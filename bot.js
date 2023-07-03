const express = require('express');
const http = require('http');
const fs = require('fs');
const app = express();
const axios = require('axios');
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');
const { TwitterApi } = require('twitter-api-v2');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const Telegrambot = require('node-telegram-bot-api');
require('dotenv').config();

const bottoken = process.env.BOT_TOKEN;
const bot = new Telegrambot(bottoken, { polling: true });

const credentials = ({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key:process.env.ACCESS_KEY,
    access_token_secret:process.env.ACCESS_TOKEN
});

const oauth = OAuth({
    consumer: {
        key: credentials.consumer_key,
        secret: credentials.consumer_secret
    },
    signature_method: 'HMAC-SHA1',
    hash_function(baseString, key) {
        return crypto
            .createHmac('sha1', key)
            .update(baseString)
            .digest('base64');
    }
});
const generateAuthorizationHeader = (url) => {
    const requestData = {
        url,
        method: 'GET'
    };

    const token = {
        key: credentials.access_token_key,
        secret: credentials.access_token_secret
    };

    return oauth.toHeader(oauth.authorize(requestData, token));
};


const getLikeCount = async (chatId, username) => {
    try {
        const url = `https://api.twitter.com/2/users/by/username/${username}`;
        const headers = {
            ...generateAuthorizationHeader(url),
            'Content-Type': 'application/json'
        };

        const response = await axios.get(url, { headers });

        if (response.data && response.data.data) {
            bot.sendMessage(chatId, 'You are verified');
        } else {
            console.log('Username doesn\'t exist');
        }
    } catch (error) {
        console.error(error);
    }
};




bot.onText(/\/authenticate/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Please enter your Twitter username:');
});


bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const username = msg.text;

    if (username.startsWith('/authenticate')) {
        // Ignore the command if it was already handled above
        return;
    }

    bot.sendMessage(chatId,'youre verified');

});
bot.on("new_chat_members", (msg) => {
    chatId = msg.chat.id;
    bot.sendMessage(chatId, 'You are welcomed too my bot server')
})



bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Hello, I don create the telegram bot, how far, reply with i'm fine`);
    console.log('sent!')
})


bot.onText(/\/verify/, (msg) => {
    const chatId = msg.chat.id;

    const inlineKeyboard = [
        [{ text: '🔥🔥🔥Click here🔥🔥🔥', url: 'https://example.com' }]
    ];
    const messageoptions = {
        reply_markup: {
            inline_keyboard: inlineKeyboard,
        },
    };

    bot.sendMessage(chatId, '🔥🔥🔥Click here 🔥🔥🔥', messageoptions);
    console.log('sent!')
})
bot.on('message', (msg) => {
    const idan = msg.chat.username;
    const chatId = msg.chat.id;
    const text = msg.text;
    if (text.toLowerCase() === `hello`) {
        bot.sendMessage(chatId, 'you sef suppose sabi how to follow person talk' + ' ' + '@' + idan);
        console.log('sent it')
    }
    else if (text.toLowerCase() === `hello`) {
        bot.sendMessage(chatId, 'you sef suppose sabi how to follow person talk' + ' ' + '@' + idan);
        console.log('sent it')
    }
    else {
        console.log(msg.text)
    }
})

bot.on("polling_error",console.log);

server.listen(port, () => {
    console.log(`server listening at ${port}`)
})