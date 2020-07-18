import React, {useState} from 'react';
import './App.css';
import WebSocket from 'react-websocket';
import Service from './Service';

const App = () => {
  const [services, setServices] = useState([]);

  const baseUrl = "localhost/";
  // const baseUrl = "192.168.2.55/";

  const onMessage = (msg) => {
    const data = JSON.parse(msg);

    switch (data.type) {
      case "status":
        setServices(data.payload);
        break;
      default:
        break;
    }
  };

  return (
    <div className="App">
      <div id="content">
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
