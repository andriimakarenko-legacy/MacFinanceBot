/*===========================================================================*/
/*                                                                           */
/*     __  ___           _______                             ____        __  */
/*    /  |/  /___ ______/ ____(_)___  ____ _____  ________  / __ )____  / /_ */
/*   / /|_/ / __ `/ ___/ /_  / / __ \/ __ `/ __ \/ ___/ _ \/ __  / __ \/ __/ */
/*  / /  / / /_/ / /__/ __/ / / / / / /_/ / / / / /__/  __/ /_/ / /_/ / /_   */
/* /_/  /_/\__,_/\___/_/   /_/_/ /_/\__,_/_/ /_/\___/\___/_____/\____/\__/   */
/*                                                                           */
/* Filename: main.js                                                         */
/*                                                                           */
/*===========================================================================*/

process.env["NTBA_FIX_319"] = 1;
const readlineSync = require('readline-sync');
const fs = require('fs');
let MonoUser = require('./mono.js');
let TelegramBot = require('node-telegram-bot-api');

// const monoToken = readlineSync.question('Please provide your Monobank API token: ');
// const telegramToken = readlineSync.question('Please provide your Telegram API token: ');
// const startingBalance = readlineSync.question('How many UAH is your credit limit?: ') * 100;
// const maxOKDiff = readlineSync.question('At most how many UAH do you plan to spend?: ');
// let lastBalance = startingBalance;

let configRaw = fs.readFileSync('config.json');
let config = JSON.parse(configRaw);
let monoToken = config.monoToken;
let telegramToken = config.tgToken;

let locale;
while (typeof locale === 'undefined') {
	let selectedLang = readlineSync.question('Which language do you prefer? [en, ua]: ');
	if (selectedLang === 'en') {
		let localeRaw = fs.readFileSync('locales/en.json');
		locale = JSON.parse(localeRaw);
	}
	if (selectedLang === 'ua') {
		let localeRaw = fs.readFileSync('locales/ua.json');
		locale = JSON.parse(localeRaw);
	}
}

const startingBalance = readlineSync.question(locale.startingBalance);
const maxOKDiff = readlineSync.question(locale.maxOKDiff);
let lastBalance;

const authorizedIDs = config.authorized;
const updateReceiverChats = [];
const telegramBot = new TelegramBot(telegramToken, { polling: true });

telegramBot.on('message', msg => {
	if (authorizedIDs.includes(msg.from.id)) {
		let chatID = msg.chat.id;
		updateReceiverChats.push(chatID);
		telegramBot.sendMessage(chatID, locale.tgBotRegMsg);
		console.log(updateReceiverChats);
	}
});

const checkUpdates = async () => {
	let monoUser = new MonoUser(monoToken);
	let newBalance = await monoUser.balance;
	console.log(`New balance: ${newBalance}`);
	if (!isNaN(newBalance) && newBalance != lastBalance) {
		if (typeof lastBalance !== 'undefined')
			pushUpdate(newBalance);
		lastBalance = newBalance;
	}
}

const pushUpdate = balance => {
	let difference = (startingBalance - balance)/100;
	let message = `${locale.updateMsg[0]} ${(maxOKDiff - difference).toFixed(2)} ${locale.updateMsg[1]}`;
	console.log(message);
	updateReceiverChats.forEach(chatID => {telegramBot.sendMessage(chatID, message)});
}

setInterval(checkUpdates, 70000);