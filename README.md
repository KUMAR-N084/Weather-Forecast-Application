# Sky Buddy — Weather Forecast Application

Sky Buddy is a Flask-based weather dashboard that lets users look up weather by city or device coordinates. It combines a Python backend, a browser-based dashboard, and the OpenWeatherMap API.

## Features

- Current weather and multi-day forecast lookup
- City search and city suggestions
- Location-based weather lookup using latitude and longitude
- Metric, imperial, and standard unit support
- User registration, login, profile, and settings pages
- Password reset flow using time-limited signed tokens
- Responsive frontend with theme/settings support

Weather results require a valid OpenWeatherMap API key. The application has not been independently tested in this environment, so configure the key and follow the setup steps before relying on live results.

## Technology

- Python and Flask
- Flask-SQLAlchemy with SQLite by default
- HTML, CSS, and JavaScript
- Requests for OpenWeatherMap API calls
- python-dotenv for local environment configuration

## Project structure

```text
Weather-Forecast-Application/
├── app.py
├── requirements.txt
├── .env.example
├── templates/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── profile.html
│   ├── settings.html
│   ├── forgot_password.html
│   └── password_reset.html
└── static/
    ├── script.js
    └── style.css
```

## Setup (Windows PowerShell)

1. Clone the repository and open its folder.
2. Create and activate a virtual environment:

   ```powershell
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

3. Install dependencies:

   ```powershell
   pip install -r requirements.txt
   ```

4. Create your local configuration:

   ```powershell
   Copy-Item .env.example .env
   ```

5. Generate a unique Flask secret key:

   ```powershell
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

   Add the generated value to `.env` as `SECRET_KEY=...`.

6. Get an API key from OpenWeatherMap and set `OPENWEATHERMAP_API_KEY=...` in `.env`.

7. Start the application:

   ```powershell
   python app.py
   ```

8. Open `http://127.0.0.1:5000` in your browser. The database tables are created when the app starts.

## Environment variables

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | Required random key used for sessions and signed password-reset tokens |
| `DATABASE_URL` | Optional SQLAlchemy database URL; defaults to SQLite |
| `OPENWEATHERMAP_API_KEY` | Required for live weather and city suggestions |
| `FLASK_DEBUG` | Defaults to `false`; use only during local development |
| `HOST` / `PORT` | Defaults to `127.0.0.1` / `5000` |
| `COOKIE_SECURE` | Set to `true` when deploying over HTTPS |
| `LOG_LEVEL` | Defaults to `INFO` |

## Security and deployment notes

- Keep `.env` private. Never commit API keys, Flask secret keys, database credentials, or user data.
- The weather API is called from the Flask backend; the API key is not embedded in browser JavaScript.
- Outbound weather requests use HTTPS, request timeouts, and generic client-facing error messages.
- Use HTTPS and set `COOKIE_SECURE=true` for production.
- Before production deployment, review CSRF protection, login rate limiting, password-reset delivery and abuse controls, database backups, and privacy requirements.
- If a credential was ever committed to Git, revoke or rotate it. Deleting it from the latest version does not erase it from Git history.

## Troubleshooting

- **API key not configured:** confirm `OPENWEATHERMAP_API_KEY` exists in your local `.env` file and restart the app.
- **Invalid API credentials:** check the key status with OpenWeatherMap and confirm the account/API access is active.
- **Secret key missing:** generate a new random key and set `SECRET_KEY` in `.env`.
- **Port already in use:** set another `PORT` value in `.env`.

## Project context

This is an academic full-stack web application. The README describes the repository's implemented routes and integrations; it does not claim that the application has passed a production security audit.
