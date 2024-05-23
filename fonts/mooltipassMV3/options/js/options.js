// Detect if we're dealing with Firefox or Chrome
var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

    // Unify messaging method - And eliminate callbacks (a message is replied with another message instead)
    function messaging( message, callback ) {
        chrome.runtime.sendMessage( message, callback );
    };    

if ( typeof(mpJQ) !== 'undefined') {
    var $ = mpJQ.noConflict(true);
} else if (jQuery) {
    var $ = jQuery.noConflict(true);   
}

//old before MV3
/*$(function () {
    options.initGeneralSettings();
    options.initAbout();
    options.initBlacklist();
    options.initCredentialList();
    options.initPasswordGeneratorSettings();
});*/


var options = options || {};

//old before MV3
//options.settings = typeof(localStorage.settings) == 'undefined' ? {} : JSON.parse(localStorage.settings);

if (isFirefox) options.settings.useMoolticute = true;

//old before MV3
//options.keyRing = typeof(localStorage.keyRing) == 'undefined' ? {} : JSON.parse(localStorage.keyRing);


async function Init() {
    try {			
        let storeItems = await chrome.storage.local.get(["settings", "keyRing"]);
				
        if (storeItems.settings){
            options.settings = JSON.parse(storeItems.settings)
        } else {
            options.settings = {};
        }

        if (storeItems.keyRing){
            options.keyRing = storeItems.keyRing;
        } else {
            options.keyRing = {};
        }		
	
    } catch (e) {
        console.log('Error reading settings');
    }
	
    options.initGeneralSettings();
    options.initAbout();
    options.initBlacklist();
    options.initCredentialList();
    options.initPasswordGeneratorSettings();
}


Init();


async function SaveSettings(newSettings) {
    try {			
        await chrome.storage.local.set({settings : JSON.stringify(newSettings)});	
    } catch (e) {
        console.log('Error save settings');
    }			
        
    messaging({
        action: 'load_settings'
    });
}
		

options.initGeneralSettings = function () {
    // Display strings in proper locale
    options.initGeneralSettingsLocale();

    $(".settings input[type=checkbox]").each(function () {
        $(this).attr("checked", options.settings[$(this).attr("name")]);
    });

    $(".settings input[type=checkbox]").change(function () {
        options.settings[$(this).attr("name")] = $(this).is(':checked');
		
		SaveSettings(options.settings);
		
        //old before MV3
		//localStorage.settings = JSON.stringify(options.settings);

        // messaging({
        //    action: 'load_settings'
        //});
    });

    $(".settings input[type=radio]").each(function () {
        if ($(this).val() == options.settings[$(this).attr("name")]) {
            $(this).attr("checked", options.settings[$(this).attr("name")]);
        }
    });

    $(".settings input[type=radio]").change(function () {
        options.settings[$(this).attr("name")] = $(this).val();

        SaveSettings(options.settings);
		
        //old before MV3
        //localStorage.settings = JSON.stringify(options.settings);

        //messaging({
        //    action: 'load_settings'
        //});
    });
};

options.initAbout = function () {
    // Display strings in proper locale
    options.initAboutLocale();

    $("#contributor-list").each(function () {
        $.getJSON("https://api.github.com/repos/limpkin/mooltipass/contributors", function (contributors) {
            $("#contributor-list").html("");
            for (_contributor in contributors) {
                contributor = contributors[_contributor];
                e = $(DOMPurify.sanitize("<a class='pure-u-1-3 contributor' href='" + contributor.html_url + "'><img src='" + contributor.avatar_url + "' />" + contributor.login + "</a>", { SAFE_FOR_JQUERY: true }));
                $("#contributor-list").append(e);
            }
        });
    });
}

options.isEmpty = function (dict) {
    var keys = [];
    for (var key in dict) {
        if (key != null) keys.push(key);
    }
    return (keys.length == 0)
}

