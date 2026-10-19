# Non-finite stop-order limits remove pagination instead of rejecting input
Severity: normal
Area: SDK

## Steps to reproduce
1. Install the included reproduction dependencies with `npm install --prefix feedback/repro --ignore-scripts --registry=https://registry.npmjs.org`.
2. Run `node feedback/repro/nonfinite-pagination.mjs`.
3. The script uses the public `client.listPerpStopOrders` method on Somnia Tokyo / Hideki testnet and scopes every request to one public account and one pool. It requests all four documented lifecycle statuses.
4. Compare `limit: 1`, `limit: NaN`, and `limit: Infinity`. The script performs only three read-only listing calls and never requests the global table without a limit.

## Expected
Reject non-finite limits with an actionable input error before making a request. An invalid page-size value should not silently turn a bounded listing into an unlimited listing.

## Actual
For the same account/pool scope, the public SDK returned:

| Limit input | Returned rows |
| --- | --- |
| `1` | 1 |
| `NaN` | 4 |
| `Infinity` | 4 |

`listPerpStopOrders` forwards `opts.limit ?? 200` without validating that it is a finite integer. Both non-finite values survive the nullish-coalescing default and serialize to JSON `null`. The indexer treats `limit: null` as an unlimited listing for the selected scope.

If an application calculates a page size from invalid input, it can unexpectedly fetch the entire matching history, increasing response size, memory use and latency as history grows. The evidence demonstrates pagination loss, not measured service disruption. The current four-row sample is intentionally small.

## Evidence
- Public SDK reproduction: `feedback/repro/nonfinite-pagination.mjs`.
- Inputs, scope and response counts: `feedback/evidence/nonfinite-pagination.json`.
- SDK 0.32.1 source: `src/perp/stops.ts:305–330`, especially the `limit`/`offset` variables passed to `gqlRequest`.
- `src/graphqlBoundary.ts:194–197` serializes the GraphQL request.
- `listPerpPositionChanges` already validates finite integer pagination bounds in `src/perp/history.ts:1420–1428`, explicitly documenting this same JSON-null failure mode.
- No transaction was submitted; no transaction hash applies.

## Environment
- SDK: `@somnia-chain/markets-sdk@0.32.1`.
- Runtime: Node.js 26.11.1; viem 2.57.7.
- Network: Somnia Tokyo / Hideki testnet, chain ID `50383`.
- Indexer: `https://hideki-dev.smk.somnia.host/v1/graphql`.
- Public read-only sample account: `0x38c01adebdd275f8bec6b41245d63e273b01bad4`. This account was not controlled or modified by the reporter.
- Pool: `0x0f464d57c1fd839e4d87a408bbccdab8f77e6394`.
- Status scope: `PENDING`, `TRIGGERED`, `TRIGGER_FAILED`, `CANCELLED`.

## Suggested correction
Validate pagination before any indexer request: require finite integer limits within documented bounds and finite non-negative integer offsets. Reuse the validation pattern already present in `listPerpPositionChanges`.
