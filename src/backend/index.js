const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const {v4: uuid} = require('uuid');

const port = 80;
const updateInterval = 3000;
const pingInterval = 3000;
const service_names = ['smbd', 'wsdd'];

class Service {
    constructor(name) {
        this.name = name;
        this.update();
    }

    async update () {
        this.getLogs(0);
        exec(`systemctl status ${this.name}`, (err, stdout) => {
            const lines = stdout.split('\n');

            this.identifier_string = lines[0].split('-')[1].trim();
            this.status_string = lines.filter((line) => {return /Active:/.test(line)})[0].substring(13);
        });
    }

    async getLogs (page) {
        const { stdout, stderr } = await exec(`journalctl -u ${this.name} -n ${page*20 + 20}`);
        this.logs = stdout;
    }
}

const services = service_names.map((name) => new Service(name));

const update_services = async function() {
    let payload = [];

    services.forEach((service) => {
        service.update();
        payload.push(service);
    });

    wss.clients.forEach((ws) => {
        ws.send(JSON.stringify({type: "status", payload: payload}));
    });
}

setInterval(update_services, updateInterval);

const app = express();
app.use(express.static('public'));

const server = http.createServer(app);

app.get('/', (req, res) => res.sendFile('index.html'));

app.post("/:serviceName/restart", (req, res) => {
    const serviceName = req.params.serviceName;

    exec(`systemctl restart ${serviceName}`, (err, stdout) => {
        console.log(`Restarting ${serviceName}.service`);
    });

    res.sendStatus(200);
});

const wss = new WebSocket.Server({ server });

function heartbeat() {
    this.isAlive = true;
}

wss.on('connection', (ws, req) => {
    const remoteAddress = req.connection.remoteAddress;
    console.log(`${remoteAddress} connected to the server.`);
    ws.isAlive = true;
    ws.on('pong', heartbeat);

    ws.on('close', (ws, req) => {
        console.log(`${remoteAddress} disconnected from the server.`);
    });

    update_services();
});

const pingIntervalID = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) return ws.terminate();

        ws.isAlive = false;
        ws.ping();
    });
}, pingInterval);

wss.on('close', (ws, req) => {
    clearInterval(pingIntervalID);
})

server.listen(port);
