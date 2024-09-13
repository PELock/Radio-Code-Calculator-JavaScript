"use strict";

/******************************************************************************
 *
 * Radio Code Calculator API - WebApi interface usage example
 *
 * In this example, we will demonstrate how to generate a code for a specific
 * type of car radio. This example shows how to use an extended offline
 * validation.
 *
 * Version      : v.1.1.6
 * JS           : ES6
 * Dependencies : radio-code-calculator
 * Author       : Bartosz Wójcik (support@pelock.com)
 * Project      : https://www.pelock.com/products/radio-code-calculator
 * Homepage     : https://www.pelock.com
 *
 * @link https://www.pelock.com/products/radio-code-calculator
 * @copyright Copyright (c) 2021-2024 PELock LLC
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
// generate a single radio unlocking code
//
let serial = "123456";
let extra = "";

//
// select a radio model
//
let radioModel = RadioModels.FORD_M_SERIES;

//
// display radio model information, you can use it to set limits in your controls e.g.
//
// textFieldRadioSerial.maxLength = radioModel.serial_max_len
// textFieldRadioSerial.regEx = radioModel.serial_regex_pattern()
//
// (if allowed by your controls)
//
console.log(`Radio model ${radioModel.name} expects a serial number of ${radioModel.serial_max_len} length and ${radioModel.serial_regex_pattern()} regex pattern<br>`);

// additional information
if (radioModel.extra_max_len > 0)
{
	console.log(`Additionally an extra field is required with ${radioModel.extra_max_len} and ${radioModel.extra_regex_pattern()} regex pattern<br>`);
}

//
// validate the serial number (offline) before sending the Web API request
//
let error = radioModel.validate(serial, extra);

if (error !== RadioErrors.SUCCESS)
{
	if (error === RadioErrors.INVALID_SERIAL_LENGTH)
		console.log(`Invalid serial number length (expected ${radioModel.serial_max_len} characters<br>`);
	else if (error == RadioErrors.INVALID_SERIAL_PATTERN)
		console.log(`Invalid serial number regular expression pattern (expected ${radioModel.serial_regex_pattern()} regex pattern)<br>`);
	else if (error == RadioErrors.INVALID_SERIAL_NOT_SUPPORTED)
		console.log("This serial number is not supported");
	else if (error == RadioErrors.INVALID_EXTRA_LENGTH)
		console.log(`Invalid extra data length (expected ${radioModel.extra_max_len} characters)<br>`);
	else if (error == RadioErrors.INVALID_EXTRA_PATTERN)
		console.log(`Invalid extra data regular expression pattern (expected ${radioModel.extra_regex_pattern()} regex pattern)<br>`);

	process.exit(1);
}

//
// generate radio code (using Web API)
//
myRadioCodeCalculator.calc(radioModel, serial).then((result) => {

	console.log("Radio code is " + result["code"]);

}).catch((error) => {

	switch(error["error"])
	{
	case RadioErrors.INVALID_RADIO_MODEL: console.log("Invalid radio model (not supported)"); break;
	case RadioErrors.INVALID_SERIAL_LENGTH: console.log("Invalid serial number length (expected " + result["serialMaxLen"] + " characters)"); break;
	case RadioErrors.INVALID_SERIAL_PATTERN: console.log("Invalid serial number regular expression pattern (expected " + result["serialRegexPattern"]["php"] + " regex pattern)"); break;
	case RadioErrors.INVALID_SERIAL_NOT_SUPPORTED: console.log("This serial number is not supported"); break;
	case RadioErrors.INVALID_EXTRA_LENGTH: console.log("Invalid extra data length (expected " + result["extraMaxLen"] + " characters)"); break;
	case RadioErrors.INVALID_EXTRA_PATTERN: console.log("Invalid extra data regular expression pattern (expected " + result["extraRegexPattern"]["php"] + " regex pattern"); break;
	case RadioErrors.INVALID_INPUT: console.log("Invalid input data"); break;
	case RadioErrors.INVALID_COMMAND: console.log("Invalid command sent to the Web API interface"); break;
	case RadioErrors.INVALID_LICENSE: console.log("Invalid license key!"); break;
	default: console.log(`Something unexpected happen while trying to login to the service (error code ${error}).`); break;
	}
});
