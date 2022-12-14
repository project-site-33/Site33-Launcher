/**
 * @author Site-33
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */

'use strict';
const nodeFetch = require("node-fetch");

module.exports = class Assets {
    constructor(assetIndex) {
        this.assetIndex = assetIndex;
    }

    async Getassets() {
        let assets = [];
        let data = await nodeFetch(this.assetIndex.url).then(res => res.json());
        for (let asset of Object.values(data.objects)) {
            assets.push({
                sha1: asset.hash,
                size: asset.size,
                type: "FILE",
                path: `assets/objects/${asset.hash.substring(0, 2)}/${asset.hash}`,
                url: `https://resources.download.minecraft.net/${asset.hash.substring(0, 2)}/${asset.hash}`
            });
        }
        assets.push({
            sha1: this.assetIndex.sha1,
            size: this.assetIndex.size,
            type: "FILE",
            path: `assets/indexes/${this.assetIndex.id}.json`,
            url: this.assetIndex.url
        });
        return { assetIndex: data, assets: assets };
    }
}