//old before MV3
/*options.initBlacklist = function () {
    // Display strings in proper locale
    options.initBlacklistLocale();

    $("#form-blacklist-add").submit(function(e) {
        e.preventDefault();
        console.log('submit');
        var value = $('#url-blacklist-add').val().trim();

        console.log('blacklist', options.blacklist);

        if(value == '') {
            return;
        }

        options.blacklist = typeof(localStorage.mpBlacklist) == 'undefined' ? {} : JSON.parse(localStorage.mpBlacklist);
        options.blacklist[value] = true;
        localStorage.mpBlacklist = JSON.stringify(options.blacklist);
		
        $('#url-blacklist-add').val('');

        options.showBlacklistedUrls();
    });

    options.showBlacklistedUrls();
};*/


async function submitFunctionBlacklistAdd(e) {
       e.preventDefault();
        console.log('submit');
        var value = $('#url-blacklist-add').val().trim();

        console.log('blacklist', options.blacklist);

        if(value == '') {
            return;
        }

        //options.blacklist = typeof(localStorage.mpBlacklist) == 'undefined' ? {} : JSON.parse(localStorage.mpBlacklist);
        //options.blacklist[value] = true;
        //localStorage.mpBlacklist = JSON.stringify(options.blacklist);
		
		try {			
            let storeItems = await chrome.storage.local.get(["mpBlacklist"]);
				
            if (storeItems.mpBlacklist){
                options.blacklist = JSON.parse(storeItems.mpBlacklist);

            } else {
               options.blacklist = {};
            }

			options.blacklist[value] = true;		   
            await chrome.storage.local.set({mpBlacklist : JSON.stringify(options.blacklist)});			   
	
        } catch (e) {
           console.log('Error reading blacklist');
        }

        $('#url-blacklist-add').val('');

        options.showBlacklistedUrls();
}

//async function initBlacklist() {
options.initBlacklist = function () {	
    // Display strings in proper locale
    options.initBlacklistLocale();

    $("#form-blacklist-add").submit(submitFunctionBlacklistAdd);

    options.showBlacklistedUrls();
};


//old before MV3
/*options.showBlacklistedUrls = function() {
    $("#blacklisted-urls").each(function () {

        // get blacklist from storage, or create an empty one if none exists
        options.blacklist = typeof(localStorage.mpBlacklist) == 'undefined' ? {} : JSON.parse(localStorage.mpBlacklist);

        if (options.isEmpty(options.blacklist)) {
            $("#no-blacklisted-urls").show();
            return;
        };

        $("#no-blacklisted-urls").hide();

        $(this).html("");
        for (var url in options.blacklist) {
            $element = $("<tr data-url='" + url + "'><td><span class='value'>" + url + '</span><span class="remove"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="11" height="14" viewBox="0 0 22 28" data-code="61453" data-tags="close,remove,times"><g fill="#BBB" transform="scale(0.02734375 0.02734375)"><path d="M741.714 755.429c0 14.286-5.714 28.571-16 38.857l-77.714 77.714c-10.286 10.286-24.571 16-38.857 16s-28.571-5.714-38.857-16l-168-168-168 168c-10.286 10.286-24.571 16-38.857 16s-28.571-5.714-38.857-16l-77.714-77.714c-10.286-10.286-16-24.571-16-38.857s5.714-28.571 16-38.857l168-168-168-168c-10.286-10.286-16-24.571-16-38.857s5.714-28.571 16-38.857l77.714-77.714c10.286-10.286 24.571-16 38.857-16s28.571 5.714 38.857 16l168 168 168-168c10.286-10.286 24.571-16 38.857-16s28.571 5.714 38.857 16l77.714 77.714c10.286 10.286 16 24.571 16 38.857s-5.714 28.571-16 38.857l-168 168 168 168c10.286 10.286 16 24.571 16 38.857z"></path></g></svg></span></td>');
            $element.appendTo($(this));
        }

        $("#blacklisted-urls .remove").click(function () {
            var url = $(this).closest('tr').attr('data-url');
            delete options.blacklist[url];
            localStorage.mpBlacklist = JSON.stringify(options.blacklist);
            messaging({action: 'load_settings'});

            $(this).closest('tr').remove();

            if (options.isEmpty(options.blacklist)) {
                $("#no-blacklisted-urls").show()
            }
        });


        $('#tab-blacklist tr.clone:first button.delete:first').click(function (e) {
            var url = $(this).closest('tr').data('url');
            var id = $(this).closest('tr').attr('id');
            $('#tab-blacklist #' + id).remove();
            delete options.blacklist[url];
            localStorage.mpBlacklist = JSON.stringify(options.blacklist);
            messaging({action: 'load_settings'});
        });

        var trClone = $("#tab-blacklist table tr.clone:first").clone(true);
        trClone.removeClass("clone");

        var index = 1;
        for (var url in options.blacklist) {
            var tr = trClone.clone(true);
            tr.data('url', url);
            tr.attr('id', 'tr-scf' + index);
            tr.children('td:first').text(url);
            $('#tab-blacklist table tbody:first').append(tr);
            index++;
        }

        if ($('#tab-blacklist table tbody:first tr').length > 2) {
            $('#tab-blacklist table tbody:first tr.empty:first').hide();
        }
        else {
            $('#tab-blacklist table tbody:first tr.empty:first').show();
        }
    });
};*/


