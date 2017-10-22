(function(){
    'use strict';
    const request = require('request');
    console.log('test');
    request({
        url: 'http://www.nicovideo.jp/api/mylist/list',
        headers: {
        Cookie: '',
        },
    }, function(err, data){
        console.log(data);
    })
})();