import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { formatDay, localTime } from '../utils/forecast';

// Register necessary Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const TemperatureGraph = ({ items, timezone, date }) => {
  if (!items || !items.length) return null;

  // City-local times as labels; temperatures are already °C (units=metric)
  const labels = items.map((item) => localTime(item.dt, timezone));
  const temperatures = items.map((item) => Math.round(item.main.temp * 10) / 10);

  const data = {
    labels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: temperatures,
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        tension: 0.4, // Curve tension for smooth lines
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: `Temperature Forecast for ${formatDay(date)}` },
    },
    scales: {
      x: { title: { display: true, text: 'Time (local)' } },
      y: {
        title: { display: true, text: 'Temperature (°C)' },
        ticks: { callback: (value) => `${value}°C` },
      },
    },
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '10px' }}>
      <h2>Temperature Graph</h2>
      <Line data={data} options={options} />
    </div>
  );
};

export default TemperatureGraph;
