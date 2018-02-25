/*******************************************************************************************
  Module:		cipFields
  Copyright:	(c) 2018
  Created:		02/25/2018 (mm/dd/yyyy)
********************************************************************************************/
var cipFields = {

    inputQueryPattern: "input[type='text'], input[type='email'], input[type='password'], input[type='tel'], input[type='number'], input:not([type])",
    uniqueNumber: 342845638,    // unique number as new IDs for input fields
    combinations: [],           // objects with combination of username + password fields

    setUniqueId: function (field)
    {
        if (field && !field.attr("data-mp-id")) {
            // use ID of field if it is unique
            // yes, it should be, but there are many bad developers outside...
            var fieldId = field.attr("id");
            if (fieldId) {
                var foundIds = mpJQ("input#" + cipFields.prepareId(fieldId));
                if (foundIds.length == 1) {
                    field.attr("data-mp-id", fieldId);
                    return;
                }
            }

            // create own ID if no ID is set for this field
            cipFields.uniqueNumber += 1;
            field.attr("data-mp-id", "mpJQ" + String(cipFields.uniqueNumber));

            // Set unique id for form also.
            containerForm = field.closest('form');
            if (containerForm.length && !containerForm.data('mp-id')) {
                cipFields.setUniqueId(containerForm);
            }
        }
    },

    setFormUniqueId: function (field)
    {
        if (field && !field.attr("data-mp-id")) {
            // use ID of field if it is unique
            // yes, it should be, but there are many bad developers outside...
            var fieldId = field.attr("id");
            if (fieldId) {
                var foundIds = mpJQ("form#" + cipFields.prepareId(fieldId));
                if (foundIds.length == 1) {
                    field.attr("data-mp-id", fieldId);
                    return;
                }
            }

            // create own ID if no ID is set for this field
            cipFields.uniqueNumber += 1;
            field.attr("data-mp-id", "mpJQ" + String(cipFields.uniqueNumber));
        }
    },

    prepareId: function (id)
    {
        return id.replace(/[:#.,\[\]\(\)' "]/g, '');
    },

    getAllFields: function ()
    {
        //cipDebug.log('field call!');
        var fields = [];
        // get all input fields which are text, email or password and visible
        mpJQ(cipFields.inputQueryPattern).each(function () {
            if (mpJQ(this).hasClass('mooltipass-hash-ignore')) {
                return;
            }
            if (cipFields.isAvailableField(this)) {
                cipFields.setUniqueId(mpJQ(this));
                fields.push(mpJQ(this));
                //cipDebug.log('field detection!', mpJQ(this));
            }
        });

        return fields;
    },
    
    isSpecifiedFieldAvailable: function (fieldId)
    {
        return Boolean(_f(fieldId));
    },

    getHashForVisibleFields: function (fields)
    {
        var hash = '';
        for (var i = 0; i < fields.length; i++) {
            if (mpJQ(this).hasClass('mooltipass-hash-ignore')) {
                continue;
            }
            hash += fields[i].attr('type') + fields[i].data('mp-id');
        };

        return hash;
    },

    prepareVisibleFieldsWithID: function ($pattern)
    {
        mpJQ($pattern).each(function () {
            if (cipFields.isAvailableField(this)) {
                cipFields.setUniqueId(mpJQ(this));
            }
        });
    },

    isAvailableField: function ($field)
    {
        return (
            mpJQ($field).is(":visible")
            && mpJQ($field).css("visibility") != "hidden"
            && !mpJQ($field).is(':disabled')
            && mpJQ($field).css("visibility") != "collapsed"
            && mpJQ($field).css("visibility") != "collapsed"
        );
    },

    getAllCombinations: function (inputs)
    {
        cipDebug.log('cipFields.getAllCombinations');
        var fields = [];
        var uField = null;
        for (var i = 0; i < inputs.length; i++) {
            if (!inputs[i] || inputs[i].length < 1) {
                cipDebug.log("input discredited:");
                cipDebug.log(inputs[i]);
                continue;
            }
            else {
                cipDebug.log("examining input: ", inputs[i]);
            }

            if ((inputs[i].attr("type") && inputs[i].attr("type").toLowerCase() == "password") || (inputs[i].attr("data-placeholder-type") && inputs[i].attr("data-placeholder-type").toLowerCase() == "password")) {
                var uId = (!uField || uField.length < 1) ? null : cipFields.prepareId(uField.attr("data-mp-id"));

                var combination = {
                    "username": uId,
                    "password": cipFields.prepareId(inputs[i].attr("data-mp-id"))
                };
                fields.push(combination);

                // reset selected username field
                uField = null;
            }
            else {
                // username field
                uField = inputs[i];
            }
        }

        return fields;
    },

    getCombination: function (givenType, fieldId)
    {
        cipDebug.log("cipFields.getCombination");

        if (cipFields.combinations.length == 0) {
            if (cipFields.useDefinedCredentialFields()) {
                return cipFields.combinations[0];
            }
        }
        // use defined credential fields (already loaded into combinations)
        if (cip.settings["defined-credential-fields"] && cip.settings["defined-credential-fields"][document.location.origin]) {
            return cipFields.combinations[0];
        }

        for (var i = 0; i < cipFields.combinations.length; i++) {
            if (cipFields.combinations[i][givenType] == fieldId) {
                return cipFields.combinations[i];
            }
        }

        // find new combination
        var combination = {
            "username": null,
            "password": null
        };

        var newCombi = false;
        if (givenType == "username") {
            var passwordField = cipFields.getPasswordField(fieldId, true);
            var passwordId = null;
            if (passwordField && passwordField.length > 0) {
                passwordId = cipFields.prepareId(passwordField.attr("data-mp-id"));
            }
            combination = {
                "username": fieldId,
                "password": passwordId
            };
            newCombi = true;
        }
        else if (givenType == "password") {
            var usernameField = cipFields.getUsernameField(fieldId, true);
            var usernameId = null;
            if (usernameField && usernameField.length > 0) {
                usernameId = cipFields.prepareId(usernameField.attr("data-mp-id"));
            }
            combination = {
                "username": usernameId,
                "password": fieldId
            };
            newCombi = true;
        }

        if (combination.username || combination.password) {
            cipFields.combinations.push(combination);
        }

        if (newCombi) {
            combination.isNew = true;
        }
        return combination;
    },

    getUsernameField: function (passwordId, checkDisabled)
    {
        var passwordField = _f(passwordId);
        if (!passwordField) {
            return null;
        }

        if (cipDefine.selection && cipDefine.selection.username !== null) {
            return _f(cipDefine.selection.username);
        }

        var form = passwordField.closest("form")[0];
        var usernameField = null;

        // search all inputs on this one form
        if (form) {
            mpJQ(cipFields.inputQueryPattern, form).each(function () {
                cipFields.setUniqueId(mpJQ(this));
                if (mpJQ(this).attr("data-mp-id") == passwordId) {
                    // break
                    return false;
                }

                if (mpJQ(this).attr("type") && mpJQ(this).attr("type").toLowerCase() == "password") {
                    // continue
                    return true;
                }

                usernameField = mpJQ(this);
            });
        }
        // search all inputs on page
        else {
            var inputs = cipFields.getAllFields();
            cip.initPasswordGenerator(inputs);
            for (var i = 0; i < inputs.length; i++) {
                if (inputs[i].attr("data-mp-id") == passwordId) {
                    break;
                }

                if (inputs[i].attr("type") && inputs[i].attr("type").toLowerCase() == "password") {
                    continue;
                }

                usernameField = inputs[i];
            }
        }

        if (usernameField && !checkDisabled) {
            var usernameId = usernameField.attr("data-mp-id");
            // check if usernameField is already used by another combination
            for (var i = 0; i < cipFields.combinations.length; i++) {
                if (cipFields.combinations[i].username == usernameId) {
                    usernameField = null;
                    break;
                }
            }
        }

        cipFields.setUniqueId(usernameField);

        return usernameField;
    },

    getPasswordField: function (usernameId, checkDisabled)
    {
        cipDebug.log('cipFields.getPasswordField');
        var usernameField = _f(usernameId);
        if (!usernameField) {
            return null;
        }

        if (cipDefine.selection && cipDefine.selection.password !== null) {
            return _f(cipDefine.selection.password);
        }

        var form = usernameField.closest("form")[0];
        var passwordField = null;

        // search all inputs on this one form
        if (form) {
            passwordField = mpJQ("input[type='password']:first", form);
            if (passwordField.length < 1) {
                passwordField = null;
            }

            cipPassword.init();
            cipPassword.initField(passwordField);
        }
        // search all inputs on page
        else {
            var inputs = cipFields.getAllFields();
            cip.initPasswordGenerator(inputs);

            var active = false;
            for (var i = 0; i < inputs.length; i++) {
                if (inputs[i].attr("data-mp-id") == usernameId) {
                    active = true;
                }
                if (active && mpJQ(inputs[i]).attr("type") && mpJQ(inputs[i]).attr("type").toLowerCase() == "password") {
                    passwordField = inputs[i];
                    break;
                }
            }
        }

        if (passwordField && !checkDisabled) {
            var passwordId = passwordField.attr("data-mp-id");
            // check if passwordField is already used by another combination
            for (var i = 0; i < cipFields.combinations.length; i++) {
                if (cipFields.combinations[i].password == passwordId) {
                    passwordField = null;
                    break;
                }
            }
        }

        cipFields.setUniqueId(passwordField);

        return passwordField;
    },

    prepareCombinations: function (combinations)
    {
        cipDebug.log("prepareCombinations, length: " + combinations.length);
        for (var i = 0; i < combinations.length; i++) {
            // disable autocomplete for username field
            if (_f(combinations[i].username)) {
                _f(combinations[i].username).attr("autocomplete", "off");
            }

            var pwField = _f(combinations[i].password);
            // needed for auto-complete: don't overwrite manually filled-in password field
            if (pwField && !pwField.data("cipFields-onChange")) {
                pwField.data("cipFields-onChange", true);
                pwField.change(function () {
                    mpJQ(this).data("unchanged", false);
                });
            }

            // initialize form-submit for remembering credentials
            var fieldId = combinations[i].password || combinations[i].username;
            var field = _f(fieldId);
        }
    },

    useDefinedCredentialFields: function ()
    {
        if (cip.settings["defined-credential-fields"] && cip.settings["defined-credential-fields"][document.location.origin]) {
            var creds = cip.settings["defined-credential-fields"][document.location.origin];

            var $found = _f(creds.username) || _f(creds.password);
            for (var i = 0; i < creds.fields.length; i++) {
                if (_fs(creds.fields[i])) {
                    $found = true;
                    break;
                }
            }

            if ($found) {
                var fields = {
                    "username": creds.username,
                    "password": creds.password,
                    "fields": creds.fields
                };
                cipFields.combinations = [];
                cipFields.combinations.push(fields);

                return true;
            }
        }

        return false;
    }
};