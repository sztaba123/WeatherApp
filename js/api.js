const API_KEY = 'aa5b5a15bf44788c02eaa041cf26323f';

// Upewnij się, że karty są ukryte na początku
document.addEventListener('DOMContentLoaded', function() {
    hideWeatherCards();
    
    // Upewnij się, że sekcja prognozy jest ukryta
    const forecastSection = document.getElementById('tempForNextDays');
    if (forecastSection) {
        forecastSection.classList.add('weather-hidden');
        forecastSection.classList.remove('weather-visible');
    }
});

function getWeatherByCity() {
    const cityName = document.getElementById('cityInput').value.trim();
    if (!cityName) {
        showError("Proszę podać nazwę miasta.");
        return;
    }
    
    // Pokaż loading
    showLoading();
    
    const URL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric&lang=pl`;
    // endpoint for next 5 days forecast
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric&lang=pl`;

    fetch(URL)
      .then(response => {
        if (!response.ok){
            throw new Error(`Miasto nie zostało znalezione (${response.status})`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Weather data:', data);
        displayWeatherData(data);
        hideError();
      })
      .catch(error => {
        console.error('Błąd podczas pobierania danych pogodowych:', error);
        showError(error.message);
        hideWeatherCards(); // Ukryj karty przy błędzie
      })
      .finally(() => {
        hideLoading();
      });

    // Pobierz prognozę na 5 dni
    fetch(forecastURL)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Miasto nie zostało znalezione (${response.status})`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Forecast data:', data);
        displayForecastData(data);
      })
      .catch(error => {
        console.error('Błąd podczas pobierania danych prognozy:', error);
        showError(error.message);
      });
}

function displayWeatherData(data) {
    // Pokaż karty pogodowe
    showWeatherCards();
    
    document.getElementById('weatherIcon').innerHTML = `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="${data.weather[0].description}">`;
    document.getElementById('cityName').innerText = data.name;
    document.getElementById('temperature').innerText =  `${data.main.temp.toFixed(1)} °C`;
    document.getElementById('description').innerText = data.weather[0].description;
    document.getElementById('feelsLike').innerText = `${data.main.feels_like.toFixed(1)} °C`;
    document.getElementById('humidity').innerText = `${data.main.humidity}%`;
    document.getElementById('pressure').innerText = `${data.main.pressure} hPa`;
    document.getElementById('visibility').innerText = `${(data.visibility / 1000).toFixed(1)} km`;
    const now = Date.now() / 1000; // aktualny czas w sekundach
    let sunText, sunTime, sunIcon;

    if (now < data.sys.sunrise) {
      // Przed wschodem słońca
      sunText = "Wschód słońca";
      sunTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
      sunIcon = "🌅";
    } else if (now < data.sys.sunset) {
      // Po wschodzie, przed zachodem
      sunText = "Zachód słońca";
      sunTime = new Date(data.sys.sunset * 1000).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
      sunIcon = "🌇";
    } else {
      // Po zachodzie słońca
      sunText = "Wschód słońca (jutro)";
      sunTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
      sunIcon = "🌅";
    }

    document.getElementById('sunRise').innerHTML = `${sunIcon} ${sunText}: ${sunTime}`;
    document.getElementById('sunRiseLabel').innerText = sunText;
    document.getElementById('windSpeed').innerText = data.wind.speed;
}

function displayForecastData(data) {
    console.log('Forecast data received:', data);
    console.log('Number of forecast items:', data.list.length);
    
    // Pokaż sekcję prognozy
    const forecastSection = document.getElementById('tempForNextDays');
    forecastSection.classList.remove('weather-hidden');
    forecastSection.classList.add('weather-visible');
    
    const forecastContainer = document.getElementById('forecastCards');
    
    // Wyczyść poprzednie dane
    forecastContainer.innerHTML = '';
    
    // Grupuj dane po dniach (API zwraca dane co 3 godziny)
    const dailyForecasts = {};
    const today = new Date().toDateString();
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString(); // Unikalny klucz dla każdego dnia
        
        // Pomiń dzisiejszy dzień - pokazujemy tylko następne dni
        if (dateKey === today) return;
        
        if (!dailyForecasts[dateKey]) {
            dailyForecasts[dateKey] = {
                date: date,
                temps: [],
                weather: item.weather[0],
                items: []
            };
        }
        
        dailyForecasts[dateKey].temps.push(item.main.temp);
        dailyForecasts[dateKey].items.push(item);
    });
    
    // Sortuj dni chronologicznie i weź pierwsze 5
    const days = Object.values(dailyForecasts)
        .sort((a, b) => a.date - b.date)
        .slice(0, 5);
    
    console.log('Processed days:', days.length);
    
    days.forEach((day, index) => {
        const maxTemp = Math.max(...day.temps).toFixed(1);
        const minTemp = Math.min(...day.temps).toFixed(1);
        const avgTemp = (day.temps.reduce((sum, temp) => sum + temp, 0) / day.temps.length).toFixed(1);
        
        const dayName = day.date.toLocaleDateString('pl-PL', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        const card = document.createElement('div');
        card.className = 'forecast-day-card';
        card.innerHTML = `
            <div class="forecast-icon">
                <img src="https://openweathermap.org/img/wn/${day.weather.icon}.png" 
                     alt="${day.weather.description}">
            </div>
            <p class="card-label">${dayName}</p>
            <span class="card-value">${avgTemp}°C</span>
            <div class="temp-range" style="font-size: 0.75rem; color: #6c757d;">
                ${minTemp}° / ${maxTemp}°
            </div>
            <p class="forecast-desc">
                ${day.weather.description}
            </p>
        `;
        
        forecastContainer.appendChild(card);
    });
    
    // Jeśli mamy mniej niż 5 dni, dodaj informację
    if (days.length < 5) {
        console.log(`Only ${days.length} days available in forecast`);
    }
}

function showError(message) {
    const errorDiv = document.getElementById('weatherResult');
    errorDiv.className = 'alert alert-danger';
    errorDiv.innerText = message;
    errorDiv.classList.remove('d-none');
}

function hideError() {
    const errorDiv = document.getElementById('weatherResult');
    errorDiv.classList.add('d-none');
}

function showLoading() {
    const errorDiv = document.getElementById('weatherResult');
    errorDiv.className = 'alert alert-info';
    errorDiv.innerText = 'Ładowanie danych pogodowych...';
    errorDiv.classList.remove('d-none');
}

function hideLoading() {
    const errorDiv = document.getElementById('weatherResult');
    errorDiv.classList.add('d-none');
}

function showWeatherCards() {
    const mainCard = document.getElementById('mainWeatherCard');
    const detailCards = document.getElementById('detailWeatherCards');
    const forecastCards = document.getElementById('tempForNextDays');
    
    mainCard.classList.remove('weather-hidden');
    mainCard.classList.add('weather-visible');
    
    detailCards.classList.remove('weather-hidden');
    detailCards.classList.add('weather-visible');
    
    // Pokaż też sekcję prognozy jeśli istnieją dane
    if (forecastCards) {
        forecastCards.classList.remove('weather-hidden');
        forecastCards.classList.add('weather-visible');
    }
}

function hideWeatherCards() {
    const mainCard = document.getElementById('mainWeatherCard');
    const detailCards = document.getElementById('detailWeatherCards');
    const forecastCards = document.getElementById('tempForNextDays');
    
    mainCard.classList.remove('weather-visible');
    mainCard.classList.add('weather-hidden');
    
    detailCards.classList.remove('weather-visible');
    detailCards.classList.add('weather-hidden');
    
    // Ukryj też sekcję prognozy
    if (forecastCards) {
        forecastCards.classList.remove('weather-visible');
        forecastCards.classList.add('weather-hidden');
    }
}
