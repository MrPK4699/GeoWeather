import React, { useEffect, useState } from 'react';
import WeatherDisplay from './WeatherDisplay';

import './LocationDropdown.css'; 


const DynamicForcasting = ({ weatherData }) => {
  const currDt = new Date();
  const formattedDate = currDt.toISOString().slice(0, 10);
  
  const [date, setDate] = useState(formattedDate);
  const [filteredData, setFilteredData] = useState( { forecast: [] });

  console.log(weatherData)
  console.log(filteredData)
  // Function to filter weather data based on selected date
  const handleChange = (selectedDate) => {
    const targetDate = selectedDate || formattedDate;

     if (!weatherData || !weatherData.forecast) return;

    setDate(targetDate);

    const filterArr = weatherData.forecast.filter((ele) => {
      return ele.dt_txt.slice(0, 10) === targetDate;
    });
    // console.log(filterArr.length)
    setFilteredData({...weatherData, forecast:filterArr});
  };

  // Initial filter setup on component mount
  useEffect(() => {
    handleChange(formattedDate);
  }, [weatherData]); // Ensure this runs when weatherData changes

  return (
    <div>
      {/* <h1>Dynamic Forecasting</h1> */}
      <div className="dropdown-container">
        <label htmlFor='Select-date' className="dropdown-label">Select Date</label>
        <input
          type="date"
          id="city-dropdown" 
          className="city-dropdown" 
          onChange={(e) => {
            handleChange(e.target.value);
          }}
          value={date}
        />
    </div>
      {filteredData.forecast.length > 0 ? (
        <>
          <WeatherDisplay weatherData={filteredData} />
        </>
      ) : (
        <p>No weather data available for the selected date.</p>
      )}
    </div>
  );
};

export default DynamicForcasting;


