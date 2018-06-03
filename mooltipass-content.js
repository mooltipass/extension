/*******************************************************************************************
  Module:       mooltipass-content
  Description:  Defines an entry point into the extension's content-scripts
/*******************************************************************************************
  Copyright:    (c) 2018
  Created:      02/25/2018 (mm/dd/yyyy)
********************************************************************************************/

// Adding this here just in case.
window.mpJQ = $;

// Define variables
var isFirefox;
var isSafari;
var _called = {};
var cipDebug = {};
var content_debug_msg;
var mcCombs;

// Unify messaging method - And eliminate callbacks (a message is replied with another message instead)
function messaging(message) {
    if (content_debug_msg > 4) cipDebug.log('%c Sending message to background:', 'background-color: #0000FF; color: #FFF; padding: 5px; ', message);
    if (isSafari) safari.self.tab.dispatchMessage("messageFromContent", message);
    else chrome.runtime.sendMessage(message);
};

// ContentScript Entry-Point
function init() {
    // Init variables
    isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    isSafari = typeof (safari) == 'object' ? true : false;
    content_debug_msg = (!isFirefox && !isSafari && chrome.runtime && !('update_url' in chrome.runtime.getManifest())) ? 55 : false;

    // Initialize logging
    if (content_debug_msg) {
        cipDebug.log = function (message) { this.log(message); }
        cipDebug.log = console.log.bind(window.console);
        cipDebug.warn = console.warn.bind(window.console);
        cipDebug.trace = console.trace.bind(window.console);
        cipDebug.error = console.error.bind(window.console);
    } else {
        cipDebug.log = function () { }
        cipDebug.log = function () { }
        cipDebug.warn = function () { }
        cipDebug.trace = function () { }
        cipDebug.error = function () { }
    }

    // Don't initialize in user targeting iframes, captchas, etc.
    var stopInitialization =
        window.self != window.top &&
        !window.location.hostname.match('chase.com') &&
        !window.location.hostname.match('apple.com') && (
            mpJQ('body').text().trim() == '' ||
            window.innerWidth <= 1 ||
            window.innerHeight <= 1 ||
            window.location.href.match('recaptcha') ||
            window.location.href.match('youtube') ||
            window.location.href.match('pixel')
        );
    if (stopInitialization) return;

    // Capture messages recieved from the background script
    startTemporaryEventListener();

    // Check if URL is BlackListed
    messaging({ 'action': 'check_if_blacklisted', 'url': window.location.href });
};

// Registers a temporary messageListener for msg's recieved from background script
function startTemporaryEventListener() {

    // Define temporary messageListener
    tempListenerCallback = function (req, sender, callback) {
        if (isSafari) req = req.message;
        if (content_debug_msg > 5) cipDebug.log('%c onMessage: %c ' + req.action, 'background-color: #68b5dc', 'color: #000000');
        else if (content_debug_msg > 4 && req.action != 'check_for_new_input_fields') cipDebug.log('%c onMessage: %c ' + req.action, 'background-color: #68b5dc', 'color: #000000');

        // check message recieved
        switch (req.action) {
            case 'response-check_if_blacklisted':

                // Remove event listener
                if (isSafari) safari.self.removeEventListener("message", tempListenerCallback, false);
                else chrome.runtime.onMessage.removeListener(tempListenerCallback);

                // Init the content scripts
                startContentScripts(req);
                break;
        }
    };

    // Register the temporary messageListener
    if (isSafari) safari.self.addEventListener("message", tempListenerCallback, false);
    else {
        chrome.runtime.onMessage.removeListener(tempListenerCallback);
        chrome.runtime.onMessage.addListener(tempListenerCallback);
    }
};

// Checks the response of the "check_if_blacklisted" msg and initializes the content scripts
function startContentScripts(data) {
    // If URL is BlackListed, don't initialize content scripts
    if (data && data.isBlacklisted) return;

    // Initialize MessageListener
    cipEvents.startEventHandling();

    // Initialize mcCombinations
    mcCombs = new mcCombinations();
    mcCombs.settings.debugLevel = content_debug_msg;

    // Delete tab info from previous navigation
    messaging({ 'action': 'remove_credentials_from_tab_information' });

    // Inform background script initialization is complete
    messaging({ 'action': 'content_script_loaded' });
};

// Deprecated code
function _f(fieldId) {
    var field = (fieldId) ? mpJQ("input[data-mp-id='" + fieldId + "']:first") : [];
    return (field.length > 0) ? field : null;
};

// Newer version of _f()
function _fs(fieldId) {
    var field = (fieldId) ? mpJQ("input[data-mp-id='" + fieldId + "']:first,select[data-mp-id='" + fieldId + "']:first").first() : [];
    return (field.length > 0) ? field : null;
};

// Start Script
init();