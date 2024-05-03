"use strict";

/******************************************************************************
 *
 * Radio Code Calculator API - WebApi interface
 *
 * Generate radio unlocking codes for various radio players.
 *
 * Version      : v1.1.5
 * JS           : ES6
 * Dependencies : form-data, node-fetch
 * Author       : Bartosz Wójcik (support@pelock.com)
 * Project      : https://www.pelock.com/products/radio-code-calculator
 * Homepage     : https://www.pelock.com
 *
 * @link https://www.pelock.com/products/radio-code-calculator
 * @copyright Copyright (c) 2021-2024 PELock LLC
 * @license Apache-2.0
 *
/*****************************************************************************/

// ES module style imports
import FormData from 'form-data';
import fetch from 'node-fetch';

// CommonJS style imports
//const FormData = require('form-data');
//const fetch = require('node-fetch');

/**
 * Errors returned by the Radio Code Calculator API interface
 *
 * Usage:
 *
 * if (error === RadioErrors.SUCCESS) { ... }
 *
 */
export class RadioErrors
{
	/**
	 * @var int cannot connect to the Web API interface (network error)
	 */
	static ERROR_CONNECTION = -1;

	/**
	 * @var int successful request
	 */
	static SUCCESS = 0;

	/**
	 * @var int an error occurred while validating input data (invalid length, format etc.)
	 */
	static INVALID_INPUT = 1;

	/**
	 * @var int invalid Web API command (not supported)
	 */
	static INVALID_COMMAND = 2;

	/**
	 * @var int radio model is not supported by the calculator
	 */
	static INVALID_RADIO_MODEL = 3;

	/**
	 * @var int radio serial number is invalid (invalid format, not matching the expected regex pattern)
	 */
	static INVALID_SERIAL_LENGTH = 4;

	/**
	 * @var int radio serial number doesn't match the expected regular expression pattern
	 */
	static INVALID_SERIAL_PATTERN = 5;

	/**
	 * @var int radio serial number is not supported by the selected calculator
	 */
	static INVALID_SERIAL_NOT_SUPPORTED = 6;

	/**
	 * @var int extra data is invalid (invalid format, not matching the expected regex pattern)
	 */
	static INVALID_EXTRA_LENGTH = 7;

	/**
	 * @var int extra data doesn't match the expected regular expression pattern
	 */
	static INVALID_EXTRA_PATTERN = 8;

	/**
	 * @var int license key is invalid or expired
	 */
	static INVALID_LICENSE = 100;
}

/**
 * RadioModel class used to calculate the radio code for specified car radio/navigation
 *
 * Usage:
 *
 * // create Radio Code Calculator API class instance (we are using our activation key)
 * let myRadioCodeCalculator = new RadioCodeCalculator("ABCD-ABCD-ABCD-ABCD");
 *
 * // validate the serial number (offline) before sending the Web API request
 * let error = radioModel.validate(serial, extra);
 *
 * ...
 *
 * // generate radio code (using Web API)
 * myRadioCodeCalculator.calc(RadioModels.FORD_M_SERIES), "123456").then((result) => { ... })
 *
 *     console.log("Radio code is " + result["code"]);
 *
 * }).catch((error) => {
 *
 *     switch(error["error"]) { ... }
 *
 * });
 *
 */
export class RadioModel
{
	/**
	 * @var string A single radio model with its parameters
	 */
	name = "";

	/**
	 * @var int Required, valid length of the radio serial/seed number
	 */
	serial_max_len = 0;

	/**
	 * @var array PCRE compatible regex patterns for the radio serial/seed number
	 */
	_serial_regex_patterns = [];

	/**
	 * @var int Length of the optional param for radio code generation
	 */
	extra_max_len = 0;

	/**
	 * @var array|null PCRE compatible regex patterns for the optional radio serial/seed number
	 */
	_extra_regex_patterns = null;

	/**
	 * @var string Default programming language used to determine the format of regular expression formats
	 */
	default_programming_language = "js";

	/**
	 * In JS you cannot pass the extra parameters for the RegExp in a single string
	 * This function splits the provided rule into Reg Exp rule & extra params (like case insensitive flag)
	 *
	 * @return RegExp regular expression
	 */
	regex_string_to_rule(regex_string)
	{
		const regexParts = /\/(.*)\/(.*)/.exec(regex_string);
		const {1: source, 2: flags} = regexParts;

		return new RegExp(source, flags);
	}

	/**
	 * Return the regex pattern for the current programming language only
	 *
	 * @return RegExp|string PCRE compatible regular expression or an empty string ""
	 */
	serial_regex_pattern()
	{
		if (!(this.default_programming_language in this._serial_regex_patterns))
			return "";

		return this.regex_string_to_rule(this._serial_regex_patterns[this.default_programming_language]);
	}

	/**
	 * Extra field (if defined) regex pattern for the current programming language only or null
	 *
	 * @return RegExp|null PCRE compatible regular expression or null if not required
	 */
	extra_regex_pattern()
	{
		if (this._extra_regex_patterns == null)
			return null;

		if (!(this.default_programming_language in this._extra_regex_patterns))
			return null;

		return this.regex_string_to_rule(this._extra_regex_patterns[this.default_programming_language]);
	}

