

# Dynamic Web Testing

## Local Deploy 

-  #TODO: Will be Updated Shortly

## Deploy to AWS

- At root Directory (Dynamic_Web_Testing)  install required packages

	```
	yarn
	```

- Install Required packages in  `js_testing_api` 

	```	
	cd js_testing_api && yarn
	```

- Deploy `js_testing_api`

	```	
	serverless deploy
	```

- Install Required packages in  `css_testing_api` 

	```
	cd ../css_testing_api && yarn
	```

- Deploy `css_testing_api` 

	```
	serverless deploy
	```


## Note: 

Deploy `js_testing_api` first and then Deploy other APIs , as Other APIs depends on `js_testing_api`s API End Point 

