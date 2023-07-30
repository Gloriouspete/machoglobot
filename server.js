const express = require('express');
const http = require('http');
const fs = require('fs');
const app = express();
const axios = require('axios');
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql2');
const crypto = require('crypto');
const Telegrambot = require('node-telegram-bot-api');
const { error } = require('console');
require('dotenv').config();
const session = require('express-session');
const secretKey = crypto.randomBytes(32).toString('hex');
const userSession = new Map();

app.use(session({
    secret: secretKey, // Replace with your secret key
    resave: false,
    saveUninitialized: true
}));

const bottoken = process.env.BOT_TOKEN;
const bot = new Telegrambot(bottoken, { polling: true });


bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `   🤖 Welcome to Glo Data Bot! 📱💻

I'm here to make buying Data subscriptions easy and affordable. With just a few simple steps, you can get your Data subscription at a very cheap rate.

🔹 No registration required! Just send **REGISTER** or "/REGISTER", and I'll take care of the rest.

🔹 Fast and reliable service! You'll get your data in no time.

🔹 24/7 support! If you have any questions or need assistance, feel free to ask.

💡 How to use Glo Data Bot:
1️⃣ Send the word "/BUY": Sending me the word BUY helps me activate your order.

2️⃣ Choose your Data Network: I'd Provide a List of networks where you choose your preferred one.

3️⃣ Choose your Data plan*: Choose  the data plan you want (e.g., "2GB", "N300", "Monthly Plan").

4️⃣ Payment: I'll provide you with the payment Account immediately you register, Provided you have Sufficient balance, the data would go through in no time.

5️⃣ Enjoy your Data! Start browsing, streaming, and connecting with your loved ones.

👉 To get started, simply type "REGISTER", and I'll handle the rest.

If you have any questions or need assistance, just type "/help" or ask, and I'll be happy to assist you. Happy browsing! 🚀`;

    bot.sendMessage(chatId, welcomeMessage);
});
bot.onText(/\/buy/, (msg) => {
    const chatId = msg.chat.id;
    const options = [
        { text: 'MTN', callback_data: '1' },
        { text: 'Glo', callback_data: '2' },
        { text: 'Airtel', callback_data: '4' },
        { text: 'Etisalat', callback_data: '3' },
    ];

    const keyboard = {
        inline_keyboard: [options],
    };

    bot.sendMessage(chatId, 'Choose Preferred Network', { reply_markup: keyboard });
    bot.on('callback_query', (query) => {
        const chatId = query.message.chat.id;
        const chosenOption = query.data;
        if (chosenOption !== '1' && chosenOption !== '2' && chosenOption !== '3' && chosenOption !== '4') {
            const amunt = chosenOption;
            const net = userSession.get(chatId);
            const network = net.network;
    
            const existingData = userSession.get(chatId) || {};
            userSession.set(chatId, { amount: amunt , ...existingData,}); 
            console.log(network, amunt);
    
            const replyOptions = {
                reply_markup: {
                    force_reply: true
                }
            };
    
             bot.sendMessage(chatId, 'Enter Phone Number:', replyOptions);
        }
        else{
        userSession.set(chatId, { network: chosenOption });




        const url = `https://datastation.com.ng/api/network/`;
        const authToken = '87ae029578c5d04a55ec1cda9ba8499a93207b09';

        axios.get(url, {
            headers: {
                'Authorization': `Token ${authToken}`,
                'Accept': 'application/json',
            }
        })
            .then(response => {
                const transformDataToKeyboard = (data) => {
                    const transformedData = data.map(product => {
                        const { plan_amount, plan_network, dataplan_id, plan, month_validate, plan_type } = product;
                        const multipliedAmount = parseFloat(plan_amount) * 1.1;
                        const multipliedid = Math.round(dataplan_id);
                        const rounded = Math.round(multipliedAmount);
                        return { plan, month_validate, plan_type, network: plan_network, dataid: multipliedid, amount: rounded };
                    });

                    const sliced = transformedData.slice(0, 13);
                    const keyboardRows = sliced.map(product => {
                        return [
                            { text: `${product.plan} - ${product.amount}NGN -- ${product.month_validate}`, callback_data: product.amount },
                        ];
                    });

                    return {
                        inline_keyboard: keyboardRows,
                    };
                };

                if (chosenOption === '1') {

                    const data = response.data.MTN_PLAN;
                    const keyboard = transformDataToKeyboard(data);
                    bot.sendMessage(chatId, 'Mtn Plans', { reply_markup: keyboard });
                }
                else if (chosenOption === '4') {

                    const data = response.data.AIRTEL_PLAN;
                    const keyboard = transformDataToKeyboard(data);
                    bot.sendMessage(chatId, 'Airtel Plans', { reply_markup: keyboard });
                }
                else if (chosenOption === '2') {

                    const data = response.data.GLO_PLAN;
                    const keyboard = transformDataToKeyboard(data);
                    bot.sendMessage(chatId, 'Glo Plans', { reply_markup: keyboard });
                }
                else if (chosenOption === '3') {

                    const data = response.data['9MOBILE_PLAN'];
                    const keyboard = transformDataToKeyboard(data);
                    bot.sendMessage(chatId, '9Mobile Plans', { reply_markup: keyboard });
                }


            })
            .catch(error => {
                console.error(error)
            })}
    })
});





bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (msg.reply_to_message && msg.reply_to_message.text === 'Enter Phone Number:') {
        const existingData = userSession.get(chatId) || {}; // Retrieve existing data or an empty object
        userSession.set(chatId, { ...existingData, number: text });

        const replyOptions = {
            reply_markup: {
                force_reply: true
            }
        };
       await  bot.sendMessage(chatId, `Enter password:`, replyOptions);
    }
    else if (msg.reply_to_message && msg.reply_to_message.text === 'Enter password:') {
        const existingData = userSession.get(chatId) || {}; // Retrieve existing data or an empty object
        userSession.set(chatId, { ...existingData, password: text });
       await bot.sendMessage(chatId, `Your request is processing`);
        lastcard(chatId);
    }
})

const lastcard = (data) => {
    const deal = userSession.get(data);
    console.log(deal);
}

// Start the Express.js server
app.listen(port, async () => {
    console.log(`Server listening at http://localhost:${port}`);
});
