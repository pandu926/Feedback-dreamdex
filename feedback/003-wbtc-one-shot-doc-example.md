# Perps one-shot example selects WBTC then dereferences an empty market list
Severity: normal
Area: docs

## Steps to reproduce
1. Install `@somnia-chain/markets-sdk@0.32.1` using the included reproduction package: `npm ci --prefix feedback/repro --ignore-scripts --registry=https://registry.npmjs.org`.
2. Configure the client for Somnia Tokyo / Hideki testnet using the official developer guide: chain ID `50383`, the Hideki chain/address preset, and `https://hideki-dev.smk.somnia.host/v1/graphql`.
3. Follow the **One-shot reads (no watch)** example in the published package's `docs/PERPS.md`, around lines 1208–1212:

```ts
const perps = await client.listPerpMarkets({ baseSymbol: "WBTC", limit: 20 });
const one = await client.getPerpMarket(perps[0].id);
```

4. Run `node feedback/repro/wbtc-doc-example.mjs` for the same read-only calls, with the failure captured and a `BTC` query as a control.

## Expected
A copyable perps example should select a market present on the documented testnet or handle an empty result before indexing it. The guide's opening examples use BTC and ETH.

## Actual
The exact `WBTC` filter returns no market on Tokyo/Hideki. The following expression reads `.id` from `undefined` before `getPerpMarket` is called:

```text
TypeError: Cannot read properties of undefined (reading 'id')
```

The `BTC` control returns one market. A developer copying the published one-shot example therefore fails before reaching the subsequent portfolio and state reads.

This is a documentation/example mismatch for Tokyo testnet, not a failure of the SDK's exact-symbol filtering. Market availability can change; the evidence records the observed deployment.

## Evidence
- Script: `feedback/repro/wbtc-doc-example.mjs`.
- Captured results: `feedback/evidence/wbtc-doc-example.json` (`WBTC`: 0, `BTC`: 1, captured `TypeError`).
- Published package location: `node_modules/@somnia-chain/markets-sdk/docs/PERPS.md`, **One-shot reads (no watch)**.
- Official network/setup guide: https://app.testnet.dreamdex.io/docs/developers/perps-testnet.
- No transaction was submitted; no transaction hash applies.

## Environment
- SDK: `@somnia-chain/markets-sdk@0.32.1`; viem 2.57.7.
- Runtime: Node.js 26.11.1.
- Network: Somnia Tokyo / Hideki testnet, chain ID `50383`.
- Indexer: `https://hideki-dev.smk.somnia.host/v1/graphql`.
- Wallet address: not applicable; market discovery is read-only and account-independent.

## Suggested correction
Use `BTC` in the example and guard the empty result before accessing the first market. Also handle the nullable result of `getPerpMarket` before reading its pool address.
