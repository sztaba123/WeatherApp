const API_KEY = 'aa5b5a15bf44788c02eaa041cf26323f';

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
      })
      .finally(() => {
        hideLoading();
      });
}

function displayWeatherData(data) {
    document.getElementById('cityName').innerText = data.name;
    document.getElementById('temperature').innerText =  data.main.temp;
    document.getElementById('description').innerText = data.weather[0].description;
    document.getElementById('humidity').innerText = data.main.humidity;
    document.getElementById('windSpeed').innerText = data.wind.speed ;
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
