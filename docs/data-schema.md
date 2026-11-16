# Data schema

The dashboard reads one global object, `window.RM_DATA`, defined in `data/rm-data.js`.
All identifiers in the bundled file are anonymized.

## Top-level keys

| Key            | Type   | Description |
| -------------- | ------ | ----------- |
| `meta`         | object | `generated`, `orderWindow`, `grnWindow`, `anon` flag |
| `kpis`         | object | Headline numbers: `orderValue`, `pendingValue`, `receivedValue`, `tonnage`, `orderTonnes`, `vendors`, `grns`, `grades`, `plants`, `materials`, `overdueLines`, `overdueValue`, `openPending`, `avgLead`, `medLead`, `topVendor`, `topVendorSpend`, `valueFill`, `unitsFill`, `lineFill`, `unitsShortT` |
| `byCategory`   | array  | `{ name, order, tonnes, lines }` |
| `byPlant`      | array  | `{ plant, order, received, pending, tonnes }` |
| `byGrade`      | array  | `{ value, tonnes, ... }` per grade |
| `byRegion`     | array  | `{ value, tonnes, ... }` per sourcing region |
| `ordersTrend`  | array  | Monthly order value |
| `receiptTrend` | array  | Monthly receipt value and tonnage |
| `leadDist`     | array  | `{ label, count }` lead-time buckets |
| `vendors`      | array  | `{ vendor, spend, received, pending, ordT, recT, lines, fill, delivpct, region, trust }` |
| `overdue`      | array  | `{ plant, po, vendor, desc, pend, due, daysLate }` |
| `rawOrders`    | array  | `{ plant, po, mat, date, vendor, grade, cat, desc, qtyT, order, pend, status, delivered }` |
| `hier`         | array  | Category, grade drill-down with `ordT`, `recT`, `pendT`, `fill` |
| `gradeVendor`  | object | Keyed by `"Category / Grade"`; vendor price and ordered tonnes |

## Units

- Money values are in rupees; tonnage in tonnes; lead times in days; fill and delivery rates in percent.

## Anonymization rules

Apply these before publishing any dataset built from real records:

| Real field          | Published as                         |
| ------------------- | ------------------------------------ |
| Vendor names        | `Vendor 01..N`, ranked by spend      |
| Plant codes         | `Plant 01..N`, ranked by order value |
| Purchase orders     | `PO-00001..`                         |
| Material codes      | `MAT-0001..`                         |
| Money and tonnage   | Multiplied by a constant scale factor |

Ratios such as fill rate, trust index and lead time are left unchanged so the charts
stay realistic.
