'use strict';
(function(){
    const {ipcRenderer} = require('electron');
    const {remote} = require('electron');
    const request = require('request');

    const nico = {
        search: 'http://api.search.nicovideo.jp/api/v2/snapshot/video/contents/search',
        history: 'http://www.nicovideo.jp/api/videoviewhistory/list',
        login: 'https://secure.nicovideo.jp/secure/login',
        video: 'http://nico.ms/',
        thumnail: 'http://tn-skr{idx}.smilevideo.jp/smile?i=',
        info: 'http://ext.nicovideo.jp/api/getthumbinfo/',
        playlist: 'http://flapi.nicovideo.jp/api/getplaylist/',
    };
    
    //検索結果表示
    let searchWord = function(){
        const word = document.getElementById('word').value;
        const win = remote.getCurrentWindow();
        const qWord = '?q=' + word;
        const qTargets = '&targets=tagsExact';
        const qFields = '&fields=contentId,title,viewCounter,startTime,lengthSeconds';
        const qSort = '&_sort=-lastCommentTime';
        const qLimit = '&_limit=100';
        const queryURL = nico.search + qWord + qTargets + qFields + qSort + qLimit;
        fetch(encodeURI(queryURL))
        .then(res => res.json())
        .then((out) => {
            let result = document.getElementById('result');
            while (result.hasChildNodes()) {
                result.removeChild(result.firstChild);
            }
            for(let i = 0; i < out.data.length; i++){
                const contents = out.data[i];
                const conDate = new Date(contents.startTime);
                const conSecond = parseInt(contents.lengthSeconds) * 1000;
                //投稿日
                const yyyy = conDate.getFullYear();
                const mm = conDate.getMonth() + 1;
                const dd = conDate.getDate();
                const hh = conDate.getHours();
                const nn = conDate.getMinutes();
                const startDate = yyyy + '/' + mm + '/' + dd + ' ' + hh + ':' + nn;
                //再生時間
                const h = String(Math.floor(conSecond / 3600000) + 100).substring(1);
                const m = String(Math.floor((conSecond - h * 3600000)/60000)+ 100).substring(1);
                const s = String(Math.round((conSecond - h * 3600000 - m * 60000)/1000)+ 100).substring(1);
                const lengthTime = (h > 0 ? h  + ':': '') + m + ':' + s;
                const thumURL = nico.thumnail.replace('{idx}', i % 4 + 1);

                let elmp = document.createElement('div');
                elmp.className = 'col-xs-offset-1 col-xs-10';
                elmp.style.marginBottom = '20px';
                let elma = document.createElement('a');
                elma.href = nico.video + contents.contentId;
                elma.insertAdjacentHTML('beforeend', contents.title);
                elmp.appendChild(elma);
                elmp.appendChild(document.createElement('br'));
                let elmi = document.createElement('img');
                elmi.src = thumURL + contents.contentId.replace('sm', '');
                elmi.width = '130';
                elmi.height = '100';
                elmi.className = 'pull-left';
                elmi.style.marginRight = '10px';
                elmp.appendChild(elmi);
                elmp.insertAdjacentHTML('beforeend', '再生数：' + contents.viewCounter + '<br>');
                elmp.insertAdjacentHTML('beforeend', '再生時間：' + lengthTime + '<br>');
                elmp.insertAdjacentHTML('beforeend', '投稿日：' + startDate + '<br>');
                let elm1 = document.createElement('a');
                elm1.href = '#';
                elm1.name = contents.contentId;
                elm1.insertAdjacentHTML('beforeend', 'パート１から再生');
                elmp.appendChild(elm1);            
                result.appendChild(elmp);
            };
        })
        .catch(err => console.log(err));
    }

    //検索
    document.getElementById('submit').addEventListener('click', searchWord);
    document.getElementById('searchForm').addEventListener('submit', function(e){
        searchWord();
        e.preventDefault();
    }, false);

    //検索結果クリック
    document.getElementById('result').addEventListener('click', function(e){
        e.preventDefault();
//        console.log(remote.getCurrentWindow());
        //const win = remote.getCurrentWindow();
        if(e.target.tagName.toUpperCase() === 'A'){
            if(e.target.href.indexOf('#') >= 0){
                //パート１から再生
                ipcRenderer.send('first_click', e.target.name);
                remote.getCurrentWindow().close();
                //getPlayList(e.target.name)
                //.then(data => {
                //})
                //.catch(console.log(err));
            }else{
                //選択した動画を再生
                ipcRenderer.send('result_click', e.target.href);
                remote.getCurrentWindow().close();
            }
        }
    });

    ipcRenderer.on('search_send', (e, arg) => {
        console.log(e);
        ipcRenderer.sendToHost(e);
    })
})();

