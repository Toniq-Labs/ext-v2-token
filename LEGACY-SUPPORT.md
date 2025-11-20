# Legacy Support Guide

**For Frontend, Marketplace & Wallet Developers**

Early EXT NFT canisters have different implementations due to launches before standard finalization. This guide helps you support the entire ecosystem with canister-specific handlers.

**The Problem:** Different canisters use different methods - some accept only Principals, others use custom transfer signatures, and token enumeration varies across implementations.

**The Solution:** Detect canister ID and call the appropriate method.

---

## Metadata APIs

**Three methods exist:**
- `getMetadata()` - Collection-level (often empty)
- `ext_metadata(tokenId)` - Standard per-token metadata
- `metadata(tokenId)` - Legacy per-token metadata

**Resolution order:** Try `ext_metadata` → `metadata` → `getMetadata()`.

```javascript
async function resolveMetadata(actor, tokenId) {
    const ext = await actor.ext_metadata?.(tokenId).catch(() => null);
    if (ext) return ext;

    const legacy = await actor.metadata?.(tokenId).catch(() => null);
    if (legacy) return legacy;

    return (await actor.getMetadata?.().catch(() => null)) || null;
}
```

**Notes:** Generative collections return rich per-token metadata. Non-generative collections often return just the numeric index or `null`; handle both without failing the UI.

---

## Transfer Methods

### Known Canister Types

```javascript
const ICP_LEDGER = 'ryjl3-tyaaa-aaaaa-aaaba-cai';

const PRINCIPAL_ONLY = [
    'qcg3w-tyaaa-aaaah-qakea-cai', // ICPunks (original)
    '4nvhy-3qaaa-aaaah-qcnoq-cai', // ICats (original)
    'd3ttm-qaaaa-aaaai-qam4a-cai', // IC Drip (original)
    'jzg5e-giaaa-aaaah-qaqda-cai',
    'xkbqi-2qaaa-aaaah-qbpqq-cai',
];

const ICTURTLES = 'fl5nr-xiaaa-aaaai-qbjmq-cai';
const HZLD = 'qz7gu-giaaa-aaaaf-qaaka-cai';

// Wrapper canisters (wrapper → original mapping)
const WRAPPERS = {
    'bxdf4-baaaa-aaaah-qaruq-cai': 'qcg3w-tyaaa-aaaah-qakea-cai', // icpunks_wrapped
    'y3b7h-siaaa-aaaah-qcnwa-cai': '4nvhy-3qaaa-aaaah-qcnoq-cai', // icats_wrapped
    '3db6u-aiaaa-aaaah-qbjbq-cai': 'd3ttm-qaaaa-aaaai-qam4a-cai', // icdrip_wrapped
    'jeghr-iaaaa-aaaah-qco7q-cai': 'fl5nr-xiaaa-aaaai-qbjmq-cai', // icturtles_wrapped
    'q6hjz-kyaaa-aaaah-qcama-cai': 'xkbqi-2qaaa-aaaah-qbpqq-cai', // icpbunny_wrapped
};
```

**Helper utilities assumed:**
- `getSubAccountArray(index)` → 32-byte subaccount array (`src/extjs/utils.js`)
- `principalToAccountIdentifier(principal, index)` → ICP account id (`src/extjs/utils.js`)
- `validatePrincipal(text)` → boolean (`src/extjs/utils.js`)
- `constructUser(accountIdOrPrincipal)` → EXT `User` value (`src/extjs/extjs.js`)
- `encodeTokenId(canisterId, tokenIndex)` → EXT token identifier (`src/extjs/extjs.js`)
- `Principal` from `@dfinity/principal` is available in scope for examples

### Complete Transfer Implementation