async function clickRemoveFunction() {
            var url = $(this).closest('tr').attr('data-url');
            delete options.blacklist[url];
			//old before MV3
            //localStorage.mpBlacklist = JSON.stringify(options.blacklist);
			await chrome.storage.local.set({mpBlacklist : JSON.stringify(options.blacklist)});
            messaging({action: 'load_settings'});

            $(this).closest('tr').remove();

            if (options.isEmpty(options.blacklist)) {
                $("#no-blacklisted-urls").show()
            }
}

async function clickButtonDeleteFunction(e) {
            var url = $(this).closest('tr').data('url');
            var id = $(this).closest('tr').attr('id');
            $('#tab-blacklist #' + id).remove();
            delete options.blacklist[url];
			//old before MV3
            //localStorage.mpBlacklist = JSON.stringify(options.blacklist);
			await chrome.storage.local.set({mpBlacklist : JSON.stringify(options.blacklist)});
            messaging({action: 'load_settings'});
}

async function eachFunction(){

        // get blacklist from storage, or create an empty one if none exists
		//old before MV3
        //options.blacklist = typeof(localStorage.mpBlacklist) == 'undefined' ? {} : JSON.parse(localStorage.mpBlacklist);
		
		try {			
            let storeItems = await chrome.storage.local.get(["mpBlacklist"]);
				
            if (storeItems.mpBlacklist){
                options.blacklist = JSON.parse(storeItems.mpBlacklist);

            } else {
               options.blacklist = {};
            }	
        } catch (e) {
           console.log('Error reading blacklist');
        }		

        if (options.isEmpty(options.blacklist)) {
            $("#no-blacklisted-urls").show();
            return;
        };

        $("#no-blacklisted-urls").hide();

        $(this).html("");
        for (var url in options.blacklist) {
            $element = $("<tr data-url='" + url + "'><td><span class='value'>" + url + '</span><span class="remove"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="11" height="14" viewBox="0 0 22 28" data-code="61453" data-tags="close,remove,times"><g fill="#BBB" transform="scale(0.02734375 0.02734375)"><path d="M741.714 755.429c0 14.286-5.714 28.571-16 38.857l-77.714 77.714c-10.286 10.286-24.571 16-38.857 16s-28.571-5.714-38.857-16l-168-168-168 168c-10.286 10.286-24.571 16-38.857 16s-28.571-5.714-38.857-16l-77.714-77.714c-10.286-10.286-16-24.571-16-38.857s5.714-28.571 16-38.857l168-168-168-168c-10.286-10.286-16-24.571-16-38.857s5.714-28.571 16-38.857l77.714-77.714c10.286-10.286 24.571-16 38.857-16s28.571 5.714 38.857 16l168 168 168-168c10.286-10.286 24.571-16 38.857-16s28.571 5.714 38.857 16l77.714 77.714c10.286 10.286 16 24.571 16 38.857s-5.714 28.571-16 38.857l-168 168 168 168c10.286 10.286 16 24.571 16 38.857z"></path></g></svg></span></td>');
            $element.appendTo($(this));
        }

        $("#blacklisted-urls .remove").click(clickRemoveFunction);


        $('#tab-blacklist tr.clone:first button.delete:first').click(clickButtonDeleteFunction);

        var trClone = $("#tab-blacklist table tr.clone:first").clone(true);
        trClone.removeClass("clone");

        var index = 1;
        for (var url in options.blacklist) {
            var tr = trClone.clone(true);
            tr.data('url', url);
            tr.attr('id', 'tr-scf' + index);
            tr.children('td:first').text(url);
            $('#tab-blacklist table tbody:first').append(tr);
            index++;
        }

        if ($('#tab-blacklist table tbody:first tr').length > 2) {
            $('#tab-blacklist table tbody:first tr.empty:first').hide();
        }
        else {
            $('#tab-blacklist table tbody:first tr.empty:first').show();
        }
}