	/**
	 * Initialize RadioModel class with the radio model name, serial & extra fields max. length and regex pattern
	 *
	 * @param string name Radio model name
	 * @param int serial_max_len Max. serial length
	 * @param string|array serial_regex_pattern Serial number single regex pattern or a dictionary
	 * @param int extra_max_len Max. extra field length
	 * @param string|array|null extra_regex_pattern: Extra field single regex pattern or a dictionary
	 */
	constructor(name,
				serial_max_len,
				serial_regex_pattern,
				extra_max_len = 0,
				extra_regex_pattern = null)
	{
		this.name = name;
		this.serial_max_len = serial_max_len;

		// create an empty dict to prevent Python re-using previous dict from previous object (!)
		this._serial_regex_patterns = [];

		// store the regex pattern under the key for the default programming language (compatibility)
		if (typeof serial_regex_pattern === "string")
			this._serial_regex_patterns[this.default_programming_language] = serial_regex_pattern;
		else if (typeof serial_regex_pattern === "object")
			this._serial_regex_patterns = serial_regex_pattern;

		// initialize extra field
		this.extra_max_len = extra_max_len;
		this._extra_regex_patterns = null;

		if (extra_max_len != 0)
			if (typeof extra_regex_pattern == "string")
				this._extra_regex_patterns[this.default_programming_language] = extra_regex_pattern;
			else if (typeof extra_regex_pattern === "object")
				this._extra_regex_patterns = extra_regex_pattern;
	}

	/**
	 * Validate radio serial number and extra data (if provided), check their lenghts and regex patterns
	 *
	 * @param string serial Radio serial number
	 * @param string|null extra: Extra data (optional)
	 * @return int one of the RadioErrors values
	 */
	validate(serial, extra = null)
	{
		 if (serial.length != this.serial_max_len)
			return RadioErrors.INVALID_SERIAL_LENGTH;

		if (serial.match(this.serial_regex_pattern()) == null)
			return RadioErrors.INVALID_SERIAL_PATTERN;

		if (extra !== null && extra.length > 0)
		{
			if (extra.length != this.extra_max_len)
				return RadioErrors.INVALID_EXTRA_LENGTH;
			if (extra.match(extra_regex_pattern()) == null)
				return RadioErrors.INVALID_EXTRA_PATTERN;
		}

		return RadioErrors.SUCCESS;
	}
}

/**
 * Supported radio models with the validation parameters (max. lengths & regex patterns)
 *
 * This helper class can be used to quickly perform offline validation of the radio
 * serial/seed codes before its send to the WebApi.
 *
 * Usage:
 *
 * let radioModel = RadioModels.FORD_M_SERIES
 *
 */
export class RadioModels
{
	static RENAULT_DACIA = new RadioModel("renault-dacia", 4, "/^([A-Z]{1}[0-9]{3})$/");
	static CHRYSLER_PANASONIC_TM9 = new RadioModel("chrysler-panasonic-tm9", 4, "/^([0-9]{4})$/");
	static FORD_M_SERIES = new RadioModel("ford-m-series", 6, "/^([0-9]{6})$/");
	static FORD_V_SERIES = new RadioModel("ford-v-series", 6, "/^([0-9]{6})$/");
	static FORD_TRAVELPILOT = new RadioModel("ford-travelpilot", 7, "/^([0-9]{7})$/");
	static FIAT_STILO_BRAVO_VISTEON = new RadioModel("fiat-stilo-bravo-visteon", 6, "/^([a-zA-Z0-9]{6})$/");
	static FIAT_DAIICHI = new RadioModel("fiat-daiichi", 4, "/^([0-9]{4})$/");
	static FIAT_VP = new RadioModel("fiat-vp", 4, "/^([0-9]{4})$/");
	static TOYOTA_ERC = new RadioModel("toyota-erc", 16, "/^([a-zA-Z0-9]{16})$/");
	static JEEP_CHEROKEE = new RadioModel("jeep-cherokee", 14, "/^([a-zA-Z0-9]{10}[0-9]{4})$/");
	static NISSAN_GLOVE_BOX = new RadioModel("nissan-glove-box", 12, "/^([a-zA-Z0-9]{12})$/");
	static ECLIPSE_ESN = new  RadioModel("eclipse-esn", 6, "/^([a-zA-Z0-9]{6})$/");
	static JAGUAR_ALPINE = new RadioModel("jaguar-alpine", 5, "/^([0-9]{5})$/");
}

/**
 * Radio Code Calculator API module
 *
 * Usage:
 *
 * myRadioCodeCalculator = new RadioCodeCalculator("YOUR-WEB-API-KEY");
 *
 * // generate radio code (using Web API)
 * myRadioCodeCalculator.calc(RadioModels.FORD_M_SERIES), "123456").then((result) => { ... })
 *
 *     console.log("Radio code is " + result["code"]);
 *
 * }).catch((error) => {
 *
 *     switch(error["error"]) { ... }
 *
 * });
 *
 */
