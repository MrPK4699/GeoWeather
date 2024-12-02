import React from 'react';
import './LocationDropdown.css'; 

const cities = ["Ho Chi Minh", "Singapore", "Kuala Lumpur", "Tokyo", "Athens"];

const LocationDropdown = ({ selectedCity, setSelectedCity }) => (
    <div className="dropdown-container">
        <label htmlFor="city-dropdown" className="dropdown-label">Select City:</label>
        <select 
            id="city-dropdown" 
            className="city-dropdown" 
            value={selectedCity} 
            onChange={(e) => setSelectedCity(e.target.value)}
        >
            {cities.map((city) => (
                <option key={city} value={city}>
                    {city}
                </option>
            ))}
        </select>
    </div>
);

export default LocationDropdown;

