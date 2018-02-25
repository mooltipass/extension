/*******************************************************************************************
  Module:		mpDialog
  Copyright:	(c) 2018
  Created:		02/25/2018 (mm/dd/yyyy)
********************************************************************************************/
var mpDialog = {

    shown: false,
    dialog: false,
    $pwField: false,
    inputs: false,
    created: false,

    toggle: function (target, isPasswordOnly)
    {
        if (this.shown) this.hide();
        else this.show(target, isPasswordOnly);
    },

    precreate: function (inputs, $pwField)
    {
        this.inputs = inputs;
        this.$pwField = $pwField;
    },

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

    hide: function ()
    {
        $('body').removeClass('mp-overlay-opened')
        this.dialog && this.dialog.fadeOut(100);
        this.shown = false;
    },

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

    onCustomCredentialsSelection: function ()
    {
        if ($('.mp-ui-password-dialog').length > 0) cipDefine.show()
    },

    onGeneratePassword: function ()
    {
        cipPassword.generatePassword();
    },

    onCopyPasswordToFields: function (password)
    {
        var passwordFields = mpJQ("input[type='password']:not('.mooltipass-password-do-not-update')");

        passwordFields.each(function (index, field) {
            mcCombs.triggerChangeEvent(field, password)
        })
    },

    onHideDialog: function ()
    {
        mpDialog.hide();
    }
};