import React, { useState} from 'react';
import './Service.css';

const Service = (props) => {
    const service = props.service;
    

    const [showLogs, setShowLogs] = useState(false);

    const toggleLogs = () => {
        setShowLogs(!showLogs);
    }

    const restart = () => {
        fetch(`http://${props.baseUrl}${service.name}/restart`, {method: 'POST'});
    }

    const log_class = "logs " + (showLogs? "": "hidden");
    const color = service.status_string.startsWith('active')? "#8bd97e": "#f56c81";
    return (
        <div className="Service el-2">
            <div style={{width: "100%"}}>
                <p className="name">
                    <div style={{width: "10px", height: "10px", backgroundColor: color, display: "inline-block", borderRadius: "5px", position: "relative", top: "-4px", marginRight: "8px"}}/>
                    {service.identifier_string}
                </p>
                <p className="status">{service.status_string}</p>
                <p className={log_class}>{service.logs}</p>
            </div>
            
            <div className="buttonGroup">
                <button className="restart el-1" onClick={restart}>Restart</button>
                <button className="viewLogs" onClick={toggleLogs}>{showLogs? "Hide Logs": "Show Logs"}</button>
            </div>
        </div>
    );
}

export default Service;