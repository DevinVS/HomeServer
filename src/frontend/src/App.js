import React, {useState, useRef, useEffect} from 'react';
import './App.css';
import WebSocket from 'react-websocket';
import Service from './Service';
import {Line} from 'react-chartjs-2';
import { defaults } from 'react-chartjs-2';

const App = () => {
  const [services, setServices] = useState([]);

  const [cpuHist, setCpuHist] = useState(new Array(10));
  const [memHist, setMemHist] = useState(new Array(10));
  const [downHist, setDownHist] = useState(new Array(10));
  const [upHist, setUpHist] = useState(new Array(10));

  // const baseUrl = "localhost:8888/";
  const baseUrl = "192.168.2.55:8888/";

  const onMessage = (msg) => {
    const data = JSON.parse(msg);

    switch (data.type) {
      case "status":
        setServices(data.payload.services);

        const system = data.payload.system;

        setCpuHist(cpuHist.concat(system.cpu_usage*100).slice(1));
        setMemHist(memHist.concat(system.mem_usage*100).slice(1));
        setDownHist(downHist.concat(system.download_speed).slice(1));
        setUpHist(upHist.concat(system.upload_speed).slice(1));

        break;
      default:
        break;
    }
  };

  // Disable animating charts by default.
  defaults.global.animation = false;

  const cpu_graph_data = {
    labels: ["", "", "", "", "", "", "", "", "", ""],
    datasets: [
      {
        label: 'CPU Usage (%)',
        backgroundColor: 'rgba(117, 173, 235, 0.8)',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: cpuHist
      }
    ]
  };

  const cpu_options = {
    scales: {
      yAxes: [{
        ticks: {
          max: 100,
          min: 0,
          stepSize: 20
        }
      }]
    }
  }

  const mem_graph_data = {
    labels: ["", "", "", "", "", "", "", "", "", ""],
    datasets: [
      {
        label: 'Memory Usage (%)',
        backgroundColor: 'rgba(186, 39, 74, 0.8)',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: memHist
      }
    ]
  };

  const mem_options = {
    scales: {
      yAxes: [{
        ticks: {
          max: 100,
          min: 0,
          stepSize: 20
        }
      }]
    }
  }

  const down_graph_data = {
    labels: ["", "", "", "", "", "", "", "", "", ""],
    datasets: [
      {
        label: 'Download Speed (Mib)',
        backgroundColor: 'rgba(151, 216, 178, 0.8)',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: downHist
      }
    ]
  };

  const down_options = {
    scales: {
      yAxes: [{
        ticks: {
          min: 0,
          suggestedMax: 15
        }
      }]
    }
  }

  const up_graph_data = {
    labels: ["", "", "", "", "", "", "", "", "", ""],
    datasets: [
      {
        label: 'Upload Speed (Mib)',
        backgroundColor: 'rgba(250, 130, 76, 0.8)',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: upHist
      }
    ]
  };

  const up_options = {
    scales: {
      yAxes: [{
        ticks: {
          min: 0,
          max: 5,
          stepSize: 1
        }
      }]
    }
  }


  return (
    <div className="App">
      <div id="content">
      <h1>Home Server Dashboard</h1>
        <div id="system">
          <div className="graphContainer"><Line data={cpu_graph_data} options={cpu_options}/></div>
          <div className="graphContainer"><Line data={mem_graph_data} options={mem_options} /></div>
          <div className="graphContainer"><Line data={down_graph_data} options={down_options} /></div>
          <div className="graphContainer"><Line data={up_graph_data} options={up_options} /></div>
        </div>
        <div id="services">
          {services.map((service, index) => {
            return <Service baseUrl={baseUrl} service={service} key={index} />
          })}
        </div>
      </div>
      <WebSocket url={`ws://${baseUrl}`} onMessage={onMessage}/>
    </div>
  );
}

export default App;
