import axios from 'axios';

const API_KEY = process.env.REACT_APP_API_KEY;
const BASE_URL = process.env.REACT_APP_BASE_URL;

export const getCurrentWeather = (city) => 
    axios.get(`${BASE_URL}/weather`, { params: { q: city, appid: API_KEY } });

export const getWeatherForecast = (city, days = 5) => 
    axios.get(`${BASE_URL}/forecast`, { params: { q: city, cnt: days * 8, appid: API_KEY } });