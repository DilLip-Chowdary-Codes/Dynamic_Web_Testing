const fs = require("fs");
const child_process = require("child_process");
// const uuid = require('uuid/v4');
const { v4: uuid } = require('uuid');

exports.handler = async (event) => {
	console.log("Event: ", event);

	request_data = JSON.parse(event.body);

	console.log("Request Data: ", request_data);

	create_required_files(request_data);
	const parsedResults = run_test();
	const response = prepare_result(parsedResults);

	const api_response = {
		"body": JSON.stringify(response),
		"headers": {"Content-Type": "application/json"},
		"statusCode": 200
		}
	return api_response;
};

function create_required_files(request_data){

	console.log("Creating Required Files...")

	const dir = '/tmp/testing/';

	// Remove Prev Test Files
	fs.rmdirSync(dir, { recursive: true });

	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	//  Move node_modules, package.json etc files to /tmp/testing 

	child_process.execSync("cp -r . /tmp/testing/", {
		stdio: "inherit",
	});

	const user_code = request_data.user_code;

	for(let i=0;i<user_code.length;i++){

		const lang = user_code[i].language;
		const file_content = user_code[i].file_content;

		if(lang=="HTML"){

			fs.writeFileSync('/tmp/testing/index.html', file_content, function (err) {
				if (err) throw err;
				console.log('HTML Content Saved!');
			});

		}
		else if (lang=="CSS"){

			fs.writeFileSync('/tmp/testing/index.css', file_content, function (err) {
				if (err) throw err;
				console.log('CSS Content Saved!');
			});
		}
		else if(lang=="JAVASCRIPT"){

			fs.writeFileSync('/tmp/testing/index.js', file_content, function (err) {
				if (err) throw err;
				console.log('JS Content Saved!');
			});

		}
	}

	const test_cases = request_data.test_cases;

	for (let i = 0; i < test_cases.length; i++) {
		const testcase_id = test_cases[i].testcase_id;
		const testcase_uuid = uuid()
		fs.writeFileSync('/tmp/testing/' + testcase_uuid + (testcase_id) + '.test.js', test_cases[i].metadata, function (err) {
			if (err) throw err;
			console.log('Test Cases Saved!');
		});
	}



	console.log("Created Required Files")

}

function run_test(){

	console.log("Running Test ...")

	try{

	child_process.execSync("cd /tmp/testing/ && npm run test", {
	stdio: "inherit",
	});
	}
	catch(err){
		console.log(err);
	}

	const results = fs.readFileSync("/tmp/testing/output.json");
	const parsedResults = JSON.parse(results);

	console.log("Test Completed ")

	return parsedResults;
}

function prepare_result(parsedResults){

	console.log("Preparing Result...")

	const INCORRECT = "INCORRECT";
	const CORRECT = "CORRECT";
	const COMPILATION_ERROR = "COMPILATION_ERROR";
	const RUNTIME_ERROR = "RUNTIME_ERROR";
	const ERROR = "ERROR";

	const all_test_cases_result = parsedResults.testResults;
	let results = [];

	for(let i=0;i<all_test_cases_result.length;i++){

		const test_case_result = all_test_cases_result[i];
		const testcase_id = test_case_result.name.slice(49, -8);
		const execution_time_in_seconds = (test_case_result.endTime - test_case_result.startTime)/1000;

		let test_case_status;
		if (test_case_result.status=="passed"){
			test_case_status = CORRECT;
		}
		else if (test_case_result.status=="failed"){
			test_case_status = INCORRECT;
		}
		// else if(){
		// 	test_case_status = COMPILATION_ERROR
		// }
		// else if (){

		// 	test_case_status = RUNTIME_ERROR
		// }
		// else{
		// 	test_case_status = ERROR
		// }
		results.push({

			"testcase_id": testcase_id,
			"status": test_case_status,
			"execution_time_in_seconds": execution_time_in_seconds,
			"error": test_case_result.message
		});

	}

	const is_compilation_error = parsedResults.wasInterrupted;

	const response = {
		"results": results,
		"is_compilation_error": is_compilation_error
	};

	console.log(response);

	console.log("Result Prepared...")

	return response;
}
