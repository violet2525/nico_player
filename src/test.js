(function(){
    'use strict';
    const request = require('request');
    console.log('test');
    request({
        url: 'http://www.nicovideo.jp/api/mylist/list',
        headers: {
        Cookie: 'user_session=user_session_4443337_b38ccc7f67f762cd24187ee695768a413424c1d9d0470a7a01bff63ebebdb2e6;',
        },
    }, function(err, data){
        console.log(data);
    })
})();