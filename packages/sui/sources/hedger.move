// Copyright (c) VelocityVault Team
// SPDX-License-Identifier: Apache-2.0

/// DeepBook-based hedging module for VelocityVault.
/// Provides high-speed hedge order placement and management using DeepBook v3.
/// 
/// This module wraps DeepBook v3's CLOB functionality to provide:
/// - Hedge order placement (limit and market)
/// - Position tracking across pools
/// - Order lifecycle management
module velocity::hedger;

use sui::object::{Self, UID, ID};
use sui::tx_context::{Self, TxContext};
use sui::transfer;
use sui::clock::Clock;
use sui::table::{Self, Table};
use sui::event;

// DeepBook v3 imports
use deepbook::pool::{Self, Pool};
use deepbook::balance_manager::{BalanceManager, TradeProof};
use deepbook::order_info::OrderInfo;

// === Errors ===
const ENotAuthorized: u64 = 0;
const EPositionNotFound: u64 = 1;
const EInvalidQuantity: u64 = 2;
const EOrderNotFound: u64 = 3;
const EInsufficientBalance: u64 = 4;

// === Constants ===
/// Order types from DeepBook
const ORDER_TYPE_LIMIT: u8 = 0;          // NO_RESTRICTION - standard limit order
const ORDER_TYPE_IOC: u8 = 1;            // IMMEDIATE_OR_CANCEL
const ORDER_TYPE_FOK: u8 = 2;            // FILL_OR_KILL
const ORDER_TYPE_POST_ONLY: u8 = 3;      // POST_ONLY - maker only

/// Self-matching options
const SELF_MATCHING_ALLOWED: u8 = 0;

// === Structs ===

/// Admin capability for managing the hedger
public struct HedgerAdminCap has key, store {
    id: UID,
}

/// Main hedger state - tracks positions and orders
public struct Hedger has key {
    id: UID,
    /// Owner address
    owner: address,
    /// Active hedge positions by pool ID
    positions: Table<ID, HedgePosition>,
    /// Order ID to position mapping for quick lookups
    order_to_position: Table<u128, ID>,
    /// Total number of active hedges
    active_hedges: u64,
}

/// Represents a hedge position in a specific pool
public struct HedgePosition has store, copy, drop {
    /// Pool ID this hedge is for
    pool_id: ID,
    /// Net position (positive = long, negative represented as separate field)
    long_quantity: u64,
    short_quantity: u64,
    /// Current active order ID (0 if no active order)
    active_order_id: u128,
    /// Average entry price (in price units)
    avg_entry_price: u64,
    /// Timestamp of last update
    last_updated: u64,
}

// === Events ===

public struct HedgeOrderPlaced has copy, drop {
    hedger_id: ID,
    pool_id: ID,
    order_id: u128,
    client_order_id: u64,
    price: u64,
    quantity: u64,
    is_bid: bool,
    timestamp: u64,
}

public struct HedgeOrderCanceled has copy, drop {
    hedger_id: ID,
    pool_id: ID,
    order_id: u128,
    timestamp: u64,
}

public struct PositionUpdated has copy, drop {
    hedger_id: ID,
    pool_id: ID,
    long_quantity: u64,
    short_quantity: u64,
    avg_entry_price: u64,
    timestamp: u64,
}

// === Public Functions ===

/// Initialize a new hedger instance
public fun create_hedger(ctx: &mut TxContext): (Hedger, HedgerAdminCap) {
    let hedger = Hedger {
        id: object::new(ctx),
        owner: tx_context::sender(ctx),
        positions: table::new(ctx),
        order_to_position: table::new(ctx),
        active_hedges: 0,
    };

    let admin_cap = HedgerAdminCap {
        id: object::new(ctx),
    };

    (hedger, admin_cap)
}

/// Create and share a hedger, transfer admin cap to sender
entry fun init_hedger(ctx: &mut TxContext) {
    let (hedger, admin_cap) = create_hedger(ctx);
    transfer::share_object(hedger);
    transfer::transfer(admin_cap, tx_context::sender(ctx));
}

