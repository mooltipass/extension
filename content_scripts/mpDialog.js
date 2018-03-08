/*******************************************************************************************
  Module:       mpDialog
  Description:  Handles creating, displaying and hiding the <IFRAME> with src UI/password-dialog.html.
                Trrigers the creation of <IFRAME> with src UI/custom-credentials-selection.html.
                Listens to GeneratePassword & CopyPasswordToFields.
                Listens to StoreCredentials & sends them back to background script.
                Listens to CustomCredentialsSelection and instanciates dialog for that [cipDefine.show()].
/*******************************************************************************************                
  Copyright:    (c) 2018
  Created:      02/25/2018 (mm/dd/yyyy)
********************************************************************************************/
var mpDialog = {

    shown: false,
    dialog: false,
    $pwField: false,
    inputs: false,
    created: false,

    /**
    * Toggles the visibility of <IFRAME> with src UI/password-dialog.html.
    *
    * @param {HTMLElement} target
    *   <IFRAME> element displaying the UI/password-dialog.html.
    * @param {boolean} isPasswordOnly
    *   Value resembling whether a password field was detected on this page or not.
    */
    toggle: function (target, isPasswordOnly)
    {
        if (this.shown) this.hide();
        else this.show(target, isPasswordOnly);
    },

    /**
    * Updates the attributes of the mpDialog class.
    *
    * @param {Array} inputs
    *   Array of all <INPUT> fields found on this page.
    * @param {HTMLElement} $pwField
    *   Password <INPUT> field.
    */
    precreate: function (inputs, $pwField)
    {
        this.inputs = inputs;
        this.$pwField = $pwField;
    },

    /**
    * Checks if the <IFRAME> with src UI/password-dialog.html has been created or not.
    * If not created, creates the new <IFRAME> and appends it to the page.
    *
    * @param {HTMLElement} target
    *   <IFRAME> element displaying the UI/password-dialog.html.
    * @param {boolean} isPasswordOnly
    *   Value resembling whether a password field was detected on this page or not.
    */
    create: function (target, isPasswordOnly)
    {
        var iframe = document.createElement('iframe');
        iframe.onload = function () {
            $(iframe).fadeIn(100)
        }
        iframe.src = cip.settings['extension-base'] + 'ui/password-dialog/password-dialog.html?' +
            encodeURIComponent(JSON.stringify({
                login: mcCombs.credentialsCache && mcCombs.credentialsCache.length && mcCombs.credentialsCache[0].Login
                    ? mcCombs.credentialsCache[0].Login
                    : null,
                offsetLeft: target.offset().left - $(window).scrollLeft() + target.width() + 20,
                offsetTop: target.offset().top - $(window).scrollTop() + target.height() / 2 - 20,
                isPasswordOnly: isPasswordOnly,
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
                hideCustomCredentials: mcCombs.possibleCombinations.some(function (combination) {
                    return combination.requiredUrl == window.location.hostname
                })
            }));

        $(iframe).addClass('mp-ui-password-dialog').hide()
        mpJQ("body").append(iframe)

        this.dialog = $(iframe)
        this.created = true
    },

    /**
    * Displays the <IFRAME> with src UI/password-dialog.html.
    * Updates the CSS styling of the <BODY> element to accomodate for the <IFRAME>.
    * Sends a "create_action" message back to the background script.
    *
    * @param {HTMLElement} target
    *   <IFRAME> element displaying the UI/password-dialog.html.
    * @param {boolean} isPasswordOnly
    *   Value resembling whether a password field was detected on this page or not.
    */
    show: function (target, isPasswordOnly)
    {
        $('body').addClass('mp-overlay-opened')

        if (!this.created) {
            this.create(target, isPasswordOnly);
        } else {
            this.dialog.fadeIn(100)
            messaging({
                action: 'create_action',
                args: [{
                    action: 'password_dialog_show',
                    args: {
                        offsetLeft: target.offset().left - $(window).scrollLeft() + target.width() + 20,
                        offsetTop: target.offset().top - $(window).scrollTop() + target.height() / 2 - 20,
                        isPasswordOnly: isPasswordOnly,
                        windowWidth: window.innerWidth,
                        windowHeight: window.innerHeight
                    }
                }]
            });
        }
    },

    /**
    * Hides the <IFRAME> with src UI/password-dialog.html.
    * Removes all CSS styling related to the <IFRAME> from the <BODY> element.
    */
    hide: function ()
    {
        $('body').removeClass('mp-overlay-opened')
        this.dialog && this.dialog.fadeOut(100);
        this.shown = false;
    },

    /**
    * EventHandler for highlighting <INPUT> fields on page.
    * Triggers when mouse cursor hovers ontop of the "Store or update current credentials" button.
    *
    * @param {boolean} highlight
    *   Value resembling the action to be performed. [TRUE] for highlighting & [FALSE] for removing the highlight effect.
    */
    onHighlightFields: function (highlight)
    {
        if (highlight) {
            var usernameFieldId = cipDefine.selection.username || mcCombs.usernameFieldId,
                passwordFieldId = cipDefine.selection.password || mcCombs.passwordFieldId

            usernameFieldId && $('[data-mp-id=' + usernameFieldId + ']').addClass('mp-hover-username')
            passwordFieldId && $('[data-mp-id=' + passwordFieldId + ']').addClass('mp-hover-password')
        } else {
            mpJQ(".mp-hover-username").removeClass("mp-hover-username");
            mpJQ(".mp-hover-password").removeClass("mp-hover-password");
        }
    },

    /**
    * EventHandler for storing/updating user credentials on current opened page.
    * Triggers when user clicks on the "Store or update current credentials" button.
    *
    * @param {string} username
    *   Username currently stored within app for this website (if exists, otherwise empty string).
    */
    onStoreCredentials: function (username)
    {
        var url = (document.URL.split("://")[1]).split("/")[0]

        var usernameFieldId = cipDefine.selection.username || mcCombs.usernameFieldId,
            passwordFieldId = cipDefine.selection.password || mcCombs.passwordFieldId,
            $userField = $('[data-mp-id=' + usernameFieldId + ']'),
            $pwField = $('[data-mp-id=' + passwordFieldId + ']')

        if (!username) {
            if ($userField.length) {
                var username = $userField.val();
            } else {
                var username = '';
            }
        }
        var password = $pwField.val();

        mpJQ(".mp-hover-username").removeClass("mp-hover-username");
        mpJQ(".mp-hover-password").removeClass("mp-hover-password");

        mpJQ("#mp-update-credentials-wrap").html('<p style="font-size: 12px !important;">Follow the instructions on your Mooltipass device to store the credentials.</p>');

        if (cip.rememberCredentials({ target: $userField.closest('form')[0] }, $userField, username, $pwField, password)) {
            mpJQ("#mp-update-credentials-wrap").html('<p style="font-size: 12px !important;">Credentials are added to your Mooltipass KeyCard</p>');
        }
    },

    /**
    * Event handler for selecting custom credentials fields on this website.
    * Triggers when the user clicks on the "Select custom credentials fields" button.
    * Initiates the creation of a new <IFRAME> with src UI/custom-credentials-selection.html.
    */
    onCustomCredentialsSelection: function ()
    {
        if ($('.mp-ui-password-dialog').length > 0) cipDefine.show()
    },

    /**
    * Event handler for generating a new password.
    * Triggers when the <IFRAME> with src UI/password-dialog.html is created for the first time.
    * Also triggers when the user clicks on the "Re-generate" button.
    */
    onGeneratePassword: function ()
    {
        cipPassword.generatePassword();
    },

    /**
    * Event handler for entering the generated password into the <INPUT> password field on this page.
    * Recieves the string password value that was automatically generated.
    * Looks for all password <INPUT> fields within the page and updates their content with the password value.
    *
    * @param {string} password
    *   String password value that was automatically generated by the extension.
    */
    onCopyPasswordToFields: function (password)
    {
        var passwordFields = mpJQ("input[type='password']:not('.mooltipass-password-do-not-update')");

        passwordFields.each(function (index, field) {
            mcCombs.triggerChangeEvent(field, password)
        })
    },
};