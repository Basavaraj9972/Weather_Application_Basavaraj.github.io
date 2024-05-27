const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const forecastGridDiv = document.querySelector(".forecast-grid");
const errorMessageDiv = document.querySelector(".error-message");

const API_KEY = "b4dd825ff846fed4607ecd23b1412433"; // API key for OpenWeatherMap API

const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
        const sunrise = new Date(weatherItem.sys.sunrise * 1000).toLocaleTimeString();
        const sunset = new Date(weatherItem.sys.sunset * 1000).toLocaleTimeString();
        return `<div class="current-weather">
            <div class="details">
                <h2>City: ${cityName}, Country: ${weatherItem.sys.country}</h2>
                <p class="description"><i class="fas fa-cloud"></i> Weather Description: ${weatherItem.weather[0].description}</p>
                <p><i class="fas fa-thermometer-half"></i> Temperature: <span class="temperature">${Math.round(weatherItem.main.temp)}°C</span></p>
                <p><i class="fas fa-thermometer-half"></i> Feels Like: <span class="feels-like">${Math.round(weatherItem.main.feels_like)}°C</span></p>
                <p><i class="fas fa-wind"></i> Wind Speed: <span class="wind-speed">${weatherItem.wind.speed} m/s</span></p>
                <p><i class="fas fa-compass"></i> Wind Direction: <span class="wind-direction">${weatherItem.wind.deg}°</span></p>
                <p><i class="fas fa-tint"></i> Humidity: <span class="humidity">${weatherItem.main.humidity}%</span></p>
                <p><i class="fas fa-tachometer-alt"></i> Pressure: <span class="pressure">${weatherItem.main.pressure} hPa</span></p>
                <p><i class="fas fa-eye"></i> Visibility: <span class="visibility">${(weatherItem.visibility / 1000).toFixed(2)} km</span></p>
                <p><i class="fas fa-sun"></i> Sunrise: <span class="sunrise">${sunrise}</span></p>
                <p><i class="fas fa-moon"></i> Sunset: <span class="sunset">${sunset}</span></p>
            </div>
            <div class="icon">
                <img src="http://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="Weather Icon">
                <h6 class="condition">${weatherItem.weather[0].main}</h6>
            </div>
        </div>`;
    } else {
        const today = new Date();
        let date = new Date(weatherItem.dt_txt);
        const dayLabel = (date.toDateString() === today.toDateString()) ? "Today" : date.toDateString();
        return `<li class="card">
            <h3>${dayLabel}</h3>
            <p><i class="fas fa-thermometer-half"></i> High: ${Math.round(weatherItem.main.temp_max)}°C</p>
            <p><i class="fas fa-thermometer-half"></i> Low: ${Math.round(weatherItem.main.temp_min)}°C</p>
            <img src="http://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="Weather Icon">
            <h3><i class="fas fa-cloud"></i> ${weatherItem.weather[0].description}</h3>
        </li>`;
    }
};

const createHourlyForecastItem = (forecastItem) => {
    let date = new Date(forecastItem.dt * 1000);
    return `<div class="forecast-item">
        <h3><i class="fas fa-clock"></i> ${date.getHours()}:00</h3>
        <img src="http://openweathermap.org/img/wn/${forecastItem.weather[0].icon}@2x.png" alt="Weather Icon">
        <p><i class="fas fa-thermometer-half"></i> Temp: ${Math.round(forecastItem.main.temp)}°C</p>
        <p><i class="fas fa-cloud-rain"></i> Precipitation: ${(forecastItem.pop * 100).toFixed(0)}%</p>
        <p><i class="fas fa-cloud"></i> ${forecastItem.weather[0].description}</p>
    </div>`;
};
const getHourlyForecast = (cityName) => {
    const currentDate = new Date();
    const currentHour = currentDate.getHours();

    // Calculate the start time (current time)
    const startTime = new Date(currentDate);
    startTime.setHours(currentHour, 0, 0, 0);

    // Calculate the end time (same time tomorrow)
    const endTime = new Date(currentDate);
    endTime.setDate(endTime.getDate() + 1);
    endTime.setHours(currentHour, 0, 0, 0);

    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`)
        .then(res => {
            if (!res.ok) throw new Error("City not found");
            return res.json();
        })
        .then(data => {
            forecastGridDiv.innerHTML = "";
            const hourlyForecast = data.list.filter(item => {
                // Filter the forecast data to get only the hourly forecasts within the specified time range
                const forecastDate = new Date(item.dt_txt);
                return forecastDate >= startTime && forecastDate < endTime;
            });

            hourlyForecast.forEach(item => {
                const forecastHTML = createHourlyForecastItem(item);
                forecastGridDiv.insertAdjacentHTML("beforeend", forecastHTML);
            });
        })
        .catch(err => {
            console.error(err);
            errorMessageDiv.textContent = "City not found. Please try again.";
            errorMessageDiv.style.display = "block";
            setTimeout(() => {
                errorMessageDiv.style.display = "none";
            }, 3000);
        });
};



const getWeatherDetails = (cityName) => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`)
        .then(res => {
            if (!res.ok) throw new Error("City not found");
            return res.json();
        })
        .then(data => {
            const weatherHTML = createWeatherCard(cityName, data, 0);
            currentWeatherDiv.innerHTML = weatherHTML;
            getHourlyForecast(cityName);
        })
        .catch(err => {
            console.error(err);
            errorMessageDiv.textContent = "City not found. Please try again.";
            errorMessageDiv.style.display = "block";
            setTimeout(() => {
                errorMessageDiv.style.display = "none";
            }, 3000);
        });

    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`)
        .then(res => {
            if (!res.ok) throw new Error("City not found");
            return res.json();
        })
        .then(data => {
            const uniqueForecastDays = [];
            const fiveDayForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    return uniqueForecastDays.push(forecastDate);
                }
            });

            weatherCardsDiv.innerHTML = "";
            fiveDayForecast.forEach((item, index) => {
                const weatherHTML = createWeatherCard(cityName, item, index + 1);
                weatherCardsDiv.insertAdjacentHTML("beforeend", weatherHTML);
            });
        })
        .catch(err => {
            console.error(err);
            errorMessageDiv.textContent = "City not found. Please try again.";
            errorMessageDiv.style.display = "block";
            setTimeout(() => {
                errorMessageDiv.style.display = "none";
            }, 3000);
        });
};

searchButton.addEventListener("click", () => {
    const cityName = cityInput.value.trim();
    if (cityName) {
        getWeatherDetails(cityName);
    } else {
        alert("Please enter a city name.");
    }
});

locationButton.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`)
                .then(res => {
                    if (!res.ok) throw new Error("Unable to retrieve weather data");
                    return res.json();
                })
                .then(data => {
                    const cityName = data.name;
                    getWeatherDetails(cityName);
                })
                .catch(err => {
                    console.error(err);
                    errorMessageDiv.textContent = "Unable to retrieve weather data. Please try again.";
                    errorMessageDiv.style.display = "block";
                    setTimeout(() => {
                        errorMessageDiv.style.display = "none";
                    }, 3000);
                });
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});
