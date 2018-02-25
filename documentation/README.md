
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

- ~~Replace hard-coded strings within the extension with **LOCALE** resources.~~
- Refactor the *mooltipass-content.js* into smaller, readable, debugable scripts as is the case with all *background-scripts*.
- **Chrome.webRequest.onBeforeRequest** is used heavily within the extension. This is very resource intensive and can add major noticable delay to the user experience in cases where the extension is used along side another network trafficing or security extension. Discuss the possibility of limiting it to capturing *HTTP POST* requests being made from within the *main_frame* instead of *all_frames*.
