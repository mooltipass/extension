/*******************************************************************************************
  Module:       cip
  Description:  Acts as the main script within the content-scripts.
                With every new navigation checks for input fields.
                Tries to retrieve any stored credentials for the current URL if input fields found.
                Handles ContextMenu actions.
/*******************************************************************************************
  Copyright:    (c) 2018
  Created:      02/25/2018 (mm/dd/yyyy)
********************************************************************************************/
var cip = {
    
    settings: {},           // Settings of chromeIPass
    u: null,                // Username field which will be set on focus
    p: null,                // Password field which will be set on focus
    url: null,              // document.location
    submitUrl: null,        // Request-url of the form in which the field is located
    credentials: [],        // Received credentials from KeePassHTTP
    trapSubmit: true,
    visibleInputsHash: 0,
    waitingForPost: true,   // Post could be either by form submit or XHR. Either way, we wait for it.
    autoSubmit: true,       // Auto-submit form
    fillPasswordOnly: false,// Flag setting that we only wish to fill in the password

    init: function ()
    {
        cipDebug.warn('Starting CIP');
        // Grab settings from mcCombinations.
        cip.settings = mcCombs.settings;
        cip.initCredentialFields();
    },

    initCredentialFields: function (forceCall)
    {
        if (_called.initCredentialFields && !forceCall) return;

        _called.initCredentialFields = true;

        var inputs = cipFields.getAllFields();
        cipDebug.log('initCredentialFields(): ' + inputs.length + ' input fields found');

        cip.visibleInputsHash = cipFields.getHashForVisibleFields(inputs);

        cipFields.prepareVisibleFieldsWithID("select");
        cipDebug.log('about to start pwd gen');
        cip.initPasswordGenerator(inputs);

        var searchForAllCombinations = true;
        var manualSpecifiedFields = false;
        if (cipFields.useDefinedCredentialFields()) {
            searchForAllCombinations = false;
            manualSpecifiedFields = true;
        }

        var inputs = cipFields.getAllFields();

        /*
         * Uncomment next line of code for development tests (will prevent forms to auto-submit)
        */
        //cip.autoSubmit = false; // Temporarily forbid auto-submit

        // get all combinations of username + password fields
        cipFields.combinations = cipFields.getAllCombinations(inputs);

        cipFields.prepareCombinations(cipFields.combinations);

        //cipDebug.log('Combinations found:', cipFields.combinations );
        if (cipFields.combinations.length == 0) {
            if (!isSafari) chrome.runtime.sendMessage({
                'action': 'show_default_browseraction'
            });
            return;
        }

        // If manual specified credential fields are not available on the current page (defined, 2-page login)
        // --> don't trigger request for credentials to device
        if (manualSpecifiedFields) {
            if (!cipFields.isSpecifiedFieldAvailable(cipFields.combinations[0].username)
                && !cipFields.isSpecifiedFieldAvailable(cipFields.combinations[0].password)
                && (!cipFields.combinations[0].fields || (cipFields.combinations[0].fields.length > 0 && !cipFields.isSpecifiedFieldAvailable(cipFields.combinations[0].fields[0])))) {
                chrome.runtime.sendMessage({
                    'action': 'show_default_browseraction'
                });
                return;
            }
        }

        cip.url = document.location.origin;
        cip.submitUrl = cip.getFormActionUrl(cipFields.combinations[0]);

        chrome.runtime.sendMessage({
            'action': 'retrieve_credentials',
            'args': [cip.url, cip.submitUrl, true, true]
        }, cip.retrieveCredentialsCallback);
    },

    /**
    * Initializes the password generator [cipPassword].
    * Goes through all the <INPUT> fields of type "password" & initializes them.
    *
    * @param {Array} inputs
    *   Array of all <INPUT> fields found on the page.
    */
    initPasswordGenerator: function (inputs)
    {
        if (content_debug_msg > 4) cipDebug.log('%c cip: %c initPasswordGenerator', 'background-color: #b78e1b', 'color: #333333');
        if (mcCombs.settings.usePasswordGenerator) {
            cipPassword.init();

            for (var i = 0; i < inputs.length; i++) {
                if (inputs[i] && inputs[i].attr("type") && inputs[i].attr("type").toLowerCase() == "password") {
                    if (!mpJQ(inputs[i]).hasClass('mooltipass-password-do-not-update')) {
                        cipPassword.initField(inputs[i], inputs, i);
                    }
                }
            }
        }
    },

    /**
    * Checks if their are any new <INPUT> fields available on the page.
    * Calculates a hash of all visible <INPUT> fields on the page & compares it with the previusly calculted hash.
    * If both hash values are the same, then no new fields found.
    * Otherwise, updates the new hash value.
    */
    checkForNewInputs: function ()
    {
        var fields = cipFields.getAllFields();
        var hash = cipFields.getHashForVisibleFields(fields);

        if (hash != cip.visibleInputsHash) {
            // WAIT for Mooltipass App or Moolticute to answer before sending init to fields.
            if (cip.settings.status) {
                //cip.initCredentialFields( true );
                cip.visibleInputsHash = hash;
                // Somehow dynamically created input doesn't show up in detectCombination,
                // even when inputs hash is changed.
                setTimeout(function () { mcCombs.detectCombination() }, 500);
            }
        }
    },

    /**
    * Triggers when the background-script responds to the "retrieve_credentials" message.
    *
    * @param {Object} credentials
    *   Object carrying the Username and password info required for logging in.
    * @param {Number} dontAutoFillIn
    *   Resembling a boolean value. [TRUE] for auto-fill-in, [FALSE] otherwise.
    */
    retrieveCredentialsCallback: function (credentials, dontAutoFillIn)
    {
        cipDebug.trace('cip.retrieveCredentialsCallback()', credentials);
        if (!credentials) return;

        if (cipFields.combinations.length > 0) {
            cip.u = _f(cipFields.combinations[0].username);
            cip.p = _f(cipFields.combinations[0].password);
        }

        if (cip.winningCombination) {
            // Associate the fields to the winning combination (just in case they dissapear -> Now with values!!!!)
            for (field in cip.winningCombination.fields) {
                cip.winningCombination.savedFields[field] = {
                    name: cip.winningCombination.fields[field].attr(cip.winningCombination.savedFields[field].submitPropertyName ? cip.winningCombination.savedFields[field].submitPropertyName : 'name'),
                }
            }
        }

        if (credentials.length > 0) {
            cip.credentials = credentials;
            cip.prepareFieldsForCredentials(!Boolean(dontAutoFillIn));


            if (cip.winningCombination) {
                // Associate the fields to the winning combination (just in case they dissapear -> Now with values!!!!)
                for (field in cip.winningCombination.fields) {
                    cip.winningCombination.savedFields[field].value = cip.winningCombination.fields[field].val();
                }

                // Check if WinningCombination wants to run something after values have been filled
                if (cip.winningCombination.postFunction) cip.winningCombination.postFunction.call(this, cip.winningCombination.fields);
            }
        }
    },

    prepareFieldsForCredentials: function (autoFillInForSingle)
    {
        cipDebug.log('cip.prepareFieldsForCredentials()', cipFields.combinations[0], cip.credentials);

        // only one login returned by mooltipass
        var combination = null;
        if (!cip.u && cipFields.combinations.length > 0) {
            cip.u = _f(cipFields.combinations[0].username);
        }
        if (!cip.p && cipFields.combinations.length > 0) {
            cip.p = _f(cipFields.combinations[0].password);
        }

        if (cip.u && cip.fillPasswordOnly === false) {

            cip.u.val('');
            cip.u.sendkeys(cip.credentials[0].Login);
            //cip.u.val(cip.credentials[0].Login);
            // Due to browser extension sand-boxing, and basic jQuery functionality, you cannot trigger a non-jQuery click event with trigger or click.
            cip.u[0].dispatchEvent(new Event('change'));

        }
        if (cip.p) {
            cip.p.val('');
            cip.p.sendkeys(cip.credentials[0].Password);
            // Due to browser extension sand-boxing, and basic jQuery functionality, you cannot trigger a non-jQuery click event with trigger or click.
            cip.p[0].dispatchEvent(new Event('change'));
        }
        cip.fillPasswordOnly = false;
    },

    /**
    * Extracts the action URL from the current form.
    *
    * @param {Object} combination
    *   The combination object associated to the current form.
    * @returns {String} action
    *   String resembling the action URL of the form.
    */
    getFormActionUrl: function (combination)
    {
        var field = _f(combination.password) || _f(combination.username);

        if (field == null) {
            return null;
        }

        var form = field.closest("form");
        var action = null;

        if (form && form.length > 0) {
            action = form[0].action;
        }

        if (typeof (action) != "string" || action == "" || action.indexOf('{') > -1) {
            action = document.location.origin + document.location.pathname;
        }

        cipDebug.log("action url: " + action);
        return action;
    },

    fillInCredentials: function (combination, onlyPassword, suppressWarnings)
    {
        var action = cip.getFormActionUrl(combination);

        var u = _f(combination.username);
        var p = _f(combination.password);

        if (combination.isNew) {
            // initialize form-submit for remembering credentials
            var fieldId = combination.password || combination.username;
            var field = _f(fieldId);
        }

        if (u) {
            cip.u = u;
        }
        if (p) {
            cip.p = p;
        }

        if (cip.url == document.location.origin && cip.submitUrl == action && cip.credentials.length > 0) {
            cip.fillIn(combination, onlyPassword, suppressWarnings);
        }
        else {
            cip.url = document.location.origin;
            cip.submitUrl = action;

            chrome.runtime.sendMessage({
                'action': 'retrieve_credentials',
                'args': [cip.url, cip.submitUrl, true, true]
            }, function (credentials) {
                cipDebug.log('cip.fillInCredentials()');
                cip.retrieveCredentialsCallback(credentials, true);
                cip.fillIn(combination, onlyPassword, suppressWarnings);
            });
        }
    },

    /**
    * Triggers when the user selects the "Fill user+pass" context-menu.
    */
    retrieveAndFillUserAndPassword: function ()
    {
        cip.initCredentialFields(true);
    },

    /**
    * Triggers when the user selects the "Fill pass only" context-menu.
    */
    retrieveAndFillPassword: function ()
    {
        cip.fillPasswordOnly = true;
        this.initCredentialFields(true);
    },

    fillInFromActiveElement: function (suppressWarnings)
    {
        var el = document.activeElement;
        if (el.tagName.toLowerCase() != "input") {
            if (cipFields.combinations.length > 0) {
                cip.fillInCredentials(cipFields.combinations[0], false, suppressWarnings);
            }
            return;
        }

        cipFields.setUniqueId(mpJQ(el));
        var fieldId = cipFields.prepareId(mpJQ(el).attr("data-mp-id"));
        var combination = null;
        if (el.type && el.type.toLowerCase() == "password") {
            combination = cipFields.getCombination("password", fieldId);
        }
        else {
            combination = cipFields.getCombination("username", fieldId);
        }
        delete combination.loginId;

        cip.fillInCredentials(combination, false, suppressWarnings);
    },

    fillInFromActiveElementPassOnly: function (suppressWarnings)
    {
        var el = document.activeElement;
        if (el.tagName.toLowerCase() != "input") {
            if (cipFields.combinations.length > 0) {
                cip.fillInCredentials(cipFields.combinations[0], false, suppressWarnings);
            }
            return;
        }

        cipFields.setUniqueId(mpJQ(el));
        var fieldId = cipFields.prepareId(mpJQ(el).attr("data-mp-id"));
        var combination = null;
        if (el.type && el.type.toLowerCase() == "password") {
            combination = cipFields.getCombination("password", fieldId);
        }
        else {
            combination = cipFields.getCombination("username", fieldId);
        }

        if (!_f(combination.password)) {
            var message = "Unable to find a password field";
            chrome.runtime.sendMessage({
                action: 'alert',
                args: [message]
            });
            return;
        }

        delete combination.loginId;

        cip.fillInCredentials(combination, true, suppressWarnings);
    },

    setValue: function (field, value)
    {
        if (field.is("select")) {
            value = value.toLowerCase().trim();
            mpJQ("option", field).each(function () {
                if (mpJQ(this).text().toLowerCase().trim() == value) {
                    field.val(mpJQ(this).val());
                    return false;
                }
            });
        }
        else {
            field.val(value);
            field.trigger('input');
        }
    },

    fillInStringFields: function (fields, StringFields, filledInFields)
    {
        cipDebug.log('cip.fillInStringFields()');
        var $filledIn = false;

        filledInFields.list = [];
        if (fields && StringFields && fields.length > 0 && StringFields.length > 0) {
            for (var i = 0; i < fields.length; i++) {
                var $sf = _fs(fields[i]);
                if ($sf && StringFields[i]) {
                    //$sf.val(StringFields[i].Value);
                    cip.setValue($sf, StringFields[i].Value);
                    filledInFields.list.push(fields[i]);
                    $filledIn = true;
                }
            }
        }

        return $filledIn;
    },

    fillIn: function (combination, onlyPassword, suppressWarnings)
    {
        // no credentials available
        if (cip.credentials.length == 0 && !suppressWarnings) {
            var message = "No logins found.";
            chrome.runtime.sendMessage({
                action: 'alert',
                args: [message]
            });
            return;
        }

        var uField = _f(combination.username);
        var pField = _f(combination.password);

        // exactly one pair of credentials available
        if (cip.credentials.length == 1) {
            var filledIn = false;
            if (uField && !onlyPassword) {
                uField.val(cip.credentials[0].Login);
                filledIn = true;
            }
            if (pField) {
                pField.attr("type", "password");
                pField.val(cip.credentials[0].Password);
                pField.data("unchanged", true);
                filledIn = true;
            }

            var list = {};
            if (cip.fillInStringFields(combination.fields, cip.credentials[0].StringFields, list)) {
                filledIn = true;
            }

            if (!filledIn) {
                if (!suppressWarnings) {
                    var message = "Error #101\nCannot find fields to fill in.";
                    chrome.runtime.sendMessage({
                        action: 'alert',
                        args: [message]
                    });
                }
            }
        }
        // specific login id given
        else if (combination.loginId != undefined && cip.credentials[combination.loginId]) {
            var filledIn = false;
            if (uField) {
                uField.val(cip.credentials[combination.loginId].Login);
                filledIn = true;
            }

            if (pField) {
                pField.val(cip.credentials[combination.loginId].Password);
                pField.data("unchanged", true);
                filledIn = true;
            }

            var list = {};
            if (cip.fillInStringFields(combination.fields, cip.credentials[combination.loginId].StringFields, list)) {
                filledIn = true;
            }

            if (!filledIn) {
                if (!suppressWarnings) {
                    var message = "Error #102\nCannot find fields to fill in.";
                    chrome.runtime.sendMessage({
                        action: 'alert',
                        args: [message]
                    });
                }
            }
        }
        // multiple credentials available
        else {
            // check if only one password for given username exists
            var countPasswords = 0;

            if (uField) {
                var valPassword = "";
                var valUsername = "";
                var valStringFields = [];
                var valQueryUsername = uField.val().toLowerCase();

                // find passwords to given username (even those with empty username)
                for (var i = 0; i < cip.credentials.length; i++) {
                    if (cip.credentials[i].Login.toLowerCase() == valQueryUsername) {
                        countPasswords += 1;
                        valPassword = cip.credentials[i].Password;
                        valUsername = cip.credentials[i].Login;
                        valStringFields = cip.credentials[i].StringFields;
                    }
                }

                // for the correct alert message: 0 = no logins, X > 1 = too many logins
                if (countPasswords == 0) {
                    countPasswords = cip.credentials.length;
                }

                // only one mapping username found
                if (countPasswords == 1) {
                    if (!onlyPassword) {
                        uField.val(valUsername);
                    }
                    if (pField) {
                        pField.val(valPassword);
                        pField.data("unchanged", true);
                    }

                    var list = {};
                }

                // user has to select correct credentials by himself
                if (countPasswords > 1) {
                    if (!suppressWarnings) {
                        var message = "Error #105\nMore than one login was found in KeePass!\n" +
                            "Press the chromeIPass icon for more options.";
                        chrome.runtime.sendMessage({
                            action: 'alert',
                            args: [message]
                        });
                    }
                }
                else if (countPasswords < 1) {
                    if (!suppressWarnings) {
                        var message = "Error #103\nNo credentials for given username found.";
                        chrome.runtime.sendMessage({
                            action: 'alert',
                            args: [message]
                        });
                    }
                }
            }
            else {
                if (!suppressWarnings) {
                    var message = "Error #104\nMore than one login was found in KeePass!\n" +
                        "Press the chromeIPass icon for more options.";
                    chrome.runtime.sendMessage({
                        action: 'alert',
                        args: [message]
                    });
                }
            }
        }
    },

    /**
    * Triggers when the user selects the "Save credentials" context-menu.
    * Checks if user entered credentials into the credentials fields.
    * Intializes their storage by calling cip.rememberCredentials().
    */
    contextMenuRememberCredentials: function ()
    {
        var el = document.activeElement;
        if (el.tagName.toLowerCase() != "input") {
            return;
        }

        cipFields.setUniqueId(mpJQ(el));
        var fieldId = cipFields.prepareId(mpJQ(el).attr("data-mp-id"));
        var combination = null;
        if (el.type && el.type.toLowerCase() == "password") {
            combination = cipFields.getCombination("password", fieldId);
        }
        else {
            combination = cipFields.getCombination("username", fieldId);
        }

        var usernameValue = "";
        var passwordValue = "";

        var usernameField = _f(combination.username);
        var passwordField = _f(combination.password);

        if (usernameField) {
            usernameValue = usernameField.val();
        }
        if (passwordField) {
            passwordValue = passwordField.val();
        }

        if (!cip.rememberCredentials(null, usernameField, usernameValue, passwordField, passwordValue)) {
            alert("Could not detect changed credentials.");
        }
    },

    /**
    * Stores the newly input credentials by the user.
    * Updates the cip.credentials list with the new credentials.
    * Sends a "update_notify" message to the background script.
    *
    * @param {object} event
    *   Object resembling the event that triggered.
    * @param {HTMLElement} usernameField
    *   <INPUT> username field.
    * @param {String} usernameValue
    *   String username.
    * @param {HTMLElement} passwordField
    *   <INPUT> password field.
    * @param {String} passwordValue
    *   String password.
    */
    rememberCredentials: function (event, usernameField, usernameValue, passwordField, passwordValue)
    {
        cipDebug.log('rememberCredentials()', arguments);
        // no password given or field cleaned by a site-running script
        // --> no password to save
        if (passwordValue == "") {
            cipDebug.log('rememberCredentials() no password value');
            return false;
        }

        if (!cip.trapSubmit) {
            cipDebug.log('rememberCredentials() trap disabled');
            cip.trapSubmit = true;
            return false;
        }


        var usernameExists = false;
        var nothingChanged = false;
        for (var i = 0; i < cip.credentials.length; i++) {
            if (cip.credentials[i].Login == usernameValue && cip.credentials[i].Password == passwordValue) {
                nothingChanged = true;
                break;
            }

            if (cip.credentials[i].Login == usernameValue) {
                usernameExists = true;
            }
        }

        if (!nothingChanged) {
            if (!usernameExists) {
                for (var i = 0; i < cip.credentials.length; i++) {
                    if (cip.credentials[i].Login == usernameValue) {
                        usernameExists = true;
                        break;
                    }
                }
            }
            var credentialsList = [];
            for (var i = 0; i < cip.credentials.length; i++) {
                credentialsList.push({
                    "Login": cip.credentials[i].Login,
                    "Name": cip.credentials[i].Name,
                    "Uuid": cip.credentials[i].Uuid
                });
            }

            var url = event.target && event.target.action;
            // Action property can be DOM element with name="action".
            if (!url || typeof url != 'string' || url == 'javascript:void(0)' || url.indexOf('javascript') == 0) {
                url = document.location.href;
                if (url.indexOf("?") > 0) {
                    url = url.substring(0, url.indexOf("?"));
                    if (url.length < document.location.origin.length) {
                        url = document.location.origin;
                    }
                }
            }

            cipDebug.log('rememberCredentials - sending update_notify');
            messaging({
                'action': 'update_notify',
                'args': [usernameValue, passwordValue, url, usernameExists, credentialsList]
            });

            return true;
        } else {
            cipDebug.log('rememberCredentials - nothing changed');
        }

        return false;
    }
};