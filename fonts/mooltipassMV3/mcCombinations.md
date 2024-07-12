# McCombinations Documentation

mcCombinations is the heart of the extension. It takes the fields presents in the page and 
tries to come out with the most accurate procedure after analyzing the fields.

In a broad view, what it does is:

	* Split all the fields into forms
	* Detect a combination for each form
	* Holds the most pertinent form/combination

The most common structure would be a form with a submit button, the first field being the login
and the second a password. From there, everything is a special case and it is handled by mcCombinations

## Marking founded fields and forms

In function getAllForms() the mcCombinations  scans the page for fields that matches certain selector (**inputQueryPattern**) 
**inputQueryPattern** includes
  _inputs with type='username'
  inputs with type='text' but not with class="search"
  inputs with type='email'
  inputs with type='login'
  inputs with type='password' but not with class="notinview" and not tabindex='-1'
  inputs with type='tel'
  inputs with type='number'
  any input without "type" attribute
  inputs with name='username'_
After mcCombinations found field that match the selector, it "marks" it by adding to the HTML element the attribute "data-mp-id" 
If field element have the ID attribute, the mcCombinations takes this ID as value for data-mp-id attribute
![](data:image/png;base64,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)
if field element don't have the ID attribute, the mcCombination generates unique value like "mpJQ000000000"
![](data:image/png;base64,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)
For founded fields the mcCombinations search for parent form element and marks it with same algorithm.

## Work method

As mcCombinations tries to perform the whole detection and submit preparation of forms, it doesn't return what it finds, but actually stores and prepares itself for communication with the device. So, everything is stored inside the "forms" variable inside mcCombs

To check detected forms in a page, just type in the console:

- mcCombs.forms

(You'll see a "noform", which is a special case for orphaned input fields)

forms is an object with the ID of the form and combination information inside it:

combination: the combination itself (so... preExtraFunction can modify it)
element: A reference to the FORM element that's associated
fields: A reference to every field in the combination that has relationship with it.



## Combination Matching

Combinations are selected in order from top to bottom, so the process is abandoned as soon as a viable combination is found.

A combination is viable if: All the required fields have been found, and the score reached 100. 


## Intercepting and submitting form

We catch form submit by the following ways:
* Handling click on submit button
* Handling return keypress on form fields
* Handling submit event on form

For submit button detection _detectSubmitButton()_ function is used. It uses flexible set of selectors to prioritize available buttons. Also accept and ignore patterns are used for filtering.

Form submit is done by the following ways:
* Clicking on submit button 
* Triggering submit event on form
* Sending keyDown event (ENTER key) to password field.

## Detection of Submit button

For given field the mcCombinations  scans for Submit button inside the parent element. If Submit button not found on this level, mcCombinations scans on level up (parent of the previously scaned element), mcCombinations scans untill BODY element.

On each scan the mcCombinations searches the element with certain selector. If such element found, mcCombinations  initially checks it against IGNORE_PATTERNS. If element matches IGNORE_PATTERNS. it will be skipped. After this  mcCombinations  checks it against ACCEPT_PATTERNS. Only element that matches ACCEPT_PATTERNS will stay in the result set.

After this mcCombinations sorts set of founded buttons depending how far from they located from the field. After this mcCombinations  gets the first button in the set (button that has less distance from the field).

## Combination structure

Each combination has a specific structure in JSON format, and properties are as below:

	combinationId: [String] Just an indicative name for the combination, no spaces nor special chars please, eg: 'simpleLoginForm001'
	combinationName: [String] Descriptive info about the combination
	requiredFields: [Object] Fields that must be present in the form for this combination to pass as positive
	requiredFields.selector: [String] DOM selector for the requirement. eg: 'input[type=password]'
	requiredFields.submitPropertyName: [String] While by default we submit the NAME property as the descriptor, some sites use other property, specified in this field
	requiredFields.mapsTo: [ENUM:username/password] Set if this required field maps to either username or password
	requiredFields.closeToPrevious: [BOOL] If the found element matching the requiredFields.selector also has to be immediate in DOM order to the previous requiredField (Ignores any other HTML element besides input fields)
	scorePerMatch: [INT 0-100] On each found match, add this to the combination score.
	score: [INT 0-100] Starting score for combination.
	autoSubmit: [BOOL] Indicates if the combination will submit the form after filling it or not
	maxfields: [INT] Maximum number of fields the FORM element can contain in order to consider this combinationName
	preExtraFunction: [FUNCTION] Called when the combination is found and pass as approved, BEFORE credentials retrieve callback 
	extraFunction: [FUNCTION] Called when the combination is found and pass as approved, AFTER credentials retrieve callback 
	isPasswordOnly: [BOOL] Indicates if the combination expects to have only password fields
	usePasswordGenerator: [BOOL] Use password generator in the password fields or not
	enterFromPassword: [BOOL] Send an enter key after filling in the password
	requiredUrl: [String] Only works for the specificied URL
	callback: [Function] Skips the normal combination processor and executes this function instead. Meant for very specific cases.



## Example

It is easy to explain this method by analyzing one of the first combinations: 'canFieldBased'. As the combinationName says: 'Login Form with can-field properties' some websites opperate with a CMS that generate input fields with 'can-field' as a property.

The required fields are indicates it is looking for two fields: input[can-field=accountName] and input[can-field=password] with mapping to username and password respectively.

As we expect two fields, each match scores 50 points (in hope to reach and not surpass 100)

Later, we know that CMS doesn't render standard submit fields, and that it requires some time since the last time something was typed until the form is submitted (probably to avoid robots) So in the extra function we add a timeout plus an indication to issue a click event to the submit button.
