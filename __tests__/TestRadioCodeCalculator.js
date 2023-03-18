"use strict";

/******************************************************************************
 *
 * Radio Code Calculator API - WebApi interface unit test
 *
 * Validate Radio Code Calculator Web API responses
 *
 * Run with npm test
 *
 * Version      : v1.1.3
 * JS           : ES6
 * Dependencies : form-data, node-fetch
 * Author       : Bartosz Wójcik (support@pelock.com);
 * Project      : https://www.pelock.com/products/radio-code-calculator
 * Homepage     : https://www.pelock.com
 *
 * @link https://www.pelock.com/products/radio-code-calculator
 * @copyright Copyright (c) 2021-2023 PELock LLC
 * @license Apache-2.0
 *
/*****************************************************************************/

//
// include Radio Code Calculator API module (via composer autoloader)
//
import { RadioCodeCalculator, RadioErrors, RadioModel, RadioModels } from "radio-code-calculator";

//
// make sure to provide valid activation key in order to run the tests
//
const VALID_ACTIVATION_KEY = "ABCD-ABCD-ABCD-ABCD";

/**
 * @var RadioCodeCalculator global instance of RadioCodeCalculator
 */
let myRadioCodeCalculator = new RadioCodeCalculator(VALID_ACTIVATION_KEY);

test("test_login()", () =>
{
	// login to the service
	myRadioCodeCalculator.login().then(result => {

		expect(result).not.toBeNull();
		expect(result).toHaveProperty('error');
		expect(result['error']).toBe(RadioErrors.SUCCESS);
		expect(result).toHaveProperty("license");
		expect(result["license"]).toHaveProperty("userName");
		expect(result["license"]).toHaveProperty("type");
		expect(result["license"]).toHaveProperty("expirationDate");
	}).catch(error => expect(error).toBeNull());
});

test("test_login_invalid()", () =>
{
	// provide invalid license key
	let radioCodeApi = new RadioCodeCalculator("AAAA-BBBB-CCCC-DDDD");

	// login to the service
	radioCodeApi.login().then(result => {})
	.catch(result =>
	{
		expect(result).not.toBeNull();
		expect(result).toHaveProperty('error');
		expect(result['error']).toBe(RadioErrors.INVALID_LICENSE);
	});
});

test("test_invalid_radio_model()", () =>
{
	// login to the service
	myRadioCodeCalculator.calc("INVALID RADIO MODEL", "1234").then(result => {})
	.catch(result =>
	{
		expect(result).not.toBeNull();
		expect(result).toHaveProperty('error');
		expect(result['error']).toBe(RadioErrors.INVALID_RADIO_MODEL);
	});
});

test("test_radio_command()", () =>
{
	// send invalid command to the service
	const params = [];
	params["command"] = "INVALID COMMAND";

	myRadioCodeCalculator.post_request(params).then(result => {})
	.catch(result =>
	{
		expect(result).not.toBeNull();
		expect(result).toHaveProperty('error');
		expect(result['error']).toBe(RadioErrors.INVALID_COMMAND);
	});
});

test("test_radio_codes()", () =>
{
	// valid pair of radio codes to test the calculator
	let codes = [
		[ RadioModels.RENAULT_DACIA, "Z999", "0060"],
		[ RadioModels.CHRYSLER_PANASONIC_TM9, "1234", "8865"],
		[ RadioModels.FORD_M_SERIES, "123456", "2487"],
		[ RadioModels.FORD_V_SERIES, "123456", "3067"],
		[ RadioModels.FORD_TRAVELPILOT, "1234567", "3982"],
		[ RadioModels.FIAT_STILO_BRAVO_VISTEON, "999999", "4968"],
		[ RadioModels.FIAT_DAIICHI, "6461", "8354"],
		[ RadioModels.TOYOTA_ERC, "10211376ab8e0d25", "A6905892"],
		[ RadioModels.JEEP_CHEROKEE, "TQ1AA1500E2884", "1315"],
		[ RadioModels.NISSAN_GLOVE_BOX, "D4CDDC568498", "55B7AB0BAB6F"],
		[ RadioModels.ECLIPSE_ESN, "7D4046", "15E0ED"],
	];

	codes.forEach(params =>
	{
		let model = params[0];
		let seed = params[1];
		let key = params[2];

		// offline validate input first
		expect(model.validate(seed)).toBe(RadioErrors.SUCCESS);

		// validate radio code for the given serial number
		myRadioCodeCalculator.calc(model, seed).then(result =>
		{
			expect(result).not.toBeNull();
			expect(result).toHaveProperty('error');
			expect(result['error']).toBe(RadioErrors.SUCCESS);
			expect(result['code']).toBe(key);
		}).catch(error => expect(error).toBeNull());
	});
});

test("test_radio_code_len()", () =>
{
	// invalid radio serial length
	myRadioCodeCalculator.calc(RadioModels.FORD_M_SERIES, "1").then(result => {}).catch(result =>
	{
		expect(result).not.toBeNull();
		expect(result).toHaveProperty('error');
		expect(result['error']).toBe(RadioErrors.INVALID_SERIAL_LENGTH);
	});
});

test("test_radio_code_pattern()", () =>
{
	// calculate the code with invalid regex pattern
	myRadioCodeCalculator.calc(RadioModels.FORD_M_SERIES, "12345A").then(result => {}).catch(result =>
	{
		expect(result).not.toBeNull();
		expect(result).toHaveProperty('error');
		expect(result['error']).toBe(RadioErrors.INVALID_SERIAL_PATTERN);
	});
});
