import React from 'react';
import './WeatherDisplay.css';
import TemperatureGraph from './TemperatureGraph';
import { formatDay, localTime } from '../utils/forecast';

/**
 * weatherData: current weather for the city (temp, condition, timezone)
 * date: the selected city-local day, 'YYYY-MM-DD'
 * items: the 3-hour forecast entries for that day
 */
const WeatherDisplay = ({ weatherData, date, items }) => {
    if (!weatherData) return <p>Loading...</p>;

    return (
        <div className="weather-container">
            <h2 className="city-name">{weatherData.city}</h2>
            <p className="temperature">Temperature: {weatherData.temp}°C</p>
            <p className="condition">Condition: {weatherData.condition}</p>

            <h3 className="forecast-title">Forecast for {formatDay(date)}</h3>
            <ul className="forecast-list">
                {items.map((item) => (
                    <li key={item.dt} className="forecast-item">
                        <p className="forecast-date">{localTime(item.dt, weatherData.timezone)}</p>
                        <p className="forecast-temp">Temperature: {Math.round(item.main.temp)}°C</p>
                        <div>
                            <img
                                src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                                alt={item.weather[0].description}
                                width="100"
                                height="100"
                            />
                            <p className="forecast-condition">{item.weather[0].description}</p>
                        </div>
                    </li>
                ))}
            </ul>
            <TemperatureGraph items={items} timezone={weatherData.timezone} date={date} />
        </div>
    );
};

export default WeatherDisplay;
