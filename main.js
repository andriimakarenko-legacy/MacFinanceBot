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

const readlineSync = require('readline-sync');
const request = require('request');
let MonoUser = require('./mono.js');
let TelegramBot = require('node-telegram-bot-api');

const monoToken = readlineSync.question('Please provide your Monobank API token: ');
const telegramToken = readlineSync.question('Please provide your Telegram API token: ');
const startingBalance = readlineSync.question('How many UAH is your credit limit?: ') * 100;
const maxOKDiff = readlineSync.question('At most how many UAH do you plan to spend?: ');
let lastBalance = startingBalance;

const authorizedIDs = [369190174, 202478614];
const updateReceiverChats = [];
const telegramBot = new TelegramBot(telegramToken, { polling: true });

telegramBot.on('message', msg => {
	if (authorizedIDs.includes(msg.from.id)) {
		let chatID = msg.chat.id;
		updateReceiverChats.push(chatID);
		telegramBot.sendMessage(chatID, 'You are now registered and will receive updates upon every transaction');
		console.log(updateReceiverChats);
	}
});

const checkUpdates = async () => {
	let monoUser = new MonoUser(monoToken);
	let newBalance = await monoUser.balance;
	console.log(newBalance);
	if (!isNaN(newBalance) && newBalance != lastBalance) {
		pushUpdate(newBalance);
		lastBalance = newBalance;
	}
}

const pushUpdate = balance => {
	let difference = (startingBalance - balance)/100;
	let message = `You've made a new transaction. You have ${(maxOKDiff - difference).toFixed(2)} UAH left to spend`;
	console.log(message);
	updateReceiverChats.forEach(chatID => {telegramBot.sendMessage(chatID, message)});
}

setInterval(checkUpdates, 70000);