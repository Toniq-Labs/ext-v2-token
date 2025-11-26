# EXT v2 API Reference

Complete API reference for the EXT (Extendable Token) v2 standard implementation.

## Table of Contents

- [Core Types](#core-types)
- [Balance & Ownership](#balance--ownership)
- [Transfer Operations](#transfer-operations)
- [Marketplace](#marketplace)
- [Sale System](#sale-system)
- [Metadata](#metadata)
- [Assets](#assets)
- [Admin Functions](#admin-functions)
- [HTTP Interface](#http-interface)
- [Heartbeat & Automation](#heartbeat--automation)
- [Legacy Methods](#legacy-methods)

---

## Core Types

### User
Represents either a Principal or an AccountIdentifier:
```candid
type User = variant {
    address: AccountIdentifier;
    principal: principal;
};
```

### TokenIdentifier
Unique identifier for a token (text format):
```candid
type TokenIdentifier = text;
```

### TokenIndex
Numeric index for a token:
```candid
type TokenIndex = nat32;
```

### AccountIdentifier
Text representation of an account (derived from Principal + SubAccount):
```candid
type AccountIdentifier = text;
```

### SubAccount
32-byte subaccount identifier:
```candid
type SubAccount = vec nat8;
```

### Balance
Token balance (for NFTs, typically 1 or 0):
```candid
type Balance = nat;
```

### Memo
Arbitrary data attached to transfers:
```candid
type Memo = blob;
```

---

## Balance & Ownership

### balance
Get the balance of a user for a specific token.

```candid
balance: (BalanceRequest) -> (BalanceResponse) query;

type BalanceRequest = record {
    token: TokenIdentifier;
    user: User;
};

type BalanceResponse = variant {
    ok: Balance;
    err: CommonError;
};
```

**Example:**
```javascript
const request = {
    token: "abc123...",
    user: { principal: Principal.fromText("...") }
};
const response = await actor.balance(request);
```

### bearer
Get the current owner of a token.

```candid
bearer: (TokenIdentifier) -> (Result_7) query;

type Result_7 = variant {
    ok: AccountIdentifier;
    err: CommonError;
};
```

**Example:**
```javascript
const owner = await actor.bearer(tokenId);
if ('ok' in owner) {
    console.log("Owner:", owner.ok);
}
```

### tokens
Get all token indices owned by an account.

```candid
tokens: (AccountIdentifier) -> (Result_1) query;

type Result_1 = variant {
    ok: vec TokenIndex;
    err: CommonError;
};
```

**⚠️ Deprecated**: Use `tokens_ext` instead for better performance.

### tokens_ext
**Recommended** method to get tokens with additional data.

```candid
tokens_ext: (AccountIdentifier) -> (Result) query;

type Result = variant {
    ok: vec record {
        TokenIndex;
        opt Listing;      // Current listing if any
        opt blob;         // Optional metadata
    };
    err: CommonError;
};
```

**Example:**
```javascript
const result = await actor.tokens_ext(accountId);
if ('ok' in result) {
    result.ok.forEach(([index, listing, metadata]) => {
        console.log(`Token ${index}`, listing, metadata);
    });
}
```

---

## Transfer Operations

### transfer / ext_transfer
Transfer a token from one user to another.

```candid
transfer: (TransferRequest) -> (TransferResponse);
ext_transfer: (TransferRequest) -> (TransferResponse);

type TransferRequest = record {
    from: User;
    to: User;
    token: TokenIdentifier;
    amount: Balance;
    memo: Memo;
    notify: bool;          // Whether to notify recipient canister
    subaccount: opt SubAccount;
};

type TransferResponse = variant {
    ok: Balance;
    err: variant {
        Unauthorized: AccountIdentifier;
        InsufficientBalance;
        InvalidToken: TokenIdentifier;
        Rejected;
        CannotNotify: AccountIdentifier;
        Other: text;
    };
};
```

**Example:**
```javascript
const request = {
    from: { principal: fromPrincipal },
    to: { address: toAccountId },
    token: tokenId,
    amount: 1n,
    memo: [],
    notify: false,
    subaccount: [],
};
const result = await actor.transfer(request);
```

**Notes:**
- Both methods are identical (ext_transfer is alias)
- See [LEGACY-SUPPORT.md](./LEGACY-SUPPORT.md#transfer-methods) for non-standard implementations

---

## Marketplace

### ext_marketplaceList
List a token for sale on the marketplace.

```candid
ext_marketplaceList: (ListRequest) -> (Result_3);

type ListRequest = record {
    token: TokenIdentifier;
    from_subaccount: opt SubAccount;
    price: opt nat64;      // Price in smallest units (e8s for ICP)
};

type Result_3 = variant {
    ok;
    err: CommonError;
};
```

**Example:**
```javascript
// List for 1 ICP (100,000,000 e8s)
await actor.ext_marketplaceList({
    token: tokenId,
    from_subaccount: [],
    price: [100_000_000n]
});

// Delist (set price to null)
await actor.ext_marketplaceList({
    token: tokenId,
    from_subaccount: [],
    price: []
});
```

### ext_marketplaceListings
Get all current marketplace listings.

```candid
ext_marketplaceListings: () -> (vec record {
    TokenIndex;
    Listing;
    Metadata;
}) query;

type Listing = record {
    seller: principal;
    price: nat64;
    locked: opt Time;      // When locked for purchase
};
```

**Example:**
```javascript
const listings = await actor.ext_marketplaceListings();
listings.forEach(([index, listing, metadata]) => {
    console.log(`Token ${index}: ${listing.price} e8s by ${listing.seller}`);
});
```

### ext_marketplacePurchase
Purchase a listed token from the marketplace.

```candid
ext_marketplacePurchase: (
    TokenIdentifier,
    nat64,                 // Price
    AccountIdentifier      // Buyer account
) -> (Result_9);

type Result_9 = variant {
    ok: record {
        AccountIdentifier;  // Subaccount for payment
        nat64;              // Amount to pay
    };
    err: CommonError;
};
```

**Purchase Flow:**
1. Call `ext_marketplacePurchase` → receive payment subaccount
2. Send ICP to the returned subaccount
3. Call `ext_marketplaceSettle` to complete transfer

**Example:**
```javascript
// Step 1: Initiate purchase
const purchaseResult = await actor.ext_marketplacePurchase(
    tokenId,
    priceInE8s,
    buyerAccountId
);

if ('ok' in purchaseResult) {
    const [paymentAddress, amount] = purchaseResult.ok;

    // Step 2: Send ICP to paymentAddress
    await ledger.transfer({
        to: paymentAddress,
        amount: { e8s: amount },
        // ...
    });

    // Step 3: Settle after payment
    await actor.ext_marketplaceSettle(buyerAccountId);
}
```

### ext_marketplaceSettle
Complete a marketplace purchase after payment is sent.

```candid
ext_marketplaceSettle: (AccountIdentifier) -> (Result_3);
```

**Auto-Settlement:**
The heartbeat system automatically settles pending transactions, but you can call this manually for immediate settlement.

### ext_marketplaceStats
Get marketplace statistics.

```candid
ext_marketplaceStats: () -> (
    nat64,    // Total volume (e8s)
    nat64,    // Highest sale price
    nat64,    // Lowest sale price
    nat64,    // Floor price (current lowest listing)
    nat,      // Listings count
    nat,      // Total supply
    nat       // Total sales count
) query;
```

### ext_marketplaceTransactions
Get all marketplace transactions.

```candid
ext_marketplaceTransactions: () -> (vec Transaction) query;

type Transaction = record {
    token: TokenIndex;
    seller: AccountIdentifier;
    buyer: AccountIdentifier;
    price: nat64;
    time: Time;
};
```

**⚠️ Note:** Returns ALL transactions, not filtered by caller. See [LEGACY-SUPPORT.md](./LEGACY-SUPPORT.md#transactions-api).

---

## Sale System

The sale system supports timed sales with pricing groups, whitelists, and bulk discounts.

### ext_saleOpen
Open a new sale with pricing groups.

```candid
ext_saleOpen: (
    vec SalePricingGroup,
    SaleRemaining,
    vec AccountIdentifier    // Addresses reserved for sale
) -> (bool);

type SalePricingGroup = record {
    name: text;
    start: Time;
    end: Time;
    pricing: vec record {    // Bulk pricing tiers
        nat64;               // Quantity
        nat64;               // Price per token
    };
    limit: record {          // Per-address purchase limits
        nat64;               // Min quantity
        nat64;               // Max quantity
    };
    participants: vec AccountIdentifier;  // Whitelist (empty = public)
};

type SaleRemaining = variant {
    burn;                    // Burn unsold tokens
    retain;                  // Keep in canister
    send: AccountIdentifier; // Transfer to address
};
```

**Example:**
```javascript
await actor.ext_saleOpen(
    [
        {
            name: "Whitelist Sale",
            start: 1700000000000000000n,
            end: 1700086400000000000n,
            pricing: [
                [1n, 50_000_000n],      // 1 token: 0.5 ICP
                [5n, 45_000_000n],      // 5+ tokens: 0.45 ICP each
            ],
            limit: [1n, 10n],            // Min 1, max 10
            participants: whitelistAddresses,
        },
        {
            name: "Public Sale",
            start: 1700086400000000000n,
            end: 1700172800000000000n,
            pricing: [[1n, 100_000_000n]],
            limit: [1n, 5n],
            participants: [],            // Empty = public
        }
    ],
    { retain: null },                    // Keep unsold tokens
    saleTokenAddresses                   // Pre-minted tokens for sale
);
```

### ext_saleClose
Close the current sale.

```candid
ext_saleClose: () -> (bool);
```

### ext_salePause / ext_saleResume
Temporarily pause or resume sale.

```candid
ext_salePause: () -> (bool);
ext_saleResume: () -> (bool);
```

### ext_saleUpdate
Update sale parameters while sale is active.

```candid
ext_saleUpdate: (
    opt vec SalePricingGroup,
    opt SaleRemaining,
    opt vec AccountIdentifier
) -> (bool);
```

### ext_saleCurrent
Get current sale configuration.

```candid
ext_saleCurrent: () -> (opt Sale) query;

type Sale = record {
    start: Time;
    end: Time;
    groups: vec SalePricingGroup;
    quantity: nat;
    remaining: SaleRemaining;
};
```

### ext_saleSettings
Get sale settings for a specific buyer (includes availability).

```candid
ext_saleSettings: (AccountIdentifier) -> (opt SaleDetails) query;

type SaleDetails = record {
    start: Time;
    end: Time;
    quantity: nat;
    remaining: nat;
    groups: vec SaleDetailGroup;
};

type SaleDetailGroup = record {
    id: nat;
    name: text;
    start: Time;
    end: Time;
    pricing: vec record { nat64; nat64; };
    available: bool;      // Whether caller can participate
};
```

### ext_salePurchase
Purchase tokens during a sale.

```candid
ext_salePurchase: (
    nat,                  // Quantity
    nat64,                // Price per token
    nat64,                // Total amount
    AccountIdentifier     // Buyer address
) -> (Result_5);

type Result_5 = variant {
    ok: record {
        AccountIdentifier;  // Payment subaccount
        nat64;              // Amount to pay
    };
    err: text;
};
```

**Purchase Flow:**
1. Call `ext_salePurchase` → receive payment details
2. Send ICP to payment subaccount
3. Call `ext_saleSettle` to receive tokens

**Example:**
```javascript
const quantity = 5;
const pricePerToken = 50_000_000n;
const total = BigInt(quantity) * pricePerToken;

const result = await actor.ext_salePurchase(
    quantity,
    pricePerToken,
    total,
    buyerAccountId
);

if ('ok' in result) {
    const [paymentAddress, amount] = result.ok;
    // Send payment, then settle...
}
```

### ext_saleSettle
Complete a sale purchase after payment.

```candid
ext_saleSettle: (AccountIdentifier) -> (Result_4);

type Result_4 = variant {
    ok;
    err: text;
};
```

### ext_saleTransactions
Get all sale transactions.

```candid
ext_saleTransactions: () -> (vec SaleTransaction) query;

type SaleTransaction = record {
    seller: principal;      // Sale canister/admin
    buyer: AccountIdentifier;
    tokens: vec TokenIndex; // All tokens purchased in this transaction
    price: nat64;
    time: Time;
};
```

---

## Metadata

### ext_metadata
**Standard method** to get token metadata.

```candid
ext_metadata: (TokenIdentifier) -> (Result_8) query;

type Result_8 = variant {
    ok: Metadata;
    err: CommonError;
};

type Metadata = variant {
    fungible: record {
        name: text;
        symbol: text;
        decimals: nat8;
        metadata: opt MetadataContainer;
    };
    nonfungible: record {
        name: text;
        asset: text;           // URL or path to main asset
        thumbnail: text;        // URL or path to thumbnail
        metadata: opt MetadataContainer;
    };
};

type MetadataContainer = variant {
    blob: blob;
    json: text;
    data: vec MetadataValue;
};

type MetadataValue = record {
    text;                      // Key
    variant {
        text: text;
        nat: nat;
        nat8: nat8;
        blob: blob;
    };
};
```

**Example:**
```javascript
const metadata = await actor.ext_metadata(tokenId);
if ('ok' in metadata && 'nonfungible' in metadata.ok) {
    const nft = metadata.ok.nonfungible;
    console.log("Name:", nft.name);
    console.log("Image:", nft.asset);
    console.log("Thumbnail:", nft.thumbnail);
}
```

### metadata (Legacy)
Legacy metadata format.

```candid
metadata: (TokenIdentifier) -> (Result_6) query;

type MetadataLegacy = variant {
    fungible: record {
        name: text;
        symbol: text;
        decimals: nat8;
        metadata: opt blob;
    };
    nonfungible: record {
        metadata: opt blob;
    };
};
```

**⚠️ Deprecated:** Use `ext_metadata` for new implementations.

### getMetadata
Get all tokens with their legacy metadata.

```candid
getMetadata: () -> (vec record {
    TokenIndex;
    MetadataLegacy;
}) query;
```

**⚠️ Warning:** Returns ALL tokens - can be very large for big collections.

### ext_setCollectionMetadata
Set collection-level metadata.

```candid
ext_setCollectionMetadata: (text, text) -> ();
```

**Admin only.**

---

## Assets

The asset system supports streaming large files (images, videos) either directly or via separate asset canisters.

### ext_assetAdd
Begin adding a new asset.

```candid
ext_assetAdd: (
    AssetHandle,          // Unique identifier
    text,                 // Name
    text,                 // Content type (e.g., "image/png")
    AssetType,
    nat                   // Total size in bytes
) -> ();

type AssetHandle = text;

type AssetType = variant {
    direct: vec ChunkId;              // Stored directly
    canister: record {                // Stored in asset canister
        id: AssetId;
        canister: text;
    };
    other: text;
};
```

### ext_assetStream
Stream asset data in chunks.

```candid
ext_assetStream: (
    AssetHandle,
    blob,                 // Chunk data
    bool                  // Is last chunk
) -> (bool);
```

**Example:**
```javascript
// Add asset
await actor.ext_assetAdd(
    "asset-0",
    "Image 0",
    "image/png",
    { direct: [] },
    imageData.length
);

// Stream in chunks
const chunkSize = 1024 * 1024; // 1MB chunks
for (let i = 0; i < imageData.length; i += chunkSize) {
    const chunk = imageData.slice(i, i + chunkSize);
    const isLast = i + chunkSize >= imageData.length;
    await actor.ext_assetStream("asset-0", chunk, isLast);
}
```

### addAsset / addThumbnail
Legacy methods for adding assets and thumbnails.

```candid
addAsset: (AssetHandle, nat32, text, text, text) -> ();
addThumbnail: (AssetHandle, blob) -> ();
```

### ext_assetExists
Check if an asset exists.

```candid
ext_assetExists: (AssetHandle) -> (bool) query;
```

### ext_assetFits
Check if there's space for an asset of given size.

```candid
ext_assetFits: (bool, nat) -> (bool) query;
```

### ext_addAssetCanister
Create a new linked asset canister for additional storage.

```candid
ext_addAssetCanister: () -> ();
```

**Admin only.** Used when main canister is running low on storage.

---

## Admin Functions

### ext_setOwner
Transfer ownership of the canister.

```candid
ext_setOwner: (principal) -> ();
```

**Current owner only.**

### ext_admin
Get current admin principal.

```candid
ext_admin: () -> (principal) query;
```

### ext_setAdmin
Set an admin principal (in addition to owner).

```candid
ext_setAdmin: (principal) -> ();
```

**Owner only.**

### ext_removeAdmin
Remove current admin.

```candid
ext_removeAdmin: () -> ();
```

**Owner only.**

### setMinter / getMinter
Set/get the minting principal.

```candid
setMinter: (principal) -> ();
getMinter: () -> (principal) query;
```

### ext_mint
Mint new tokens (pre-allocation before sale).

```candid
ext_mint: (vec record {
    AccountIdentifier;
    Metadata;
}) -> (vec TokenIndex);
```

**Minter only.** See [LEGACY-SUPPORT.md](./LEGACY-SUPPORT.md#minting-workflow) for details.

**⚠️ Important:** This is NOT user-facing minting. Called by server before sale to pre-allocate tokens.

### ext_setRoyalty
Set marketplace royalty recipients.

```candid
ext_setRoyalty: (vec record {
    AccountIdentifier;
    nat64;              // Basis points (e.g., 500 = 5%)
}) -> ();
```

**Example:**
```javascript
await actor.ext_setRoyalty([
    [creatorAddress, 500n],      // 5% to creator
    [teamAddress, 250n]          // 2.5% to team
]);
```

### ext_setSaleRoyalty
Set royalty for sale proceeds.

```candid
ext_setSaleRoyalty: (AccountIdentifier) -> () oneway;
```

### ext_setMarketplaceOpen
Set when marketplace becomes available.

```candid
ext_setMarketplaceOpen: (Time) -> ();
```

---

## HTTP Interface

Enables serving NFT assets directly via HTTP (no wallet required).

### http_request
Handle HTTP requests (query mode - read-only).

```candid
http_request: (HttpRequest) -> (HttpResponse) query;

type HttpRequest = record {
    method: text;
    url: text;
    headers: vec HeaderField;
    body: blob;
};

type HttpResponse = record {
    status_code: nat16;
    headers: vec HeaderField;
    body: blob;
    streaming_strategy: opt HttpStreamingStrategy;
    upgrade: bool;
};

type HeaderField = record { text; text; };
```

**Example URLs:**
- `https://[canister-id].raw.ic0.app/?tokenid=abc123`
- `https://[canister-id].raw.ic0.app/?index=0&type=thumbnail`

### http_request_update
Handle HTTP requests (update mode - can modify state).

```candid
http_request_update: (HttpRequest) -> (HttpResponse);
```

### http_request_streaming_callback
Stream large assets via callbacks.

```candid
http_request_streaming_callback: (HttpStreamingCallbackToken) ->
    (HttpStreamingCallbackResponse) query;

type HttpStreamingCallbackToken = record {
    key: text;
    index: nat;
    content_encoding: text;
    sha256: opt blob;
};
```

---

## Heartbeat & Automation

Automated background tasks run via IC heartbeat.

### heartbeat_isRunning / isHeartbeatRunning
Check if heartbeat is active.

```candid
heartbeat_isRunning: () -> (bool) query;
isHeartbeatRunning: () -> (bool) query;
```

### heartbeat_start / heartbeat_stop
Start or stop heartbeat processing.

```candid
heartbeat_start: () -> ();
heartbeat_stop: () -> ();
```

**Admin only.**

### adminKillHeartbeat / adminStartHeartbeat
Emergency heartbeat controls.

```candid
adminKillHeartbeat: () -> ();
adminStartHeartbeat: () -> ();
```

### Heartbeat Tasks

Individual heartbeat task handlers:

```candid
heartbeat_paymentSettlements: () -> ();    // Settle marketplace purchases
heartbeat_disbursements: () -> ();         // Process royalty payments
heartbeat_capEvents: () -> ();             // Send events to CAP
heartbeat_assetCanisters: () -> ();        // Manage asset canisters
heartbeat_external: () -> ();              // Custom external tasks
```

### heartbeat_pending
View pending heartbeat tasks.

```candid
heartbeat_pending: () -> (vec record {
    text;    // Task name
    nat;     // Queue size
}) query;
```

---

## Payments & Settlements

### ext_payments
View all pending payments.

```candid
ext_payments: () -> (vec record {
    AccountIdentifier;
    Payment;
}) query;

type Payment = record {
    payer: AccountIdentifier;
    amount: nat64;
    subaccount: SubAccount;
    purchase: PaymentType;
    expires: Time;
};

type PaymentType = variant {
    nft: TokenIndex;
    nfts: vec TokenIndex;
    sale: nat64;
};
```

### allSettlements / settlements
View pending settlements.

```candid
allSettlements: () -> (vec record {
    TokenIndex;
    record {
        seller: principal;
        buyer: AccountIdentifier;
        price: nat64;
        subaccount: SubAccount;
    };
}) query;

settlements: () -> (vec record {
    TokenIndex;
    AccountIdentifier;
    nat64;
}) query;
```

### ext_expired / failedSales
View expired or failed transactions.

```candid
ext_expired: () -> (vec record {
    AccountIdentifier;
    SubAccount;
}) query;

failedSales: () -> (vec record {
    AccountIdentifier;
    SubAccount;
}) query;
```

---

## Cycles Management

### acceptCycles
Accept cycles sent to canister.

```candid
acceptCycles: () -> ();
```

### availableCycles
Get current cycle balance.

```candid
availableCycles: () -> (nat) query;
```

---

## CAP Integration

### ext_capInit
Initialize CAP (Canister Audit Protocol) integration.

```candid
ext_capInit: () -> ();
```

**Admin only.** Creates a CAP history canister for transaction logging.

---

## Extension System

### extensions / ext_extensions
Get list of supported extensions.

```candid
extensions: () -> (vec Extension) query;
ext_extensions: () -> (vec Extension) query;

type Extension = text;
```

Common extensions:
- `"@ext/common"`
- `"@ext/nonfungible"`
- `"@ext/allowance"`
- etc.

---

## Registry & Supply

### getRegistry
Get complete ownership registry.

```candid
getRegistry: () -> (vec record {
    TokenIndex;
    AccountIdentifier;
}) query;
```

**⚠️ Warning:** Returns ALL tokens - expensive for large collections.

### getTokens
Get all tokens with metadata.

```candid
getTokens: () -> (vec record {
    TokenIndex;
    MetadataLegacy;
}) query;
```

**⚠️ Warning:** Returns ALL tokens - very expensive.

### supply / extdata_supply
Get total supply.

```candid
supply: (TokenIdentifier) -> (Result_2) query;
extdata_supply: (TokenIdentifier) -> (Result_2) query;

type Result_2 = variant {
    ok: Balance;
    err: CommonError;
};
```

For NFTs, typically returns total number of tokens.

---

## Error Handling

### CommonError
Standard error type across all methods.

```candid
type CommonError = variant {
    InvalidToken: TokenIdentifier;
    Other: text;
};
```

### Transfer Errors
```candid
variant {
    Unauthorized: AccountIdentifier;
    InsufficientBalance;
    InvalidToken: TokenIdentifier;
    Rejected;
    CannotNotify: AccountIdentifier;
    Other: text;
};
```

---

## Related Documentation

- [Legacy Support Guide](./LEGACY-SUPPORT.md) - Non-standard implementations and universal handlers
- [Main README](./README.md) - Quick start guide

---

**Last Updated:** 2025-11-19
**Version:** EXT v2
**Maintainer:** Toniq Labs
