/*******************************************************************************************
  Module:		cipDefine
  Copyright:	(c) 2018
  Created:		02/25/2018 (mm/dd/yyyy)
********************************************************************************************/
var cipDefine = {

    selection: {
        username: null,
        password: null,
        fields: {}
    },

    show: function () {
        $('body').addClass('mp-overlay-opened')
        $('.mp-ui-password-dialog').hide()

        var iframe = document.createElement('iframe');
        iframe.onload = function () {
            $(iframe).fadeIn(100)
        }
        iframe.src = cip.settings['extension-base'] + 'ui/custom-credentials-selection/custom-credentials-selection.html?' +
            encodeURIComponent(JSON.stringify({
                settings: cip.settings,
                origin: document.location.origin
            }));

        $(iframe).addClass('mp-ui-custom-credentials-selection').hide()
        mpJQ("body").append(iframe)
    },

    hide: function () {
        $('.mp-ui-custom-credentials-selection').fadeOut(100, function () {
            $(this).remove()

            if (cipDefine.source == 'password-dialog') {
                $('.mp-ui-password-dialog').show()
            } else {
                $('body').removeClass('mp-overlay-opened')
            }
        })
    },

    isFieldSelected: function ($cipId) {
        return (
            $cipId == cipDefine.selection.username ||
            $cipId == cipDefine.selection.password ||
            $cipId in cipDefine.selection.fields
        );
    },

    retrieveMarkFields: function (pattern) {
        var fields = []

        mpJQ(pattern).each(function () {
            if (mpJQ(this).is(":visible") && mpJQ(this).css("visibility") != "hidden" && mpJQ(this).css("visibility") != "collapsed") {
                fields.push({
                    top: mpJQ(this).offset().top - $(document).scrollTop(),
                    left: mpJQ(this).offset().left,
                    width: mpJQ(this).outerWidth(),
                    height: mpJQ(this).outerHeight(),
                    id: mpJQ(this).attr("data-mp-id")
                })
            }
        });

        messaging({
            action: 'create_action',
            args: [{
                action: 'custom_credentials_selection_mark_fields_data',
                args: {
                    fields: fields
                }
            }]
        });
    }
};