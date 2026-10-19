# Negative order quantity produces sufficient margin and a negative lock amount
Severity: normal
Area: SDK

## Steps to reproduce
1. Install `@somnia-chain/markets-sdk@0.32.1` and `viem@2.57.7` in a Node.js project. The included reproduction package pins these versions.
2. Run `npm install --prefix feedback/repro --ignore-scripts --registry=https://registry.npmjs.org` and then `node feedback/repro/negative-quantity.mjs` from the repository root.
3. The script connects to Somnia Tokyo/Hideki testnet with the documented chain and indexer configuration. It generates a fresh address, supplies no signer, and selects the BTC market.
4. It calls the public `client.previewPerpOrderMargin` with `isBid: true`, `quantity: 100000n`, and `price: 100000000000000000000000n` as a positive control, then repeats with `quantity: -100000n`.

## Expected
The preview should reject a negative order quantity with an actionable input error before producing margin requirements. Its result should not contain negative margin lock amounts or claim sufficiency for an order outside the unsigned quantity domain.

## Actual
On an empty test address, the positive control returned `sufficient: false`. The negative quantity returned:

```json
{
  "priceable": true,
  "asOfBlock": "28014940",
  "increasingQuantity": "-100000",
  "lockAmount": "-23055515679771536498",
  "initialMarginPortion": "-4999999999999999999",
  "adverseGapPortion": "-18055515679771536499",
  "hasCollateralForLock": true,
  "meetsInitialMargin": true,
  "sufficient": true
}
```

An application using this preview to display required margin or gate submission can show a negative requirement and enable an invalid submission. The actual order quantity is unsigned, so this is a preview/input-validation issue; it does not demonstrate a successful invalid order or a loss of funds. The exact negative lock value changes with the live mark price.

## Evidence
- Reproduction: `feedback/repro/negative-quantity.mjs`.
- Full public SDK request inputs and results: `feedback/evidence/negative-quantity.json`.
- Source: `src/perp/margin.ts`, `perpOrderMarginQuote` around lines 2115–2132 and `previewPerpOrderMargin` around lines 2454–2493 in SDK 0.32.1.
- The chain-tier preview forwards the invalid quantity to the pure quote without a positivity check. The sibling `previewPerpLiquidationPrice` already rejects nonpositive quantities around line 3287.
- No transaction was submitted; no transaction hash applies.

## Environment
- SDK: `@somnia-chain/markets-sdk@0.32.1`.
- Runtime used for reproduction: Node.js 26.11.1; viem 2.57.7.
- Network: Somnia Tokyo / Hideki testnet, chain ID `50383`.
- Indexer: `https://hideki-dev.smk.somnia.host/v1/graphql`.
- Test address: `0xdFE86a1eD950A5FBd3522dF427D4676108D9b886`, generated solely for read-only checks.
- BTC pool: `0x4181dd08e73bbcdd1ba3e615a18f6abd941b94c0`.
- MarginBank: `0x478769e1177c0773c43a593dccc4ad15f15f1394`.

## Suggested correction
Validate the quantity domain in both the public pure quote and the chain-tier preview. Reject negative values before arithmetic or RPC reads, and document the intended treatment of zero. Preserve useful typed input errors for applications.
