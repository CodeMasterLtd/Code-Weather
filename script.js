document.addEventListener('DOMContentLoaded', function () {
    const apiKey = 'c67ad773870622c3699a639632c3351f';
    const version = "1.2.0.0";

    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');
    const weatherInfo = document.getElementById('weather-info');
    const currentTime = document.getElementById('currentTime');
    const versionDisplay = document.getElementById("version");

    // Display current year dynamically
    const currentYear = new Date().getFullYear();
    document.getElementById('currentYear').textContent = currentYear;

    // Show version
    versionDisplay.textContent = "Version: " + version;

    // Update current time every second
    setInterval(() => {
        const now = new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = now.toLocaleDateString('en-GB', options);
        const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        currentTime.textContent = formattedDate + ' | ' + formattedTime;
    }, 1000); 

    // Event listener for search button
    searchBtn.addEventListener('click', function () {
        const city = cityInput.value.trim();
        if (city === '') {
            displayError("Please enter a city name.");
            return;
        }

        fetchWeather(city);
    });

    // Fetch weather data from OpenWeatherMap API
    async function fetchWeather(city) {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`); // Use the correct API endpoint

            if (!response.ok) {
                throw new Error('City not found');
            }

            const weatherData = await response.json();
            displayWeather(weatherData);
        } catch (error) {
            displayError('City not found. Please enter a valid city name.');
            console.error('Error fetching weather data:', error);
        }
    }

    // Display weather information on the page
    function displayWeather(data) {
        searchBtn.style.backgroundColor = '';
        const weatherCard = document.createElement('div');
        weatherCard.classList.add('weather-card');

        const iconUrl = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`; 

        // Capitalize function
        function capitalizeFirstLetter(str) {
            return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }

        const windSpeedMph = (data.wind.speed * 2.237).toFixed(1);
        const visibilityMi = (data.visibility / 1609.34).toFixed(1);

        weatherCard.innerHTML = `
            <h2>${data.name}, ${data.sys.country}</h2>
            <div class="temperature">${Math.round(data.main.temp)}°C</div>
            <div class="description">${capitalizeFirstLetter(data.weather[0].description)}</div>
            <img src="${iconUrl}" alt="Weather Icon" class="icon">
            <p>--------------------------------</p>
            <div class="details">
                <h4>Weather Details:</h4>
                <p>Humidity: ${data.main.humidity} <strong>%</strong></p>
                <p>Wind: ${windSpeedMph} <strong>MPH</strong></p>
                <p>Visibility: ${visibilityMi} <strong>MILES</strong></p>
                <p>Cloudiness: ${data.clouds.all} <strong>%</strong></p>

                <h4>Temperature Range:</h4>
                <p>Min: ${Math.round(data.main.temp_min)}<strong>°C -</strong> Max: ${Math.round(data.main.temp_max)}<strong>°C</strong></p>
                <p>Feels Like: ${Math.round(data.main.feels_like)}<strong>°C</strong></p>

                <h4>Sunrise/Sunset:</h4>
                <p>Sunrise <img src="images/day.png" alt="Day Icon" class="day-icon">: <strong>${new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</strong> | Sunset <img src="images/night.png" alt="Night Icon" class="night-icon">: <strong>${new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</strong></p>
            </div>
        `;

        weatherInfo.innerHTML = ''; // Clear previous weather info
        weatherInfo.appendChild(weatherCard);
    }

    // Function to display errors
    function displayError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.classList.add('error');
        errorDiv.style.color ='darkred';
        errorDiv.style.fontSize = '1.2rem';
        errorDiv.textContent = message;
        searchBtn.style.backgroundColor = 'darkred';
        weatherInfo.innerHTML = ''; // Clear previous weather info
        weatherInfo.appendChild(errorDiv);
    }
});