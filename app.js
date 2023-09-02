const linebot = require('linebot'); //引入linebot套件
const express = require('express'); //引入express套件
var req = require('request'); //引入request套件
var rq=require('request-promise')//引入request-promise模組
const bodyParser = require('body-parser');

// //去讀取google首頁(測試request套件)
// request('https://www.google.com/',function(error,res,body){
//     console.log('error:',error);
//     console.log('statusCode:',res && res.statusCode); //若有回應，呈現狀態碼
//     console.log('body:',body); //讀取內容本體
// });
const SITE_NAME='臺南市';
const opt={
    url:"https://opendata.cwb.gov.tw/fileapi/v1/opendataapi/O-A0001-001?Authorization=CWB-6F525D28-7918-4013-BFB4-71227C069D24&downloadType=WEB&format=JSON",
    json:true //啟用自動解析json
};

//回乎函式寫法
// req(opt,function(error,response,body){
//     if(!error && response.statusCode===200){
//         var data;
//         //var town;
//         for(i in body['cwbopendata']['location']){
//             if(body['cwbopendata']['location'][i]['parameter'][0]['parameterValue']==SITE_NAME){
//                 // console.log(body['cwbopendata']['location'][i]['weatherElement'][14]['elementValue']);
//                 //town=body['cwbopendata']['location'][i]['parameter'][2]['parameterValue'];
//                 data=body['cwbopendata']['location'][i]['weatherElement'][14]['elementValue']['value'];
//                 break;
//             }
//             //console.log(body['cwbopendata']['location'][i]['parameter'][2]['parameterValue']);
//         }
//         console.log(data);
//     }
// });

//promise寫法
// rq(opt)
// .then(function(res){
//     var data;
//     var city;
//     var town;
//     for(i in res['cwbopendata']['location']){
//         //if(res['cwbopendata']['location'][i]['parameter'][0]['parameterValue']==SITE_NAME){
//             // console.log(body['cwbopendata']['location'][i]['weatherElement'][14]['elementValue']);
//             if(res['cwbopendata']['location'][i]['parameter'][0]['parameterValue']=='臺南市' && res['cwbopendata']['location'][i]['parameter'][2]['parameterValue']=='北門區'){
//                 city=res['cwbopendata']['location'][i]['parameter'][0]['parameterValue'];
//                 town=res['cwbopendata']['location'][i]['parameter'][2]['parameterValue'];
//                 data=res['cwbopendata']['location'][i]['weatherElement'][14]['elementValue']['value'];
//                 break;
//             }
//         }
//         console.log(city+town+data);
//             })
//             .catch(function(error){
//                 console.log("出錯了～找不到指定資源…");
//             });


function readweatherAPI(res,city_name,town_name){
    var data;
    var city;
    var town;
    for(i in res['cwbopendata']['location']){
        // if(res['cwbopendata']['location'][i]['parameter'][0]['parameterValue']==SITE_NAME){
        //     // console.log(body['cwbopendata']['location'][i]['weatherElement'][14]['elementValue']);
        //     data=res['cwbopendata']['location'][i]['weatherElement'][14]['elementValue']['value'];
        //     break;
        // }
        if(res['cwbopendata']['location'][i]['parameter'][0]['parameterValue']==city_name && res['cwbopendata']['location'][i]['parameter'][2]['parameterValue']==town_name){
            city=res['cwbopendata']['location'][i]['parameter'][0]['parameterValue'];
            town=res['cwbopendata']['location'][i]['parameter'][2]['parameterValue'];
            data=res['cwbopendata']['location'][i]['weatherElement'][14]['elementValue']['value'];
            break;
    }
    const value=[city,town,data];
    return value;
}

//建立linebot 物件
const bot = linebot({
    //設定環境變數
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});

const app = express();
// 指定使用ejs樣板引擎
app.set('view engine','ejs'); 
 
//驗證數位簽章並解析JSON資料
const linebotParser = bot.parser();

//處理首頁的請求(暫時不做，要得懂json檔，在做比較好)
app.get('/',function(request,response){
    rq(opt)
    .then(function(res){
        response.render('index',{weatherAPI:readweatherAPI(res)}); //把天氣狀況交給ejs引琴合成HTML網頁
    })
    .catch(function(error){
        response.send('無法取得資料');
    });
});
//處理line訊息伺服器的請求
app.post('/linewebhook', linebotParser);

// //處理訊息事件(回復一樣的話)
// bot.on('message', function (event) {
//   event.reply(event.message.text).then(function (data) {  //回復接收到的訊息文字
//   }).catch(function (error) {
//     console.log('Error', error);
//   });
// });
bot.on('message', function (event) {
	switch (event.message.type) {
		case 'text':
			switch (event.message.text) {
				case '天氣':
                    event.reply("請問要查哪裡的天氣呢~");
                    switch (event.message.text){
                        case '臺南市':
                            var city_name='臺南市';
                            switch (event.message.text){
                                case '北門區':
                                    var town_name='北門區';
                            }
                            break;
                    }
					let data;
					rq(opt)
					.then(function (res) {
						data = readweatherAPI(res,city_name,town_name);
						event.reply(data);
					})
					.catch(function (err) {
						event.reply('無法取得資料～');
					});
					break;

				case '自我介紹一下':
					return event.reply('Hello ' + '我是測試用的linebot' + ' ' + '祈');
					break;
			}
			break;
		case 'sticker':
			event.reply({
				type: 'sticker',
				packageId: 1,
				stickerId: 1
			});
			break;
		default:
			event.reply('Unknow message: ' + JSON.stringify(event));
			break;
	}
});

app.listen(process.env.PORT || 80, function () {
  console.log('LineBot is running.');
});