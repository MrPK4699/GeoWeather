import axios from 'axios';

const API_KEY="1ae9c487f695f551fcda539243a86e16";
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const getCurrentWeather = (city) => 
    axios.get(`${BASE_URL}/weather`, { params: { q: city, appid: API_KEY } });

export const getWeatherForecast = (city, days = 3) => 
    axios.get(`${BASE_URL}/forecast`, { params: { q: city, cnt: days * 8, appid: API_KEY } });