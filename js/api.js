const API_KEY = 'aa5b5a15bf44788c02eaa041cf26323f';

// Upewnij się, że karty są ukryte na początku
document.addEventListener('DOMContentLoaded', function() {
    hideWeatherCards();
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
    
    mainCard.classList.remove('weather-hidden');
    mainCard.classList.add('weather-visible');
    
    detailCards.classList.remove('weather-hidden');
    detailCards.classList.add('weather-visible');
}

function hideWeatherCards() {
    const mainCard = document.getElementById('mainWeatherCard');
    const detailCards = document.getElementById('detailWeatherCards');
    
    mainCard.classList.remove('weather-visible');
    mainCard.classList.add('weather-hidden');
    
    detailCards.classList.remove('weather-visible');
    detailCards.classList.add('weather-hidden');
}
