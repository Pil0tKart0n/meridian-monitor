# Observability Guide Reference

Detailed patterns for logging, metrics, tracing, dashboards, and alerting. Supplement to the main SKILL.md §4.

---

## OpenTelemetry Setup (Application Instrumentation)

### Node.js (auto-instrumentation)

```typescript
// tracing.ts — import FIRST in your entrypoint
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

const sdk = new NodeSDK({
  serviceName: process.env.SERVICE_NAME || 'my-service',
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4317',
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter(),
    exportIntervalMillis: 15000,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
process.on('SIGTERM', () => sdk.shutdown());
```

### Python (auto-instrumentation)

```python
# Typically via CLI: opentelemetry-instrument python app.py
# Or programmatic:
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

provider = TracerProvider()
provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter()))
trace.set_tracer_provider(provider)

FastAPIInstrumentor.instrument_app(app)  # Auto-instruments all routes
```

### Collector Configuration (Minimal)

```yaml
# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 5s
    send_batch_size: 1024

exporters:
  otlp/tempo:
    endpoint: tempo:4317
    tls:
      insecure: true
  prometheus:
    endpoint: 0.0.0.0:8889

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/tempo]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [prometheus]
```

---

## Structured Logging Standard

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | ISO 8601 | When the event occurred |
| `level` | string | `debug`, `info`, `warn`, `error`, `fatal` |
| `message` | string | Human-readable description |
| `service` | string | Service name (from env) |
| `env` | string | Environment (`dev`, `staging`, `prod`) |
| `version` | string | Application version (from build) |
| `requestId` | string | Correlation ID (from request header or generated) |
| `traceId` | string | W3C Trace Context trace ID (if OTel instrumented) |

### Optional Fields (add when relevant)

| Field | When |
|-------|------|
| `userId` | After authentication (hash if PII concern) |
| `tenantId` | Multi-tenant applications |
| `route` | HTTP requests |
| `statusCode` | HTTP responses |
| `latencyMs` | Request/operation duration |
| `error.type` | Error class name |
| `error.message` | Error message (never include stack in prod logs) |

### Example (Node.js with pino)

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service: process.env.SERVICE_NAME,
    env: process.env.NODE_ENV,
    version: process.env.APP_VERSION,
  },
});

// Usage: logger.info({ requestId, userId, route: '/api/orders' }, 'Order created');
```

---

## Dashboard Templates

### Golden Signals Dashboard (per service)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Service: api-service | Environment: prod | Last 1h                      │
├──────────────────────┬──────────────────────┬──────────────────────────┤
│ Request Rate         │ Error Rate           │ Latency (p50/p95/p99)    │
│ [line chart]         │ [line chart]         │ [line chart]             │
│ Current: 250 req/s   │ Current: 0.3%        │ p50: 45ms p95: 180ms    │
├──────────────────────┼──────────────────────┼──────────────────────────┤
│ CPU Utilization      │ Memory Utilization   │ Connection Pool          │
│ [gauge]              │ [gauge]              │ [gauge]                  │
│ 35%                  │ 62%                  │ 12/20 active             │
├──────────────────────┴──────────────────────┴──────────────────────────┤
│ Recent Deploys       │ SLO Status           │ Error Budget Remaining   │
│ v1.4.2 (2h ago)      │ Availability: 99.95% │ 72% (27 days left)       │
└──────────────────────────────────────────────────────────────────────────┘
```

### PromQL Queries (Grafana/Prometheus)

```promql
# Request rate
rate(http_server_request_duration_seconds_count{service="api"}[5m])

# Error rate (5xx)
sum(rate(http_server_request_duration_seconds_count{service="api", http_status_code=~"5.."}[5m]))
/
sum(rate(http_server_request_duration_seconds_count{service="api"}[5m]))

# Latency p95
histogram_quantile(0.95, sum(rate(http_server_request_duration_seconds_bucket{service="api"}[5m])) by (le))

# Error budget burn rate (1h window)
1 - (
  sum(rate(http_server_request_duration_seconds_count{service="api", http_status_code!~"5.."}[1h]))
  /
  sum(rate(http_server_request_duration_seconds_count{service="api"}[1h]))
) / (1 - 0.999)  # 99.9% SLO target
```

---

## Alert Rule Patterns

### Multi-Window Burn Rate (SLO-based alerting)

| Window | Burn rate | Meaning | Action |
|--------|----------|---------|--------|
| 1h | 14.4× | Budget consumed in ~5h | **Page** (SEV1/2) |
| 6h | 6× | Budget consumed in ~3 days | **Page** (SEV2) |
| 3d | 1× | Budget consumed on schedule | **Ticket** (SEV3) |

```yaml
# Alertmanager rule example
- alert: HighErrorBurnRate
  expr: |
    (
      job:slo_errors_per_request:ratio_rate1h{job="api"} > (14.4 * 0.001)
      and
      job:slo_errors_per_request:ratio_rate5m{job="api"} > (14.4 * 0.001)
    )
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: "High error budget burn rate for {{ $labels.job }}"
    runbook_url: "https://wiki.example.com/runbooks/api-high-error-rate"
```

### Alert Hygiene Rules

1. **Every alert must have a runbook link.** No exceptions.
2. **Every alert must be actionable.** If the response is "wait and see" → it's not an alert, it's a dashboard.
3. **Review alerts quarterly.** Delete alerts that haven't fired or that were always false positives.
4. **Group related alerts.** Don't page for each symptom of the same root cause.
5. **Separate pages from tickets.** Pages = immediate human action needed. Tickets = fix in business hours.

---

## Trace Sampling Strategies

| Strategy | When | Config |
|----------|------|--------|
| **Always sample errors** | Always (non-negotiable) | 100% for status >= 500 |
| **Probabilistic** | Default for success | Start 10%, adjust based on volume/cost |
| **Rate-limited** | High-traffic services | Max N traces per second |
| **Tail-based** | When you need complete traces for slow/error requests | Collector-level decision (requires buffering) |

**Rule:** Start with probabilistic (10%) + always-on for errors. Adjust based on trace storage costs and debugging needs.

---

## Log Aggregation Architecture

```
Application → structured JSON logs → stdout/stderr
    ↓
Container runtime captures stdout
    ↓
DaemonSet collector (Fluent Bit / OTel Collector)
    ↓
Central log store (Loki / Elasticsearch / CloudWatch)
    ↓
Grafana / Kibana for querying
```

**Rules:**
- Applications log to stdout/stderr. Never to files inside containers.
- Collector handles parsing, enrichment (pod labels, node info), and routing.
- Retention: 30 days hot (queryable), 90 days cold (archive), per compliance requirements.
- PII: Strip or mask before storage. Never log passwords, tokens, or unmasked PII.
