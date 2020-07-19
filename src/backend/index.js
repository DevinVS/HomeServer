const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const osutils = require('os-utils');
const os = require('os');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const {v4: uuid} = require('uuid');

const port = 8888;
const updateInterval = 2000;
const pingInterval = 3000;
const service_names = ['smbd','backup', 'backend','wsdd', 'MinecraftServer'];

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

class System {
    constructor() {
        this.update();
    }

    update() {
        this.getNetworkUsage();
        this.getMemoryUsage();

        osutils.cpuUsage((num) => {
            this.cpu_usage = num;
        });
    }

    async getMemoryUsage() {
        exec('free -m', (err, stdout) => {
            const data = stdout.split('\n').filter((line) => /Mem:/.test(line))[0].split(/\b\s+/);
            
            const total = data[0].substring(4).trim();
            this.mem_usage = data[1] / total;
        });
    }

    async getNetworkUsage() {
        exec(`ifstat 1 1`, (err, stdout) => {
            let data = stdout.split('\n');
            data = data[data.length-2].split(/\b\s+/);

            this.download_speed = data[0].trim()*8/1000;
            this.upload_speed = data[1]*8/1000;
        })
    }
}

const services = service_names.map((name) => new Service(name));
const system = new System();

const update_services = async function() {

    system.update();

    services.forEach((service) => {
        service.update();
    });

    wss.clients.forEach((ws) => {
        ws.send(JSON.stringify({type: "status", payload: {services, system}}));
    });
}

setInterval(update_services, updateInterval);

const app = express();
app.use(express.static('build'));

const server = http.createServer(app);

app.get('/', (req, res) => {res.send("Hello World")})

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
