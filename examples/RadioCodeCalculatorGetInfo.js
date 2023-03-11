"use strict";

/******************************************************************************
 *
 * Radio Code Calculator API - WebApi interface usage example
 *
 * In this example, we will demonstrate how to get information about the
 * specific radio calculator and its parameters (max. length & regex pattern).
 *
 * Version      : v1.1.2
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
// query information about the radio model
//
myRadioCodeCalculator.info("ford-m-series").then((result) => {

	let radio_model = result["radioModel"];

	console.log("Radio model name - " + radio_model.name + "<br>");

	console.log("Max. length of the radio serial number - " + radio_model.serial_max_len + "<br>");
	console.log("Regex pattern for the radio serial number - " + radio_model.serial_regex_pattern() + "<br>");

	// is extra field specified?
	if (radio_model.extra_max_len > 0)
	{
		console.log("Max. length of the radio extra data - " + radio_model.extra_max_len + "<br>");
		console.log("Regex pattern for the radio extra data - " + radio_model.extra_regex_pattern() + "<br>");
		console.log("<br>");
	}

}).catch((error) => {
	if (error.error == RadioErrors.INVALID_LICENSE)
		console.log("Invalid license key!");
	else
		console.log(`Something unexpected happen while trying to login to the service (error code ${error["error"]}).`);
});