###### Setup: 
	1. Change configurations in config.js
		a. server port
		b. mongodb configurations
			* ip
			* port
			* database
			
	2. installl package.json
	
	3. run app.js [Command: node app.js]

###### Add card & currency details:

	[ Assuming base url: http://localhost/ ]
	* http://localhost/admin
	
	Note: No validations added, please enter data as mentioned in placeholder

###### Requirement:
	* Minimum number of banknotes are dispensed
	* Availability of various denominations in the ATM is maintained
	* Code should be flexible to take care of any bank denominations as long as it is a multiple of 100
	* Validate card details and dispense requested amount.

###### Tested Scenarios: [Please refere sample images from screens]
	1. No cash ATM
	
	2. Validating card details
	
	3. Validating request amount with card balance
	
	4. Availability of currency
		EX: ATM has 2000 & 500 currenc only, and user request for 2700
			INPUT: 2700
			OUTPUT: Please enter the multiples of 2000, 500
			
	5. Display available balance and withdrawal denominations
		EX: card balance: 30000
			INPUT: 2700
			OUTPUT: Balance: 27300
				Notes: 	2000 * 1
					500 * 1
					100 * 2
