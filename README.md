# async-chess
A simple react/redux/node web-app for playing asynchronous games of chess

Running this project locally requires access to a postgres instance and a google OAuth client ID

## Running locally

1. Pull the repository and run `npm install` in both the root directory and the `client/` directory

2. Create a fresh postgres database along with a new user.

3. create .env files in the root and `client/` directories with the variables outlined below.

4. Run `npm run dbsetup` to create the required tables in postgres

5. run `npm run dev`

## Environment Valiables

Both parts of the application require environment variables to properly configure. 

The frontend will pick up variables defined in `client/.env`

The backend will pick up variables defined in `.env`

### Node (.env)

- PG_PORT (default: `5432`)

Port postgres is running on.

- PG_USER (required)

Name of postgres user the application will use for queries.

- PG_PASSWORD (required)

Password for postgres user the application will use for queries.

- PG_DB_NAME (default: `asyncchess`)

Name of the database the application will be acting on. Provided user must have access. 

- SESSION_SECRET

Secret used by express-session to authenticate sessions. Default is arbitrary insecure string for test/development purposes.

- GOOGLE_CLIENT_ID (required)

Google client ID. Must be the same ID provided to the frontend app.

### Frontend (client/.env)

- REACT_APP_GOOGLE_CLIENT_ID (required)

Google client ID. Must be the same ID provided to the backend app.

- SKIP_PREFLIGHT_CHECK

May be required to suppress the frontend build complaining about the backend dependencies.

## testing

Backend tests can be run with `npm test`

Frontend tests are currently missing.