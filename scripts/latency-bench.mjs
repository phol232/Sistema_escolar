#!/usr/bin/env node

import { performance } from "node:perf_hooks";
import process from "node:process";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const ROUTES = (process.env.ROUTES ?? "/configuracion/anio-escolar,/configuracion/niveles-grados,/configuracion/aulas,/personas,/docentes")
  .split(",")
  .map((route) => route.trim())
  .filter(Boolean);
const ITERATIONS = parsePositiveInt(process.env.ITERATIONS, 8);
const BURST_REQUESTS = parsePositiveInt(process.env.BURST_REQUESTS, 20);
const CONCURRENCY = parsePositiveInt(process.env.CONCURRENCY, 5);
const TIMEOUT_MS = parsePositiveInt(process.env.TIMEOUT_MS, 15000);
const REQUEST_MODE = (process.env.REQUEST_MODE ?? "html").toLowerCase();
const COOKIE = process.env.COOKIE?.trim();
const OUT_JSON = process.env.OUT_JSON?.trim();
const FAIL_ON_ERROR = process.env.FAIL_ON_ERROR === "1";

const sharedHeaders = {
  "user-agent": "sistema-escolar-latency-bench/1.0",
};

if (COOKIE) {
  sharedHeaders.cookie = COOKIE;
}

