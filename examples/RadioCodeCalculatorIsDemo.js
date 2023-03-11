"use strict";

/******************************************************************************
 *
 * Radio Code Calculator API - WebApi interface usage example
 *
 * In this example we will verify our activation key status.
 *
 * Version      : v1.1.1
 * JS           : ES6
 * Dependencies : radio-code-calculator
 * Author       : Bartosz Wójcik (support@pelock.com)
 * Project      : https://www.pelock.com/products/radio-code-calculator
 * Homepage     : https://www.pelock.com
 *
 * @link https://www.pelock.com/products/radio-code-calculator
 * @copyright Copyright (c) 2021-2023 PELock LLC
 * @license Apache-2.0
 *
/*****************************************************************************/

//
// include Radio Code Calculator API module
//
import { RadioCodeCalculator, RadioErrors, RadioModel, RadioModels } from "radio-code-calculator";
//
// create Radio Code Calculator API class instance (we are using our activation key)
//
let myRadioCodeCalculator = new RadioCodeCalculator("ABCD-ABCD-ABCD-ABCD");

//
// login to the service
//
myRadioCodeCalculator.login().then((result) => {

	//
	// result[] array holds the information about the license
	//
	// result["license"]["activationStatus"] - True if license is active, False on invalid/expired keys
	// result["license"]["userName"] - user name/company name of the license owner
	// result["license"]["type"] - license type (0 - Personal License, 1 - Company License)
	// result["license"]["expirationDate"] - license expiration date (in YYYY-MM-DD format)
	//
	console.log("License activation status - " + (result["license"]["activationStatus"] ? "True" : "False") + "<br>");
	console.log("License owner - " + result["license"]["userName"]);
	console.log("License type - " + (result["license"]["type"] == 0 ? "Personal" : "Company") + "<br>");
	console.log("Expiration date - " + result["license"]["expirationDate"] + "<br>");

}).catch((error) => {

	if (error["error"] == RadioErrors.INVALID_LICENSE)
		console.log("Invalid license key!");
	else
		console.log(`Something unexpected happen while trying to login to the service (error code ${error}).`);
});