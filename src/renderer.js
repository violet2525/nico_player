'use strict';
(function(){
    const {ipcRenderer} = require('electron');
    const {remote} = require('electron');
    const path = require('path');

    const adJson = require('../IGNORE/adress.json');

    const icon = {
        close: document.getElementById('close'),
        back: document.getElementById('back'),
        play: document.getElementById('play'),
        next: document.getElementById('next'),
        setting: document.getElementById('setting'),
        search: document.getElementById('search')
    }

    const wv = document.getElementById('webview');

    const nico = {
        search: 'http://api.search.nicovideo.jp/api/v2/snapshot/video/contents/search',
        history: 'http://www.nicovideo.jp/api/videoviewhistory/list',
        login: 'https://secure.nicovideo.jp/secure/login',
        video: 'http://nico.ms/',
    };
    
    //閉じる
    icon.close.addEventListener('click', function(){
        let win = remote.getCurrentWindow();
        win.close();
    }, false);
    
    //検索窓を開く
    icon.search.addEventListener('click', function(){
        let win = remote.getCurrentWindow();
        const winSize = win.getSize();
        const subWindow = new remote.BrowserWindow({
            width: winSize[0] * 0.8,
            height: winSize[1] * 0.8,
            parent: win,
            show: false,
            //frame: false,
        })
        subWindow.loadURL(path.join(__dirname, './search.html'));
        subWindow.showInactive();
    }, false);

    window.onload = function(){
        //ログイン
        login(adJson.address, adJson.password)
        .then(function(data){
            getHistory(data)
            .then(function(data){
                wv.src = nico.video + data;
            })
        });
    }

    wv.addEventListener('dom-ready', function(){
        wv.openDevTools()
        wv.send('webview_load', [localStorage.getItem('history'), localStorage.getItem('session')]);
    })

    wv.addEventListener('did-frame-finish-load', function(){

    })
    
    //ログイン処理
    let login = function(mail, pass){
        return new Promise(function(resolve, reject){
            var request= require('request');
            request.post({
            url: nico.login,
            form: {
                mail_tel: mail,
                password: pass,
            },
            },function(error,response){
            //if(error!=null){
            //    throw reject(error)
            //};
            
            var session= null;
            var cookies= response.headers['set-cookie'] || [];
            for(var i=0; i<cookies.length; i++){
                var cookie= cookies[i];
                if(cookie.match(/^user_session=user_session/)){
                session= cookie.slice(0,cookie.indexOf(';')+1);
                }
            }
            
            console.log(response.headers['set-cookie']);
            console.log(session);
            document.cookie = session;
            resolve(session);
            });        
        });
    }

    //視聴履歴
    let getHistory = function(session){
        return new Promise(function(resolve, reject){
            let request = require('request');
            request({
                url: nico.history,
                headers: {
                Cookie: session,
                },
            },function(error,response){
                if(error!=null) throw reject(error);
                //console.log(response.body);
                let his = JSON.parse(response.body);
                console.log(his.history[0]);
                const ss = session.replace('user_session_4443337_', '');
                resolve(his.history[0].item_id);            
                request({url: nico.video + his.history[0].item_id, headers: {Cookie: session}},
                    function(err, res){
                        console.log(res);
                        const aryHead = res.headers['set-cookie']
                        let nhis = '';
                        for (let i=0;i < aryHead.length;i++){
                            if(aryHead[i].match(/^nicohistory=.*?;/)){
                                nhis= aryHead[i].match(/^nicohistory=.*?;/)[0];
                            }
                        }
                        localStorage.setItem('history', nhis);
                        localStorage.setItem('session', session);
                    }
                )
                
            })
        });
    }


    //検索結果取得
    ipcRenderer.on('sendSearch', function(event, arg){
        console.log(arg);
    });
})();