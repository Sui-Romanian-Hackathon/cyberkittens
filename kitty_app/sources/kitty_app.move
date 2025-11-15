/*
/// Module: kitty_app
module kitty_app::kitty_app;
*/

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions


// Sui Move Smart Contract for Visual Audit Badge NFT System
// Supports image metadata and Display standard

module kittyaudit::audit_badge {
    use sui::object;
    use sui::object::{UID, ID};
    use sui::transfer;
    use sui::tx_context;
    use sui::tx_context::TxContext;
    use sui::coin;
    use sui::coin::Coin;
    use sui::sui::SUI;
    use sui::event;
    use std::string;
    use std::string::String;
    use std::ascii;
    use sui::display;
    use sui::package;
    use sui::url;
    use sui::url::Url;
    use sui::clock;
    use sui::clock::Clock;

    // ====== Error Codes ======
    const EInsufficientPayment: u64 = 0;
    const EInvalidScore: u64 = 2;

    // ====== Pricing Constants ======
    const SCAN_PRICE: u64 = 10_000_000_000; // 10 SUI (9 decimals)
    const SUBSCRIPTION_PRICE: u64 = 30_000_000_000; // 30 SUI per month

    // ====== One-Time Witness for Display ======
    public struct AUDIT_BADGE has drop {}

    // ====== Structs ======

    /// The main admin capability for the platform
    public struct AdminCap has key, store {
        id: UID
    }

    /// Platform treasury to collect fees
    public struct Treasury has key {
        id: UID,
        balance: Coin<SUI>,
        total_scans: u64,
        total_revenue: u64
    }

    /// Visual Audit Badge NFT with image support
    /// Follows Sui Display standard for marketplace compatibility
    public struct AuditBadge has key, store {
        id: UID,
        /// Badge name
        name: String,
        /// Badge description
        description: String,
        /// Image URL (IPFS, Walrus, or data URI)
        image_url: Url,
        /// Contract hash being audited
        contract_hash: String,
        /// Security score (0-100)
        score: u8,
        /// Severity level (low, medium, high, critical)
        severity: String,
        /// Number of vulnerabilities found
        vulnerability_count: u64,
        /// Audit timestamp
        audit_timestamp: u64,
        /// Auditor platform address
        auditor: address,
        /// Contract owner
        owner: address,
        /// Link to full audit report
        project_url: String
    }

    /// User subscription for unlimited scans
    public struct Subscription has key {
        id: UID,
        user: address,
        expiry_timestamp: u64,
        scans_used: u64
    }

    // ====== Events ======

    public struct AuditBadgeMinted has copy, drop {
        badge_id: ID,
        owner: address,
        score: u8,
        severity: String,
        image_url: String,
        timestamp: u64
    }

    public struct ScanPurchased has copy, drop {
        buyer: address,
        amount: u64,
        timestamp: u64
    }

    public struct SubscriptionCreated has copy, drop {
        user: address,
        expiry: u64,
        timestamp: u64
    }

    // ====== Init Function ======

    /// Initialize the module with Display standard
    fun init(otw: AUDIT_BADGE, ctx: &mut TxContext) {
        // Create package publisher for Display
        let publisher = package::claim(otw, ctx);

        // Create and configure Display object for NFT marketplaces
        let mut display = display::new<AuditBadge>(&publisher, ctx);

        // Set display fields for marketplace compatibility
        display::add(&mut display, string::utf8(b"name"), string::utf8(b"{name}"));
        display::add(&mut display, string::utf8(b"description"), string::utf8(b"{description}"));
        display::add(&mut display, string::utf8(b"image_url"), string::utf8(b"{image_url}"));
        display::add(&mut display, string::utf8(b"project_url"), string::utf8(b"{project_url}"));
        display::add(&mut display, string::utf8(b"creator"), string::utf8(b"KittyAudit Security Platform"));

        // Update and share the Display object
        display::update_version(&mut display);
        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(display, tx_context::sender(ctx));

        // Create admin capability
        let admin_cap = AdminCap {
            id: object::new(ctx)
        };

        // Create treasury
        let treasury = Treasury {
            id: object::new(ctx),
            balance: coin::zero<SUI>(ctx),
            total_scans: 0,
            total_revenue: 0
        };

        // Transfer admin cap to deployer
        transfer::transfer(admin_cap, tx_context::sender(ctx));
        
        // Share treasury object
        transfer::share_object(treasury);
    }

    // ====== Public Entry Functions ======

    /// Purchase a single scan
    public fun purchase_scan(
        payment: Coin<SUI>,
        treasury: &mut Treasury,
        ctx: &mut TxContext
    ) {
        let payment_value = coin::value(&payment);
        assert!(payment_value >= SCAN_PRICE, EInsufficientPayment);

        coin::join(&mut treasury.balance, payment);
        treasury.total_scans = treasury.total_scans + 1;
        treasury.total_revenue = treasury.total_revenue + payment_value;

        event::emit(ScanPurchased {
            buyer: tx_context::sender(ctx),
            amount: payment_value,
            timestamp: tx_context::epoch(ctx)
        });
    }

