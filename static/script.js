// static/script.js

console.log("Script.js loaded");

let allHourlyDataFromServer = [];
let currentWeatherData = null;
let isFetchingDefaultCity = false;
let currentDisplayedCityName = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize User Menu Dropdown
    const userMenuButton = document.getElementById('user-menu-button');
    const userMenuDropdown = document.getElementById('user-menu-dropdown');
    if (userMenuButton) {
        userMenuButton.addEventListener('click', (event) => {
            userMenuDropdown.classList.toggle('show');
            event.stopPropagation();
        });
    }
    // Close dropdown if clicked outside
    window.addEventListener('click', (event) => {
        if (userMenuDropdown && userMenuDropdown.classList.contains('show') && !userMenuButton.contains(event.target)) {
            userMenuDropdown.classList.remove('show');
        }
    });

    const searchButton = document.getElementById('search-button');
    if (searchButton) {
        searchButton.addEventListener('click', () => fetchAndDisplayWeather());
    }

    const cityInput = document.getElementById('city-input');
    if (cityInput) {
        cityInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                fetchAndDisplayWeather();
            }
        });
        // Add event listener for city suggestions
        cityInput.addEventListener('input', () => fetchCitySuggestions(cityInput.value));
    }

    const unitsToggle = document.getElementById('units-toggle');
    if (unitsToggle) {
        unitsToggle.addEventListener('change', () => {
            if (currentDisplayedCityName) {
                fetchAndDisplayWeather(currentDisplayedCityName);
            }
        });
    }

    // Load initial weather (geolocation or default)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            fetchAndDisplayWeather(null, position.coords.latitude, position.coords.longitude);
        }, error => {
            console.warn("Geolocation error:", error.message, ". Falling back to default city.");
            if (typeof defaultCityFromServer !== 'undefined' && defaultCityFromServer && defaultCityFromServer !== "None" && !isFetchingDefaultCity) {
                isFetchingDefaultCity = true;
                fetchAndDisplayWeather(defaultCityFromServer);
            }
        });
    } else {
        console.warn("Geolocation not supported. Falling back to default city.");
        if (typeof defaultCityFromServer !== 'undefined' && defaultCityFromServer && defaultCityFromServer !== "None" && !isFetchingDefaultCity) {
            isFetchingDefaultCity = true;
            fetchAndDisplayWeather(defaultCityFromServer);
        }
    }
    
    hideFlashMessages();

    const backToDailyButton = document.getElementById('back-to-daily-button');
    if (backToDailyButton) {
        backToDailyButton.addEventListener('click', () => {
            document.getElementById('day-specific-hourly-display').hidden = true;
            if (currentWeatherData) {
                const units = document.querySelector('input[name="units"]:checked').value;
                const tempUnit = units === 'metric' ? '°C' : '°F';
                // Re-display the full hourly and daily forecasts
                displayDailyForecast(currentWeatherData.forecast.list, tempUnit);
                displayHourlyForecast(currentWeatherData.forecast.list, tempUnit);
            }
            document.getElementById('daily-forecast-section').hidden = false;
            document.getElementById('hourly-forecast-section').hidden = false;
            backToDailyButton.style.display = 'none';
        });
    }

    // Login Form Submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevent default form submission

            const formData = new FormData(loginForm);

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    body: formData 
                });

                const result = await response.json();
                const messageDiv = document.getElementById('message');

                if (response.ok) {
                    displayMessage(result.message, 'success');
                    // Redirect to index or dashboard
                    window.location.href = '/'; 
                } else {
                    displayMessage(result.message, 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                displayMessage('An unexpected error occurred. Please try again.', 'error');
            }
        });
    }

    // --- Register Form Submission ---
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevent default form submission

            const formData = new FormData(registerForm);

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                const messageDiv = document.getElementById('message');

                if (response.ok) {
                    displayMessage(result.message, 'success');
                    registerForm.reset(); // Clear the form fields
                    setTimeout(() => {
                        window.location.href = '/login'; // Redirect to login page after delay
                    }, 2000);
                } else {
                    displayMessage(result.message, 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                displayMessage('An unexpected error occurred. Please try again.', 'error');
            }
        });
    }

    // --- Password Toggle Functionality ---
    document.querySelectorAll('.toggle-password-icon').forEach(icon => {
        icon.addEventListener('click', function() {
            const targetId = this.dataset.target || this.previousElementSibling.id;
            const passwordInput = document.getElementById(targetId);
            if (passwordInput) {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                this.setAttribute('aria-label', type === 'password' ? 'Show password' : 'Hide password');
            }
        });
    });

    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const email = document.getElementById('forgot-password-email').value;
            try {
                const response = await fetch('/forgot_password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email })
                });
                const result = await response.json();
                displayMessage(result.message, response.ok ? 'success' : 'error');
            } catch (error) {
                console.error('Error:', error);
                displayMessage('An unexpected error occurred. Please try again.', 'error');
            }
        });
    }
});

