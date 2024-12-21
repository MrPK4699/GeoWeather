import React, { useState, useEffect } from 'react';
import LocationDropdown from './components/LocationDropdown';

import { getCurrentWeather, getWeatherForecast } from './services/weatherService';
import './App.css';
import MapComponent from './components/MapComponent';
import GeolocationMap from './components/GeoLocationMap';
import InfiniteScrolling from './components/InfiniteScrolling';
import Pagination from './components/Pagination';
import DynamicForcasting from './components/DynamicForcasting';
const App = () => {
    const [selectedCity, setSelectedCity] = useState(() => 
        localStorage.getItem('selectedCity') || 'Ho Chi Minh'
    );
    const [weatherData, setWeatherData] = useState(null);

    const [coord, setCoord]= useState({lat:'', lon:''});

    useEffect(() => {
        localStorage.setItem('selectedCity', selectedCity);
        const fetchWeather = async () => {
            try {
                const weatherResponse = await getCurrentWeather(selectedCity);
                const forecastResponse = await getWeatherForecast(selectedCity);
                const res= await fetch( `https://nominatim.openstreetmap.org/search?q=${selectedCity}&format=json&limit=1` )
                const ans= await res.json();
    
                // console.log(ans);
                console.log('weatherResponse', weatherResponse);
                console.log('forecastResponse', forecastResponse);
                setCoord((prev)=>({...prev, lat: ans[0].lat, lon:ans[0].lon}));
                // await setCoord({lat: ans[0].lat, lon:ans[0].lon});
    
                setWeatherData({
                    city: selectedCity,
                    temp: (weatherResponse.data.main.temp - 273.15).toFixed(2),
                    condition: weatherResponse.data.weather[0].description,
                    forecast: forecastResponse.data.list
                });
                
            } catch (error) {
                console.log(error);
            }
        };
        fetchWeather();
    }, [selectedCity]);

    return (
        <div style={{height:'100vh' ,overflow: 'auto'}}>
            <h1 style={{margin:'auto'}}>Weather Forecast</h1>
            <LocationDropdown selectedCity={selectedCity} setSelectedCity={setSelectedCity} />
            <DynamicForcasting weatherData={weatherData}/>
            {coord.lat && coord.lon && <MapComponent location={selectedCity} lat={coord.lat} lon={coord.lon}/>}

            {/* <GeolocationMap /> */}
            {/* <InfiniteScrolling/> */}
            {/* <Pagination/> */}

        </div>
    );
};

export default App;