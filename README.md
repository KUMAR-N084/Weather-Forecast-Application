# Sky Buddy — Full-Stack Weather Forecast Application

Sky Buddy is a weather dashboard built with **Python, Flask, SQLAlchemy, SQLite, HTML, CSS, and JavaScript**. It retrieves live weather information from the OpenWeatherMap API and provides account-based preferences for a more personalised experience.

This repository is the primary weather project in my portfolio.

## Features

- Search for current weather by city
- Retrieve weather using browser/device coordinates
- View forecast information from the weather provider
- Search city suggestions
- Switch between metric, imperial, and standard units
- Register, log in, and log out
- Store user profile details and a preferred city
- Save user interface preferences, including light/dark theme
- Responsive pages for the dashboard, login, registration, profile, and settings

## Technology stack

| Layer | Technologies |
|---|---|
| Backend | Python, Flask |
| Database | SQLite, Flask-SQLAlchemy |
| Frontend | HTML5, CSS3, JavaScript |
| External service | OpenWeatherMap API |
| Configuration | python-dotenv |
| Authentication | Flask sessions, Werkzeug password hashing |

## How it works

1. The user searches for a city or allows location access in the browser.
2. The frontend sends the location and selected units to the Flask application.
3. Flask validates the request and calls the OpenWeatherMap service using a server-side API key.
4. The application returns the weather response to the frontend.
5. Registered users can save account preferences such as their default city and theme.

## Project structure

```text
Weather-Forecast-Application/
├── app.py
├── requirements.txt
├── .env.example
├── .gitignore
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

## Run locally (Windows PowerShell)

### 1. Clone the repository

```powershell
git clone https://github.com/KUMAR-N084/Weather-Forecast-Application.git
cd Weather-Forecast-Application
```

### 2. Create and activate a virtual environment

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```powershell
pip install -r requirements.txt
```

### 4. Configure environment variables

```powershell
Copy-Item .env.example .env
```

Generate a unique Flask secret key:

```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

Add the generated value and your own OpenWeatherMap API key to the local `.env` file.

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | Required secret for Flask sessions and signed tokens |
| `OPENWEATHERMAP_API_KEY` | Required for live weather and city suggestions |
| `DATABASE_URL` | Optional SQLAlchemy database URL; defaults to SQLite |
| `FLASK_DEBUG` | Enables Flask debug mode only when explicitly configured |
| `HOST` / `PORT` | Local server host and port |
| `COOKIE_SECURE` | Set to `true` when serving over HTTPS |
| `LOG_LEVEL` | Application logging level |

### 5. Start the application

```powershell
python app.py
```

Open [http://127.0.0.1:5000](http://127.0.0.1:5000) in your browser. The application creates its database tables when it starts.

## Security and current limitations

- Passwords are stored as Werkzeug password hashes, not plain text.
- Keep `.env` out of Git. The API key is read by the Flask backend and is not placed in browser JavaScript.
- Use a strong, unique `SECRET_KEY`; enable secure cookies and HTTPS for deployment.
- The password-reset token verification and reset page are present, but automated email delivery of reset links is **not yet integrated**.
- Before public deployment, add and verify CSRF protection, login/register rate limiting, stronger password policy, and a production-ready password-reset email workflow.
- This project has not yet been independently build-tested or security-audited as part of this README update. Configure your own API key and test the complete flow locally before presenting it as a live deployment.

## Resume description

**Sky Buddy — Full-Stack Weather Forecast Application**  
Built a weather dashboard using Python, Flask, SQLAlchemy, SQLite, HTML, CSS, and JavaScript. Integrated the OpenWeatherMap API for city- and location-based weather lookup, and implemented user registration, login, profile preferences, and theme settings.

## Future improvements

- Add automated tests for authentication, settings, and weather API routes.
- Complete password-reset email delivery and add CSRF protection.
- Add request throttling, input validation, and deployment configuration.
- Add screenshots and a hosted demo after the application has been tested end to end.