async function fetchCitySuggestions(query) {
    const datalist = document.getElementById('city-suggestions');
    if (query.length < 3) { // fetch suggestions for 3 or more characters
        datalist.innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`/get_city_suggestions?q=${encodeURIComponent(query)}`);
        const suggestions = await response.json();

        datalist.innerHTML = ''; // Clear previous suggestions
        if (suggestions.error) {
            console.error('Error fetching suggestions:', suggestions.error);
            displayMessage('Error fetching city suggestions: ' + suggestions.error, 'error');
            return;
        }
        suggestions.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            datalist.appendChild(option);
        });
    } catch (error) {
        console.error('Network error fetching city suggestions:', error);
        displayMessage('Network error fetching city suggestions.', 'error');
    }
}

async function fetchAndDisplayWeather(city = null, lat = null, lon = null) {
    hideAllForecastSections();
    let cityToSearch = city;
    if (!city && !lat && !lon) {
        const cityInputElement = document.getElementById('city-input');
        cityToSearch = cityInputElement ? cityInputElement.value.trim() : null;
    }

    const units = document.querySelector('input[name="units"]:checked').value;
    let searchParams = new URLSearchParams({ units: units });
    if (cityToSearch) {
        searchParams.append('city', cityToSearch);
    } else if (lat !== null && lon !== null) {
        searchParams.append('lat', lat.toString());
        searchParams.append('lon', lon.toString());
    } else {
        displayMessage("Please enter a city or enable geolocation.", 'error');
        return;
    }

    showLoading(true);

    try {
        const response = await fetch(`/get_weather?${searchParams.toString()}`);
        const data = await response.json();

        if (!response.ok) {
            displayMessage(data.error || `An error occurred: ${response.statusText}`, 'error');
            currentWeatherData = null;
            currentDisplayedCityName = null;
        } else {
            currentWeatherData = data;
            const current = data.current;
            const forecastList = data.forecast.list;
            currentDisplayedCityName = current.name; // Set the currently displayed city name

            const tempUnit = units === 'metric' ? '°C' : '°F';
            const windUnit = units === 'metric' ? 'm/s' : 'mph';

            document.querySelectorAll('.temp-unit').forEach(span => span.textContent = tempUnit);
            document.querySelectorAll('.wind-unit').forEach(span => span.textContent = windUnit);

            document.getElementById('current-city').textContent = current.name;
            document.getElementById('current-date').textContent = new Date(current.dt * 1000).toLocaleDateString();
            document.getElementById('current-time').textContent = new Date(current.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            document.getElementById('current-description').textContent = current.weather[0].description;
            document.getElementById('current-temp').textContent = Math.round(current.main.temp);
            document.getElementById('current-feels-like').textContent = Math.round(current.main.feels_like);
            document.getElementById('current-humidity').textContent = current.main.humidity;
            document.getElementById('current-wind-speed').textContent = current.wind.speed;
            document.getElementById('current-pressure').textContent = current.main.pressure;
            document.getElementById('current-weather-icon').src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;
            document.getElementById('current-weather-section').hidden = false;

            // Call functions to display forecast data
            displayHourlyForecast(forecastList, tempUnit);
            displayDailyForecast(forecastList, tempUnit);
            allHourlyDataFromServer = forecastList; // Store for detailed view

            const cityInputElement = document.getElementById('city-input');
            if (cityInputElement && cityToSearch) {
                cityInputElement.value = '';
            }
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        displayMessage('Failed to fetch weather data. A network error may have occurred.', 'error');
        currentWeatherData = null;
        currentDisplayedCityName = null;
    } finally {
        showLoading(false);
        isFetchingDefaultCity = false;
    }
}

function displayHourlyForecast(forecastList, tempUnit) {
    const hourlyList = document.querySelector('#hourly-forecast-section .hourly-list');
    hourlyList.innerHTML = '';
    document.getElementById('hourly-forecast-section').hidden = false;

    // The API provides 3-hour forecasts and shows next 24 hours weather with 8 different weather timings in 24 hour timeline
    const next24Hours = forecastList.slice(0, 8);
    next24Hours.forEach(hour => {
        const hourlyItem = document.createElement('div');
        hourlyItem.classList.add('hourly-item');
        hourlyItem.innerHTML = `
            <div>${new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="${hour.weather[0].description}">
            <div>${Math.round(hour.main.temp)}${tempUnit}</div>
            <div class="rain-chance">💧 ${Math.round(hour.pop * 100)}%</div>
            <div class="description">${hour.weather[0].description}</div>
        `;
        hourlyList.appendChild(hourlyItem);
    });
}

function displayDailyForecast(forecastList, tempUnit) {
    const dailyList = document.querySelector('#daily-forecast-section .daily-list');
    dailyList.innerHTML = '';
    document.getElementById('daily-forecast-section').hidden = false;

    const dailyAggregates = {};

    // Group forecast data by day
    forecastList.forEach(item => {
        const dateKey = new Date(item.dt * 1000).toISOString().split('T')[0];
        const displayDate = new Date(item.dt * 1000).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
        
        if (!dailyAggregates[dateKey]) {
            dailyAggregates[dateKey] = {
                displayDate: displayDate,
                temps: [],
                pops: [],
                icons: {},
                descriptions: {}
            };
        }
        dailyAggregates[dateKey].temps.push(item.main.temp);
        dailyAggregates[dateKey].pops.push(item.pop);
        const icon = item.weather[0].icon;
        const desc = item.weather[0].description;
        dailyAggregates[dateKey].icons[icon] = (dailyAggregates[dateKey].icons[icon] || 0) + 1;
        dailyAggregates[dateKey].descriptions[desc] = (dailyAggregates[dateKey].descriptions[desc] || 0) + 1;
    });

    for (const dateKey in dailyAggregates) {
        const day = dailyAggregates[dateKey];
        const max_temp = Math.round(Math.max(...day.temps));
        const min_temp = Math.round(Math.min(...day.temps));
        const avg_pop = Math.round((day.pops.reduce((a, b) => a + b, 0) / day.pops.length) * 100);

        const representativeIcon = Object.keys(day.icons).reduce((a, b) => day.icons[a] > day.icons[b] ? a : b);
        const representativeDescription = Object.keys(day.descriptions).reduce((a, b) => day.descriptions[a] > day.descriptions[b] ? a : b);

        const dailyItem = document.createElement('div');
        dailyItem.classList.add('daily-item');
        dailyItem.innerHTML = `
            <h4>${day.displayDate}</h4>
            <img src="https://openweathermap.org/img/wn/${representativeIcon}@2x.png" alt="${representativeDescription}">
            <p>High: ${max_temp}${tempUnit}</p>
            <p>Low: ${min_temp}${tempUnit}</p>
            <p class="rain-chance">💧 Rain: ${avg_pop}%</p>
            <p>${representativeDescription}</p>
            <button class="view-hourly-button" data-date="${dateKey}">View Hourly</button>
        `;
        dailyList.appendChild(dailyItem);
    }

    //  event listeners to View Hourly buttons
    document.querySelectorAll('.view-hourly-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const selectedDate = event.target.dataset.date; // YYYY-MM-DD format
            document.getElementById('hourly-forecast-section').hidden = true;
            document.getElementById('daily-forecast-section').hidden = true;
            document.getElementById('day-specific-hourly-display').hidden = false;
            document.getElementById('back-to-daily-button').style.display = 'block';

            const hourlyDataForSelectedDay = allHourlyDataFromServer.filter(item => 
                new Date(item.dt * 1000).toISOString().split('T')[0] === selectedDate
            );
            
            const units = document.querySelector('input[name="units"]:checked').value;
            const tempUnit = units === 'metric' ? '°C' : '°F';
            displayDaySpecificHourlyForecast(hourlyDataForSelectedDay, selectedDate, tempUnit);
        });
    });
}

