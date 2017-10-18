(function(){
    'use strict';
    const {ipcRenderer} = require('electron');
    const {remote} = require('electron');
    
    ipcRenderer.on('webview_load', function(channel, arg){
        let webContents = remote.getCurrentWebContents();
        let cookie = webContents.session.cookies;
        cookie.set({
            url: 'http://www.nicovideo.jp',
            domain: '.nicovideo.jp',
            path: '/',
            name: arg[0].slice(0, arg[0].indexOf('=')),
            value: arg[0].slice(arg[0].indexOf('=') + 1, arg[0].length - 1)
        }, function(err){
            if(err !== null){
                console.log(err);
            }
        })
        cookie.set({
            url: 'http://www.nicovideo.jp',
            domain: '.nicovideo.jp',
            path: '/',
            name: arg[1].slice(0, arg[1].indexOf('=')),
            value: arg[1].slice(arg[1].indexOf('=') + 1, arg[1].length - 1)
        }, function(err){
            if(err !== null){
                console.log(err);
            }
        })
        let video = document.getElementsByClassName('PlayerContainer')[0];
        if(video === null){
            webContents.reload();            
        }
        document.body.style.overflow = 'hidden';
        scrollTo(video.getBoundingClientRect().left, video.getBoundingClientRect().top);
    });
})();