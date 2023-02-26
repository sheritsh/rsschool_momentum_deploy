// FLOW
let randomNum;
getRandomNum();
setBg();
showTime();
getWeather();
window.addEventListener('beforeunload', setLocalStorage);
window.addEventListener('load', getLocalStorage);
sliderOnclick();
cityEvent();
getQuotes();
quoteReloadListener();

// FUNCTIONS DEFINITION

function showTime() {
    const timeWidget = document.querySelector('.time');
    const date = new Date();
    const currentTime = date.toLocaleTimeString();
    timeWidget.textContent = currentTime;
    setTimeout(showTime, 1000)
    showDate();
    showGreetings();
}

function showDate() {
    const dateWidget = document.querySelector('.date');
    const date = new Date();
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
      };
    const currentDate = date.toLocaleDateString('ru-Ru', options);
    dateWidget.textContent = currentDate;
}

function showGreetings() {
    const greetingsWindget = document.querySelector('.greeting');
    const timeOfDay = getTimeOfDay();
    greetingsWindget.textContent = `Good ${timeOfDay}`;
}

function getTimeOfDay() {
    const date = new Date();
    const hours = date.getHours();
    if (hours > 5 && hours < 12) return 'morning';
    if (hours > 11 && hours < 18) return 'afternoon';
    if (hours > 17 && hours < 24) return 'evening';
    if (hours >= 0 && hours < 6) return 'night';
}

// I didn’t fork myself on github, I took the already forked one from the first person from the list
function getBgUrl() {
    if (randomNum > 20) randomNum = 1;
    if (randomNum < 1) randomNum = 20;
    let urlNumb = randomNum.toString();
    if (urlNumb.length == 1) urlNumb = '0' + urlNumb;
    return `https://github.com/00oleg/stage1-tasks/blob/assets/images/${getTimeOfDay()}/${urlNumb}.jpg?raw=true`;
}

function getSlideNext() {
    randomNum++;
    setBg();
}

function getSlidePrev() {
    randomNum--;
    setBg();
}

function getRandomNum() {
    const rand = Math.random()*(20-1) + 1;
    randomNum = Math.floor(rand);
}

function setBg() {
    const img = new Image();
    img.src = getBgUrl();
    img.onload = () => {
        document.body.style.backgroundImage = `url('${getBgUrl()}')`;
    };
}

function sliderOnclick() {
    const nextSlider = document.querySelector('.slide-next');
    const prevSlider = document.querySelector('.slide-prev');
    nextSlider.onclick = getSlideNext;
    prevSlider.onclick = getSlidePrev;
}

