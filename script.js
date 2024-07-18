document.addEventListener('DOMContentLoaded', function () {
    const apiKeys = '86e4563e8fd1dca3cafae89072ab8715';
    const version = "1.3.0.0";
    const locale = "en-GB";
    const loadTime = 1;
    let error = false;
    let apiIndex = 1;
    const apiSwitchInterval = 5 * 60 * 1000;

    const searchBtn = document.getElementById('search-btn');
    const searchBtn2 = document.getElementById('search-btn2');
    const cityInput = document.getElementById('city-input');
    const weatherInfo = document.getElementById('weather-info');
    const currentTime = document.getElementById('currentTime');
    const versionDisplay = document.getElementById("version");
    const year = document.getElementById("currentYear");
    const logo = document.getElementById("main-logo");
    const body = document.body;
    const icon1 = document.getElementById("icon1");
    const icon2 = document.getElementById("icon2");

    body.style.backgroundImage = "url('https://wallpapers.com/images/featured/earth-0rp0vszrdz909xc9.jpg')";
    body.style.backgroundSize = "cover";
    body.style.backgroundRepeat = "no-repeat";
    body.style.backgroundPosition = "center";
    body.style.backgroundAttachment = "fixed";

    function copyRight() {
        const currentYear = new Date().getFullYear();
        if (currentYear === 2024) {
            year.innerHTML = " 2024";
        } else {
            year.innerHTML = " 2024 - " + currentYear;
        }
    }

    versionDisplay.textContent = "Version: " + version;

    setInterval(() => {
        const now = new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = now.toLocaleDateString(locale, options);
        const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

        currentTime.textContent = formattedDate + ' | ' + formattedTime;

        const hours = now.getHours();
        if (hours >= 18 || hours < 6) {
            currentTime.style.color = "#000";
            body.style.backgroundColor = "#000";
            logo.src = "images/night.png";
            icon1.href = "images/night.png";
            icon2.href = "images/night.png";
        } else if (hours >= 6 && hours < 12) {
            currentTime.style.color = "#fff";
            body.style.backgroundColor = "#a8a8a8";
            logo.src = "images/day.png";
            icon1.href = "images/day.png";
            icon2.href = "images/day.png";
        } else {
            currentTime.style.color = "#fff";
            body.style.backgroundColor = "#a8a8a8";
            logo.src = "images/day.png";
            icon1.href = "images/day.png";
            icon2.href = "images/day.png";
        }
    }, loadTime);

    searchBtn2.addEventListener('click', nav);

    function nav(){
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const city = await fetchCityNameByCoords(lat, lon);
            if (city) {
                cityInput.value = city;
                fetchWeather(city);
            }
        }, (error) => {
            displayError('Unable to retrieve your location.');
        });
    }
    searchBtn.addEventListener('click', function () {
        const city = cityInput.value.trim();
        if (city === '') {
            displayError("Please enter a city name.");
            return;
        }

        fetchWeather(city);
    });

    async function fetchWeather(city) {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKeys}&units=metric`);
            if (!response.ok) {
                throw new Error('City not found');
            }
            const weatherData = await response.json();
            displayWeather(weatherData);
            changeBackground(weatherData.weather[0].description);
        } catch (error) {
            displayError('City not found. Please enter a valid city name.');
            console.error('Error fetching weather data:', error);
        }
    }


    async function fetchCityNameByCoords(lat, lon) {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKeys}&units=metric`);
            if (!response.ok) {
                throw new Error('Location not found');
            }
            const weatherData = await response.json();
            return weatherData.name;
        } catch (error) {
            console.error('Error fetching city name by coordinates:', error);
            return null;
        }
    }

    function displayWeather(data) {
        searchBtn.style.backgroundColor = '';
        const weatherCard = document.createElement('div');
        weatherCard.classList.add('weather-card');

        const iconUrl = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;


        function capitalizeFirstLetter(str) {
            return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }

        const windSpeedMph = (data.wind.speed * 2.237).toFixed(1);
        const visibilityMi = (data.visibility / 1609.34).toFixed(1)

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
                <p>Sunrise <img src="images/day.svg" alt="Day Icon" class="day-icon">: <strong>${new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</strong> | Sunset <img src="images/night.svg" alt="Night Icon" class="night-icon">: <strong>${new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</strong></p>
            </div>
        `;

        weatherInfo.innerHTML = '';
        weatherInfo.appendChild(weatherCard);
    }

    function displayError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.classList.add('error');
        errorDiv.style.color = 'darkred';
        errorDiv.style.textAlign = 'center';
        errorDiv.style.fontSize = '1.2rem';
        errorDiv.textContent = message;
        searchBtn.style.textShadow = 'darkred 0 0 5px';
        weatherInfo.innerHTML = ''; 
        weatherInfo.appendChild(errorDiv);
    }

    function changeBackground(description) {
        if (description.includes("clear")) {
            body.style.backgroundImage = "url('https://img.freepik.com/premium-photo/sky-graphics-hd-8k-wallpaper-stock-photographic-image_974970-325.jpg')";
        } else if (description.includes("clouds")) {
            if (description.includes("few")) {
                body.style.backgroundImage = "url('https://img.freepik.com/premium-photo/clouds-hd-8k-wallpaper-stock-photographic-image_890746-54777.jpg?w=360')";
            } else if (description.includes("scattered")) {
                body.style.backgroundImage = "url('https://www.shutterstock.com/shutterstock/videos/1092587007/thumb/1.jpg?ip=x480')";
            } else if (description.includes("broken")) {
                body.style.backgroundImage = "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrdjni2DRtdj3YXj5Yu6KKvdZrtRf0ocVsqg&s')";
            } else {
                body.style.backgroundImage = "url('https://img.freepik.com/premium-photo/clouds-hd-8k-wallpaper-stock-photographic-image_890746-54777.jpg?w=360')";
            }
        } else if (description.includes("rain")) {
            if (description.includes("shower")) {
                body.style.backgroundImage = "url('https://img.freepik.com/premium-photo/summer-shower-rain-raindrops-falling-roof_646752-2088.jpg')";
            } else {
                body.style.backgroundImage = "url('https://wallpapercave.com/wp/wp9383742.jpg')";
            }
        } else if (description.includes("snow")) {
            body.style.backgroundImage = "url('https://www.shutterstock.com/image-photo/falling-snow-background-winter-season-abstract-1645913367')";
        } else {
            body.style.backgroundImage = "url('https://wallpapers.com/images/featured/earth-0rp0vszrdz909xc9.jpg')";
        }

        body.style.backgroundSize = "cover";
        body.style.backgroundRepeat = "no-repeat";
        body.style.backgroundPosition = "center";
        body.style.backgroundAttachment = "fixed";
    }

    copyRight();
});