if (REQUEST_MODE === "rsc") {
  sharedHeaders.accept = "text/x-component";
  sharedHeaders.rsc = "1";
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function percentile(sorted, p) {
  if (sorted.length === 0) {
    return 0;
  }

  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[index];
}

function toMs(value) {
  return `${value.toFixed(1)} ms`;
}

function buildUrl(route, options = {}) {
  const url = new URL(route, BASE_URL);

  if (REQUEST_MODE === "rsc") {
    url.searchParams.set("_rsc", options.rscToken ?? `bench-${Date.now()}`);
  }

  if (options.cacheBustToken) {
    url.searchParams.set("__bench", options.cacheBustToken);
  }

  return url.toString();
}

async function requestRoute(route, scenario, sequence, options = {}) {
  const cacheBustToken = options.cacheBust ? `${scenario}-${sequence}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` : undefined;
  const url = buildUrl(route, {
    cacheBustToken,
    rscToken: `${scenario}-${sequence}-${Date.now().toString(36)}`,
  });

  const startedAt = performance.now();

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: sharedHeaders,
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    await response.arrayBuffer();

    const latencyMs = performance.now() - startedAt;

    return {
      scenario,
      route,
      url,
      status: response.status,
      ok: response.status >= 200 && response.status < 300,
      latencyMs,
      error: null,
    };
  } catch (error) {
    const latencyMs = performance.now() - startedAt;

    return {
      scenario,
      route,
      url,
      status: 0,
      ok: false,
      latencyMs,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function runSequentialScenario(scenario, routes, iterations, options = {}) {
  const results = [];
  let sequence = 0;

  for (let i = 0; i < iterations; i += 1) {
    for (const route of routes) {
      sequence += 1;
      const result = await requestRoute(route, scenario, sequence, options);
      results.push(result);
    }
  }

  return results;
}

async function runConcurrentScenario(scenario, routes, totalPerRoute, concurrency, options = {}) {
  const results = [];

  for (const route of routes) {
    let inFlight = 0;
    let launched = 0;
    let finished = 0;

    await new Promise((resolve) => {
      const launchNext = () => {
        while (inFlight < concurrency && launched < totalPerRoute) {
          inFlight += 1;
          launched += 1;
          const sequence = launched;

          requestRoute(route, scenario, sequence, options)
            .then((result) => {
              results.push(result);
            })
            .finally(() => {
              inFlight -= 1;
              finished += 1;

              if (finished >= totalPerRoute) {
                resolve(undefined);
                return;
              }

              launchNext();
            });
        }
      };

      launchNext();
    });
  }

  return results;
}

function summarize(results) {
  const groups = new Map();

  for (const item of results) {
    const key = `${item.scenario}::${item.route}`;
    const existing = groups.get(key) ?? [];
    existing.push(item);
    groups.set(key, existing);
  }

  const rows = [];

  for (const [key, items] of groups.entries()) {
    const [scenario, route] = key.split("::");
    const latencies = items.map((item) => item.latencyMs).sort((a, b) => a - b);
    const okCount = items.filter((item) => item.ok).length;
    const errorCount = items.length - okCount;
    const avg = latencies.reduce((sum, value) => sum + value, 0) / Math.max(1, latencies.length);

    const statusCounts = {};
    const errorCounts = {};
    for (const item of items) {
      const statusKey = String(item.status);
      statusCounts[statusKey] = (statusCounts[statusKey] ?? 0) + 1;

      if (item.error) {
        errorCounts[item.error] = (errorCounts[item.error] ?? 0) + 1;
      }
    }

    rows.push({
      scenario,
      route,
      requests: items.length,
      okRate: Number(((okCount / Math.max(1, items.length)) * 100).toFixed(2)),
      avgMs: Number(avg.toFixed(2)),
      p50Ms: Number(percentile(latencies, 50).toFixed(2)),
      p95Ms: Number(percentile(latencies, 95).toFixed(2)),
      minMs: Number((latencies[0] ?? 0).toFixed(2)),
      maxMs: Number((latencies[latencies.length - 1] ?? 0).toFixed(2)),
      errorCount,
      statusCounts,
      errorCounts,
    });
  }

  rows.sort((a, b) => a.scenario.localeCompare(b.scenario) || a.route.localeCompare(b.route));
  return rows;
}

function printSummary(rows) {
  const byScenario = new Map();
  for (const row of rows) {
    const list = byScenario.get(row.scenario) ?? [];
    list.push(row);
    byScenario.set(row.scenario, list);
  }

  console.log("\nLatency benchmark summary");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Mode: ${REQUEST_MODE}`);
  console.log(`Routes: ${ROUTES.join(", ")}`);
  console.log(`Cookie provided: ${COOKIE ? "yes" : "no"}`);

  for (const [scenario, scenarioRows] of byScenario.entries()) {
    console.log(`\nScenario: ${scenario}`);
    console.log("route | req | ok% | avg | p50 | p95 | min | max | errors | statuses");
    for (const row of scenarioRows) {
      const statuses = Object.entries(row.statusCounts)
        .map(([status, count]) => `${status}:${count}`)
        .join(" ");
      const topErrors = Object.entries(row.errorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([message, count]) => `${count}x ${message}`)
        .join(" | ");
      console.log(
        `${row.route} | ${row.requests} | ${row.okRate.toFixed(2)} | ${toMs(row.avgMs)} | ${toMs(row.p50Ms)} | ${toMs(row.p95Ms)} | ${toMs(row.minMs)} | ${toMs(row.maxMs)} | ${row.errorCount} | ${statuses}`,
      );
      if (topErrors) {
        console.log(`  errors: ${topErrors}`);
      }
    }
  }
}

async function main() {
  if (ROUTES.length === 0) {
    console.error("No routes configured. Set ROUTES=/r1,/r2");
    process.exitCode = 1;
    return;
  }

  console.log("Running latency scenarios...");

  const coldResults = await runSequentialScenario("cold_sequential", ROUTES, 1, { cacheBust: true });
  const warmResults = await runSequentialScenario("warm_sequential", ROUTES, ITERATIONS, { cacheBust: false });
  const burstResults = await runConcurrentScenario("burst_concurrent", ROUTES, BURST_REQUESTS, CONCURRENCY, { cacheBust: false });

  const allResults = [...coldResults, ...warmResults, ...burstResults];
  const summaryRows = summarize(allResults);

  printSummary(summaryRows);

  const okCount = allResults.filter((item) => item.ok).length;
  const errorCount = allResults.length - okCount;

  if (okCount === 0) {
    console.error("\\nNo successful requests. Is the app running and is COOKIE valid for protected routes?");
    process.exitCode = 2;
  } else if (FAIL_ON_ERROR && errorCount > 0) {
    console.error(`\\nFAIL_ON_ERROR=1 and ${errorCount} requests failed.`);
    process.exitCode = 3;
  }

  if (OUT_JSON) {
    const fs = await import("node:fs/promises");
    await fs.writeFile(
      OUT_JSON,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          config: {
            BASE_URL,
            ROUTES,
            ITERATIONS,
            BURST_REQUESTS,
            CONCURRENCY,
            TIMEOUT_MS,
            REQUEST_MODE,
            cookieProvided: Boolean(COOKIE),
            failOnError: FAIL_ON_ERROR,
          },
          summary: summaryRows,
          raw: allResults,
        },
        null,
        2,
      ),
      "utf8",
    );

    console.log(`\nSaved JSON report to ${OUT_JSON}`);
  }
}

main().catch((error) => {
  console.error("Benchmark failed:", error);
  process.exitCode = 1;
});
