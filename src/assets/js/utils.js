/**
 * @author Site-33
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */

 import config from './utils/config.js';
 import database from './utils/database.js';
 import logger from './utils/logger.js';
 import slider from './utils/slider.js';
 const DiscordRPC = require('discord-rpc');
 const https = require('https')
 
 export {
     config as config,
     database as database,
     logger as logger,
     changePanel as changePanel,
     addAccount as addAccount,
     slider as Slider,
     accountSelect as accountSelect,
     setActivity as setActivity,
 }
 
 const clientId = '1028217270754885682';
 const rpc = new DiscordRPC.Client({ transport: 'ipc' });
 const startTimestamp = new Date();
 
 let menu;
 let nb_user = "Chargement...";
 async function setActivity(id) {
     menu = id;
     var getData = function(){
        https.get(`https://minecraft-api.com/api/ping/online/site-33.net/25002`, function(res){
            res.on('data', function(data){
                let nb_user_data
                try {
                    nb_user_data = JSON.parse(data)
                }catch (err) { }
                
                if(!isNaN(nb_user_data)) {
                    nb_user = nb_user_data
                }else {
                    nb_user = 0;
                }
            });
            res.on('error', function(e){
                console.log(e);
            });
        });

     }
     getData()
     const list = {
         home: "Dans le Menu principal",
         settings: "Dans les Paramètres",
         login: "Dans la page de connexion",
         start_jeu: "Lancement du jeux...",
         jeu: "Dans le jeux",
         radio: "Dans la Radio",
         start_launcher: "Lancement du launcher...",
         update: "Mise à jours en cours..."
     }
 if (!rpc) {
     return;
 }
 
     rpc.setActivity({
         details: `${list[menu] ? list[menu] : "Erreur"}`,
         state: `Nombre de joueur : ${nb_user}`,
         startTimestamp,
         largeImageKey: 'icon',
         largeImageText: 'Site-33',
         buttons: [
             { label: 'Notre site', url: 'https://site-33.net' },
             { label: 'Notre discord', url: 'https://discord.gg/9Pmkw23dyf' }
         ],
         instance: false,
     });
 }
 
 rpc.on('ready', () => {
    setActivity("start_launcher");
 
 // actualise tout les 15 sec sinon timeout par discord
   setInterval(() => {
     setActivity(menu); // actualise la page avec la page qui est afficher
   }, 15e3);
 });
 
 rpc.login({ clientId });
 
 function changePanel(id) {
     menu = id;
     setActivity(id);
     let panel = document.querySelector(`.${id}`);
     let active = document.querySelector(`.active`)
     if (active) active.classList.toggle("active");
     panel.classList.add("active");
 }
 
 function addAccount(data) {
     let div = document.createElement("div");
     div.classList.add("account");
     div.id = data.uuid;
     div.innerHTML = `
         <img class="account-image" src="https://minotar.net/helm/${data.name}/100">
         <div class="account-name">${data.name}</div>
         <div class="account-uuid">${data.uuid}</div>
         <div class="account-delete"><div class="icon-account-delete icon-account-delete-btn"></div></div>
     `
     document.querySelector('.accounts').appendChild(div);
 }
 
 function accountSelect(uuid) {
     let account = document.getElementById(uuid);
     let pseudo = account.querySelector('.account-name').innerText;
     let activeAccount = document.querySelector('.active-account')
 
     if (activeAccount) activeAccount.classList.toggle('active-account');
     account.classList.add('active-account');
     headplayer(pseudo);
 }
 
 async function headplayer(pseudo) {
     const bd = await new database().init();
     let uuid = (await bd.get('1234', 'accounts-selected')).value;
     let account = (await bd.get(uuid.selected, 'accounts')).value;
     const player = $('.player-head')
     const player_name = document.querySelector(".player-name")
     for(let i=0; i<player.length; i++){
        player[i].style.backgroundImage = `url(https://minotar.net/helm/${pseudo}/100)`;
     }
     //player_name.textContent = account.name;
 }