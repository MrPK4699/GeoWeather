import {
  WiCloud,
  WiCloudy,
  WiDayCloudy,
  WiDayRain,
  WiDaySunny,
  WiFog,
  WiNightAltCloudy,
  WiNightAltRain,
  WiNightClear,
  WiShowers,
  WiSnow,
  WiThunderstorm,
} from 'react-icons/wi';

// OpenWeather icon code -> [icon component, animation class]
const ICONS = {
  '01d': [WiDaySunny, 'wi-spin'],
  '01n': [WiNightClear, 'wi-float'],
  '02d': [WiDayCloudy, 'wi-float'],
  '02n': [WiNightAltCloudy, 'wi-float'],
  '03d': [WiCloud, 'wi-drift'],
  '03n': [WiCloud, 'wi-drift'],
  '04d': [WiCloudy, 'wi-drift'],
  '04n': [WiCloudy, 'wi-drift'],
  '09d': [WiShowers, 'wi-float'],
  '09n': [WiShowers, 'wi-float'],
  '10d': [WiDayRain, 'wi-float'],
  '10n': [WiNightAltRain, 'wi-float'],
  '11d': [WiThunderstorm, 'wi-flash'],
  '11n': [WiThunderstorm, 'wi-flash'],
  '13d': [WiSnow, 'wi-float'],
  '13n': [WiSnow, 'wi-float'],
  '50d': [WiFog, 'wi-drift'],
  '50n': [WiFog, 'wi-drift'],
};

/** Weather icon for an OpenWeather icon code. `animated` adds a gentle motion. */
export default function WeatherIcon({ code, label, animated = false, className = '' }) {
  const [Icon, motion] = ICONS[code] || ICONS['03d'];
  return (
    <Icon
      className={`${animated ? motion : ''} ${className}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