//async function showBlacklistedUrls() {
options.showBlacklistedUrls = function() {	
    $("#blacklisted-urls").each(eachFunction);
};


options.initCredentialList = function () {
    // Display strings in proper locale
    options.initCredentialListLocale();

    $("#credential-urls").each(function () {

        // get blacklist from storage, or create an empty one if none exists

        if (options.isEmpty(options.settings["defined-credential-fields"])) {
            $("#no-credential-urls").show();
            return;
        }
        ;
        $("#no-credential-urls").hide();

        $(this).html("");
        for (var url in options.settings["defined-credential-fields"]) {
            $element = $("<tr data-url='" + url + "'><td><span class='value'>" + url + '</span><span class="remove"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="11" height="14" viewBox="0 0 22 28" data-code="61453" data-tags="close,remove,times"><g fill="#BBB" transform="scale(0.02734375 0.02734375)"><path d="M741.714 755.429c0 14.286-5.714 28.571-16 38.857l-77.714 77.714c-10.286 10.286-24.571 16-38.857 16s-28.571-5.714-38.857-16l-168-168-168 168c-10.286 10.286-24.571 16-38.857 16s-28.571-5.714-38.857-16l-77.714-77.714c-10.286-10.286-16-24.571-16-38.857s5.714-28.571 16-38.857l168-168-168-168c-10.286-10.286-16-24.571-16-38.857s5.714-28.571 16-38.857l77.714-77.714c10.286-10.286 24.571-16 38.857-16s28.571 5.714 38.857 16l168 168 168-168c10.286-10.286 24.571-16 38.857-16s28.571 5.714 38.857 16l77.714 77.714c10.286 10.286 16 24.571 16 38.857s-5.714 28.571-16 38.857l-168 168 168 168c10.286 10.286 16 24.571 16 38.857z"></path></g></svg></span></td>');
            $element.appendTo($(this));
        }

        $("#credential-urls .remove").click(function () {
            var url = $(this).closest('tr').attr('data-url');

            delete options.settings["defined-credential-fields"][url];

            SaveSettings(options.settings);
		
            //old before MV3
            //localStorage.settings = JSON.stringify(options.settings);
            //messaging({action: 'load_settings'});

            $(this).closest('tr').remove();

            if (options.isEmpty(options.settings["defined-credential-fields"])) {
                $("#no-credential-urls").show()
            }
        });
    });
}

