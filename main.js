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
let MonoUser = require('./mono.js');
let TGUser = require('./tg.js');

const monoToken = readlineSync.question('Please provide your Monobank API token: ');
const telegramToken = readlineSync.question('Please provide your Telegram API token: ');
const chatID = readlineSync.question('Please specify the Telegram chat ID where to send updates: ');
const maxOKDiff = readlineSync.question('How much UAH do you allow to spend?: ');
const startingBalance = 1196000;
let currentBalance = 1196000;

setInterval(() => {
	var request = require('request');
	let monoUser = new MonoUser(monoToken);
	monoUser.getBalancePromise()
	.then(balance => {
		if (balance == currentBalance) return;
		let difference = (startingBalance - balance)/100;

		let message = 'You\'ve made a new purchase. ';
		message += 'You have ';
		message += maxOKDiff - difference;
		message += ' UAH left to spend';
		currentBalance = balance;
		console.log(message);
	});
}, 70000);