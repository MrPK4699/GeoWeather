import React, { useMemo, useState } from 'react';
import WeatherDisplay from './WeatherDisplay';
import { groupByLocalDate } from '../utils/forecast';

import './LocationDropdown.css';

const DynamicForcasting = ({ weatherData }) => {
  // Forecast grouped by the CITY's local date (not UTC, not the viewer's time zone).
  const days = useMemo(
    () => groupByLocalDate(weatherData?.forecast, weatherData?.timezone),
    [weatherData]
  );
  const dates = Object.keys(days);

  // Keep the user's chosen date while it exists in the data (e.g. after switching city);
  // otherwise fall back to the first forecast day, i.e. the city's "today".
  const [pickedDate, setPickedDate] = useState('');
  const date = days[pickedDate] ? pickedDate : dates[0];

  if (!dates.length) return <p>No weather data available.</p>;

  return (
    <div className='dyn4cast-container'>
      <div className="dropdown-container">
        <label htmlFor='forecast-date' className="dropdown-label">Select Date</label>
        <input
          type="date"
          id="forecast-date"
          className="city-dropdown"
          min={dates[0]}
          max={dates[dates.length - 1]}
          value={date}
          onChange={(e) => setPickedDate(e.target.value)}
        />
      </div>
      {days[date] ? (
        <WeatherDisplay weatherData={weatherData} date={date} items={days[date]} />
      ) : (
        <p>No weather data available for the selected date.</p>
      )}
    </div>
  );
};

export default DynamicForcasting;
