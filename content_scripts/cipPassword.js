/*******************************************************************************************
  Module:       cipPassword
  Description:  Handles input fields of type [PASSWORD].
                Adds both; login & password icons to input fields when detected.
                Listens to created icon's onClick event.
/*******************************************************************************************
  Copyright:    (c) 2018
  Created:      02/25/2018 (mm/dd/yyyy)
********************************************************************************************/
var cipPassword = {

    observedIcons: [],
    observingLock: false,

    /**
    * Initializes the cipPassword. Checks if its been intialized before or not, and proceeds on with the initialization.
    * Sets an ongoing action every 400Ms which calls checkObservedElements().
    * Sets an event handler which triggers on resizing the browser/tab and calls checkObservedElements().
    */
    init: function ()
    {
        if (content_debug_msg > 4) cipDebug.log('%c cipPassword: %c init', 'background-color: #ff8e1b', 'color: #333333');
        if ("initPasswordGenerator" in _called) return;

        _called.initPasswordGenerator = true;

        window.setInterval(function () {
            cipPassword.checkObservedElements();
        }, 400);

        $(window).on('resize', function () {
            cipPassword.checkObservedElements();
        })
    },

    /**
    * Marks the field as being initialized so as not to initialize it twice using the "mp-password-generator" attribute.
    * Creates an icon and appends it to the <INPUT> element.
    * Updates the attributes of the mpDialog.
    *
    * @param {HTMLElement} field
    *   <INPUT> element. Could be of type "username" or "password".
    * @param {Array} inputs
    *   Array containing all <INPUT> elements found on the page.
    * @param {number} pos
    *   The index of the [field] within the [inputs] arrays.
    */
    initField: function (field, inputs, pos)
    {
        if (content_debug_msg > 4) cipDebug.log('%c cipPassword: %c initField', 'background-color: #ff8e1b', 'color: #333333', field);
        if (!field || field.length != 1) return;

        if (field.data("mp-password-generator")) return;

        field.data("mp-password-generator", true);

        cipPassword.createIcon(field);
        mpDialog.precreate(inputs, field);

        var $found = false;
        if (inputs) {
            for (var i = pos + 1; i < inputs.length; i++) {
                if (inputs[i] && inputs[i].attr("type") && inputs[i].attr("type").toLowerCase() == "password") {
                    field.data("mp-genpw-next-field-id", inputs[i].data("mp-id"));
                    field.data("mp-genpw-next-is-password-field", (i == 0));
                    $found = true;
                    break;
                }
            }
        }

        field.data("mp-genpw-next-field-exists", $found);
    },

    /**
    * Sends a "generate_password" message to the background script.
    * Triggers as a result of the user clicking on the "Re-generate" password button within the UI/password-dialog.html
    * Passes the "usePasswordGeneratorLength" stored within the cip.settings to the background script.
    */
    generatePassword: function ()
    {
        messaging({ action: 'generate_password', args: [cip.settings['usePasswordGeneratorLength']] });
    },

    /**
    * Generates a new password hash from the password settings stored within the extension.
    *
    * @param {object} passwordSettings
    *   Object containing an array of seeds and a structure containing the extension settings.
    *   {seeds: [], settings: {}}
    *   Provided via the background script.
    * @returns {String} hash
    *   String hash resembling the new generated password.
    */
    generatePasswordFromSettings: function (passwordSettings)
    {
        var charactersLowercase = 'abcdefghijklmnopqrstuvwxyz';
        var charactersUppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var charactersNumbers = '1234567890';
        var charactersSpecial = '!$%*()_+{}-[]:"|;\'?,./';
        var hash = "";
        var possible = "";
        var length = cip.settings['usePasswordGeneratorLength'];

        if (passwordSettings.settings["usePasswordGeneratorLowercase"]) possible += charactersLowercase;
        if (passwordSettings.settings["usePasswordGeneratorUppercase"]) possible += charactersUppercase;
        if (passwordSettings.settings["usePasswordGeneratorNumbers"]) possible += charactersNumbers;
        if (passwordSettings.settings["usePasswordGeneratorSpecial"]) possible += charactersSpecial;

        for (var i = 0; i < length; i++) {
            hash += possible.charAt(Math.floor(passwordSettings.seeds[i] * possible.length));
        }
        return hash;
    },

    /**
    * Removes the icons appended to the UserName and password <INPUT> fields.
    */
    removeLoginIcons: function ()
    {
        var PREFIX = 'mp-ui-login-icon',
            SELECTOR = '.' + PREFIX;

        mpJQ(SELECTOR).remove()
    },

    /**
    * Creates a logIn icon and appends it to the "username" <INPUT> field.
    * Checks if the username <INPUT> field contains an icon, if not, creates a new one.
    *
    * @param {HTMLElement} field
    *   The username <INPUT> field.
    */
    createLoginIcon: function (field)
    {
        var PREFIX = 'mp-ui-login-icon',
            SELECTOR = '.' + PREFIX;

        // Return if field isn't defined.
        if (!field) return

        // Prevent showing icon if password field is less than 100px by width.
        if (field[0].clientWidth < 100) return

        // Prevent showing icon if password field is hidden by width or height.
        if (field[0].clientWidth < 2 || field[0].clientHeight < 2) return

        // Prevent showing icon if the password field has a tabIndex of -1 
        if (field.prop('tabindex') == -1) return

        if (content_debug_msg > 4) cipDebug.log('%c cipPassword: %c createLoginIcon', 'background-color: #ff8e1b', 'color: #333333', field);

        // Check if there are other icons in the page
        var currentIcons = mpJQ(SELECTOR);
        var iconIndex = currentIcons.length;
        if (iconIndex > 0) {
            for (var I = 0; I < iconIndex; I++) {
                if (field.data("mp-id") === mpJQ(currentIcons[I]).data('mp-genpw-field-id')) { // An icon for this field already exists
                    return
                }
            }
        }

        var $className = (field.outerHeight() > 28)
            ? PREFIX + '__big'
            : PREFIX + '__small';
        var $size = (field.outerHeight() > 28) ? 24 : 16;
        var $offset = Math.floor((field.outerHeight() - $size) / 2);
        $offset = ($offset < 0) ? 0 : $offset;

        var $zIndex = 0;
        var $zIndexField = field;
        var z;
        var c = 0;
        while ($zIndexField.length > 0) {
            if (c > 100 || $zIndexField[0].nodeName == "#document") {
                break;
            }
            z = $zIndexField.css("z-index");
            if (!isNaN(z) && parseInt(z) > $zIndex) {
                $zIndex = parseInt(z);
            }
            $zIndexField = $zIndexField.parent();
            c++;
        }

        if (isNaN($zIndex) || $zIndex < 1) {
            $zIndex = 1;
        }
        $zIndex += 1;

        var iframe = document.createElement('iframe');
        iframe.src = cip.settings['extension-base'] + 'ui/login-icon/login-icon.html?' +
            encodeURIComponent(JSON.stringify({
                type: $size == 16 ? 'small' : 'big',
                iconId: PREFIX + '-' + field.data('mp-id'),
                settings: cip.settings
            }));

        var $icon = $(iframe)
            .attr('id', PREFIX + '-' + field.data('mp-id'))
            .attr('tabindex', -1)
            .addClass(PREFIX)
            .addClass($className)
            .css("z-index", $zIndex)
            .data("size", $size)
            .data("offset", $offset)
            .data("index", iconIndex)
            .data("mp-genpw-field-id", field.data("mp-id"));

        cipPassword.setIconPosition($icon, field);
        cipPassword.observedIcons.push($icon);
        $icon.insertAfter(field);
    },

    /**
    * Creates a password icon and appends it to the "password" <INPUT> field.
    * Checks if the password <INPUT> field contains an icon, if not, creates a new one.
    *
    * @param {HTMLElement} field
    *   The password <INPUT> field.
    */
    createIcon: function (field)
    {
        var PREFIX = 'mp-ui-password-dialog-toggle',
            SELECTOR = '.' + PREFIX;

        // Return if field isn't defined.
        if (!field) return

        // Prevent showing icon if password field is less than 100px by width.
        if (field[0].clientWidth < 100) return

        // Prevent showing icon if password field is hidden by width or height.
        if (field[0].clientWidth < 2 || field[0].clientHeight < 2) return

        // Prevent showing icon if the password field has a tabIndex of -1 
        if (field.prop('tabindex') == -1) return

        if (content_debug_msg > 4) cipDebug.log('%c cipPassword: %c createIcon', 'background-color: #ff8e1b', 'color: #333333', field);

        // Check if there are other icons in the page
        var currentIcons = mpJQ(SELECTOR);
        var iconIndex = currentIcons.length;
        if (iconIndex > 0) {
            for (var I = 0; I < iconIndex; I++) {
                if (field.data("mp-id") === mpJQ(currentIcons[I]).data('mp-genpw-field-id')) { // An icon for this field already exists
                    mpJQ(currentIcons[I]).remove();
                }
            }
        }

        var $className = (field.outerHeight() > 28)
            ? PREFIX + '__big'
            : PREFIX + '__small';
        var $size = (field.outerHeight() > 28) ? 24 : 16;
        var $offset = Math.floor((field.outerHeight() - $size) / 2);
        $offset = ($offset < 0) ? 0 : $offset;

        var $zIndex = 0;
        var $zIndexField = field;
        var z;
        var c = 0;
        while ($zIndexField.length > 0) {
            if (c > 100 || $zIndexField[0].nodeName == "#document") {
                break;
            }
            z = $zIndexField.css("z-index");
            if (!isNaN(z) && parseInt(z) > $zIndex) {
                $zIndex = parseInt(z);
            }
            $zIndexField = $zIndexField.parent();
            c++;
        }

        if (isNaN($zIndex) || $zIndex < 1) {
            $zIndex = 1;
        }
        $zIndex += 1;

        var iframe = document.createElement('iframe');
        iframe.src = cip.settings['extension-base'] + 'ui/password-dialog-toggle/password-dialog-toggle.html?' +
            encodeURIComponent(JSON.stringify({
                type: $size == 16 ? 'small' : 'big',
                iconId: PREFIX + '-' + field.data('mp-id'),
                settings: cip.settings
            }));

        var $icon = $(iframe)
            .attr('id', PREFIX + '-' + field.data('mp-id'))
            .attr('tabindex', -1)
            .addClass(PREFIX)
            .addClass($className)
            .css("z-index", $zIndex)
            .data("size", $size)
            .data("offset", $offset)
            .data("index", iconIndex)
            .data("mp-genpw-field-id", field.data("mp-id"));

        cipPassword.setIconPosition($icon, field);
        cipPassword.observedIcons.push($icon);
        $icon.insertAfter(field);
    },

    /**
    * Triggers when the user clicks on icons appended to the "password" field.
    * Toggels the displays the UI/password-dialog.html <IFRAME>.
    *
    * @param {String} iconId
    *   String resembling the ID of the clicked icon.
    */
    onIconClick: function (iconId)
    {
        target = $('#' + iconId)

        if (!target.is(":visible")) {
            target.remove();
            return;
        }

        // Check if the current form has a combination associated to it
        var fieldID = target.data('mp-genpw-field-id');

        var associatedInput = mpJQ('#' + fieldID + ',input[data-mp-id=' + fieldID + ']');
        var containerForm = associatedInput.closest('form');
        var comb = false;

        // Search for combination departing from FORM (probably refactor to be a sole function in mcCombs)
        if (containerForm.length == 0) comb = mcCombs.forms.noform.combination;
        else {
            for (form in mcCombs.forms) {
                if (form === containerForm.prop('id') || form === containerForm.data('mp-id')) { // Match found
                    comb = mcCombs.forms[form].combination;
                }
            }
        }

        mpDialog.toggle(target, comb && comb.isPasswordOnly);
    },

    /**
    * Updates the styling of the icon to ensure its properly placed within the input field.
    *
    * @param {HTMLElement} $icon
    *   <IFRAME> element with src set to UI/password-dialog-toggle.html carring the icon.
    * @param {HTMLElement} $field
    *   The <INPUT> element resembling the password input field
    */
    setIconPosition: function ($icon, $field)
    {
        $icon
            .css("top", $field.position().top + parseInt($field.css('margin-top')) + $icon.data("offset"))
            .css("left", $field.position().left + parseInt($field.css('margin-left')) + $field.outerWidth() - $icon.data("size") - $icon.data("offset"))

        // Get bounding rectangles
        var iconBoundingRect = $icon[0].getBoundingClientRect();
        var fieldBoundingRect = $field[0].getBoundingClientRect();

        // Ensure $icon is placed within $field
        if ((iconBoundingRect.bottom <= fieldBoundingRect.bottom) &&
            (iconBoundingRect.right <= fieldBoundingRect.right)) return;

        // Otherwise, apply generic styling rule
        $icon
            .offset({
                top: $field.offset().top + parseInt($field.css('margin-top')),
                left: $field.offset().left + parseInt($field.width()) - parseInt($field.css('padding-right'))
            })
    },

    /**
    * Goes through the list of detect password <INPUT> fields within the page.
    * Ensures that the password icon is appended to the field only if the field is visible to the user.
    * Otherwise, removes the icon from the <INPUT> field.
    */
    checkObservedElements: function ()
    {
        if (typeof (mpJQ) === 'undefined') return;
        if (cipPassword.observingLock) {
            return;
        }

        cipPassword.observingLock = true;
        mpJQ.each(cipPassword.observedIcons, function (index, iconField) {
            if (iconField && iconField.length == 1) {
                var fieldId = iconField.data("mp-genpw-field-id");
                var field = mpJQ("input[data-mp-id='" + fieldId + "']:first");
                if (!field || field.length != 1) {
                    iconField.remove();
                    cipPassword.observedIcons.splice(index, 1);
                }
                else if (!field.is(":visible")) {
                    iconField.hide();
                }
                else if (field.is(":visible")) {
                    iconField.show();
                    cipPassword.setIconPosition(iconField, field);
                    field.data("mp-password-generator", true);
                }
            }
            else {
                cipPassword.observedIcons.splice(index, 1);
            }
        });
        cipPassword.observingLock = false;
    }
};