# GeoWeather

Live weather for any city: current conditions, the next 24 hours, a 5-day forecast with a temperature
and rain chart, and a rain-radar map. The background animates to match the real weather (sun, stars,
clouds, rain, thunder, snow or mist).

## Features

- **City search** with autocomplete (any city worldwide), plus recent searches and popular cities
- **Use my location** (GPS) with a clear message if permission is denied
- **Current weather**: temperature, feels-like, today's high/low, humidity, wind and direction,
  chance of rain, pressure, visibility, sunrise and sunset, all in the city's own local time
- **Next 24 hours** in 3-hour steps and a **5-day forecast** with min–max range bars
- **Temperature & rain chart** for the selected day (lightweight SVG, no chart library)
- **Map** with live rain radar overlay
- **°C / °F** toggle; city, unit and recent searches are remembered
- Animated background per weather and time of day; respects "reduce motion"
- Responsive from phones to wide screens; keyboard and screen-reader friendly

## Tech

React 19 · Vite · Tailwind CSS 4 · TanStack Query (caching, request cancelling) · Leaflet ·
OpenWeather API · Vitest + Testing Library

## Setup

1. Get a free API key at <https://openweathermap.org/api>.
2. Create a `.env` file in the project root:

   ```
   VITE_OWM_API_KEY=your_key_here
   ```

   (The older `REACT_APP_API_KEY` name also works.) `.env` is git-ignored: never commit it.

3. Install and run:

   ```bash
   npm install
   npm run dev      # http://localhost:5173
   npm test         # run the tests
   npm run build    # production build in dist/
   ```

> **Note:** any key used in browser code can be read by visitors. For a public deployment, call the
> OpenWeather API through a small server-side proxy (e.g. a Vercel/Netlify function) instead.

## Credits

Weather data and rain radar © [OpenWeather](https://openweathermap.org/) ·
Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors ·
Icons: [Weather Icons](https://erikflowers.github.io/weather-icons/) and [Lucide](https://lucide.dev/) via react-icons
