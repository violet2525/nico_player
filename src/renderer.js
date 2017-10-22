(function(){
    'use strict';
    const {ipcRenderer} = require('electron');
    const {remote} = require('electron');
    const path = require('path');

    const adJson = require('../IGNORE/adress.json');
    const request = require('request');
    
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
        mylist: 'http://www.nicovideo.jp/my/mylist',
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
            frame: false,
        })
        subWindow.openDevTools();
        subWindow.loadURL(path.join(__dirname, 'search.html'));
        subWindow.webContents.send('search_send');
        subWindow.showInactive();
    }, false);

    //前の動画
    icon.back.addEventListener('click', function(){
        wv.goBack();
    });

    //次の動画
    icon.next.addEventListener('click', function(){
        wv.send('next_send');
        //document.getElementsByClassName('PlayerSkipNextButton')[0].click();
    });

    window.addEventListener('DOMContentLoaded', function(){
    })

    wv.addEventListener('dom-ready', function(){
        wv.openDevTools()
        wv.send('webview_load', [localStorage.getItem('history'), localStorage.getItem('session')]);
    })

    wv.addEventListener('load-commit', function(){
//        console.log('load-commit');
    })
    
    wv.addEventListener('did-get-response-details', (details) => {
        if(details.requestMethod === 'GET' && details.newURL.indexOf('.nicovideo.jp/smile?m=') >= 0 && details.newURL.indexOf('&sb=1') >= 0){
            //console.log(details.httpResponseCode);                
            if(parseInt(details.httpResponseCode) === 403){
                //wv.reload();
                //console.log(details);
                request({
                    url: nico.mylist,
                    headers: {
                    Cookie: localStorage.getItem('session'),
                    },
                }, function(err, data){
                    //const re = /\sNicoAPI\.token = "([0-9]+-[0-9]+-[0-9a-z]+)"/gi
                    //let ma = re.exec(data.body)[1];
                    //const test = nico.video + wv.src.replace(/.*(sm[0-9]+).*/gi, '$1') + '?playlist_token=' + ma.replace(/-/g, '_');
                    //console.log(test);
                    //wv.src = test;
                })
        
            }
        }
    });

    let searchResult = (linkURL) => {
        wv.src = linkURL;
    };

    let firstResult = (partURL) => {
        wv.send('first_result', partURL);
    };

    wv.addEventListener('ipc-message', (ev) => {
        console.log('ipc message');
    })


    //検索結果からジャンプ
    ipcRenderer.on('result_send', (event, arg) => {
        console.log(arg);
        searchResult(arg);
    });
    //パート1から再生
    ipcRenderer.on('first_send', (event, arg) => {
        console.log(arg);
        firstResult(arg);
    });
})();