const apiKey = "daf1bafdb24ddfa1d827109d8db7cb22";
const weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather?q=";
const forecastApiUrl = "https://api.openweathermap.org/data/2.5/forecast?q=";

function showLoading() {
  document.getElementById("loading").classList.remove("hidden");
  document.getElementById("error-message").classList.add("hidden");
}

function hideLoading() {
  document.getElementById("loading").classList.add("hidden");
}

function showError(message) {
  const errorDiv = document.getElementById("error-message");
  errorDiv.textContent = message;
  errorDiv.classList.remove("hidden");
}

function searchWeather() {
  const city = document.getElementById("search-box").value.trim();
  if (!city) {
    showError("Please enter a city name!");
    return;
  }

  showLoading();

  // Fetch current weather
  fetch(`${weatherApiUrl}${city}&appid=${apiKey}&units=metric`)
    .then((response) => {
      if (!response.ok) throw new Error("City not found");
      return response.json();
    })
    .then((data) => {
      updateWeather(data);
      // Fetch 5-day forecast after current weather
      return fetch(`${forecastApiUrl}${city}&appid=${apiKey}&units=metric`);
    })
    .then((response) => {
      if (!response.ok) throw new Error("Forecast not available");
      return response.json();
    })
    .then((data) => {
      updateForecast(data);
      hideLoading();
    })
    .catch((error) => {
      console.error(error);
      hideLoading();
      showError("Couldn’t fetch weather data. Please try again.");
    });
}

function updateWeather(data) {
  // Update condition
  document.getElementById("condition").textContent =
    data.weather[0].description.charAt(0).toUpperCase() +
    data.weather[0].description.slice(1);

  // Update weather icon
  const iconCode = data.weather[0].icon;
  document.getElementById(
    "weather-icon"
  ).src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  // Update temperature
  document.getElementById("temperature").textContent = Math.round(data.main.temp);

  // Update day and date
  const date = new Date();
  document.getElementById("day").textContent = date.toLocaleString("en-US", {
    weekday: "long",
  });
  document.getElementById("date").textContent = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Update city name
  document.getElementById("city-name").textContent = data.name;

  // Update weather info
  document.getElementById("wind-speed").textContent = data.wind.speed;
  document.getElementById("pressure").textContent = data.main.pressure;
  document.getElementById("humidity").textContent = data.main.humidity;
}

function updateForecast(data) {
  const forecastList = document.getElementById("forecast-list");
  forecastList.innerHTML = ""; // Clear previous forecast

  // Filter forecast data to get one entry per day (e.g., at 12:00)
  const dailyData = data.list.filter((entry) =>
    entry.dt_txt.includes("12:00:00")
  );

  dailyData.forEach((day) => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleString("en-US", { weekday: "short" });
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const temp = Math.round(day.main.temp);
    const iconCode = day.weather[0].icon;
    const description = day.weather[0].description;
    const pressure = day.main.pressure;
    const windSpeed = day.wind.speed;
    const humidity = day.main.humidity;

    const forecastItem = `
      <div class="forecast-item">
        <p>${dayName}, ${formattedDate}</p>
        <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${description}">
        <p>${temp}°C</p>
        <p>${pressure} hPa</p>
        <p>${windSpeed} m/s</p>
        <p>${humidity}%</p>
      </div>
    `;
    forecastList.innerHTML += forecastItem;
  });
}

// Default load with a sample city
window.onload = () => {
  document.getElementById("search-box").value = "London";
  searchWeather();
};