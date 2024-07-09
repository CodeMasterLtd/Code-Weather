const apiKey = 'c67ad773870622c3699a639632c3351f'; // Replace with your OpenWeatherMap API key

document.addEventListener('DOMContentLoaded', function () {
    const Version = "1.0.0.0";
    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');
    const weatherInfo = document.getElementById('weather-info');
    const nowTime = document.getElementById('currentTime');
    const VersionShow = document.getElementById("version");
    VersionShow.innerHTML = "Version: " + Version;


    setInterval(() => {
        nowTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'});
    }, 1000);

    searchBtn.addEventListener('click', function () {
        const city = cityInput.value.trim();

        if (city === '') {
            alert('Please enter a city name.');
            return;
        }

        fetchWeather(city);
    });

    async function fetchWeather(city) {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
            if (!response.ok) {
                throw new Error('City not found');
            }
            const weatherData = await response.json();
            displayWeather(weatherData);
        } catch (error) {
            alert('City not found. Please enter a valid city name.');
            console.error('Error fetching weather data:', error);
        }
    }

    function displayWeather(data) {
        const weatherCard = document.createElement('div');
        weatherCard.classList.add('weather-card');

        const iconUrl = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;

        // Function to capitalize the first letter of each word
        function capitalizeFirstLetter(str) {
            return str.replace(/\b\w/g, function (char) {
                return char.toUpperCase();
            });
        }

        // Format sunrise and sunset times
        const sunriseTime = new Date(data.sys.sunrise * 1000);
        const sunsetTime = new Date(data.sys.sunset * 1000);
        const currentTime = new Date();

        // Compare current time with sunrise and sunset times
        if (currentTime > sunriseTime && currentTime < sunsetTime) {
            // Daytime - set light mode
            document.body.classList.add('light-mode');
        } else {
            // Nighttime - set dark mode
            document.body.classList.remove('light-mode');
        }

        const windSpeedMph = (data.wind.speed * 2.237).toFixed(1);
        const visibilityMi = (data.visibility / 1609.34).toFixed(1);

        weatherCard.innerHTML = `
            <h2>${data.name}</h2>
            <div class="temperature">${Math.round(data.main.temp)}&deg;C</div>
            <div class="description">${capitalizeFirstLetter(data.weather[0].description)}</div>
            <img src="${iconUrl}" alt="Weather Icon" class="icon">
            <div class="details">
                <h4>Weather Info:</h4>
                <p>Humidity: ${data.main.humidity}%</p>
                <p>Wind Speed: ${windSpeedMph} MPH</p>
                <p>Visibility: ${visibilityMi} MILES</p>
                <p>Cloudiness: ${data.clouds.all}%</p>

                <h4>Temperatures:</h4>
                <p>Temperature: 🡻${Math.round(data.main.temp_min)}&deg;C - 🡹${Math.round(data.main.temp_max)}&deg;C</p>
                <p>Feels Like: ${Math.round(data.main.feels_like)}&deg;C</p>

                <h4>Sunrise/Sunset:</h4>
                <p>⛅: ${sunriseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} AM</p>
                <p>🌕: ${sunsetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} PM</p>
            </div>
        `;

        weatherInfo.innerHTML = ''; // Clear previous weather info
        weatherInfo.appendChild(weatherCard);
    }
});
