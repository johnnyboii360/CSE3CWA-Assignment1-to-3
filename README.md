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

Open `http://localhost:3000`. **Activity Data** manages saved activities and words. The health check is available at `http://localhost:3000/api/health` and returns 200 when SQLite is available.

## API

- `GET/POST /api/activity-sets` lists or creates activities.
- `GET/PUT/DELETE /api/activity-sets/:id` retrieves, updates, or deletes an activity and its words.
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
