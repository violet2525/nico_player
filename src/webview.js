(function(){
    'use strict';
    const {ipcRenderer} = require('electron');
    const {remote} = require('electron');
    const request = require('request');
    
    let webContents = remote.getCurrentWebContents();

    const nico = {
        search: 'http://api.search.nicovideo.jp/api/v2/snapshot/video/contents/search',
        history: 'http://www.nicovideo.jp/api/videoviewhistory/list',
        login: 'https://secure.nicovideo.jp/secure/login',
        video: 'http://nico.ms/',
        mylist: 'http://www.nicovideo.jp/my/mylist',
        playlist: 'http://flapi.nicovideo.jp/api/getplaylist/',        
        info: 'http://ext.nicovideo.jp/api/getthumbinfo/',
    };

    //視聴履歴
    let getHistory = (session) => {
        console.log(session);
        return new Promise((resolve, reject) => {
            request({
                url: nico.history,
                headers: {
                Cookie: session,
                },
            },function(err,response){
                if (!(err === null || err === undefined)){
                    reject(err)
                };
                let his = JSON.parse(response.body);
                request({
                    url: nico.video + his.history[0].item_id,
                    headers: {
                        Cookie: session,
                    },
                }, function(err, res){
                    if (!(err === null || err === undefined)){
                        console.log(err);
                    }
                    const aryHead = res.headers['set-cookie']
                    let hisses = '';
                    for (let i=0;i < aryHead.length;i++){
                        if(aryHead[i].match(/^nicohistory=.*?;/)){
                            hisses= aryHead[i].match(/^nicohistory=.*?;/)[0];
                        }
                    }
                    resolve([his.history[0].item_id,session, hisses]);
                })
            })
        });
    }

    //
    let getCookie = () => {
        return new Promise(function(resolve, reject){
            const adJson = require('../IGNORE/adress.json');        
            const sqlite3 = require('sqlite3').verbose();
            const dbfile = adJson.session;
            let db = new sqlite3.Database(dbfile);
            db.serialize(function(){
                const sqlString = 'SELECT * FROM cookies WHERE host_key=".nicovideo.jp" AND name="user_session"';
                db.all(sqlString, function(err, row){
                    if (!(err === null || err === undefined)){
                        reject(err);
                    }
                    let dbValue = row[0].encrypted_value;
                    var edge = require('electron-edge-js');
                    var hello = edge.func('py', 'src/test.py');
                    hello(dbValue, function (err, result) {
                        if (!(err === null || err === undefined)){
                            console.log(err);
                        };
                        resolve('user_session=' + result + ';');
                    });
                });
            });
        })        
    }

    let setCookie = (session, history) => {
        let webContents = remote.getCurrentWebContents();
        let cookie = webContents.session.cookies;
        cookie.set({
            url: 'http://www.nicovideo.jp',
            domain: '.nicovideo.jp',
            path: '/',
            name: session.slice(0, session.indexOf('=')),
            value: session.slice(session.indexOf('=') + 1, session.length - 1)
        }, function(err){
            if (!(err === null || err === undefined)){
                console.log(err);
            }
        })
        cookie.set({
            url: 'http://www.nicovideo.jp',
            domain: '.nicovideo.jp',
            path: '/',
            name: history.slice(0, history.indexOf('=')),
            value: history.slice(history.indexOf('=') + 1, history.length - 1)
        }, function(err){
            if (!(err === null || err === undefined)){
                console.log(err);
            }
        });
    };

    //パート１から再生用マイリスト取得
    let getPlayList = function(linkURL){
        return new Promise(function(resolve, reject){
            request({
                url: nico.info + linkURL.replace('#', '')
            },function(err, res){
                if (!(err === null || err === undefined)){
                    reject(err);
                }
                let parse = new DOMParser();
                const dom = parse.parseFromString(res.body, 'text/xml');
                const dis = dom.getElementsByTagName('description')[0];
                let myListId = null;
                if(dis !== undefined){
                    myListId = /mylist\/[0-9]+/gi.exec(dis.innerHTML)[0];
                }
                console.log(myListId);
                resolve(myListId);
            })
        })
    }

    //パート１URL取得
    let getWatchFirst = (listURL) => {
        return new Promise(function(resolve, reject){
            getCookie()
            .then(ses => {
                console.log(ses);
                request({
                    url: nico.playlist + listURL,
                    headers: {
                        Cookie: ses,
                    },
                }, function(err, res){
                    if (!(err === null || err === undefined)){
                        reject(err);
                    }
                    console.log(res);
                    const resBody = JSON.parse(res.body);
                    console.log(resBody);
                    const firstId = resBody.items[0].video_id
                    resolve(firstId);
                })
            })
        })
    }
        
    webContents.addListener('media-started-playing', function(){
        //console.log('media-started-playing');
    });
    webContents.addListener('media-paused', function(){
        //console.log('media-paused');
    });

    //ロード完了時
    window.addEventListener('load', function(){
        let video = document.getElementsByClassName('PlayerContainer')[0];
        if(webContents.getURL().indexOf('nicovideo.jp') >= 0){
            if(video === undefined){
                //未ログイン
                webContents.reload();
            }else{
            }
        }
    });

    //DOM読み込み完了時
    window.addEventListener('DOMContentLoaded', function(){
        let header = document.getElementById('siteHeader');
        let video = document.getElementsByClassName('PlayerContainer')[0];        
        if(remote.getCurrentWebContents().getURL().indexOf('webview.html') >= 0){
            getCookie()
            .then(result => {
                getHistory(result)
                .then(data => {
                    setCookie(data[1], data[2]);
                    remote.getCurrentWebContents().loadURL(nico.video + data[0]);
                })        
                .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
        }else if(header !== undefined){
            header.style.position = 'absolute';
            header.style.top = '-100px';
            document.body.style.overflow = 'hidden';
            scrollTo(video.getBoundingClientRect().left, video.getBoundingClientRect().top);
            const playButton = document.getElementsByClassName('VideoStartButton');
            playButton[0].click();
        }
    });

    //パート1から再生のイベントハンドラ
    ipcRenderer.on('first_result', (e, g) => {
        console.log(g);
        getPlayList(g)
        .then(myList => {
            if(myList === null){
                alert('マイリストがありません');
            }else{
                getPlayList(g)
                .then(listId => {
                    getWatchFirst(listId)
                    .then(smId => {
                        const playlist = nico.video + smId + '?playlist_type=mylist&group_id=' + listId.replace('mylist/', '') + '&mylist_sort=7&continuous=1'
                        ipcRenderer.send('console_log', playlist);
                        remote.getCurrentWebContents().loadURL(playlist);
                    })
                    .catch(err => console.log(err));
                })
                .catch(err => console.log(err));
            }
        })
    });

    //次の動画
    ipcRenderer.on('next_send', (e, g) => {
        document.getElementsByClassName('PlayerSkipNextButton')[0].click();
    })
})();