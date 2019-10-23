/*===========================================================================*/
/*                                                                           */
/*     __  ___           _______                             ____        __  */
/*    /  |/  /___ ______/ ____(_)___  ____ _____  ________  / __ )____  / /_ */
/*   / /|_/ / __ `/ ___/ /_  / / __ \/ __ `/ __ \/ ___/ _ \/ __  / __ \/ __/ */
/*  / /  / / /_/ / /__/ __/ / / / / / /_/ / / / / /__/  __/ /_/ / /_/ / /_   */
/* /_/  /_/\__,_/\___/_/   /_/_/ /_/\__,_/_/ /_/\___/\___/_____/\____/\__/   */
/*                                                                           */
/* Filename: mono.js                                                         */
/*                                                                           */
/*===========================================================================*/

module.exports = class MonoUser {

	static get endpoint() {return 'https://api.monobank.ua/'};

	constructor(token) {
		this.token = token;
	}

	getBalancePromise() {
		var request = require('request');
		let options = {
			url: MonoUser.endpoint + '/personal/client-info',
			headers: {
				'Content-type' : 'application/json',
				'X-Token' : this.token
			}
		};

		return new Promise((resolve, reject) => {
			request.get(options, (err, resp, body) => {
				if (err) {
					reject(err);
				} else {
					let responseObj = JSON.parse(body);
					let balance = JSON.stringify(responseObj['accounts'][0]['balance']);
					resolve(balance);
				}
			})
		})
	}

	get balance() {return this.getBalancePromise()}

};