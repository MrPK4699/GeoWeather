import React, { useState, useEffect } from 'react';
import LocationDropdown from './components/LocationDropdown';

import {
    getCurrentWeather,
    getWeatherForecast,
    getErrorMessage,
    isRequestCancelled,
} from './services/weatherService';
import './App.css';
import MapComponent from './components/MapComponent';
import GeolocationMap from './components/GeoLocationMap';
import DynamicForcasting from './components/DynamicForcasting';

const DEFAULT_CITY = 'Ho Chi Minh';

const readSavedCity = () => {
    try {
        return localStorage.getItem('selectedCity') || DEFAULT_CITY;
    } catch {
        return DEFAULT_CITY; // storage blocked (private mode etc.)
    }
};

const App = () => {
    const [selectedCity, setSelectedCity] = useState(readSavedCity);
    const [weatherData, setWeatherData] = useState(null);
    const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
    const [error, setError] = useState('');
    const [retryCount, setRetryCount] = useState(0);
    const [showMapComponent, setShowMapComponent] = useState(true); // Checkbox for MapComponent
    const [showGeolocation, setShowGeolocation] = useState(false); // Checkbox for GeolocationMap

    useEffect(() => {
        try {
            localStorage.setItem('selectedCity', selectedCity);
        } catch {
            /* ignore: the choice just won't be remembered */
        }

        // Cancel this request if the city changes (or the component unmounts) before it finishes,
        // so a slow reply for an old city can never overwrite the new one.
        const controller = new AbortController();
        setStatus('loading');
        setError('');

        // Both requests run in parallel. The coordinates come from the weather API itself,
        // so no separate geocoding request is needed.
        Promise.all([
            getCurrentWeather(selectedCity, { signal: controller.signal }),
            getWeatherForecast(selectedCity, { signal: controller.signal }),
        ])
            .then(([current, forecast]) => {
                setWeatherData({
                    city: selectedCity,
                    temp: Math.round(current.data.main.temp),
                    condition: current.data.weather[0].description,
                    coord: { lat: current.data.coord.lat, lon: current.data.coord.lon },
                    timezone: forecast.data.city.timezone, // seconds from UTC
                    forecast: forecast.data.list,
                });
                setStatus('ready');
            })
            .catch((err) => {
                if (isRequestCancelled(err)) return;
                setError(getErrorMessage(err));
                setStatus('error');
            });

        return () => controller.abort();
    }, [selectedCity, retryCount]);

    return (
        <div className="app">
            <h1 style={{ margin: 'auto' }}>Weather Forecast</h1>
            <LocationDropdown selectedCity={selectedCity} setSelectedCity={setSelectedCity} />

            {status === 'loading' && (
                <p className="status-message" role="status">
                    Loading weather for {selectedCity}…
                </p>
            )}
            {status === 'error' && (
                <div className="status-message status-error" role="alert">
                    <p>{error}</p>
                    <button type="button" className="myLocation-btn" onClick={() => setRetryCount((n) => n + 1)}>
                        Try again
                    </button>
                </div>
            )}

            {/* Only show data that belongs to the selected city */}
            {weatherData && weatherData.city === selectedCity && <DynamicForcasting weatherData={weatherData} />}

            <div className="mapsComponenets">
                <div className="checkbox">
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
                {showMapComponent && weatherData && weatherData.city === selectedCity && (
                    <MapComponent location={selectedCity} lat={weatherData.coord.lat} lon={weatherData.coord.lon} />
                )}
                {showGeolocation && <GeolocationMap />}
                {!showGeolocation && !showMapComponent && <p>Please tick one of the checkboxes above.</p>}
            </div>
        </div>
    );
};

export default App;
