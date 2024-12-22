import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const TemperatureGraph = ({ weatherData }) => {
  // Extract dates and temperatures from weatherData
  if(!weatherData){
      console.log('first')
      return (
            <div>
                  <h2>Temperature Graph</h2>
                  <p>Loading...</p>
          </div> 
      )
  }
  const labels = weatherData.forecast.map((data,i) => {
      return data.dt_txt.slice(11, 16);
  }); // Extract datetime as labels
  const temperatures = weatherData.forecast.map((data) => data.main.temp - 273.15); // Convert Kelvin to Celsius

  // Chart.js Data Configuration
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

  // Chart.js Options Configuration
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: `Temperature Forecast of ${weatherData.forecast[0].dt_txt.slice(0,10)}`,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Temperature (°C)',
        },
        ticks: {
          callback: (value) => `${value}°C`,
        },
      },
    },
  };

  return (
    <div style={{backgroundColor:'white', padding:'10px'}}>
      <h2>Temperature Graph</h2>
      <Line data={data} options={options} />
    </div>
  );
};

export default TemperatureGraph;
