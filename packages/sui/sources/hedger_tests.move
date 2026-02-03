// Copyright (c) VelocityVault Team
// SPDX-License-Identifier: Apache-2.0

/// Unit tests for the hedger module.
/// Note: Full integration tests require DeepBook pool setup.
#[test_only]
module velocity::hedger_tests;

use sui::test_scenario::{Self as ts, Scenario};
use sui::test_utils;
use sui::clock;
use velocity::hedger::{Self, Hedger, HedgerAdminCap};

const ADMIN: address = @0xAD;
const USER: address = @0xB0B;

#[test]
fun test_create_hedger() {
    let mut scenario = ts::begin(ADMIN);
    
    // Create hedger
    ts::next_tx(&mut scenario, ADMIN);
    {
        hedger::init_hedger(ts::ctx(&mut scenario));
    };
    
    // Verify hedger was created and shared
    ts::next_tx(&mut scenario, ADMIN);
    {
        let hedger = ts::take_shared<Hedger>(&scenario);
        assert!(hedger::owner(&hedger) == ADMIN, 0);
        assert!(hedger::active_hedges_count(&hedger) == 0, 1);
        ts::return_shared(hedger);
    };
    
    // Verify admin cap was transferred to creator
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = ts::take_from_sender<HedgerAdminCap>(&scenario);
        ts::return_to_sender(&scenario, admin_cap);
    };
    
    ts::end(scenario);
}

#[test]
fun test_create_hedger_direct() {
    let mut scenario = ts::begin(ADMIN);
    
    ts::next_tx(&mut scenario, ADMIN);
    {
        let (hedger, admin_cap) = hedger::create_hedger(ts::ctx(&mut scenario));
        
        assert!(hedger::owner(&hedger) == ADMIN, 0);
        assert!(hedger::active_hedges_count(&hedger) == 0, 1);
        
        // Clean up
        sui::transfer::public_share_object(hedger);
        sui::transfer::public_transfer(admin_cap, ADMIN);
    };
    
    ts::end(scenario);
}

#[test]
fun test_get_position_empty() {
    let mut scenario = ts::begin(ADMIN);
    
    ts::next_tx(&mut scenario, ADMIN);
    {
        hedger::init_hedger(ts::ctx(&mut scenario));
    };
    
    ts::next_tx(&mut scenario, ADMIN);
    {
        let hedger = ts::take_shared<Hedger>(&scenario);
        
        // Query non-existent position
        let fake_pool_id = sui::object::id_from_address(@0x123);
        let (long, short, avg_price, last_updated) = hedger::get_position(&hedger, fake_pool_id);
        
        assert!(long == 0, 0);
        assert!(short == 0, 1);
        assert!(avg_price == 0, 2);
        assert!(last_updated == 0, 3);
        
        // Check net position
        let (is_long, net) = hedger::get_net_position(&hedger, fake_pool_id);
        assert!(is_long == true, 4);  // Default to long with 0 quantity
        assert!(net == 0, 5);
        
        // Check active order
        assert!(!hedger::has_active_order(&hedger, fake_pool_id), 6);
        assert!(hedger::get_active_order_id(&hedger, fake_pool_id) == 0, 7);
        
        ts::return_shared(hedger);
    };
    
    ts::end(scenario);
}

#[test]
fun test_admin_reset_position_nonexistent() {
    let mut scenario = ts::begin(ADMIN);
    
    ts::next_tx(&mut scenario, ADMIN);
    {
        hedger::init_hedger(ts::ctx(&mut scenario));
    };
    
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut hedger = ts::take_shared<Hedger>(&scenario);
        let admin_cap = ts::take_from_sender<HedgerAdminCap>(&scenario);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        // Reset non-existent position should be safe (no-op)
        let fake_pool_id = sui::object::id_from_address(@0x456);
        hedger::reset_position(&admin_cap, &mut hedger, fake_pool_id, &clock);
        
        // Verify nothing changed
        assert!(hedger::active_hedges_count(&hedger) == 0, 0);
        
        clock::destroy_for_testing(clock);
        ts::return_shared(hedger);
        ts::return_to_sender(&scenario, admin_cap);
    };
    
    ts::end(scenario);
}

// Note: Integration tests with actual DeepBook pools require:
// 1. DeepBook pool creation
// 2. Balance manager setup
// 3. Token deposits
// These should be run against testnet/devnet
//
// Example integration test structure:
//
// #[test]
// fun test_place_hedge_order_integration() {
//     // 1. Create test scenario
//     // 2. Create DeepBook pool (requires pool registry)
//     // 3. Create balance manager
//     // 4. Deposit funds
//     // 5. Create hedger
//     // 6. Place hedge order
//     // 7. Verify position tracking
//     // 8. Cancel order
//     // 9. Verify cleanup
// }
