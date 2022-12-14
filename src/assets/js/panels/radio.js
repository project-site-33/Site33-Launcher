'use strict';

import { database, changePanel } from '../utils.js';
const axios = require('axios');

class Radio {
    static id = "radio";
    async init(config) {
        this.config = config;
        this.database = await new database().init();
        this.initBtn();
        this.loadNowPlaying();

        setInterval(() => {
            this.loadNowPlaying();
        }, 15e3);

        this.nowPlaying;
        this.nowPlayingTimeout;
    }

    async initBtn() {

        document.querySelector('#home-radio-btn').addEventListener('click', () => {
            changePanel('home');
        });

        document.querySelector('#radio-btn').addEventListener('click', () => {
            changePanel('radio');
        });

        document.querySelector('#settings-btn').addEventListener('click', () => {
            changePanel('settings');
        });

        let radio = new Audio('http://site-33.net:8008/radio_320.mp3');
        document.querySelector('.play').addEventListener('click', async () => {
            document.querySelector('.pause').classList.remove("hidden");
            document.querySelector('.play').classList.add("hidden");
            await radio.load();
            radio.play();
        })

        document.querySelector('.pause').addEventListener('click', () => {
            document.querySelector('.pause').classList.add("hidden");
            document.querySelector('.play').classList.remove("hidden");
            radio.pause();
        })

        const progress = document.querySelector('#progress-bar');
        const volume_text = document.querySelector('.slider-value');
        document.querySelector('.volume-bar').addEventListener('input', () => {
            const volume = (parseInt(document.querySelector('.volume-bar').value)/100);
            progress.setAttribute('value', volume*100)
            volume_text.textContent = `${parseInt(volume*100)}%`;
            radio.volume = volume
        })
    }

    loadNowPlaying() {
        let img_radio = document.querySelector('.musique-img');
        let titre = document.querySelector('.musique-title');
        let author = document.querySelector('.author-title');
        let artiste_live = document.querySelector('.album-title');
        axios.get('http://site-33.net:6799/api/nowplaying/1').then((response) => {
            this.nowPlaying = response.data;
            let artiste_musique
            let titre_musique
            let artiste_live_musique
            if(this.nowPlaying.live.is_live) {
                artiste_musique = `Streamer : ${this.nowPlaying.live.streamer_name}`
                titre_musique = this.nowPlaying.now_playing.song.title
                artiste_live_musique = this.nowPlaying.now_playing.song.artist
            }else {
                artiste_musique = this.nowPlaying.now_playing.song.artist
                titre_musique = this.nowPlaying.now_playing.song.title
                artiste_live_musique = "";
            }

            img_radio.setAttribute("src", this.nowPlaying.now_playing.song.art);
            titre.textContent = `${titre_musique}`
            author.textContent = `${artiste_musique}`
            artiste_live.textContent = `${artiste_live_musique}`
            const root = document.querySelector(":root");
            root.style.setProperty("--url-radio", `url(${this.nowPlaying.now_playing.song.art})`);
            
        }).catch((error) => {
            console.error(error);
        })
    }



}

export default Radio;