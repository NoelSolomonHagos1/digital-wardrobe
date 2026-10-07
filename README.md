# Digital Wardrobe

Digital Wardrobe is a React/Vite frontend, an Express API, and a PostgreSQL database.

## Requirements

- Node.js and npm
- Docker with the Docker Compose plugin (for the included local PostgreSQL service)

## Start locally

1. Start PostgreSQL from the repository root:

   ```sh
   docker compose up -d db
   ```

2. Create the backend environment file:

   ```sh
   cp backend/.env.example backend/.env
   ```

   The example values match the local database in `docker-compose.yml`. Replace `JWT_SECRET` with a long random value before using the app beyond local development.
   Set `GEMINI_API_KEY` (or `GOOGLE_API_KEY`) in this file to enable Gemini Flash outfit suggestions; weather works without a key.

3. Install backend dependencies, create the tables, and start the API:

   ```sh
   cd backend
   npm ci
   npm run db:setup
   npm start
   ```

   The API listens at <http://localhost:3001>. Check its database connection at <http://localhost:3001/api/health>.

4. In a second terminal, install and start the frontend:

   ```sh
   cd frontend
   npm ci
   npm run dev
   ```

   Open the local URL printed by Vite.

`npm run db:setup` is safe to run again: it creates missing tables and indexes without deleting existing records. Stop the database with `docker compose down`; its data remains in the named volume.
