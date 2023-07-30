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

const db = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    password: '12858588Peter',
    database: 'social'
});

const credentials = ({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_KEY,
    access_token_secret: process.env.ACCESS_TOKEN
});

const filePath = path.join(__dirname, 'public', 'success.html');
const filelath = path.join(__dirname, 'public', 'index.html');


app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(filelath);
});




bot.onText(/\/authenticate/, (msg) => {
    const chatId = msg.chat.id;

    const replyOptions = {
        reply_markup: {
            force_reply: true 
        }
    };

    bot.sendMessage(chatId, 'Please enter your Twitter username:',replyOptions);


    if (msg.reply_to_message && msg.reply_to_message.text === 'Please enter your Twitter username:') {
        // Process the user's reply
        bot.sendMessage(chatId, `You replied: ${messageText}`);
    }
});

bot.onText(/\/display/, (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text.toLowerCase().startsWith('/display')) {
        const sql = `SELECT ranks FROM telebot WHERE chat_id = ?`;
        db.query(sql, [chatId], (err, results) => {
            if (err) {
                console.error(err);
            } else {
                if (results.length > 0) {
                    const iden = results[0].ranks;
                    bot.sendMessage(chatId, `Your current rank 🏆 is ${iden}, Share more and use the hashtags, we're rooting for you`);
                } else {
                    bot.sendMessage(chatId, 'No rank found for your chat ID');
                }
            }
        });
    } else {
        bot.sendMessage(chatId, 'You have to use the commands');
    }
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const message = msg.text;
    const username = msg.from.username;
 
    if (message.startsWith('/authenticate')) {
        // Ignore the command if it was already handled above
        return;
    }
    if (msg.reply_to_message && msg.reply_to_message.text === 'Please enter your Twitter username:') {
    const checkSql = `SELECT * FROM telebot WHERE chat_id = ?`;
    db.query(checkSql, [chatId], (err, results) => {
        if (err) {
            console.error(err);
        } else {
            if (results.length > 0) {
                // User is already registered
                bot.sendMessage(chatId, '*You are already registered.*\n\n Use the Display button to check your current rank.');
            }
            else {
                const sql = `INSERT INTO telebot (username, chat_id) VALUES (?, ?)`;
                db.query(sql, [username, chatId], (err, results) => {
                    if (err) {
                        console.error(err);
                    }
                    else {
                        console.log('Successfully added' + results);
                        bot.sendPhoto(chatId, 'https://ibb.co/1rdtMH8', { caption: '🎉🎉Success🎉🎉Your username is verified!' })
                            .then(() => {
                                return bot.sendMessage(chatId, 'Enter Your Ethereum($Eth) Address');
                            })
                    }
                });
            }
        }
    });
}
})



bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text.startsWith('/start')) {
        const welcomeMessage = `Welcome to IdanBot! 🤖\n\nI'm here to assist you with setting up your competition process✨✨. Let's get started!\n\n\n SELECT AN OPTION BELOW TO GET STARTED!`;

        const options = [
            ` /authenticate - Verify twitter and Provide your Ethereum address`;
            `/display - Display your current rank`
        ];
        const formattedOptions = options.map(option => ` ${option}`).join('\n'+'\n');

        const menuMessage = `${welcomeMessage}\n\n${formattedOptions}`;

        bot.sendMessage(chatId, menuMessage)
            .then(() => {
                const inlineKeyboard = [
                    [{ text: '🔥🔥JOIN MAIN GROUP🔥🔥', url: 'https://t.me/glocryptofutures' }]
                ];
                const messageOptions = {
                    reply_markup: {
                        inline_keyboard: inlineKeyboard,
                    },
                };

                return bot.sendMessage(chatId, '✨✨Click the button below to join Discussion Group✨✨:', messageOptions);
            })
            .catch((error) => {
                console.error('Error sending message:', error);
            });
    }
});



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
        bot.sendMessage(chatId, 'Focus on the issue on ground' + ' ' + '@' + idan);
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

bot.on("polling_error", console.log);

server.listen(port, () => {
    console.log(`server listening at ${port}`)
})