options.initPasswordGeneratorSettings = function () {
    $("*[name='usePasswordGenerator']").click(function () {
        if (this.checked) {
            $("#password-generator-settings").fadeIn(200);
        } else {
            $("#password-generator-settings").fadeOut(200);
        }
    });
    $("*[name='usePasswordGenerator']").each(function () {
        if (this.checked) {
            $("#password-generator-settings").fadeIn(0);
        } else {
            $("#password-generator-settings").fadeOut(0);
        }
    });


    $("*[name='usePasswordGeneratorLength']").val(options.settings['usePasswordGeneratorLength']);
    $("*[name='usePasswordGeneratorLength']").change(function () {
        $(this).val(parseInt($(this).val()));

        min = parseInt($(this).attr("min"));
        max = parseInt($(this).attr("max"));
        val = parseInt($(this).val());

        if (val > max) $(this).val(max);
        if (val < min) $(this).val(min);

        options.settings[$(this).attr("name")] = $(this).val();

        SaveSettings(options.settings);
		
        //old before MV3
        //localStorage.settings = JSON.stringify(options.settings);

        //messaging({
        //    action: 'load_settings'
        //});
    });

    $('#password-generator-settings .checkbox.password-generator-characters input').change(function () {
        options.disableLastCharCheckboxOnPasswordGenerator();
    });

    if (!options.disableLastCharCheckboxOnPasswordGenerator()) {
        $('#password-generator-settings .checkbox.password-generator-characters input:first').prop('checked', true);
        options.disableLastCharCheckboxOnPasswordGenerator();
    }
};

options.disableLastCharCheckboxOnPasswordGenerator = function () {
    var checked = [];
    $('#password-generator-settings .checkbox.password-generator-characters input').each(function (no, el) {
        if ($(el).is(':checked')) {
            checked.push(el);
        }
    });

    if (checked.length == 1) {
        $(checked[0]).prop('disabled', true);
    }
    else {
        $.each(checked, function (no, item) {
            $(item).prop('disabled', false);
        });
    }

    return checked.length > 0;
}

options.initGeneralSettingsLocale = function () {

    // -- Side menu --
    $("#options-html").text(chrome.i18n.getMessage("Options_General"));
    $("#credential-fields-html").text(chrome.i18n.getMessage("Options_Credential_Fields"));
    $("#blacklisted-sites-html").text(chrome.i18n.getMessage("Options_Blacklisted_Sites"));
    $("#about-html").text(chrome.i18n.getMessage("Options_About"));

    // -- Page header --
    $("#general-h1").text(chrome.i18n.getMessage("Options_General"));

    // -- Password generator block --
    $("#password-generator-h2").text(chrome.i18n.getMessage("OptionsHtml_Password_Generator"));
    $("#password-generator-description").text(chrome.i18n.getMessage("OptionsHtml_Password_Generator_Description"));
    $("#password-generator-checkbox").text(chrome.i18n.getMessage("OptionsHtml_Password_Generator_Checkbox"));
    $("#password-generator-length").text(chrome.i18n.getMessage("OptionsHtml_Password_Generator_Length"));
    $("#password-generator-complexity").text(chrome.i18n.getMessage("OptionsHtml_Password_Generator_Complexity"));
    $("#password-generator-lowercase").text(chrome.i18n.getMessage("OptionsHtml_Password_Generator_Lowercase"));
    $("#password-generator-uppercase").text(chrome.i18n.getMessage("OptionsHtml_Password_Generator_Uppercase"));
    $("#password-generator-numbers").text(chrome.i18n.getMessage("OptionsHtml_Password_Generator_Numbers"));
    $("#password-generator-specialchars").text(chrome.i18n.getMessage("OptionsHtml_Password_Generator_Specialchars"));

    // -- Advanced options block --
    $("#advanced-options").text(chrome.i18n.getMessage("OptionsHtml_Advanced_Options"));
    $("#advanced-options-description").text(chrome.i18n.getMessage("OptionsHtml_Advanced_Options_Description"));
    $("#advanced-options-checkbox").html(chrome.i18n.getMessage("OptionsHtml_Advanced_Options_Checkbox"));
};

