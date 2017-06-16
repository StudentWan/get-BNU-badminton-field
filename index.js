var request = require('superagent');
var cheerio = require('cheerio');

Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}


request.get('http://172.16.213.7/')
  .end(function (err, res) {
    var gymCookie = res.headers['set-cookie'][0].split(';')[0];
    var sunday = new Date(new Date().setDate(new Date().getDate() + 3)).Format('yyyy-MM-dd');
    request.get('http://172.16.213.7/system/switchRoleAction.do?ms=switchRole&time_date=' + sunday + '&gymId=2&itemId=&accessType=yy&roleCode=r_user')
      .set('Cookie', gymCookie)
      .end(function (err, res) {
        var $ = cheerio.load(res.text);
        var postData = $('#fm1').serializeArray();
        var lt, execution;
        var _eventId = 'submit';
        for (var i = 0; i < postData.length; i++) {
          if (postData[i].name === 'lt') {
            lt = postData[i].value;
          }
          if (postData[i].name === 'execution') {
            execution = postData[i].value;
          }
        }
        var loginCookie = res.headers['set-cookie'][0].split(';')[0];
        request.post(res.redirects[1])
          .type('form')
          .set('Cookie', loginCookie)
          .send({
            username: '请自己填写',
            password: '请自己填写',
            lt: lt,
            execution: execution,
            _eventId: _eventId
          })
          .end(function(err, res) {
            request.get(res.redirects[0])
              .set('Cookie', gymCookie)
              .end(function(err, res) {
                request.get('http://172.16.213.7/gymbook/gymBookAction.do?ms=viewGymBook&gymnasium_id=2&item_id=5326&time_date=' + sunday + '&userType=&viewType=m')
                  .set('Cookie', gymCookie)
                  .end(function(err, res) {
                    var totalCost = 'bookData.totalCost=20';
                    var idCard = 'bookData.book_person_zjh=请自己填写';
                    var personName = 'bookData.book_person_name=请自己填写';
                    var phoneNumber = 'bookData.book_person_phone=请自己填写';
                    var bookMode = 'bookData.book_mode=from-phone';
                    var gymnasium = 'gymnasium_idForCache=2';
                    var itemId = 'item_idForCache=5326';
                    var date = 'time_dateForCache=' + sunday;
                    var userType = 'userTypeNumForCache=1';
                    var putongRes = 'putongRes=putongRes';
                    var payWay = 'selectedPayWay=1';
                    var resource = 'allFieldTime=50451#' + sunday;

                    var formData = totalCost + '&' + idCard + '&' + personName + '&' + phoneNumber + '&' + bookMode + '&' + gymnasium + '&' + itemId + '&' + date + '&' + userType + '&' + putongRes + '&' + payWay + '&' + resource;

                    request.post('http://172.16.213.7/gymbook/gymBookAction.do?ms=saveGymBook')
                      .set('Cookie', gymCookie)
                      .type('form')
                      .send(formData)
                      .end(function(err, res) {
                        if(err) {
                          console.log('Err:' + err)
                        } else {
                          console.log(JSON.parse(res.text));
                        }
                      })
                  })
              })
          })
      })
  })