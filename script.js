document.addEventListener('DOMContentLoaded', function () {
    const apiKeys = [
        '86e4563e8fd1dca3cafae89072ab8715',
        '7604ad93d88375df47ac59b5fcaabfcb',
        'dd63bd197511a2e158190e24de540eee',
        '8a3ba965f0f88727e3fa7e7bf3603268',
        'c6832cf138005b5cd83b055bee19b4aa',
        '85580ebc1774bef14155eefb7299714d'  
    ];

    const version = "1.3.1.0";
    const locale = "en-GB";
    const loadTime = 1; // 1 second interval for time update
    const greetingTime = 2000;
    const apiSwitchInterval = 5 * 60 * 1000; // 5 minutes in milliseconds
    let apiIndex = 0;

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
    const welcomeText = document.getElementById('welcomeText');
    const welcome = document.querySelector('.welcome');
    const bk = document.querySelector('.bk');

    body.style.backgroundImage = "url('https://getwallpapers.com/wallpaper/full/0/c/d/1376952-cool-earth-backgrounds-1920x1200-for-ipad.jpg')";
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

    function updateDisplay() {
        const now = new Date();
        const optionsDate = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = now.toLocaleDateString(locale, optionsDate);
        const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    
        // Determine time of day for theme
        const hours = now.getHours();
        if (hours >= 18 || hours < 6) { // Night
            currentTime.style.color = "#000";
            body.style.backgroundColor = "#000";
            logo.src = "images/night.png";
            icon1.href = "images/night.png";
            icon2.href = "images/night.png";
        } else if (hours >= 6 && hours < 12) { // Morning
            currentTime.style.color = "#fff";
            body.style.backgroundColor = "#a8a8a8";
            logo.src = "images/day.png";
            icon1.href = "images/day.png";
            icon2.href = "images/day.png";
        } else { // Afternoon/Evening
            currentTime.style.color = "#fff";
            body.style.backgroundColor = "#a8a8a8";
            logo.src = "images/day.png";
            icon1.href = "images/day.png";
            icon2.href = "images/day.png";
        }

        // Update the content with current date and time
        currentTime.textContent = `${formattedDate} | ${formattedTime}`;
    }

    function welcomeMsg() {
        const now = new Date();
        const hours = now.getHours();
        const greeting = ' Welcome to Code Weather';
        if (hours >= 1 && hours < 12) {
            welcome.style.backgroundImage = "url('https://images.squarespace-cdn.com/content/v1/5e357b09c950981b5764fd8b/1617754196359-XUG44MOCUZKEHOQVFB74/nature.gif')";
            return "Good Morning!" + greeting + ' Make a coffee and enjoy the day';
        } else if (hours >= 12 && hours < 18) {
            welcome.style.backgroundImage = "url('https://i.pinimg.com/originals/31/68/c0/3168c09eeeb529be5b321575fe56b02b.gif')";
            return "Good Afternoon!" + greeting + ' Eat lunch and enjoy the rest of the day';
        } else {
            welcome.style.backgroundImage = "url('https://i.pinimg.com/originals/e5/10/86/e51086cfaa2fb164969f154c4fb4c958.gif')";
            return "Good Evening!" + greeting + ' Eat dinner and enjoy your night';
        }
    }

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

    // Function to switch the API key every 5 minutes
    function startApiKeyRotation() {
        setInterval(() => {
            apiIndex = (apiIndex + 1) % apiKeys.length;
        }, apiSwitchInterval);
    }

    async function fetchWeather(city) {
        try {
            const apiKey = apiKeys[apiIndex];
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
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
            const apiKey = apiKeys[apiIndex];
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
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
        const visibilityMi = (data.visibility / 1609.34).toFixed(1);

        weatherCard.innerHTML = `
            <h2>${data.name}, ${data.sys.country}</h2>
            <div class="tempbackGround">
                <div class="temperature">${Math.round(data.main.temp)}°C</div>
            </div>
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
                body.style.backgroundImage = "url('https://img.freepik.com/free-photo/dramatic-cloudy-sky_181624-22695.jpg?w=740&t=st=1690726636~exp=1690727236~hmac=3b05d0c086e273e5dc9e23f251e67c88d2d8b9b39a37ab86f7950ec81e43c1f7')";
            } else if (description.includes("broken")) {
                body.style.backgroundImage = "url('https://img.freepik.com/premium-photo/4k-hd-clouds-stock-photography-great_116407-2501.jpg')";
            } else if (description.includes("overcast")) {
                body.style.backgroundImage = "url('https://img.freepik.com/free-photo/cloudy-sky_181624-27299.jpg')";
            }
        } else if (description.includes("rain")) {
            if (description.includes("light") || description.includes("moderate")) {
                body.style.backgroundImage = "url('https://media.istockphoto.com/id/1254995695/photo/rain-drop-with-road-light-bokeh-clear-rain-drop-on-glass-window-blur-abstract-blue-color.jpg?b=1&s=170667a&w=0&k=20&c=mPMSoIrdPTHPC1cq02Ir_mFpsT6Z6M8X1m_j6iOgwhI=')";
            } else if (description.includes("heavy")) {
                body.style.backgroundImage = "url('https://images.pexels.com/photos/2395194/pexels-photo-2395194.jpeg')";
            }
        } else if (description.includes("thunderstorm")) {
            body.style.backgroundImage = "url('https://img.freepik.com/free-photo/dark-thunderclouds-lightning-flashes_1048-7634.jpg?w=740&t=st=1690727258~exp=1690727858~hmac=573f32402c5a1e1b4a5360de0be86dd6346ad900fa41a2a6f4cf3c07ebcbcbf6')";
        } else if (description.includes("snow")) {
            body.style.backgroundImage = "url('https://img.freepik.com/premium-photo/winter-landscape-blizzard-background-heavy-snowing-winter-background_31965-11193.jpg')";
        } else if (description.includes("mist") || description.includes("haze")) {
            body.style.backgroundImage = "url('https://img.freepik.com/free-photo/foggy-haze-covering-city_181624-410.jpg')";
        } else {
            body.style.backgroundImage = "url('https://wallpapers.com/images/featured/earth-0rp0vszrdz909xc9.jpg')";
        }
    }

    welcomeText.textContent = welcomeMsg();
    welcomeText.style.backgroundColor = '#000';
    welcomeText.style.color = '#fff';
    welcomeText.style.padding = '1rem';
    welcomeText.style.borderRadius = '50px';
    welcomeText.style.boxShadow = 'inset #fff 0 0 10px, 0 0 10px #fff';

    setTimeout(() => {
        welcomeText.textContent = ''; // Clear welcome message text
        welcome.classList.add('hidden'); // Hide the welcome container
        bk.classList.remove('hidden'); // Show the background container
    }, greetingTime); // Delay in milliseconds (1000 ms = 1 second)

    // Update the time every second
    setInterval(updateDisplay, loadTime); // Update interval in milliseconds (1000 ms = 1 second)

    startApiKeyRotation();
    copyRight();
});
