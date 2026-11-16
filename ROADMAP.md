# Roadmap

## Vision

A drop-in executive dashboard for procurement and supply-chain teams: point it at a CSV or
database export and get spend, vendor and delivery insight in minutes, with no build step.

## Milestones

### Now

- [ ] CSV and Excel import in the browser, with column mapping and the same anonymization option
- [ ] Synthetic data generator so demos need no real records
- [ ] Unit tests for the analytics and formatting helpers

### Next

- [ ] Split `app.js` into ES modules per view
- [ ] Export views to PDF and PowerPoint for board packs
- [ ] Saved filters and shareable URLs
- [ ] Accessibility pass: keyboard navigation and chart text alternatives

### Later

- [ ] Connectors for SAP, Postgres and Google Sheets
- [ ] Alerting on late orders and price drift
- [ ] Forecasting of spend and lead times

## Where this can go

| Direction        | Idea |
| ---------------- | ---- |
| **Startup**      | A procurement-intelligence product for manufacturers who live in Excel and SAP exports, with a natural-language analyst on top. |
| **Publication**  | Vendor trust and delivery-reliability scoring: methodology and evaluation on public procurement datasets. |
| **Open source**  | A reusable, framework-free dashboard shell for operational analytics. |

## How to help

See [CONTRIBUTING.md](CONTRIBUTING.md). Never contribute real vendor or customer data.