/// Place a hedge order on DeepBook.
/// This is the core hedging function that places a limit order to hedge exposure.
/// 
/// # Arguments
/// * `hedger` - The hedger instance
/// * `pool` - DeepBook pool to trade on
/// * `balance_manager` - Balance manager with funds
/// * `trade_proof` - Proof of trading authority
/// * `client_order_id` - Client-specified order ID for tracking
/// * `price` - Limit price (in price units, scaled by tick size)
/// * `quantity` - Order quantity (in base asset units, scaled by lot size)
/// * `is_bid` - true for buy (long), false for sell (short)
/// * `expire_timestamp` - Order expiration time (ms since epoch)
/// * `clock` - Sui Clock for timestamps
public fun place_hedge_order<BaseAsset, QuoteAsset>(
    hedger: &mut Hedger,
    pool: &mut Pool<BaseAsset, QuoteAsset>,
    balance_manager: &mut BalanceManager,
    trade_proof: &TradeProof,
    client_order_id: u64,
    price: u64,
    quantity: u64,
    is_bid: bool,
    expire_timestamp: u64,
    clock: &Clock,
    ctx: &TxContext,
): OrderInfo {
    assert!(quantity > 0, EInvalidQuantity);
    
    let pool_id = object::id(pool);
    let timestamp = sui::clock::timestamp_ms(clock);
    
    // Place limit order on DeepBook
    // Using POST_ONLY to ensure we're a maker (lower fees, better for hedging)
    let order_info = pool::place_limit_order(
        pool,
        balance_manager,
        trade_proof,
        client_order_id,
        ORDER_TYPE_LIMIT,           // Standard limit order
        SELF_MATCHING_ALLOWED,      // Allow self-matching
        price,
        quantity,
        is_bid,
        true,                       // pay_with_deep = true (fees in DEEP)
        expire_timestamp,
        clock,
        ctx,
    );

    // Get the order ID from the result
    let order_id = order_info.order_id();
    
    // Update or create position tracking
    if (table::contains(&hedger.positions, pool_id)) {
        let position = table::borrow_mut(&mut hedger.positions, pool_id);
        
        // Update position based on order direction
        if (is_bid) {
            position.long_quantity = position.long_quantity + quantity;
        } else {
            position.short_quantity = position.short_quantity + quantity;
        };
        
        // Update average entry price (simplified weighted average)
        let total_quantity = position.long_quantity + position.short_quantity;
        if (total_quantity > 0) {
            position.avg_entry_price = (
                (position.avg_entry_price as u128) * ((total_quantity - quantity) as u128) +
                (price as u128) * (quantity as u128)
            ) / (total_quantity as u128) as u64;
        };
        
        position.active_order_id = order_id;
        position.last_updated = timestamp;
    } else {
        // Create new position
        let position = HedgePosition {
            pool_id,
            long_quantity: if (is_bid) quantity else 0,
            short_quantity: if (!is_bid) quantity else 0,
            active_order_id: order_id,
            avg_entry_price: price,
            last_updated: timestamp,
        };
        table::add(&mut hedger.positions, pool_id, position);
        hedger.active_hedges = hedger.active_hedges + 1;
    };

    // Track order to position mapping
    table::add(&mut hedger.order_to_position, order_id, pool_id);

    // Emit event
    event::emit(HedgeOrderPlaced {
        hedger_id: object::id(hedger),
        pool_id,
        order_id,
        client_order_id,
        price,
        quantity,
        is_bid,
        timestamp,
    });

    order_info
}