async function getWeather() {
    const cityInput = document.querySelector('.city');
    const weatherError = document.querySelector('.weather-error');
    const weatherIcon = document.querySelector('.weather-icon');
    const temperature = document.querySelector('.temperature');
    const weatherDescription = document.querySelector('.weather-description');
    const wind = document.querySelector('.wind');
    const humidity = document.querySelector('.humidity');
    let currentCity = cityInput.value;

    if (localStorage.getItem('userCity') && !cityInput.value) currentCity = localStorage.getItem('userCity');
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&lang=ru&appid=00ece19baaa4a576d15fa736f7c35c36&units=metric`;
    const res = await fetch(url);
    const data = await res.json();

    if(data.cod == 404) {
        weatherError.textContent = `Error! city not found for '${currentCity}'!`;
        weatherIcon.className = 'weather-icon owf';
        weatherDescription.textContent = '';
        temperature.textContent = '';
        wind.textContent = '';
        humidity.textContent = '';
    } else {
        weatherError.textContent = '';
        weatherIcon.className = 'weather-icon owf';
        weatherIcon.classList.add(`owf-${data.weather[0].id}`);
        temperature.textContent = `${data.main.temp.toFixed(0)}°C`;
        weatherDescription.textContent = data.weather[0].description;
        wind.textContent = `Wind speed: ${data.wind.speed.toFixed(0)}m/s`;
        humidity.textContent = `Humidity: ${data.main.humidity.toFixed(0)}%`;
    }

}

function setCity(event) {
    const city = document.querySelector('.city');
    if (event.code === 'Enter') {
      getWeather();
      city.blur();
    }
  }

function cityEvent() {
    const city = document.querySelector('.city');
    document.addEventListener('DOMContentLoaded', getWeather);
    city.addEventListener('keypress', setCity);
}

async function getQuotes() {
    const quoteText = document.querySelector('.quote');
    const quoteAuthor = document.querySelector('.author');
    const quotesUrl = 'https://type.fit/api/quotes';
    const res = await fetch(quotesUrl);
    const data = await res.json();
    const randQuoteNumber = getRandQuoteNumber();

    quoteText.textContent = data[randQuoteNumber].text;
    if (data[randQuoteNumber].author) {
        quoteAuthor.textContent = data[randQuoteNumber].author;
    }
}

function getRandQuoteNumber() {
    const rand = Math.random()*(99-1) + 1;
    return Math.floor(rand);
}

function quoteReloadListener() {
    const reloadButton = document.querySelector('.change-quote');
    reloadButton.onclick = getQuotes;
}




// Local Storage Functions 
function setLocalStorage() {
    // name
    const usernameInput = document.querySelector('.name');
    const userName = usernameInput.value;
    localStorage.setItem('userName', userName);
    // city
    const cityInput = document.querySelector('.city');
    const cityName = cityInput.value;
    localStorage.setItem('userCity', cityName);
}
  
function getLocalStorage() {
    if(localStorage.getItem('userName')) {
        const usernameInput = document.querySelector('.name');
        usernameInput.value = localStorage.getItem('userName');
    }
    if(localStorage.getItem('userCity')) {
        const cityInput = document.querySelector('.city');
        cityInput.value = localStorage.getItem('userCity');
    } else {
        if(localStorage.getItem('verginity') != 'no') {
            const cityInput = document.querySelector('.city');
            cityInput.value = 'Minsk';
            localStorage.setItem('userCity', 'Minsk');
            localStorage.setItem('verginity', 'no');
        }
        getWeather();
    }
}


// AudioPlayer 
import playList from './playList.js';

const playListContainer = document.querySelector('.play-list');
function createPlaylist() {
    for(let i = 0; i < playList.length; i++) {
        const li = document.createElement('li');
        li.classList.add('play-item');
        li.textContent = playList[i].title;
        playListContainer.append(li);
    }
}

createPlaylist();



let currentSong = 0;
let isPlaying = false;
const audio = new Audio();
const playPauseBtn = document.querySelector('.play');
const nextTrack = document.querySelector('.play-next');
const prevTrack = document.querySelector('.play-prev');
const playListItems = document.querySelectorAll('.play-item');


function playAudio() { 
    fixSongOrder();
    updateCurrentSong();
    audio.src = playList[currentSong].src;
    audio.currentTime = 0;

    if (!isPlaying) {
        audio.play();
        isPlaying = true;
        playPauseBtn.classList.add('pause');
    } else {
        pauseAudio();
        playPauseBtn.classList.remove('pause');
    }
    songSwitcher();
}

function songSwitcher() {
    let songDuration = playList[currentSong].duration;
    console.log("Current duration " + songDuration);
}

function updateCurrentSong() {
    for (let i = 0; i < playList.length; i++) {
        if (i == currentSong) {
            playListItems[i].classList.add('item-active');
        } else {
            playListItems[i].classList.remove('item-active');
        }
    }
}

function fixSongOrder() {
    if (currentSong >= playList.length) currentSong = 0;
    if (currentSong < 0) currentSong = playList.length-1;
}

function pauseAudio() {
    audio.pause();
    isPlaying = false;
}


function playBtn() {
    playPauseBtn.onclick = playAudio;  
}

playBtn();

function nextSong() {
    isPlaying = false;
    currentSong++;
    playAudio();
}

function prevSong() {
    isPlaying = false;
    currentSong--;
    playAudio();
}

function musicControl() {
    nextTrack.onclick = nextSong;
    prevTrack.onclick = prevSong;
}

musicControl();
