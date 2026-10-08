 # Speech Pathology Activity Builder

Assessment 3 extends the Assessment 1 frontend and Assessment 2 backend (SQLite, Prisma, CRUD APIs, validation, Docker) with a data-driven dashboard, simulated usage records, alerts, CSV reporting, observability (Jaeger, Zipkin, Prometheus) and automated tests.

## Local setup

```powershell
Copy-Item .env.example .env
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`. The application includes Wordle and Word Search builders, an **Activity Data** page for managing saved activities and words, an About page, and Settings for theme and layout preferences. The seed command creates starter Wordle and Word Search activities.

The health check is available at `http://localhost:3000/api/health` and returns 200 when SQLite is available.

## API

- `GET/POST /api/activity-sets` lists or creates activities.
- `GET /api/activity-sets?type=WORDLE|WORD_SEARCH` filters activities by type.
- `GET/PUT/DELETE /api/activity-sets/:id` retrieves, updates, or deletes an activity and its words.
- `GET/POST /api/activity-sets/:id/words` lists or adds words for an activity.
- `GET /api/words/:id` retrieves an individual word.
- `PUT/DELETE /api/words/:id` updates or deletes an individual word.
- `GET /api/health` checks the API and database connection.
- `GET /health` returns `200 OK` when the app is running.
- `GET /api/metrics` returns dashboard metrics (activity counts, average time on page, most-used activity type, successful/failed generations, word list summary, alerts).
- `POST /api/events` records a usage event (`PAGE_VIEW`, `GENERATION_SUCCESS`, `GENERATION_FAILURE`).
- `GET /api/report` downloads a CSV report of activities and usage events.

## Assessment 3: dashboard and testing

Open `/dashboard` for health status, alerts, usage statistics and the word list summary. `npm run db:seed` adds simulated usage events. With the app running, `npm test` runs the API tests (set `BASE_URL` to test another host).

Phonemes are stored as JSON arrays so multi-character symbols such as `tʃ` are preserved as one value.

## Docker

```powershell
docker compose up --build
```

Open `http://localhost:3000` after the container starts. SQLite is persisted in the `activity-data` volume.

## Demonstration flow

1. Open **Activity Data** and show the student ID in the footer.
2. Create, edit, refresh, and delete an activity containing multiple words.
3. Open `/api/health` and show the 200 response.
4. Run the Docker compose command and repeat the health check.
5. Use the Wordle and Word Search builders to generate downloadable HTML activities.

## Observability (OpenTelemetry, Jaeger, Zipkin, Prometheus)

The app is instrumented with OpenTelemetry (`instrumentation.ts`, `lib/telemetry.ts`). Traces and custom metrics (`builder_generations_total`, `builder_page_views_total`, `builder_time_on_page_ms`) go to an OpenTelemetry Collector, which forwards traces to Jaeger and Zipkin and exposes metrics for Prometheus.

```
docker compose -f docker-compose.monitoring.yml up -d
npm run dev
```

| Tool | URL | What to check |
| --- | --- | --- |
| Jaeger | http://localhost:16686 | Service `next-app`, last hour, Find Traces |
| Zipkin | http://localhost:9411 | serviceName `next-app`, Run Query |
| Prometheus | http://localhost:9090 | `builder_generations_total`, `otelcol_exporter_sent_spans_total` |
| Collector metrics | http://localhost:8888/metrics, http://localhost:8889/metrics | Raw metrics |

Use the app (generate activities, open pages) so data appears. Try a bad URL such as `/api/hello1` to see a 404 trace.