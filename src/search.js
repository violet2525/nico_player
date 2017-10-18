'use strict';
(function(){
    const {ipcRenderer} = require('electron');
    const {remote} = require('electron');

    const nicoURL = 'http://api.search.nicovideo.jp/api/v2/snapshot/video/contents/search';
    
    document.getElementById('submit').addEventListener('click', function(){
        const word = document.getElementById('word').value;
        //ipcRenderer.send('sendMessage', word);
        //const win = remote.getCurrentWindow();
        //win.close();
        const qWord = '?q=' + word;
        const qTargets = '&targets=tagsExact';
        const qFields = '&fields=contentId,title';
        const qSort = '&_sort=-lastCommentTime';
        const qLimit = '&_limit=100';
        const queryURL = nicoURL + qWord + qTargets + qFields + qSort + qLimit;
        fetch(encodeURIComponent(queryURL))
            .then(res => res.json())
            .then((out) => {
                console.log(out);
            })
            .catch(err => console.log(err));
    }, false)
    
})();

