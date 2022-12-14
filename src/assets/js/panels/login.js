'use strict';

import { database, changePanel, addAccount, accountSelect } from '../utils.js';
const { AZauth } = require('./assets/js/minecraft-java');
const { ipcRenderer } = require('electron');

class Login {
        static id = "login";
        async init(config) {
            this.config = config
            this.database = await new database().init();
            if (this.config.online) this.getOnline()
            else this.getOffline()
        }
    
        getOnline() {
            console.log(`Initializing Az Panel...`)
            this.loginMicrosoft();
            this.loginMojang();
            document.querySelector('.cancel-login').addEventListener("click", () => {
                document.querySelector(".cancel-login").style.display = "none";
                changePanel("settings");
            })
        }
    
        getOffline() {
            console.log(`Initializing microsoft Panel...`)
            console.log(`Initializing mojang Panel...`)
            console.log(`Initializing offline Panel...`)
            this.loginMicrosoft();
            this.loginOffline();
            document.querySelector('.cancel-login').addEventListener("click", () => {
                document.querySelector(".cancel-login").style.display = "none";
                changePanel("settings");
            })
        }
 
        loginMicrosoft() {
            let microsoftBtn = document.querySelector('.microsoft')
            let mojangBtn = document.querySelector('.mojang')
            let cancelBtn = document.querySelector('.cancel-login')
    
            microsoftBtn.addEventListener("click", () => {
                microsoftBtn.disabled = true;
                mojangBtn.disabled = true;
                cancelBtn.disabled = true;
                ipcRenderer.invoke('Microsoft-window', this.config.client_id).then(account_connect => {
                    if (!account_connect) {
                        microsoftBtn.disabled = false;
                        mojangBtn.disabled = false;
                        cancelBtn.disabled = false;
                        return;
                    }
    
                    let account = {
                        access_token: account_connect.access_token,
                        client_token: account_connect.client_token,
                        uuid: account_connect.uuid,
                        name: account_connect.name,
                        refresh_token: account_connect.refresh_token,
                        user_properties: account_connect.user_properties,
                        meta: {
                            type: account_connect.meta.type,
                            demo: account_connect.meta.demo
                        }
                    }
    
                    let profile = {
                        uuid: account_connect.uuid,
                        skins: account_connect.profile.skins || [],
                        capes: account_connect.profile.capes || []
                    }
    
                    this.database.add(account, 'accounts')
                    this.database.add(profile, 'profile')
                    this.database.update({ uuid: "1234", selected: account.uuid }, 'accounts-selected');
    
                    addAccount(account)
                    accountSelect(account.uuid)
                    changePanel("home");
    
                    microsoftBtn.disabled = false;
                    mojangBtn.disabled = false;
                    cancelBtn.disabled = false;
                    cancelBtn.style.display = "none";
                }).catch(err => {
                    console.log(err)
                    microsoftBtn.disabled = false;
                    mojangBtn.disabled = false;
                    cancelBtn.disabled = false;
    
                });
            })
        }

        async loginMojang() {
            let mailInput = document.querySelector('.Mail')
            let passwordInput = document.querySelector('.Password')
            let cancelMojangBtn = document.querySelector('.cancel-mojang')
            let infoLogin = document.querySelector('.info-login')
            let loginBtn = document.querySelector(".login-btn")
            let mojangBtn = document.querySelector('.mojang')
            let a2f = document.querySelector('.a2f')
    
            mojangBtn.addEventListener("click", () => {
                document.querySelector(".login-card").style.display = "none";
                document.querySelector(".login-card-mojang").style.display = "block";
                document.querySelector('.a2f-card').style.display = "none";
            })
    
            cancelMojangBtn.addEventListener("click", () => {
                document.querySelector(".login-card").style.display = "block";
                document.querySelector(".login-card-mojang").style.display = "none";
                document.querySelector('.a2f-card').style.display = "none";
            })
    
            loginBtn.addEventListener("click", async() => {
                cancelMojangBtn.disabled = false;
                loginBtn.disabled = false;
                mailInput.disabled = true;
                passwordInput.disabled = true;
                
    
    
                if (mailInput.value == "") {
                    infoLogin.innerHTML = "Entrez votre pseudo"
                    cancelMojangBtn.disabled = false;
                    loginBtn.disabled = false;
                    mailInput.disabled = false;
                    passwordInput.disabled = false;
                    return
                }
    
                if (passwordInput.value == "") {
                    infoLogin.innerHTML = "Entrez votre mot de passe"
                    cancelMojangBtn.disabled = false;
                    loginBtn.disabled = false;
                    mailInput.disabled = false;
                    passwordInput.disabled = false;
                    return
                }

                let azAuth = new AZauth('https://site-33.net');
                await azAuth.getAuth(mailInput.value, passwordInput.value, a2f.value).then(async account_connect => {
    
                    if (account_connect.error) {
                        cancelMojangBtn.disabled = false;
                        loginBtn.disabled = false;
                        mailInput.disabled = false;
                        passwordInput.disabled = false;
                        infoLogin.innerHTML = 'Adresse E-mail ou mot de passe invalide'
                        return
                    }

                  if (account_connect.A2F) {
                      document.querySelector('.a2f-card').style.display = "block";
                      return
                  }
                  infoLogin.innerHTML = "Connexion en cours...";

                let account = {
                    access_token: account_connect.access_token,
                    client_token: account_connect.client_token,
                    uuid: account_connect.uuid,
                    name: account_connect.name,
                    user_properties: account_connect.user_properties,
                    meta: {
                        type: account_connect.meta.type,
                        offline: true
                    }
                }
 
                 this.database.add(account, 'accounts')
                 addAccount(account)
                 this.database.update({ uuid: "1234", selected: account.uuid }, 'accounts-selected');
 
                 accountSelect(account.uuid)
                 changePanel("home");
 
                 cancelMojangBtn.disabled = false;
                 cancelMojangBtn.click();
                 mailInput.value = "";
                 passwordInput.value = "";
                 loginBtn.disabled = false;
                 mailInput.disabled = false;
                 passwordInput.disabled = false;
                 loginBtn.style.display = "block";
                 infoLogin.innerHTML = "&nbsp;";
             }).catch(err => {
                 console.log(err);
                 cancelMojangBtn.disabled = false;
                 loginBtn.disabled = false;
                 mailInput.disabled = false;
                 passwordInput.disabled = false;
                 infoLogin.innerHTML = 'Adresse E-mail ou mot de passe invalide'
             })
         })
     }
 