```javascript
async function universalTransfer(canisterId, actor, tokenIndex, fromPrincipal, toUser, amount) {
    const amount64 = typeof amount === 'bigint' ? amount : BigInt(amount);

    // ICP Ledger
    if (canisterId === ICP_LEDGER) {
        return await actor.send_dfx({
            from_subaccount: [getSubAccountArray(0)],
            to: toUser, // account identifier string, not Principal
            amount: { e8s: amount64 },
            fee: { e8s: 10_000n },
            memo: 0n,
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

    // ICTurtles (transferFrom)
    if (canisterId === ICTURTLES) {
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

    // HZLD
    if (canisterId === HZLD) {
        const result = await actor.transfer({
            to: Principal.fromText(toUser),
            metadata: [],
            from: Principal.fromText(fromPrincipal),
            amount: amount64,
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
        amount: amount64,
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

    // ICTurtles (getAllNFT)
    if (canisterId === ICTURTLES) {
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

**⚠️ Warning:** Never use `getTokens()` - it returns ALL tokens, causing performance issues.

---

## Wrapped Canisters

Wrappers make non-standard NFTs EXT-compatible. Original NFTs are held in escrow while wrapped versions use standard EXT interface.

| Original Canister | Wrapped Canister | Collection |
|-------------------|------------------|------------|
| `qcg3w-tyaaa-aaaah-qakea-cai` | `bxdf4-baaaa-aaaah-qaruq-cai` | ICPunks |
| `4nvhy-3qaaa-aaaah-qcnoq-cai` | `y3b7h-siaaa-aaaah-qcnwa-cai` | ICats |
| `d3ttm-qaaaa-aaaai-qam4a-cai` | `3db6u-aiaaa-aaaah-qbjbq-cai` | IC Drip |
| `fl5nr-xiaaa-aaaai-qbjmq-cai` | `jeghr-iaaaa-aaaah-qco7q-cai` | ICTurtles |
| `xkbqi-2qaaa-aaaah-qbpqq-cai` | `q6hjz-kyaaa-aaaah-qcama-cai` | ICPBunny |

### Wrap Process

```javascript
async function wrapNFT(tokenId, wrapperCanister) {
    await wrapperActor.wrap(tokenId);  // Step 1: Prepare
    await originalActor.transfer_to(Principal.fromText(wrapperCanister), tokenId);  // Step 2: Transfer original
    await wrapperActor.mint(tokenId);  // Step 3: Mint wrapped token to caller
}
```

### Unwrap Process

```javascript
async function unwrapNFT(tokenId, subaccount) {
    return await wrapperActor.unwrap(tokenId, [subaccount]);  // Returns original NFT
}
```

### Detecting Wrapped Tokens

```javascript
function isWrapper(canisterId) {
    return canisterId in WRAPPERS;
}

function getOriginalCanister(wrapperCanisterId) {
    return WRAPPERS[wrapperCanisterId];
}

const displayTokens = tokens.map(token => ({
    ...token,
    wrapped: isWrapper(token.canister),
    originalCanister: isWrapper(token.canister)
        ? getOriginalCanister(token.canister)
        : token.canister,
    label: isWrapper(token.canister) ? 'Wrapped EXT' : 'Original',
}));
```

Wrapper transfers use the standard EXT path—no special handling required beyond detection and labeling.

---

## Transactions API

**Important:** `transactions()` returns ALL collection transactions, not filtered by caller.

```javascript
const allTx = await actor.transactions();
const myTx = allTx.filter(tx =>
    tx.buyer === myAccountId || tx.seller === myAccountId
);
```

For large collections, paginate or chunk filtering client-side to avoid UI stalls when rendering histories.

---

## Minting Workflow

**`ext_mint` is server-side pre-allocation, NOT user minting.**

1. **Pre-Sale:** Admin calls `ext_mint` to allocate tokens to airdrop/sale addresses
2. **During Sale:** Users call `ext_salePurchase` which transfers existing tokens

Tokens already exist before sale starts. User "minting" is actually purchasing/transferring.

---

## Implementation Checklist

### Must Have
- [ ] Canister ID detection (route methods by canister)
- [ ] Standard EXT transfer (encode tokenId, construct `User`, BigInt amounts)
- [ ] Principal-only canister support (`transfer_to`, `user_tokens`)
- [ ] ICP Ledger support (account identifier `to`, fee/memo as BigInt)
- [ ] `tokens_ext()` enumeration with listing/metadata extraction
- [ ] Input validation (Principal vs AccountId; reject mismatches early)
- [ ] Wrapper canister detection (mark wrapped, map to original)

### Should Have
- [ ] Custom transfer methods (e.g., ICTurtles `transferFrom`, HZLD signature)
- [ ] Multiple metadata formats (ext_metadata, legacy metadata, collection-level)
- [ ] Client-side transaction filtering (caller-only views, pagination)
- [ ] Purchase → payment → settle flow (mint server-side, sale wallet distribution)
- [ ] Wrap/unwrap UI (detect wrappers, offer wrap/unwrap actions)

### Common Pitfalls

⚠️ Don't assume AccountIdentifier support - check canister ID first
⚠️ Don't use `getTokens()` - returns ALL tokens
⚠️ Don't expect filtered transactions - `transactions()` returns everything
⚠️ Don't confuse `ext_mint` - it's server-side pre-allocation, not user minting

---

## Additional Resources

- [API Reference](./API-REFERENCE.md) - Complete method documentation
- [EXT Standard](https://github.com/Toniq-Labs/extendable-token) - Official specification

---

**Last Updated:** 2025-11-20