export class RadioCodeCalculator
{
	/**
	 * @var string default Radio Code Calculator API WebApi endpoint
	 */
	API_URL = "https://www.pelock.com/api/radio-code-calculator/v1";

	/**
	 * @var string|null WebApi key for the service
	 */
	_apiKey = null;

	/**
	 * Initialize Radio Code Calculator API class
	 *
	 * @param string|null api_key Activation key for the service (it cannot be empty!)
	 */
	constructor(api_key = null)
	{
		this._apiKey = api_key;
	}

	/**
	 * Login to the service and get the information about the current license limits
	 *
	 * @return RadioCodeCalculator A list with an error code, and an optional dictionary with the raw results (or null on error)
	 */
	login()
	{
		// parameters
		const params = [];
		params["command"] = "login";

		return this.post_request(params);
	}

	/**
	 * Calculate the radio code for the selected radio model
	 *
	 * @param RadioModel|string radio_model Radio model either as a RadioModel class or a string
	 * @param string radio_serial_number Radio serial number / pre code
	 * @param string radio_extra_data Optional extra data (for example - a supplier code) to generate the radio code
	 * @return array A list with an error code, and an optional dictionary with the raw results (or null)
	 */
	calc(radio_model, radio_serial_number, radio_extra_data = "")
	{
		// parameters
		const params = [];
		params["command"] = "calc";
		params["radio_model"] = typeof(radio_model) === "string" ? radio_model : radio_model.name;
		params["serial"] = radio_serial_number;
		params["extra"] = radio_extra_data;

		return this.post_request(params);
	}

	/**
	 * Get the information about the given radio calculator and its parameters (name, max. len & regex pattern)
	 *
	 * @param RadioModel|string radio_model Radio model either as a RadioModel class or a string
	 * @return array A list with an error code, and an optional RadioModel create from the return values (or null)
	 */
	info(radio_model)
	{
		// parameters
		const params = [];
		params["command"] = "info";
		params["radio_model"] = typeof(radio_model) === "string" ? radio_model : radio_model.name;

		// send request
		return this.post_request(params).then((result) => {

			return new Promise((fulfilled, rejected) =>
			{
				if (result["error"] !== RadioErrors.SUCCESS)
				{
					rejected(result);
					return;
				}

				let model = new RadioModel(params["radio_model"], result["serialMaxLen"], result["serialRegexPattern"], result["extraMaxLen"], result["extraRegexPattern"]);

				result["radioModel"] = model;

				fulfilled(result);
			});
		});
	}

	/**
	 * List all the supported radio calculators and their parameters (name, max. len & regex pattern)
	 *
	 * @return array A list with an error code, and an optional list of supported RadioModels (or null)
	 */
	list()
	{
		// parameters
		const params = [];
		params["command"] = "list";

		// send request
		return this.post_request(params).then((result) => {

			return new Promise((fulfilled, rejected) =>
			{
				if (result["error"] !== RadioErrors.SUCCESS)
				{
					rejected(result);
					return;
				}

				let radio_models = [];

				// enumerate supported radio models and build a list of RadioModel classes
				Object.keys(result["supportedRadioModels"]).forEach(radio_model_name =>
				{
					let radio_model = result["supportedRadioModels"][radio_model_name];

					let model = new RadioModel(radio_model_name, radio_model["serialMaxLen"],
											radio_model["serialRegexPattern"], radio_model["extraMaxLen"],
											radio_model["extraRegexPattern"]);
					radio_models.push(model);
				});

				result["radioModels"] = radio_models;

				fulfilled(result);
			});
		});
	}

	/**
	 * Send a POST request to the server & returns a Promise
	 *
	 * @param {Array} params_array params_array An array with the parameters
	 * @param {decodedCallback} callback_ Funkcja callback wywolywana po zdekodowaniu danych
	 * @returns {Promise} An array with the POST request results (or default error)
	 */
	post_request(params_array)
	{
		return new Promise((fulfilled, rejected) =>
		{
			// default error -> only returned by the SDK
			let default_error = { "error": RadioErrors.ERROR_CONNECTION };

			// add activation key to the parameters array
			if (this._apiKey === null)
			{
				rejected({ "error": RadioErrors.INVALID_LICENSE });
				return;
			}

			// przygotuj forme do zapytania POST
			const form = new FormData();

			// do parametrow dodaj klucz Web API
			form.append("key", this._apiKey);

			Object.keys(params_array).forEach(param => {
				form.append(param, params_array[param]);
			});

			fetch(this.API_URL, {
				method: 'POST',
				body: form,
				headers: form.getHeaders()
			})
			.then(response => response.json())
			.then(response => response['error'] == RadioErrors.SUCCESS ? fulfilled(response) : rejected(response))
			.catch(error => {
				default_error["error_message"] = error;
				rejected(default_error);
			});
		});
	}
}
