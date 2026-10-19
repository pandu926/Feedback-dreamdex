# dreamDEX Perps SDK Feedback

Two reproducible input-validation reports for `@somnia-chain/markets-sdk@0.32.1`, verified using read-only public SDK calls on Somnia Tokyo / Hideki testnet (chain ID `50383`).

| Report | Observed behavior | Proposed severity |
| --- | --- | --- |
| [Negative order quantity](feedback/001-negative-order-quantity-preview.md) | The margin preview returns a negative lock amount and `sufficient: true` for an invalid negative quantity. | normal |
| [Non-finite stop-order pagination](feedback/002-nonfinite-stop-order-pagination.md) | `NaN` and `Infinity` remove the listing limit instead of producing an input error. | normal |

Each report includes reproduction steps, expected and actual results, evidence, and environment details. No transactions were submitted. These are SDK feedback reports; no unauthorized account access or fund loss has been demonstrated.

## Reproduce

Use Node.js 20 or later. The recorded checks used Node.js 26.11.1.

```bash
npm ci --prefix feedback/repro --ignore-scripts --registry=https://registry.npmjs.org
node feedback/repro/negative-quantity.mjs
node feedback/repro/nonfinite-pagination.mjs
```

The scripts require internet access to the documented testnet services. They supply no signer and do not broadcast transactions. The pagination reproduction scopes every query to one public account and pool. Returned counts and mark-dependent amounts may change with live data.

Recorded responses are in [feedback/evidence](feedback/evidence). New runs write result files beside the scripts; those generated files are ignored by Git.

## Bounty submission

Prepared for the [dreamDEX Perps Builder Bounty](https://dorahacks.io/hackathon/dreamdex-perps-bounty/detail). Acceptance, duplicate status, severity, and payment are determined by the organizer. Creating this repository does not itself submit a Build on DoraHacks.
