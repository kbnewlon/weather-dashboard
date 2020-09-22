// Grab data for local storage and render page
let citySearches = checkCitySearches();
currentLocation();
renderSearchedCities();

// Check to see if city searches local storage is blank if it is create blank array
function checkCitySearches() {
    let localArr = JSON.parse(localStorage.getItem("CitySearches"));
    if (localArr === null) { localArr = []; }
    return localArr
}

// Grabs users IP and gives city
function currentLocation() {
    $.get("https://ipapi.co/json/", function (response) { findLatLon(response.city) });
}

//Render Searched Cities
function renderSearchedCities() {
    $("#search-list").html("")
    if (citySearches === null) { return }
    citySearches.forEach(citySearch => {
        let newCityRow = $("<li>").addClass("list-group-item").attr("id", citySearch.city).text(citySearch.city)
        $("#search-list").append(newCityRow);
    });
}

// Grabs latitude and longitude and responds with current weather and 7 day forecast
function currentWeather(cityName, lat, lon) {
    $.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=692496d9b9647012326807b41694aa6b&units=imperial`, function (response) {
        let currentDate = convertDate(response.current.dt),
            currentTemp = response.current.temp,
            currentHumidity = response.current.humidity,
            currentWind = response.current.wind_speed,
            currentUV = response.current.uvi,
            currentIcon = response.current.weather[0].icon,
            currentIconDescription = response.current.weather[0].description;
        renderCurrentWeather(cityName, currentDate, currentTemp, currentHumidity, currentWind, currentUV, currentIcon, currentIconDescription);
        renderFiveDayForecast(response);
    })
}

// Render current weather
function renderCurrentWeather(cityName, currentDate, currentTemp, currentHumidity, currentWind, currentUV, currentIcon, currentIconDescription) {
    $("#current-row").html("")
    let divCard = $("<div>").addClass("card-body"),
        H2 = $("<h2>").addClass("card-title").text(`${cityName} (${currentDate})`),
        Icon = $("<img>").attr("src", `https://openweathermap.org/img/wn/${currentIcon}@2x.png`).attr("alt", currentIconDescription),
        Temp = $("<p>").addClass("card-text").text(`Temperature: ${currentTemp.toFixed(0)} \u2109`),
        Humidity = $("<p>").addClass("card-text").text(`Humidity: ${currentHumidity} %`),
        Wind = $("<p>").addClass("card-text").text(`Wind Speed: ${currentWind} MPH`),
        UV = $("<p>").addClass("card-text").html(`UV Index: <button class='btn' id='uv-btn'>${currentUV}</button`);
    H2.append(Icon);
    divCard.append(H2, Temp, Humidity, Wind, UV);
    $("#current-row").append(divCard);
    checkUVIndex(currentUV);
}

// Render 5 Day Forecast
function renderFiveDayForecast(response) {
    $("#daily-row").html("")
    for (let i = 1; i < 6; i++) {
        const daily = response.daily[i];
        let dailyDate = convertDate(daily.dt),
            dailyIcon = daily.weather[0].icon,
            dailyIconDescription = daily.weather[0].description,
            dailyTempMin = daily.temp.min.toFixed(0),
            dailyTempMax = daily.temp.max.toFixed(0),
            dailyHumidity = daily.humidity,
            divCard = $("<div>").addClass("card col-sm ml-3 mb-3 bg-primary text-light card-width"),
            divCardBody = $("<div>").addClass("card-body text-center"),
            dailyH5 = $("<h5>").addClass("card-title h5").text(dailyDate),
            dailyImg = $("<img>").attr("src", `https://openweathermap.org/img/wn/${dailyIcon}@2x.png`).attr("alt", dailyIconDescription),
            dailyPTemp = $("<p>").addClass("card-text").text(`Temp: ${dailyTempMin} / ${dailyTempMax} \u2109`),
            dailyPHumidity = $("</p>").addClass("card-text").text(`Humidity: ${dailyHumidity} %`);
        divCardBody.append(dailyH5, dailyImg, dailyPTemp, dailyPHumidity);
        divCard.append(divCardBody);
        $("#daily-row").append(divCard);
    }
}

// Highlight UV Index
function checkUVIndex(currentUV) {
    if (currentUV <= 2) {
        $("#uv-btn").addClass("btn-success");
    } else if (currentUV <= 7) {
        $("#uv-btn").addClass("btn-warning");
    } else {
        $("#uv-btn").addClass("btn-danger");
    }
}

// Converts city name into latitude and longitude and inputs that into currentWeather
function findLatLon(city) {
    $.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=05b151abf8878f4a65f1f748137f62da`, function (response) {
        currentWeather(response.name, response.coord.lat, response.coord.lon);
        addNewSearchedCity(response.name, response.coord.lat, response.coord.lon);
        renderSearchedCities();
    });
}

//Add City to citySearches Array
function addNewSearchedCity(cityName, lat, lon) {
    let newCity = { city: cityName, latitude: lat, longitude: lon }
    if (citySearches === null) {
        citySearches.unshift(newCity);
        localStorage.setItem("CitySearches", JSON.stringify(citySearches))
    } else if (citySearches.some(function (el) { return el.city === cityName })) {
        return
    }
    else if (citySearches.length === 11) {
        citySearches.pop();
    }
    citySearches.unshift(newCity);
    localStorage.setItem("CitySearches", JSON.stringify(citySearches))
}

// Converts Unix TimeStamp to MM/DD/YYYY
function convertDate(unixTimeStamp) {
    let date = new Date(unixTimeStamp * 1000);
    return (`${(date.getMonth() + 1)}/${date.getDate()}/${date.getFullYear()}`)
}

//Event listener for search
$("#search-form").on("submit", function (event) {
    event.preventDefault();
    findLatLon($("#search-input").val().trim());
    $("#search-input").val() = "";
});

// Event Listener for Search buttons
$("#search-list").on("click", function (event) {
    event.preventDefault();
    findLatLon(event.target.id);
})