"use strict";

/******************************************************************************
 *
 * Radio Code Calculator API - WebApi interface usage example
 *
 * In this example, we will demonstrate how to generate a code for a specific
 * type of car radio.
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
// generate radio code (using Web API)
//
myRadioCodeCalculator.calc(RadioModels.FORD_M_SERIES, "123456").then((result) => {

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
