#!/usr/bin/env node
/**
 * Validates data/rm-data.js before it is committed or published.
 *
 *  - Checks that the structure the dashboard depends on is present.
 *  - Acts as a leak gate: vendors, plants, purchase orders and material codes must
 *    be anonymized (e.g. "Vendor 01", "Plant 01", "PO-00001", "MAT-0001").
 *
 * Usage: node scripts/validate-data.mjs
 */
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../data/rm-data.js", import.meta.url), "utf8");
const context = { window: {} };
vm.runInNewContext(source, context);
const data = context.window.RM_DATA;

const errors = [];
const fail = (message) => errors.push(message);

if (!data) {
  fail("window.RM_DATA is not defined");
} else {
  const required = [
    "meta", "kpis", "byCategory", "byPlant", "byGrade", "byRegion", "ordersTrend",
    "receiptTrend", "leadDist", "vendors", "overdue", "rawOrders", "hier", "gradeVendor",
  ];
  for (const key of required) {
    if (!(key in data)) fail(`missing top-level key: ${key}`);
  }

  if (data.meta && data.meta.anon !== true) fail("meta.anon must be true");

  const expectPattern = (label, values, pattern) => {
    const bad = [...new Set(values)].filter((v) => !pattern.test(String(v)));
    if (bad.length) fail(`${label}: ${bad.length} value(s) are not anonymized, e.g. "${bad[0]}"`);
  };

  expectPattern("vendors[].vendor", (data.vendors ?? []).map((v) => v.vendor), /^Vendor \d{2,}$/);
  expectPattern("byPlant[].plant", (data.byPlant ?? []).map((p) => p.plant), /^Plant \d{2,}$/);
  expectPattern("rawOrders[].vendor", (data.rawOrders ?? []).map((o) => o.vendor), /^Vendor \d{2,}$/);
  expectPattern("rawOrders[].plant", (data.rawOrders ?? []).map((o) => o.plant), /^Plant \d{2,}$/);
  expectPattern("rawOrders[].po", (data.rawOrders ?? []).map((o) => o.po), /^PO-\d{5,}$/);
  expectPattern("rawOrders[].mat", (data.rawOrders ?? []).map((o) => o.mat), /^MAT-\d{4,}$/);
  expectPattern("overdue[].po", (data.overdue ?? []).map((o) => o.po), /^PO-\d{5,}$/);
  if (data.kpis) expectPattern("kpis.topVendor", [data.kpis.topVendor], /^Vendor \d{2,}$/);
}

if (errors.length) {
  console.error("Data validation failed:\n - " + errors.join("\n - "));
  process.exit(1);
}
console.log(
  `OK: ${data.vendors.length} vendors, ${data.byPlant.length} plants, ` +
    `${data.rawOrders.length} order lines. All identifiers are anonymized.`
);