function displayDaySpecificHourlyForecast(hourlyData, selectedDate, tempUnit) {
    const daySpecificHourlyList = document.getElementById('day-specific-hourly-list');
    daySpecificHourlyList.innerHTML = '';
    
    document.getElementById('day-specific-hourly-title').textContent = `Hourly Details for ${new Date(selectedDate).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}`;

    if (hourlyData.length === 0) {
        daySpecificHourlyList.innerHTML = '<p>No hourly data available for this day.</p>';
        return;
    }

    hourlyData.forEach(hour => {
        const hourlyItem = document.createElement('div');
        hourlyItem.classList.add('hourly-item');
        hourlyItem.innerHTML = `
            <div>${new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="${hour.weather[0].description}">
            <div>${Math.round(hour.main.temp)}${tempUnit}</div>
            <div class="rain-chance">💧 ${Math.round(hour.pop * 100)}%</div>
            <div class="description">${hour.weather[0].description}</div>
            <div class="extra-details">
                <p>Humidity: ${hour.main.humidity}%</p>
                <p>Wind: ${hour.wind.speed} ${document.querySelector('input[name="units"]:checked').value === 'metric' ? 'm/s' : 'mph'}</p>
                <p>Pressure: ${hour.main.pressure} hPa</p>
            </div>
        `;
        daySpecificHourlyList.appendChild(hourlyItem);
    });
}


function displayMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `flash-message ${type} show`;
        messageDiv.style.display = 'block';
        
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                messageDiv.classList.remove('show');
                setTimeout(() => messageDiv.style.display = 'none', 300);
            }, 5000);
        }
    }
}


function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i=0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function hideAllForecastSections() {
    document.getElementById('current-weather-section').hidden = true;
    document.getElementById('hourly-forecast-section').hidden = true;
    document.getElementById('daily-forecast-section').hidden = true;
    document.getElementById('day-specific-hourly-display').hidden = true;
    const backButton = document.getElementById('back-to-daily-button');
    if (backButton) {
        backButton.style.display = 'none';
    }
    // Clear any existing error messages when fetching new weather
    const errorDiv = document.getElementById('message');
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
        errorDiv.className = 'flash-message'; // Reset classes
    }
}

function hideFlashMessages() {
    const flashMessages = document.querySelectorAll('.flash-messages .flash-message');
    flashMessages.forEach(message => {
        if (message.classList.contains('success') || message.classList.contains('info')) {
            setTimeout(() => {
                message.style.opacity = '0';
                message.style.transform = 'translateY(-10px)';
                setTimeout(() => message.remove(), 600);
            }, 5000);
        }
    });
}

function confirmLogout(username) {
  if (confirm(`Are you sure you want to log out, ${username}?`)) {
    window.location.href = "/logout";
  }
}
