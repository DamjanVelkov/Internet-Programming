// OpenWeatherMap API configuration
const API_KEY = '418dd47e5ed6eefe171b5159865df928'; // Replace with your API key from openweathermap.org
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherInfo = document.getElementById('weatherInfo');
const errorMessage = document.getElementById('errorMessage');
const loading = document.getElementById('loading');

// Weather information elements
const cityName = document.getElementById('cityName');
const dateElement = document.getElementById('date');
const weatherIcon = document.getElementById('weatherIcon');
const temperature = document.getElementById('temp');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const pressure = document.getElementById('pressure');

// Event listeners
searchBtn.addEventListener('click', searchWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

// Function to fetch weather data
async function searchWeather() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    showLoading();
    hideError();
    hideWeatherInfo();

    try {
        const response = await fetch(
            `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
            throw new Error('City not found');
        }

        const data = await response.json();
        displayWeatherData(data);
    } catch (error) {
        showError(error.message === 'City not found' 
            ? 'City not found. Please try again.' 
            : 'An error occurred. Please try again later.');
    } finally {
        hideLoading();
    }
}

// Function to display weather data
function displayWeatherData(data) {
    // Update city name and date
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    dateElement.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Update weather icon
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = data.weather[0].description;

    // Update temperature and description
    temperature.textContent = Math.round(data.main.temp);
    description.textContent = data.weather[0].description;

    // Update weather details
    humidity.textContent = `${data.main.humidity}%`;
    wind.textContent = `${data.wind.speed} m/s`;
    pressure.textContent = `${data.main.pressure} hPa`;

    showWeatherInfo();
}

// Utility functions
function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function showWeatherInfo() {
    weatherInfo.classList.remove('hidden');
}

function hideWeatherInfo() {
    weatherInfo.classList.add('hidden');
}

// Optional: Get user's current location weather on page load
document.addEventListener('DOMContentLoaded', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    showLoading();
                    const response = await fetch(
                        `${BASE_URL}?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${API_KEY}&units=metric`
                    );
                    if (!response.ok) throw new Error('Location not found');
                    const data = await response.json();
                    displayWeatherData(data);
                } catch (error) {
                    console.error('Error fetching location weather:', error);
                } finally {
                    hideLoading();
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
            }
        );
    }
});