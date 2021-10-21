
# Mooltipass Browser Extension

<p align="center">
  <img src="https://www.themooltipass.com/images/gallery/safari-chrome-ff.png" alt="Mooltipass Browser Extension"/>
</p>

The browser extension is one of the components of the Mooltipass product that facilitates communication between the browser and the Mooltipass device. It enables the user to simply retrieve and store Mooltipass credentials easily from any navigated to website.  

The extension runs on the user's browser. When the user has to login, it sends the current website's data to the Mooltipass device in realtime allowing the device to either retrieve the stored credentials and automatically enter them or, prompt to save the newly entered credentials if they were never before used on this website.  

The extension supports the [WebExtensions model](https://developer.mozilla.org/en-US/Add-ons/WebExtensions) thus, making it generic and compatible for all the major browsers in use such as; [Chrome](https://www.google.com/chrome/browser/desktop/index.html?brand=CHBD&gclid=CjwKCAiAweXTBRAhEiwAmb3Xu8dtWFBjQlO126lpCqM0hbNbW8K0gOkrAwNY0KptIfd50BtfOLjkahoCUh8QAvD_BwE), [Firefox](https://www.mozilla.org/en-US/firefox/new/) & [Safari](https://support.apple.com/downloads/safari).  

# Extension Architecture

The browser extension is composed of a number of different components which fall under the following categories:
- [Content-Scripts](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Anatomy_of_a_WebExtension#Content_scripts): Content scripts are extension-provided scripts which run in the context of a web page. Content scripts can see and manipulate the page's DOM, just like normal scripts loaded by the page.  
- [Background-Scripts](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Anatomy_of_a_WebExtension#Background_scripts): Background scripts are loaded as soon as the extension is loaded and stay loaded until the extension is disabled or uninstalled. They are often used to maintain long-term state or perform long-term operations independently of the lifetime of any particular web page or browser tab.  
- [Browser-Actions](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/user_interface/Browser_action): Browser actions are toolbar buttons. Users click the button to interact with your extension.  
- [Options-Pages](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/user_interface/Options_pages): An Options page enables you to define preferences for your extension that your users can change.  

# Intra-Extension Communication

As described earlier, the extension is composed of a front-end & a back-end. The front-end being our *Content-Scripts* & the back-end being our *Background-Scripts*.  
*Content-Scripts* enable the extension to directly interact with the loaded website while *Background-Scripts* run in the background, are longer lived and perform most of the processing.  

In our extension, the *Content-Scripts* are tasked with interacting with the website's content, scrapping the page and searching for user login forms and password fields and grabbing all the required data from the website for the product to function properly. As for our *Background-Scripts*, they are tasked with processing the data gathered by the *Content-Scripts* and interacting with our Mooltipass device enabling it to manage the user credentials and their encryption.  
.  
  
<p align="center">
  <img src="Assets\Intra-Communication.png" alt="Extension Intra-Communication Messaging"/>
</p>
.  

In order for the extension to function properly, both **Content/Background-scripts** need to communicate together. This is done via the use of [Messaging API's](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Content_scripts#Communicating_with_background_scripts) provided by the browser. This provides a mechanism to allow the extension's frontend & backend scripts to communicate together, share information and provide each other with interactive data in realtime.

# External Extension Communication

The browser extension is a plugin that enables the Mooltipass device to easily communicate and access websites the user is navigating. With that being said, the extension **does not handle** storage of the user credentials or their encryption. It simply gathers all the required data about the currently navigated websites and forwards it to the Mooltipass device to allow it to further encrypt, store, manage and retrieve the credentials. In order for this data sharing to occur, the extension needs to directly communicate with the [Mooltipass App](https://chrome.google.com/webstore/detail/mooltipass-app/cdifokahonpfaoldibbjmbkdhhelblpj). This is done via the aid of [Native Messaging](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Native_messaging).  

<p align="center">
  <img src="Assets\External-Communication.png" alt="Native Messaging"/>
</p>

Native messaging enables an extension to exchange messages with a native application installed on the user's computer. This enables native applications to provide a service to extensions without needing to be reachable over the web.

# Background-Script Initialization Data Flow

The following chart describes the initialization process of the *background-scripts* as soon as the extension is loaded within the browser.  

<p align="center">
  <img src="Assets\Background_Script_Init.png" alt="backgroundScript Initialization"/>
</p>

# Extension in action Data Flow

Their are many different scenarios the extension covers. The following chart explains what happens when the user navigates to a website where the credentials are already known and stored on the *Mooltipass device*.  

<p align="center">
  <img src="Assets\Content_Script.png" alt="ContentScript In Action"/>
</p>

# Blacklist

The ***BlackList*** is a list of user defined URL's where the extension is forbidden to analyse and retrieve/store credentials. Users can create, update, modify & delete URL's manually from this list by simply navigating to the options page and inputting the desired website's URL within the ***BlackList***.

The ***BlackList*** is stored locally within the extension's cache. Whenever a user navigates to a new website, the extension checks first if the current URL exists within the ***BlackList*** or not. If it exists, the extension halts with script initialization and holds any form of further processing.

The above mentioned behavior can be observed in the main content script ***mooltipass-content.js***:

    // Check if URL is BlackListed
    chrome.runtime.sendMessage({ "action": "check_if_blacklisted", "url": window.location.href }, function (response) {
        // If URL is BlackListed, don't initialize content scripts
        if (response.isBlacklisted) return;
    }
 
Here, the main content script sends a message to the background script which holds a copy of the local blacklist. The message contains the ***window.location.href*** which is the currently surfed URL. It then awaits the response from the background script. If the response is true (***response.isBlacklisted***), the content script returns and stops all further processing/initialization.

# Content-Script Message Handling

As previously described, the content-scripts & background-scripts communicate together via sending native messages to each other. In order to capture the messages, a message listener needs to be implemented.

Within the content-scripts, 2 message listeners are implemented:
1) Temporary message listener (***mooltipass-content.js***)
2) Main message listener (***cipEvents.js***)

In the ***mooltipass-content.js***, a temporary message listener is defined at the beginning. This message listener is intended to capture the response of the ***check_if_blacklisted*** message mentioned in the previous section.

    // Capture messages recieved from the background script
    startTemporaryEventListener();
    
Once the message response is recieved, the temporary message listener is decommisioned and the main message listener is initialized and started as shown in the below code snippet.

    // Remove event listener
    if (isSafari) safari.self.removeEventListener("message", tempListenerCallback, false);
    else chrome.runtime.onMessage.removeListener(tempListenerCallback);

    // Init the content scripts
    startContentScripts(req);

As for the ***cipEvents.js***, it is the main message listener for all content-scripts. It captures all messages being sent and reacts accordingly based on the message type/content.

Background sends 2 types of messages :
  -response message - "callback" with results for some message from content script. This message sent to tab and subframe that sent original message.
  -broadcast messages - send to all tabs, all subframes.

# Page content monitoring

Content script constantly monitors page changes using Mutation observer (https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).
"checkForNewInputs" function called if mutation observer detects input fields added or "style" attribute updated(in case some fields showed or hidden) 

# The retrieveCredentialsQueue

The extension asks/receives the credentials  from the external application via retrieveCredentialsQueue
This is the array of objects.
Each object has such fields:
```
`{'tabid': ..., 
'callback': ..., 
'domain': ..., 
'subdomain': ..., 
'tabupdated': ..., 
'reqid': ..., 
'tab': ...}`
```
When extension needs credentials, it places the request to retrieveCredentialsQueue.
When credentials received from the external application, the callback function of the first object in queue will be called with credentials
After this the object will be removed from the queue

# Asking for credentials

The credentials can be asked with two ways
1. When  the user opens the page and credentials will be filled automatically
2. User choose the right-click menu ("Fill username only", "Fill User + Pass", "Fill Pass Only")
For the second case will be set the flag `forceFilling=true` and will be set flags `fillPasswordOnly` and `fillUserOnly`
Also the extension memorize the element where right-click occurs (variable clickedElement)
When page need the credentials, it sends to background script the message retrieve_credentials with such arguments   
 **url** - url of the page,   
 **submitUrl** - submit url of the form that credentials required
 **forceCallback**,  - true  
 **triggerUnlock** - not used
The event handler in background script creates the callback function and adds it to the list of arguments
The goal of the callback function - send to page with given ID the message _<"response-" + MESSAGE_NAME>_
(in our case response-retrieve_credentials)
The message retrieve_credentials will be processed in mooltipass.device.retrieveCredentials function
Logic of the function:
From submitUrl will be extracted domain, subdomain and URL will be checked (valid and blacklisted)
Will be returned parsed_url object
Will be checked if such request already in retrieveCredentialsQueue
Will be checked if we have more than 3 requests from the certain tab within 30 sec (mooltipass.device.checkInLastCredentialsRequests function)
Current request will be added to _lastCredentialsRequests_ array (function ooltipass.device.addToLastCredentialsRequests)
Current request will be added to _retrieveCredentialsQueue_ array
If retrieveCredentialsQueue has only one element (mooltipass.device.retrieveCredentialsQueue.length == 1) will be called mooltipass.device.sendCredentialRequestMessageFromQueue() to pass the request to device
If more than 1 - this means that we already wait other credentials from the device and the queue will be processed after response from device

# Receiving the credentials from the device

The extension communicates with device via external application
Communication with external application via WebSocket (module moolticute.js)
The message from external application processed in onMessage handler
The external application sends the _ask_password_ message with credentials
In onMessage handler will be created wrapper (object) to be passed as the message object to mooltipass.device.messageListener
Login and password will be placed to wrapped.credentials
The function mooltipass.device.messageListener will call the callback function of the first object in the queue (`retrieveCredentialsQueue[0].callback`),
remove this object from the queue (`mooltipass.device.retrieveCredentialsQueue.shift()`)
and start the processing of the next pending request (`mooltipass.device.sendCredentialRequestMessageFromQueue()`)
The callback function adds to message "response-" and sends the message
"_response-retrieve_credential_" to mcCombinations
This message has necessary credentials
When mcCombinations receives the message "_response-retrieve_credential_" it processes it in the
retrieveCredentialsCallback function.
The retrieveCredentialsCallback function updates credentialsCache with current credentials, 
For case when credentials asked from right-click menu and mode fillPasswordOnly the extension fills the password field saved in clickedElement variable
In other case the extension fills the fields for all combinations on the page
.If combination successfully filled, when flag _wasFilled_ is set to true and for current form will be called doSubmit function

# Credential Caching

Not all websites implement simple login dialogs where both; the username and password fields appear side by side on the same page. Some websites resort to implementing a 2-page authentication prompt. On such pages, the user enters first his username. This username is then validated by the website, and only if it appears to exist, a new prompt appears for the user including the password field. The user can then finalize the login procedure by inputting his password and proceeding on with the authentication.

For such websites, the user would be prompted twice on the mooltipass device to enter his credentials. Once for the page containing the username field, and twice for the page containing the password field. This would also result in sending a number of redundant messages from the extension to the device to retrieve the same credentials twice for the same page.

To solve this issue, we implemented a ***Credential Cache*** within the extension. This means, for such websites, the extension requests the user credentials once from the device, and holds on to them by storing them in the local extension cache. As soon as the login operation is complete and the authentication prompt is removed, the extension empties its local ***Credential Cache*** thus, avoiding storage of unused credentials for longer than required. The local ***Credential Cache*** is stored within the ***page.js*** background script and could be seen here:

    // Store previously used logins
    page.cacheLogin = function( callback, tab, arguments ) {
      if (background_debug_msg > 4) mpDebug.log('%c page: %c cacheLogin ','background-color: #ffeef9','color: #246', arguments);
      page.tabs[ tab.id ].loginList = {'Login': arguments };
    }

To further ensure not holding on to the credentials for longer than required, on every new navigation, the extension checks whether there are any credentials stored within the local cache & empties any if found. This can be observed in the main content script ***mooltipass-content.js***:

    // Signal background script to empty local cache
    messaging({ 'action': 'remove_credentials_from_tab_information' });

Here, the content script is sending a message to the background script asking it to delete the local cache for the current active tab. This message is sent once, on every new navigation.

# Submitting Credentials

When the extension successfuly retrieves the stored credentials from the Mooltipass device and inputs them into the detected input fields, the only thing which remains then is submitting the credentials to the website to enable the user to authenticate.

In order for the extension to submit the credentials, it needs to first locate the *SUBMIT* button on the page and trigger it. The extraction and allocation of the *SUBMIT* button on the page is performed within the ***mcCombinations.js*** script as shown below:

    /*
	* Detect submit button for the given field and container.
	*
	* @param field {jQuery object}
	* @param container {jQuery object}
	* @return submitButton {DOM node} or undefined
	*/
	mcCombinations.prototype.detectSubmitButton = function detectSubmitButton(field, container){}

This function searches the page for a ***SUBMIT*** button. The extraction of the button follows a number of regulations. To describe the regulations, we need to first explain 3 main lists stored within the above mentioned function.
- ACCEPT_PATTERNS: List of regex's containing the text strings that are allowed to exist within the ***SUBMIT*** button.
- IGNORE_PATTERNS: List of regex's containing the text strings that are **not** allowed to exist within the ***SUBMIT*** button.
- BUTTON_SELECTORS: List of regex's describing the HTML elements a ***SUBMIT*** button can be composed of.

The extraction procedure starts off by applying the 3 above mentioned lists on all HTML elements found on the page and filtering out all the elements that don't comply to these regex's. The elements compling to these lists need to match non of the regex's within the *IGNORE_PATTERNS* list and at least 1 regex within each of the *ACCEPT_PATTERNS* & *BUTTON_SELECTORS* list.

After applying these lists and extracting a list of elements on the page, the elements are sorted based on their distance from the FORM element. The closer the button is, the higher its chance of being the selected one is. After the sort operation is complete, the nearest button to the FORM element is chosen to be the ***SUBMIT*** button.

In case where no button matching the criteria described above was found, the extension triggers a *SUBMIT* event on the FORM element itself as a fallback mechanism.

**The submission of credentials on Forms has an exception mentioned below:**

Not all websites follow the standard authentication procedure. Hence, for some websites, the auto submission is switched off so as not to damage the data flow of those websites. On those websites, the extension retrieves the user credentials from the device & inputs them into the fields on the screen. However, the extension doesn't proceed on by submitting the form. It simply halts any further processing and allows the user to manually submit the form by clicking on the log in button. 

For those domains, a special exception list is created within the ***mcCombinations.js*** content script as displayed below:
	
	/*
	* Submits the form!
	*/
	mcCombinations.prototype.doSubmit = function doSubmit(currentForm) {
    		var DISABLE_AUTOSUBMIT_DOMAINS = ['gls-online-filiale.de', 'mohela.com']
	}

Before the extension triggers the **Submit** event on the form, it checks if the current website lies within this list of domains or not and acts accordingly.

# Localization

The extension is currently localized in 13 languages. These languages include:
- English
- German
- Spanish
- French
- Italian
- Japanese
- Korean
- Dutch
- Portogese
- Russian
- Turkish
- Chinese (Simplified & Extended)

The localization resource files are all located within the ***_locales*** directory. The resource files are JSON formated files. The strings are all stored within a JSON structure composed of the following:

    "STRING_RESOURCE_NAME": { "message": "STRING_TEXT" }

- *STRING_RESOURCE_NAME*: The name you'll be refering to within the code to retrieve the localized string
- *message*: The attribute used to save the localized string
- *STRING_TEXT*: This is where you input your localized string.

The *STRING_RESOURCE_NAME* should be common across all locale resource files per string. To retrieve the localized string within our code, you'll need to call the *[Chrome.i18n.getMessage(STRING_RESOURCE_NAME)](https://developer.chrome.com/apps/i18n) native api*. This native api is available for calling from within any JS/HTML/CSS file within your extension regardless of its type or action.

# Possible Improvements

- Refactor the *mooltipass-content.js* into smaller, readable, debugable scripts as is the case with all *background-scripts*.