     loginOffline() {
         let mailInput = document.querySelector('.Mail')
         let passwordInput = document.querySelector('.Password')
         let cancelMojangBtn = document.querySelector('.cancel-mojang')
         let infoLogin = document.querySelector('.info-login')
         let loginBtn = document.querySelector(".login-btn")
         let mojangBtn = document.querySelector('.mojang')
 
         mojangBtn.innerHTML = "Offline"
 
         mojangBtn.addEventListener("click", () => {
             document.querySelector(".login-card").style.display = "none";
             document.querySelector(".login-card-mojang").style.display = "block";
         })
 
         cancelMojangBtn.addEventListener("click", () => {
             document.querySelector(".login-card").style.display = "block";
             document.querySelector(".login-card-mojang").style.display = "none";
         })
 
         loginBtn.addEventListener("click", () => {
             cancelMojangBtn.disabled = true;
             loginBtn.disabled = true;
             mailInput.disabled = true;
             passwordInput.disabled = true;
             infoLogin.innerHTML = "Connexion en cours...";
 
 
             if (mailInput.value == "") {
                 infoLogin.innerHTML = "Entrez votre adresse email / Nom d'utilisateur"
                 cancelMojangBtn.disabled = false;
                 loginBtn.disabled = false;
                 mailInput.disabled = false;
                 passwordInput.disabled = false;
                 return
             }
 
             if (mailInput.value.length < 3) {
                 infoLogin.innerHTML = "Votre nom d'utilisateur doit avoir au moins 3 caractères"
                 cancelMojangBtn.disabled = false;
                 loginBtn.disabled = false;
                 mailInput.disabled = false;
                 passwordInput.disabled = false;
                 return
             }
 
             Mojang.getAuth(mailInput.value, passwordInput.value).then(async account_connect => {
                 let account = {
                     access_token: account_connect.access_token,
                     client_token: account_connect.client_token,
                     uuid: account_connect.uuid,
                     name: account_connect.name,
                     user_properties: account_connect.user_properties,
                     meta: {
                         type: account_connect.meta.type,
                         offline: account_connect.meta.offline
                     }
                 }
 
                 this.database.add(account, 'accounts')
                 this.database.update({ uuid: "1234", selected: account.uuid }, 'accounts-selected');
 
                 addAccount(account)
                 accountSelect(account.uuid)
                 changePanel("home");
 
                 cancelMojangBtn.disabled = false;
                 cancelMojangBtn.click();
                 mailInput.value = "";
                 loginBtn.disabled = false;
                 mailInput.disabled = false;
                 passwordInput.disabled = false;
                 loginBtn.style.display = "block";
                 infoLogin.innerHTML = "&nbsp;";
             }).catch(err => {
                 console.log(err)
                 cancelMojangBtn.disabled = false;
                 loginBtn.disabled = false;
                 mailInput.disabled = false;
                 passwordInput.disabled = false;
                 infoLogin.innerHTML = 'Adresse E-mail ou mot de passe invalide'
             })
         })
     }
 }
 
 export default Login;