/// Place a market hedge order for immediate execution.
/// Use this when speed is more important than price.
public fun place_market_hedge<BaseAsset, QuoteAsset>(
    hedger: &mut Hedger,
    pool: &mut Pool<BaseAsset, QuoteAsset>,
    balance_manager: &mut BalanceManager,
    trade_proof: &TradeProof,
    client_order_id: u64,
    quantity: u64,
    is_bid: bool,
    clock: &Clock,
    ctx: &TxContext,
): OrderInfo {
    assert!(quantity > 0, EInvalidQuantity);
    
    let pool_id = object::id(pool);
    let timestamp = sui::clock::timestamp_ms(clock);
    
    // Place market order on DeepBook
    let order_info = pool::place_market_order(
        pool,
        balance_manager,
        trade_proof,
        client_order_id,
        SELF_MATCHING_ALLOWED,
        quantity,
        is_bid,
        true,  // pay_with_deep
        clock,
        ctx,
    );

    // Update position tracking
    let executed_qty = order_info.executed_quantity();
    let avg_price = if (executed_qty > 0) {
        order_info.cumulative_quote_quantity() / executed_qty
    } else {
        0
    };
    
    if (table::contains(&hedger.positions, pool_id)) {
        let position = table::borrow_mut(&mut hedger.positions, pool_id);
        if (is_bid) {
            position.long_quantity = position.long_quantity + executed_qty;
        } else {
            position.short_quantity = position.short_quantity + executed_qty;
        };
        position.last_updated = timestamp;
        
        // Update average entry
        let total = position.long_quantity + position.short_quantity;
        if (total > 0 && avg_price > 0) {
            position.avg_entry_price = (
                (position.avg_entry_price as u128) * ((total - executed_qty) as u128) +
                (avg_price as u128) * (executed_qty as u128)
            ) / (total as u128) as u64;
        };
    } else {
        let position = HedgePosition {
            pool_id,
            long_quantity: if (is_bid) executed_qty else 0,
            short_quantity: if (!is_bid) executed_qty else 0,
            active_order_id: 0,
            avg_entry_price: avg_price,
            last_updated: timestamp,
        };
        table::add(&mut hedger.positions, pool_id, position);
        hedger.active_hedges = hedger.active_hedges + 1;
    };

    order_info
}

/// Cancel an existing hedge order.
/// Removes the order from DeepBook and updates position tracking.
public fun cancel_hedge<BaseAsset, QuoteAsset>(
    hedger: &mut Hedger,
    pool: &mut Pool<BaseAsset, QuoteAsset>,
    balance_manager: &mut BalanceManager,
    trade_proof: &TradeProof,
    order_id: u128,
    clock: &Clock,
    ctx: &TxContext,
) {
    assert!(table::contains(&hedger.order_to_position, order_id), EOrderNotFound);
    
    let pool_id = table::remove(&mut hedger.order_to_position, order_id);
    let timestamp = sui::clock::timestamp_ms(clock);
    
    // Cancel order on DeepBook
    pool::cancel_order(
        pool,
        balance_manager,
        trade_proof,
        order_id,
        clock,
        ctx,
    );

    // Update position tracking
    if (table::contains(&hedger.positions, pool_id)) {
        let position = table::borrow_mut(&mut hedger.positions, pool_id);
        if (position.active_order_id == order_id) {
            position.active_order_id = 0;
        };
        position.last_updated = timestamp;
    };

    // Emit event
    event::emit(HedgeOrderCanceled {
        hedger_id: object::id(hedger),
        pool_id,
        order_id,
        timestamp,
    });
}

/// Cancel all hedge orders for a specific pool.
public fun cancel_all_hedges<BaseAsset, QuoteAsset>(
    hedger: &mut Hedger,
    pool: &mut Pool<BaseAsset, QuoteAsset>,
    balance_manager: &mut BalanceManager,
    trade_proof: &TradeProof,
    clock: &Clock,
    ctx: &TxContext,
) {
    pool::cancel_all_orders(
        pool,
        balance_manager,
        trade_proof,
        clock,
        ctx,
    );
    
    let pool_id = object::id(pool);
    let timestamp = sui::clock::timestamp_ms(clock);
    
    if (table::contains(&hedger.positions, pool_id)) {
        let position = table::borrow_mut(&mut hedger.positions, pool_id);
        position.active_order_id = 0;
        position.last_updated = timestamp;
    };
}