    /// Subscribe for unlimited scans
    public fun subscribe(
        payment: Coin<SUI>,
        treasury: &mut Treasury,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let payment_value = coin::value(&payment);
        assert!(payment_value >= SUBSCRIPTION_PRICE, EInsufficientPayment);

        coin::join(&mut treasury.balance, payment);
        treasury.total_revenue = treasury.total_revenue + payment_value;

        let current_time = clock::timestamp_ms(clock);
        let expiry = current_time + (30 * 24 * 60 * 60 * 1000);

        let subscription = Subscription {
            id: object::new(ctx),
            user: tx_context::sender(ctx),
            expiry_timestamp: expiry,
            scans_used: 0
        };

        event::emit(SubscriptionCreated {
            user: tx_context::sender(ctx),
            expiry: expiry,
            timestamp: current_time
        });

        transfer::transfer(subscription, tx_context::sender(ctx));
    }

    /// Mint a visual audit badge NFT with image
    /// This is the main function called after AI analysis
    public fun mint_audit_badge(
        _admin: &AdminCap,
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        contract_hash: vector<u8>,
        score: u8,
        severity: vector<u8>,
        vulnerability_count: u64,
        recipient: address,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Validate score
        assert!(score <= 100, EInvalidScore);

        let current_time = clock::timestamp_ms(clock);
        let image_url_ascii = ascii::string(image_url);

        // Create the visual audit badge NFT
        let badge = AuditBadge {
            id: object::new(ctx),
            name: string::utf8(name),
            description: string::utf8(description),
            image_url: url::new_unsafe(image_url_ascii),
            contract_hash: string::utf8(contract_hash),
            score,
            severity: string::utf8(severity),
            vulnerability_count,
            audit_timestamp: current_time,
            auditor: tx_context::sender(ctx),
            owner: recipient,
            project_url: string::utf8(b"https://kittyaudit.io")
        };

        let badge_id = object::uid_to_inner(&badge.id);

        // Emit minting event
        event::emit(AuditBadgeMinted {
            badge_id,
            owner: recipient,
            score,
            severity: string::utf8(severity),
            image_url: string::utf8(image_url),
            timestamp: current_time
        });

        // Transfer badge to recipient
        transfer::public_transfer(badge, recipient);
    }

    /// Simplified mint function for testing
    public fun mint_simple_badge(
        score: u8,
        severity: vector<u8>,
        recipient: address,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(score <= 100, EInvalidScore);

        let current_time = clock::timestamp_ms(clock);
        let _badge_number = current_time / 1000; // Use timestamp as badge number

        // Generate default SVG data URI
        let default_image = ascii::string(b"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iIzQyODVmNCIvPjwvc3ZnPg==");

        let badge = AuditBadge {
            id: object::new(ctx),
            name: string::utf8(b"KittyAudit Audit Badge"),
            description: string::utf8(b"Smart Contract Security Audit Certificate"),
            image_url: url::new_unsafe(default_image),
            contract_hash: string::utf8(b"test_contract"),
            score,
            severity: string::utf8(severity),
            vulnerability_count: 0,
            audit_timestamp: current_time,
            auditor: tx_context::sender(ctx),
            owner: recipient,
            project_url: string::utf8(b"https://kittyaudit.io")
        };

        let badge_id = object::uid_to_inner(&badge.id);

        event::emit(AuditBadgeMinted {
            badge_id,
            owner: recipient,
            score,
            severity: string::utf8(severity),
            image_url: string::utf8(ascii::into_bytes(default_image)),
            timestamp: current_time
        });

        transfer::public_transfer(badge, recipient);
    }

    // ====== Admin Functions ======

    /// Withdraw funds from treasury
    public fun withdraw_treasury(
        _admin: &AdminCap,
        treasury: &mut Treasury,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let withdrawn = coin::split(&mut treasury.balance, amount, ctx);
        transfer::public_transfer(withdrawn, recipient);
    }

    /// Extend subscription duration
    public fun extend_subscription(
        _admin: &AdminCap,
        subscription: &mut Subscription,
        additional_days: u64,
        _ctx: &mut TxContext
    ) {
        subscription.expiry_timestamp = 
            subscription.expiry_timestamp + (additional_days * 24 * 60 * 60 * 1000);
    }

    // ====== View Functions ======

    /// Get badge details
    public fun get_badge_info(badge: &AuditBadge): (String, u8, String, u64) {
        (badge.name, badge.score, badge.severity, badge.audit_timestamp)
    }

    public fun get_badge_score(badge: &AuditBadge): u8 {
        badge.score
    }

    public fun get_badge_image_url(badge: &AuditBadge): Url {
        badge.image_url
    }

    /// Check subscription status
    public fun is_subscription_active(
        subscription: &Subscription,
        clock: &Clock
    ): bool {
        let current_time = clock::timestamp_ms(clock);
        current_time < subscription.expiry_timestamp
    }

    /// Get treasury statistics
    public fun get_treasury_stats(treasury: &Treasury): (u64, u64) {
        (treasury.total_scans, treasury.total_revenue)
    }

    // ====== Test Functions ======

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        let otw = AUDIT_BADGE {};
        init(otw, ctx);
    }

    #[test_only]
    public fun test_mint_badge(
        score: u8,
        recipient: address,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        mint_simple_badge(score, b"medium", recipient, clock, ctx);
    }
}