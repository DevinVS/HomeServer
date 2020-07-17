const express = require('express');
const app = express();
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const port = 3000;
const updateInterval = 5000;
const service_names = ['wsdd', 'smbd'];

class Service {
    constructor(name) {
        this.name = name;
        this.update();
    }

    async update () {
        const { stdout, stderr } = await exec(`systemctl status ${this.name}`);

        const lines = stdout.split('\n');

        this.identifier_string = lines[0];

        this.status_string = lines.filter((line) => {return /Active:/.test(line)})[0].substring(13);

    }

    async getLogs () {
        const { stdout, stderr } = await exec(`journalctl -u ${this.name}`);

        return stdout;
    }
}


const services = service_names.map((name) => new Service(name));

const update_services = async function() {
    services.forEach((service) => {
        console.log(`Updating ${service.name}.service`);
        service.update();
    });
}

setInterval(update_services, updateInterval);
