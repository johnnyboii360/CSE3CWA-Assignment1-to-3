 # Speech Pathology Activity Builder

 The Speech Pathology Activity Builder creates phoneme-based Wordle and Word Search activities. It includes saved activity and word management backed by SQLite and Prisma, downloadable HTML activities, a data-driven dashboard, usage-event reporting, health checks, and OpenTelemetry observability.

 Usage events added by the seed script are simulated demonstration data; they are not real user activity.

 ## Requirements

 - Node.js and npm
 - Docker Desktop for the container and monitoring-stack demonstrations
 - Apache JMeter for the load-test evidence described below
 - A Chromium-based browser for the Lighthouse audit

 ## Local setup

 From the `interface` directory, create the environment file and start the app:

 ```powershell
 Copy-Item .env.example .env
 npm install
 npm run db:generate
 npm run db:push
 npm run db:seed
 npm run dev
 ```

 Open `http://localhost:3000`. The application includes Wordle and Word Search builders, an **Activity Data** page for managing saved activities and words, an About page, Settings for theme and layout preferences, and an Operations dashboard. The seed command creates starter activities and simulated usage events. The health check at `http://localhost:3000/api/health` returns HTTP 200 when SQLite is available.

 ## API

 - `GET/POST /api/activity-sets` lists or creates activities.
 - `GET /api/activity-sets?type=WORDLE|WORD_SEARCH` filters activities by type.
 - `GET/PUT/DELETE /api/activity-sets/:id` retrieves, updates, or deletes an activity and its words.
 - `GET/POST /api/activity-sets/:id/words` lists or adds words for an activity.
 - `GET /api/words/:id` retrieves an individual word.
 - `PUT/DELETE /api/words/:id` updates or deletes an individual word.
 - `GET /api/health` checks the API and database connection.
 - `GET /health` returns `200 OK` when the app is running.
 - `GET /api/metrics` returns activity, usage, generation, word-list, and health metrics, plus alerts.
 - `POST /api/events` records a usage event (`PAGE_VIEW`, `GENERATION_SUCCESS`, or `GENERATION_FAILURE`).
 - `GET /api/report` downloads a CSV report of activities and usage events.

 Phonemes are stored as JSON arrays so multi-character symbols such as `tʃ` are preserved as one value.

 ## Dashboard and testing

 Open `/dashboard` for health status, alerts, usage statistics, generation outcomes, and word-list summaries. The dashboard refreshes its metrics periodically.

 Run the API tests with the application and database available:

 ```powershell
 npm test
 ```

 The API tests use `http://localhost:3000` by default. To test another running instance in PowerShell:

 ```powershell
 $env:BASE_URL = "http://localhost:3001"
 npm test
 Remove-Item Env:BASE_URL
 ```

 Run the Playwright end-to-end tests:

 ```powershell
 npm run test:e2e
 ```

 Playwright starts the development server if one is not already responding at `http://localhost:3000`; it reuses an existing server when available. The tests cover dashboard rendering, activity CRUD, usage tracking, and generated HTML. The HTML test report is written to `playwright-report/` after a run.

 Run the code checks and production build:

 ```powershell
 npm run lint
 npm run build
 ```

 ## Assessment evidence

 Capture the actual results from your own run; do not report scores or test results that have not been measured.

 ### Accessibility and Lighthouse

 1. Start the app with the local setup instructions.
 2. In Chrome or Microsoft Edge, open the page being assessed (at minimum, check `/` and `/dashboard`).
 3. Open Developer Tools, select **Lighthouse**, choose the required device mode and categories, then run the audit.
 4. Save or capture the generated report, including the score and actionable accessibility findings. Fix issues where possible and rerun the audit.

 ### Load testing with Apache JMeter

 1. Start the app and create a JMeter test plan with an HTTP Request sampler targeting a route such as `GET /health` or `GET /api/metrics` at `localhost:3000`.
 2. Use a documented, reasonable thread count and duration for the assignment. Avoid sending a high-volume test to a shared or deployed service without permission.
 3. Save the test plan (`.jmx`) and run it from PowerShell, substituting your plan's actual path. The HTML output directory must be new or empty for each run:

    ```powershell
    New-Item -ItemType Directory -Force .\jmeter-results
    jmeter -n -t .\path\to\your-test-plan.jmx -l .\jmeter-results\results.jtl -e -o .\jmeter-results\html
    ```

 4. Include the test plan and generated report, and summarize the workload, throughput, response times, and errors. JMeter is an external tool and no test plan or performance result is included by this project.

 ### Submission checklist

 - Include screenshots or saved reports for API and Playwright tests, lint/build checks, Lighthouse, and JMeter.
 - Demonstrate activity creation, editing, persistence after refresh, deletion, health-check response, and downloadable output from both builders.
 - Show the student ID in the Activity Data page footer if required by the assignment.
 - Provide the GitHub repository URL and ensure the repository contains meaningful development commits.
 - Demonstrate live observability using the instructions below; dashboard database metrics and OpenTelemetry monitoring are separate evidence.

 ## Docker

 From the `interface` directory:

 ```powershell
 docker compose up --build
 ```

 Open `http://localhost:3000` after the container starts. SQLite data is persisted in the `activity-data` Docker volume.

 ## Observability (OpenTelemetry, Jaeger, Zipkin, Prometheus)

 The app is instrumented with OpenTelemetry (`instrumentation.ts`, `lib/telemetry.ts`). Traces and custom metrics (`builder_generations_total`, `builder_page_views_total`, `builder_time_on_page_ms`) are sent to an OpenTelemetry Collector, which forwards traces to Jaeger and Zipkin and exposes metrics for Prometheus.

 Start the monitoring services from the `interface` directory:

 ```powershell
 docker compose -f docker-compose.monitoring.yml up -d
 npm run dev
 ```

 | Tool | URL | What to check |
 | --- | --- | --- |
 | Jaeger | http://localhost:16686 | Select service `next-app`, choose a time range, and find traces |
 | Zipkin | http://localhost:9411 | Query for service name `next-app` |
 | Prometheus | http://localhost:9090 | Query `builder_generations_total` or `otelcol_exporter_sent_spans_total` |
 | Collector metrics | http://localhost:8888/metrics and http://localhost:8889/metrics | Inspect raw collector metrics |

 Use the app (open pages and generate activities) to produce telemetry, then refresh the monitoring tools. Opening a nonexistent route such as `/api/hello1` can demonstrate a 404 trace. Stop the monitoring services when finished:

 ```powershell
 docker compose -f docker-compose.monitoring.yml down
 ```

 ## Demonstration flow

 1. Open **Activity Data** and show the student ID in the footer if required.
 2. Create, edit, refresh, and delete an activity containing multiple words.
 3. Open `/api/health` and show the successful response.
 4. Run the Docker Compose application and repeat the health check.
 5. Use both builders to generate and open their downloadable HTML activities.
 6. Open `/dashboard`, download the CSV report, and show the monitoring tools with fresh telemetry.