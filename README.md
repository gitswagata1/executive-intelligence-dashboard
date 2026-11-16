<div align="center">

# Executive Intelligence Dashboard

A dark glassmorphism **command center** for manufacturing procurement. Spend, vendors,
fill rates and lead times in one zero-install page, with an optional Claude-powered
analyst.

![JavaScript](https://img.shields.io/badge/JavaScript-ES2020-F7DF1E?logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-4.4-FF6384?logo=chartdotjs&logoColor=white)
![Dependencies](https://img.shields.io/badge/build_step-none-success)
[![CI](https://github.com/gitswagata1/executive-intelligence-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/gitswagata1/executive-intelligence-dashboard/actions/workflows/ci.yml)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

> **Demo data.** The bundled dataset is **anonymized and illustrative**. Vendors appear as
> `Vendor 01..N`, plants as `Plant 01..N`, purchase orders as `PO-00001..`, and monetary
> and tonnage values are scaled. It shows how the dashboard behaves, not real business
> figures.

## Table of contents

- [Features](#features)
- [Quick start](#quick-start)
- [Modules](#modules)
- [AI analyst](#ai-analyst-optional)
- [Using your own data](#using-your-own-data)
- [Validating data](#validating-data)
- [Project structure](#project-structure)
- [Tech stack](#tech-stack)
- [Security notes](#security-notes)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Citation](#citation)
- [License](#license)

## Features

- **Executive command center** with headline KPIs, monthly trends, fulfilment breakdown
  and spend by plant and category
- **Raw material intelligence**: spend by category, lead-time distribution, sourcing by
  region, top grades, an overdue list and a filterable order explorer with CSV export
- **Vendor analytics**: scorecards with spend, tonnage, fill rate and a trust index
- **Material drill-down** from category to grade to vendor
- **Role-aware header** (VP, plant head, procurement and others) with simulated access control
- **No build step**: static HTML, CSS and JavaScript that works offline

## Quick start

Open `index.html` directly in a browser, or serve the folder:

```bash
python -m http.server 8123
# then open http://localhost:8123
```

The login screen is pre-filled and accepts any credentials; pick a role and click
**Enter Command Center**.

## Modules

| Module                    | Status      | Description                                           |
| ------------------------- | ----------- | ----------------------------------------------------- |
| Command Center            | Live        | KPIs, trends, fulfilment and spend by plant/category  |
| Swagata.ai                | Live        | Ask questions about the data in plain language        |
| Raw Material Intelligence | Live        | Category spend, lead times, overdue orders, explorer  |
| Material Drill-Down       | Live        | Category, grade and vendor hierarchy                  |
| Vendor Analytics          | Live        | Vendor scorecards and trust index                     |
| Predictive Maintenance    | Scaffolded  | Placeholder for a machine IoT feed                    |
| Logistics & Supply Chain  | Scaffolded  | Placeholder for a fleet and dispatch feed             |
| HR & Workforce            | Scaffolded  | Placeholder for an attendance feed                    |
| Financial Intelligence    | Scaffolded  | Placeholder for a GL and costing feed                 |

## AI analyst (optional)

The **Swagata.ai** view answers questions from the loaded dataset with a built-in offline
engine. To get free-form answers from a Claude model, open the connect panel and paste an
Anthropic API key. The key is stored only in your browser's `localStorage` and requests go
straight from your browser to `api.anthropic.com`. Use **Clear** to remove it.

## Using your own data

All dashboards read a single global, `window.RM_DATA`, defined in `data/rm-data.js`.

| Key                         | Contents                                          |
| --------------------------- | ------------------------------------------------- |
| `meta`                      | Data windows and generation time                  |
| `kpis`                      | Headline numbers (order value, tonnage, fill, ...) |
| `byCategory`, `byPlant`, `byGrade`, `byRegion` | Aggregates for charts          |
| `ordersTrend`, `receiptTrend`, `leadDist`      | Time series and distributions  |
| `vendors`                   | Vendor scorecard rows                             |
| `overdue`, `rawOrders`      | Order lines for the explorer                      |
| `hier`, `gradeVendor`       | Drill-down hierarchy                              |

To use your own export, generate a file with the same shape and replace
`data/rm-data.js`. **Anonymize it before publishing**: never commit real vendor names,
plant codes or purchase-order numbers. See [docs/data-schema.md](docs/data-schema.md).

## Validating data

```bash
npm run validate
```

Checks the dataset structure and fails if any vendor, plant, purchase-order or material
identifier is not anonymized. It also runs in CI, so real data cannot be published by accident.

## Project structure

```
executive-intelligence-dashboard/
├── index.html            App shell: login screen, sidebar and main view
├── css/
│   └── styles.css        Theme, glassmorphism components and layout
├── js/
│   └── app.js            Navigation, views, charts, explorer and AI analyst
├── data/
│   └── rm-data.js        Anonymized demo dataset (window.RM_DATA)
├── vendor/
│   └── chart.umd.min.js  Chart.js 4.4.1 (MIT), bundled for offline use
├── scripts/
│   └── validate-data.mjs Schema check and anonymization gate (runs in CI)
├── docs/
│   └── data-schema.md    Dataset reference
├── package.json          npm run validate / check / start
├── LICENSE
└── README.md
```

## Tech stack

Vanilla JavaScript, CSS custom properties and [Chart.js](https://www.chartjs.org/).
Fonts (Inter and Sora) load from Google Fonts and fall back to system fonts offline.

## Security notes

- Authentication is **simulated** for the demo. Do not use this login for real access control.
- Treat any Anthropic key as a secret. Because the call is made from the browser, use a
  restricted key, or proxy requests through your own backend for shared deployments.

## Roadmap

Planned work, ideas for taking the project further and open research questions are in
[ROADMAP.md](ROADMAP.md). Good first tasks are labelled
[`good first issue`](https://github.com/gitswagata1/executive-intelligence-dashboard/labels/good%20first%20issue).

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and the
[Code of Conduct](CODE_OF_CONDUCT.md) first. To report a vulnerability, follow
[SECURITY.md](SECURITY.md).

## Citation

If you use this project in research or a product, you can cite it using
[CITATION.cff](CITATION.cff) (GitHub shows a "Cite this repository" button).

## License

Released under the [MIT License](LICENSE). Chart.js is © its contributors, also MIT licensed.

---

Built by **Swagata Banerjee** · [GitHub](https://github.com/gitswagata1)