options.initAboutLocale = function () {

    // -- Side menu --
    $("#options-html").text(chrome.i18n.getMessage("Options_General"));
    $("#credential-fields-html").text(chrome.i18n.getMessage("Options_Credential_Fields"));
    $("#blacklisted-sites-html").text(chrome.i18n.getMessage("Options_Blacklisted_Sites"));
    $("#about-html").text(chrome.i18n.getMessage("Options_About"));

    // -- Page header --
    $("#about-h1").text(chrome.i18n.getMessage("Options_About"));

    // -- About block --
    $("#about-description").html(chrome.i18n.getMessage("AboutHtml_About_Description"));

    // -- Contributors block --
    $("#contributors-h2").text(chrome.i18n.getMessage("AboutHtml_Contributors"));
    $("#contributors-description").text(chrome.i18n.getMessage("AboutHtml_Contributors_Description"));

    // Open source block --
    $("#opensource-h2").text(chrome.i18n.getMessage("AboutHtml_Opensource"));
    $("#opensource-description").html(chrome.i18n.getMessage("AboutHtml_Opensource_Description"));
};

options.initCredentialListLocale = function () {

    // -- Side menu --
    $("#options-html").text(chrome.i18n.getMessage("Options_General"));
    $("#credential-fields-html").text(chrome.i18n.getMessage("Options_Credential_Fields"));
    $("#blacklisted-sites-html").text(chrome.i18n.getMessage("Options_Blacklisted_Sites"));
    $("#about-html").text(chrome.i18n.getMessage("Options_About"));

    // -- Page header --
    $("#credential-fields-h1").text(chrome.i18n.getMessage("Options_Credential_Fields"));

    // -- Description block --
    $("#credential-fields-description").html(chrome.i18n.getMessage("CredentialFieldsHtml_Description"));

    // -- URL table --
    $("#credential-fields-table-title").text(chrome.i18n.getMessage("CredentialFieldsHtml_Table_Title"));
    $("#no-credential-urls td:first").text(chrome.i18n.getMessage("CredentialFieldsHtml_Table_No_Credential_Urls"));
};

options.initBlacklistLocale = function () {

    // -- Side menu --
    $("#options-html").text(chrome.i18n.getMessage("Options_General"));
    $("#credential-fields-html").text(chrome.i18n.getMessage("Options_Credential_Fields"));
    $("#blacklisted-sites-html").text(chrome.i18n.getMessage("Options_Blacklisted_Sites"));
    $("#about-html").text(chrome.i18n.getMessage("Options_About"));

    // -- Page header --
    $("#blacklisted-sites-h1").text(chrome.i18n.getMessage("Options_Blacklisted_Sites"));

    // -- Description block --
    $("#blacklisted-sites-description").text(chrome.i18n.getMessage("BlacklistedSitesHtml_Description"));

    // -- URL table --
    $("#blacklisted-sites-table-title").text(chrome.i18n.getMessage("BlacklistedSitesHtml_Table_Title"));
    $("#no-blacklisted-urls td:first").text(chrome.i18n.getMessage("BlacklistedSitesHtml_Table_No_Blacklisted_Urls"));

    // -- Blacklist form --
    $("#add-blacklisted-site-h2").text(chrome.i18n.getMessage("BlacklistedSitesHtml_BlackListed_Site_Form_Title"));
    $("#url-blacklist-add").attr("placeholder", chrome.i18n.getMessage("BlacklistedSitesHtml_BlackListed_Site_Form_Placeholder"));
    $("#blackListed_site_submit").text(chrome.i18n.getMessage("BlacklistedSitesHtml_BlackListed_Site_Form_Submit"));
};