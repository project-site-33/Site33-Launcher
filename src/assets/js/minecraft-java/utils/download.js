/**
 * @author Site-33
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */

const fs = require('fs');
const nodeFetch = require('node-fetch');

module.exports = class download {
    async downloadFileMultiple(files, size, limit = 1) {
        if (limit > files.length) limit = files.length;
        let completed = 0;
        let downloaded = 0;
        let queued = 0;

        let start = new Date().getTime();
        let before = 0;
        let speeds = [];

        let estimated = setInterval(() => {
            let duration = (new Date().getTime() - start) / 1000;
            let loaded = (downloaded - before) * 8;
            if (speeds.length >= 5) speeds = speeds.slice(1);
            speeds.push((loaded / duration) / 8);
            let speed = 0;
            for (let s of speeds) speed += s;
            speed /= speeds.length;
            this.emit("speed", speed);
            let time = (size - downloaded) / (speed);
            this.emit("estimated", time);
            start = new Date().getTime();
            before = downloaded;
        }, 500);

        const downloadNext = async() => {
            if (queued < files.length) {
                let file = files[queued];
                queued++;
                if (!fs.existsSync(file.foler)) fs.mkdirSync(file.folder, { recursive: true });
                const writer = fs.createWriteStream(file.path);
                const response = await nodeFetch(file.url);
                response.body.on('data', (chunk) => {
                    downloaded += chunk.length;
                    this.emit('progress', downloaded, size);
                    writer.write(chunk);
                });

                response.body.on('end', () => {
                    writer.end();
                    completed++;
                    downloadNext();
                });

                response.body.on('error', (err) => {
                    this.emit('error', err);
                });
            }
        };

        while (queued < limit) {
            downloadNext();
        }

        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (completed === files.length) {
                    clearInterval(estimated);
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }

    on(event, func) {
        this[event] = func;
    }

    emit(event, ...args) {
        if (this[event]) this[event](...args);
    }
}