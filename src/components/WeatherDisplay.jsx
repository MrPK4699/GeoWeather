import React from 'react';
import './WeatherDisplay.css'; 

const WeatherDisplay = ({ weatherData }) => {
    if (!weatherData) return <p>Loading...</p>;
    // console.log(weatherData);

    const foreCast = [weatherData.forecast[0], weatherData.forecast[1], weatherData.forecast[2]];

    return (
        <div className="weather-container">
            <h2 className="city-name">{weatherData.city}</h2>
            <p className="temperature">Temperature: {weatherData.temp}°C</p>
            <p className="condition">Condition: {weatherData.condition}</p>
            
            <h3 className="forecast-title">3-Day Forecast:</h3>
            <ul className="forecast-list">
                {foreCast.map((forecastItem, index) => (
                    <li key={index} className="forecast-item">
                        <p className="forecast-date">{forecastItem.dt_txt}</p>
                        <p className="forecast-temp">Temperature: {(forecastItem.main.temp - 273.15).toFixed(2)}°C</p>
                        <p className="forecast-condition">{forecastItem.weather[0].description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default WeatherDisplay;
