const linebot = require('linebot'); //引入linebot套件
const express = require('express'); //引入express套件

//建立linebot 物件
const bot = linebot({
    //設定環境變數
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});

const app = express();
 
//驗證數位簽章並解析JSON資料
const linebotParser = bot.parser();

//處理首頁的請求
app.get('/',function(req,res){
    res.send('Hello world');
});
//處理line訊息伺服器的請求
app.post('/linewebhook', linebotParser);

//處理訊息事件
bot.on('message', function (event) {
  event.reply(event.message.text).then(function (data) {  //回復接收到的訊息文字
  }).catch(function (error) {
    console.log('Error', error);
  });
});

app.listen(process.env.PORT || 80, function () {
  console.log('LineBot is running.');
});