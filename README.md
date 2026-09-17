 # Speech Pathology Activity Builder

Assessment 2 extends the Assessment 1 Next.js builder with SQLite, Prisma, CRUD APIs, validation, and Docker support.

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
