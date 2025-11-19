# Legacy Support Guide

**For Frontend, Marketplace & Wallet Developers**

Early EXT NFT canisters have different implementations due to launches before standard finalization. This guide helps you support the entire ecosystem with canister-specific handlers.

**The Problem:** Different canisters use different methods - some accept only Principals, others use custom transfer signatures, and token enumeration varies across implementations.

**The Solution:** Detect canister ID and call the appropriate method.

---

## Metadata APIs

**Three different methods exist:**

- `getMetadata()` - Collection-level (often empty/nonexistent)
- `ext_metadata(tokenId)` - Standard per-token metadata
- `metadata(tokenId)` - Legacy per-token metadata

**Usage:** Generative collections (unique images per token) return meaningful per-token metadata. Non-generative collections typically just return the token index.

---

## Transfer Methods

### Known Canister Types

```javascript
const ICP_LEDGER = 'ryjl3-tyaaa-aaaaa-aaaba-cai';

const PRINCIPAL_ONLY = [
    'qcg3w-tyaaa-aaaah-qakea-cai',  // ICPunks
    '4nvhy-3qaaa-aaaah-qcnoq-cai',  // ICPuppies
    'jzg5e-giaaa-aaaah-qaqda-cai',  // Motoko Day Drop
    'd3ttm-qaaaa-aaaai-qam4a-cai',  // Poked Bots
    'xkbqi-2qaaa-aaaah-qbpqq-cai',  // IC Drip
];

const DEPARTURE_LABS = 'fl5nr-xiaaa-aaaai-qbjmq-cai';
const CRONIC = 'qz7gu-giaaa-aaaaf-qaaka-cai';
```

### Complete Transfer Implementation

```javascript
async function universalTransfer(canisterId, actor, tokenIndex, fromPrincipal, toUser, amount) {
    // ICP Ledger
    if (canisterId === ICP_LEDGER) {
        return await actor.send_dfx({
            from_subaccount: [getSubAccountArray(0)],
            to: toUser,
            amount: { e8s: amount },
            fee: { e8s: 10_000n },
            memo: 0,
            created_at_time: [],
        });
    }

    // Principal-only canisters
    if (PRINCIPAL_ONLY.includes(canisterId)) {
        if (!validatePrincipal(toUser)) {
            throw new Error('Principal required, not AccountIdentifier');
        }
        return await actor.transfer_to(Principal.fromText(toUser), tokenIndex);
    }

    // Departure Labs
    if (canisterId === DEPARTURE_LABS) {
        if (!validatePrincipal(toUser)) {
            throw new Error('Principal required');
        }
        const result = await actor.transferFrom(
            Principal.fromText(fromPrincipal),
            Principal.fromText(toUser),
            tokenIndex
        );
        if (!('ok' in result)) throw new Error('Transfer failed');
        return result;
    }

    // Cronic
    if (canisterId === CRONIC) {
        const result = await actor.transfer({
            to: Principal.fromText(toUser),
            metadata: [],
            from: Principal.fromText(fromPrincipal),
            amount: amount,
        });
        if (!('ok' in result)) throw new Error(JSON.stringify(result.err));
        return result;
    }

    // Standard EXT
    const result = await actor.transfer({
        token: encodeTokenId(canisterId, tokenIndex),
        from: { address: principalToAccountIdentifier(fromPrincipal, 0) },
        subaccount: [getSubAccountArray(0)],
        to: constructUser(toUser),
        amount: amount,
        fee: 0n,
        memo: new Uint8Array(),
        notify: false,
    });
    if (!('ok' in result)) throw new Error(JSON.stringify(result.err));
    return result;
}
```

---

## Token Enumeration

### Complete Token Enumeration Implementation

```javascript
async function universalGetTokens(canisterId, actor, accountId, principal) {
    // Principal-only canisters (subaccount 0 only)
    if (PRINCIPAL_ONLY.includes(canisterId)) {
        if (accountId !== principalToAccountIdentifier(principal, 0)) return [];

        const indices = await actor.user_tokens(Principal.fromText(principal));
        return indices.map(index => ({
            id: encodeTokenId(canisterId, Number(index)),
            canister: canisterId,
            index: Number(index),
        }));
    }

    // Departure Labs
    if (canisterId === DEPARTURE_LABS) {
        if (accountId !== principalToAccountIdentifier(principal, 0)) return [];

        const nfts = await actor.getAllNFT(Principal.fromText(principal));
        return nfts.map(([tokenId]) => ({
            id: encodeTokenId(canisterId, Number(tokenId)),
            canister: canisterId,
            index: Number(tokenId),
        }));
    }

    // Standard EXT (recommended)
    const result = await actor.tokens_ext(accountId);
    if ('ok' in result) {
        return result.ok.map(([index, listing, metadata]) => ({
            index: Number(index),
            id: encodeTokenId(canisterId, Number(index)),
            canister: canisterId,
            listing: listing.length > 0 ? listing[0] : null,
            metadata: metadata.length > 0 ? metadata[0] : null,
        }));
    }
    if (result.err.Other === 'No tokens') return [];
    throw new Error(result.err.Other || 'Unknown error');
}
```

**⚠️ Warning:** Never use `getTokens()` - it returns ALL tokens in the collection, causing performance issues.

---

## Transactions API

**Important:** `transactions()` returns **ALL** collection transactions, **not filtered by caller**.

```javascript
type Transaction = {
    token: TokenIndex,
    seller: AccountIdentifier,
    buyer: AccountIdentifier,
    price: nat64,
    time: Time
};
```

**You must filter client-side:**

```javascript
const allTx = await actor.transactions();
const myTx = allTx.filter(tx =>
    tx.buyer === myAccountId || tx.seller === myAccountId
);
```

---

## Minting Workflow

**Common Misconception:** `ext_mint` does NOT mean "users mint NFTs during sale."

### Actual Flow

1. **Pre-Sale (Server):** Admin calls `ext_mint` to pre-allocate tokens to:
   - Airdrop addresses
   - Sale address (holds tokens for purchase)

2. **During Sale (Users):** Calling `ext_salePurchase` **transfers** an existing token from sale address to buyer

**Key Point:** Tokens already exist before sale starts. User "minting" is actually purchasing/transferring.

### Timeline Example

```
Deploy canister
    ↓
Server calls ext_mint (tokens 0-999 created)
    ↓
ext_saleOpen (sale starts)
    ↓
Users call ext_salePurchase (transfer from sale address)
    ↓
ext_saleClose
```

---

## Implementation Checklist

### Must Have
- [ ] Canister ID detection
- [ ] Standard EXT transfer
- [ ] Principal-only canister support
- [ ] ICP Ledger support
- [ ] `tokens_ext()` enumeration
- [ ] Input validation (Principal vs AccountId)

### Should Have
- [ ] Custom transfer methods (Departure Labs, Cronic)
- [ ] Multiple metadata formats
- [ ] Client-side transaction filtering
- [ ] Purchase → payment → settle flow

### Common Pitfalls

⚠️ **Don't** assume AccountIdentifier support - check canister ID first
⚠️ **Don't** use `getTokens()` - returns ALL tokens
⚠️ **Don't** expect filtered transactions - `transactions()` returns everything
⚠️ **Don't** confuse `ext_mint` - it's server-side pre-allocation, not user minting

---

## Additional Resources

- [API Reference](./API-REFERENCE.md) - Complete method documentation
- [EXT Standard](https://github.com/Toniq-Labs/extendable-token) - Official specification

---

**Last Updated:** 2025-11-19