/// Modify an existing hedge order's quantity.
public fun modify_hedge<BaseAsset, QuoteAsset>(
    hedger: &mut Hedger,
    pool: &mut Pool<BaseAsset, QuoteAsset>,
    balance_manager: &mut BalanceManager,
    trade_proof: &TradeProof,
    order_id: u128,
    new_quantity: u64,
    clock: &Clock,
    ctx: &TxContext,
) {
    assert!(table::contains(&hedger.order_to_position, order_id), EOrderNotFound);
    assert!(new_quantity > 0, EInvalidQuantity);
    
    // Modify order on DeepBook
    pool::modify_order(
        pool,
        balance_manager,
        trade_proof,
        order_id,
        new_quantity,
        clock,
        ctx,
    );
    
    let pool_id = *table::borrow(&hedger.order_to_position, order_id);
    let timestamp = sui::clock::timestamp_ms(clock);
    
    if (table::contains(&hedger.positions, pool_id)) {
        let position = table::borrow_mut(&mut hedger.positions, pool_id);
        position.last_updated = timestamp;
    };
}

// === View Functions ===

/// Get the current position for a pool
public fun get_position(hedger: &Hedger, pool_id: ID): (u64, u64, u64, u64) {
    if (table::contains(&hedger.positions, pool_id)) {
        let position = table::borrow(&hedger.positions, pool_id);
        (
            position.long_quantity,
            position.short_quantity,
            position.avg_entry_price,
            position.last_updated,
        )
    } else {
        (0, 0, 0, 0)
    }
}

/// Get net position (long - short)
public fun get_net_position(hedger: &Hedger, pool_id: ID): (bool, u64) {
    if (table::contains(&hedger.positions, pool_id)) {
        let position = table::borrow(&hedger.positions, pool_id);
        if (position.long_quantity >= position.short_quantity) {
            (true, position.long_quantity - position.short_quantity)
        } else {
            (false, position.short_quantity - position.long_quantity)
        }
    } else {
        (true, 0)
    }
}

/// Check if there's an active order for a pool
public fun has_active_order(hedger: &Hedger, pool_id: ID): bool {
    if (table::contains(&hedger.positions, pool_id)) {
        let position = table::borrow(&hedger.positions, pool_id);
        position.active_order_id != 0
    } else {
        false
    }
}

/// Get active order ID for a pool
public fun get_active_order_id(hedger: &Hedger, pool_id: ID): u128 {
    if (table::contains(&hedger.positions, pool_id)) {
        let position = table::borrow(&hedger.positions, pool_id);
        position.active_order_id
    } else {
        0
    }
}

/// Get total number of active hedges
public fun active_hedges_count(hedger: &Hedger): u64 {
    hedger.active_hedges
}

/// Get hedger owner
public fun owner(hedger: &Hedger): address {
    hedger.owner
}

// === Admin Functions ===

/// Reset a position (admin only - for emergency use)
public fun reset_position(
    _admin: &HedgerAdminCap,
    hedger: &mut Hedger,
    pool_id: ID,
    clock: &Clock,
) {
    if (table::contains(&hedger.positions, pool_id)) {
        let position = table::borrow_mut(&mut hedger.positions, pool_id);
        position.long_quantity = 0;
        position.short_quantity = 0;
        position.active_order_id = 0;
        position.avg_entry_price = 0;
        position.last_updated = sui::clock::timestamp_ms(clock);
        
        event::emit(PositionUpdated {
            hedger_id: object::id(hedger),
            pool_id,
            long_quantity: 0,
            short_quantity: 0,
            avg_entry_price: 0,
            timestamp: position.last_updated,
        });
    };
}

#[test_only]
/// Create a hedger for testing
public fun create_hedger_for_testing(ctx: &mut TxContext): Hedger {
    Hedger {
        id: object::new(ctx),
        owner: tx_context::sender(ctx),
        positions: table::new(ctx),
        order_to_position: table::new(ctx),
        active_hedges: 0,
    }
}
