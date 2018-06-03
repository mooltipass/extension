/*******************************************************************************************
  Module:       cipEvents
  Description:  Listens to incoming Background script messages.
                Listens to extension defined hotkey presses.
/*******************************************************************************************
  Copyright:    (c) 2018
  Created:      02/25/2018 (mm/dd/yyyy)
********************************************************************************************/
var cipEvents = {

    temporaryActions: {},

    /**
    * Creates an event handler for all incoming messages from the background-script [listenerCallback()].
    * Creates an event handler for key presses to detect HOTKEYS defined within the extension.
    * Creates an event handler that's triggered on switching between tabs to detect the current active in-focus tab.
    */
    startEventHandling: function ()
    {
        /*
        * Receive a message from WS_SOCKET or MooltiPass APP
        */
        listenerCallback = function (req, sender, callback) {
            //console.log( 'callback callback callback', req.message );
            if (isSafari) req = req.message;
            if (content_debug_msg > 5) cipDebug.log('%c onMessage: %c ' + req.action, 'background-color: #68b5dc', 'color: #000000');
            else if (content_debug_msg > 4 && req.action != 'check_for_new_input_fields') cipDebug.log('%c onMessage: %c ' + req.action, 'background-color: #68b5dc', 'color: #000000');

            // Check if we want to catch the standard path
            if (cipEvents.temporaryActions[req.action]) {
                cipEvents.temporaryActions[req.action](req);
                delete cipEvents.temporaryActions[req.action];
                return;
            }

            // Safari Specific
            switch (req.action) {
                case 'response-content_script_loaded':
                    mcCombs.init(function () {
                        cip.settings = mcCombs.settings;

                        var definedCredentialFields = cip.settings["defined-credential-fields"][document.location.origin]
                        cipDefine.selection.username = definedCredentialFields ? definedCredentialFields.username : null
                        cipDefine.selection.password = definedCredentialFields ? definedCredentialFields.password : null
                        cipDefine.selection.fields = definedCredentialFields ? definedCredentialFields.fields : null
                    });
                    break;
                case 'response-get_settings':
                    mcCombs.gotSettings(req.data);
                    break;
                case 'response-retrieve_credentials':
                    mcCombs.retrieveCredentialsCallback(req.data);
                    break;
                case 'response-generate_password':
                    var randomPassword = cipPassword.generatePasswordFromSettings(req.data);
                    messaging({
                        action: 'create_action',
                        args: [{
                            action: 'password_dialog_generated_password',
                            args: {
                                password: randomPassword
                            }
                        }]
                    });
                    break;
            }

            // TODO: change IF for SWITCH
            if ('action' in req) {
                if (req.action == "fill_user_pass_with_specific_login") {
                    if (cip.credentials[req.id]) {
                        var combination = null;
                        if (cip.u) {
                            cip.u.val(cip.credentials[req.id].Login);
                            combination = cipFields.getCombination("username", cip.u);
                            cip.u.focus();
                        }
                        if (cip.p) {
                            cip.p.val(cip.credentials[req.id].Password);
                            combination = cipFields.getCombination("password", cip.p);
                        }

                        var list = {};
                    }
                    // wish I could clear out _logins and _u, but a subsequent
                    // selection may be requested.
                }
                else if (req.action == "fill_user_pass") {
                    cip.retrieveAndFillUserAndPassword();
                }
                else if (req.action == "fill_pass_only") {
                    cip.retrieveAndFillPassword();
                }
                else if (req.action == "activate_password_generator") {
                    cip.initPasswordGenerator(cipFields.getAllFields());
                }
                else if (req.action == "remember_credentials") {
                    cip.contextMenuRememberCredentials();
                }
                else if (req.action == "choose_credential_fields") {
                    cipDefine.source = 'popup-status'
                    cipDefine.show();
                }
                else if (req.action == "clear_credentials") {
                    cipEvents.clearCredentials();
                }
                else if (req.action == "activated_tab") {
                    cipEvents.triggerActivatedTab();
                }
                else if (req.action == "check_for_new_input_fields") {
                    cip.checkForNewInputs();
                }
                else if (req.action == "redetect_fields") {
                    chrome.runtime.sendMessage({
                        "action": "get_settings",
                    }, function (response) {
                        cip.settings = response.data;
                        cip.initCredentialFields(true);
                    });
                }
                else if (req.action == "get_website_info") {
                    data = {
                        "url": window.location.href,
                        "html": mpJQ("html").html()
                    };
                    callback(data);
                }
                else if (req.action == "post_detected") {
                    mcCombs.postDetected(req.details ? req.details : req.post_data);
                }
                else if (req.action == "password_dialog_toggle_click") {
                    cipPassword.onIconClick(req.args.iconId)
                }
                else if (req.action == "password_dialog_hide") {
                    mpDialog.hide()
                }
                else if (req.action == "password_dialog_highlight_fields") {
                    mpDialog.onHighlightFields(req.args.highlight)
                }
                else if (req.action == "password_dialog_generate_password") {
                    mpDialog.onGeneratePassword()
                }
                else if (req.action == "password_dialog_copy_password_to_fields") {
                    mpDialog.onCopyPasswordToFields(req.args.password)
                }
                else if (req.action == "password_dialog_store_credentials") {
                    mpDialog.onStoreCredentials(req.args.username)
                }
                else if (req.action == "password_dialog_custom_credentials_selection") {
                    cipDefine.source = 'password-dialog'
                    mpDialog.onCustomCredentialsSelection()
                }
                else if (req.action == "custom_credentials_selection_hide") {
                    cipPassword.removeLoginIcons()
                    cipDefine.hide()
                    mcCombs.init();
                }
                else if (req.action == "custom_credentials_selection_request_mark_fields_data") {
                    cipDefine.retrieveMarkFields(req.args.pattern)
                }
                else if (req.action == "custom_credentials_selection_selected") {
                    cipDefine.selection = {
                        username: req.args.username || cipDefine.selection.username,
                        password: req.args.password || cipDefine.selection.password,
                        fields: req.args.fields || cipDefine.selection.fields
                    }

                    cip.settings["defined-credential-fields"][document.location.origin] =
                        cip.settings["defined-credential-fields"][document.location.origin] ||
                        {}

                    var definedCredentialFields = cip.settings["defined-credential-fields"][document.location.origin]
                    definedCredentialFields.username = req.args.username || definedCredentialFields.username
                    definedCredentialFields.password = req.args.password || definedCredentialFields.password
                    definedCredentialFields.fields = req.args.fieldsIds || definedCredentialFields.fields
                }
                else if (req.action == "custom_credentials_selection_cancelled") {
                    cip.settings["defined-credential-fields"][document.location.origin] = null
                    cipDefine.selection = {
                        username: null,
                        password: null,
                        fields: {}
                    }
                }
            }
        };

        if (isSafari) safari.self.addEventListener("message", listenerCallback, false);
        else {
            chrome.runtime.onMessage.removeListener(listenerCallback);
            chrome.runtime.onMessage.addListener(listenerCallback);
        }

        // Hotkeys for every page
        // ctrl + shift + p = fill only password
        // ctrl + shift + u = fill username + password
        window.addEventListener('keydown.mooltipass', function (e) {
            if (e.ctrlKey && e.shiftKey) {
                if (e.keyCode == 80) { // P
                    e.preventDefault();
                    cip.fillInFromActiveElementPassOnly(false);
                } else if (e.keyCode == 85) { // U
                    e.preventDefault();
                    cip.fillInFromActiveElement(false);
                }
            }
        }, false);

        window.addEventListener('focus.mooltipass', function () {
            chrome.runtime.sendMessage({ "action": "set_current_tab" });
        });
    },

    /**
    * Triggers when the content-script recieves a "clear_credentials" message from the background-script.
    * Clears the credentials for the current website from the local cache.
    */
    clearCredentials: function ()
    {
        cip.credentials = [];
    },

    /**
    * Triggers when the content-script recieves a "activated_tab" message from the background-script.
    * The background-script detects when the currentTab (in-focus) is switched.
    * It then sends a message to the content-script of the new in-focus currentTab ["activated_tab" message].
    */
    triggerActivatedTab: function ()
    {
        mcCombs.init();
    }
};