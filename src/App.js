import React, { useState, useEffect } from 'react';
import LocationDropdown from './components/LocationDropdown';

import { getCurrentWeather, getWeatherForecast } from './services/weatherService';
import './App.css';
import MapComponent from './components/MapComponent';
import GeolocationMap from './components/GeoLocationMap';
import DynamicForcasting from './components/DynamicForcasting';

const App = () => {
    const [selectedCity, setSelectedCity] = useState(() => 
        localStorage.getItem('selectedCity') || 'Ho Chi Minh'
    );
    const [weatherData, setWeatherData] = useState(null);
    const [coord, setCoord] = useState({ lat: '', lon: '' });
    const [showMapComponent, setShowMapComponent] = useState(true); // Checkbox for MapComponent
    const [showGeolocation, setShowGeolocation] = useState(false);  // Checkbox for GeolocationMap

    useEffect(() => {
        localStorage.setItem('selectedCity', selectedCity);
        const fetchWeather = async () => {
            try {
                const weatherResponse = await getCurrentWeather(selectedCity);
                const forecastResponse = await getWeatherForecast(selectedCity);
                const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${selectedCity}&format=json&limit=1`);
                const cityCoord = await res.json();
    
                setCoord((prev) => ({ ...prev, lat: cityCoord[0].lat, lon: cityCoord[0].lon }));
                setWeatherData({
                    city: selectedCity,
                    temp: (weatherResponse.data.main.temp - 273.15).toFixed(2),
                    condition: weatherResponse.data.weather[0].description,
                    forecast: forecastResponse.data.list
                });
                console.log('weatherResponse',weatherResponse.data)
                console.log('forecastResponse',forecastResponse.data)
                
            } catch (error) {
                console.log(error);
            }
        };
        fetchWeather();
    }, [selectedCity]);

    return (
        <div style={{ height: '100vh', overflow: 'auto' }}>
            <h1 style={{ margin: 'auto' }}>Weather Forecast</h1>
            <LocationDropdown selectedCity={selectedCity} setSelectedCity={setSelectedCity} />
            <DynamicForcasting weatherData={weatherData} />
            

            <div className='mapsComponenets'>
                <div className='checkbox'>
                    <h2>MAP</h2>
                    <label>
                        <input
                            type="checkbox"
                            checked={showMapComponent}
                            onChange={(e) => setShowMapComponent(e.target.checked)}
                        />
                        Show City Map
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={showGeolocation}
                            onChange={(e) => setShowGeolocation(e.target.checked)}
                            />
                        Show My Location
                    </label>
                </div>
                {showMapComponent && coord.lat && coord.lon && (
                    <MapComponent location={selectedCity} lat={coord.lat} lon={coord.lon} />
                )}
                {showGeolocation && <GeolocationMap />}
                {!showGeolocation && !showMapComponent &&(
                    <p>please tick any of the above checkbox</p>
                )}
            </div>
        </div>
    );
};

export default App;
