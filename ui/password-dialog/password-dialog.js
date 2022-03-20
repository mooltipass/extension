/*
 * Password dialog.
 * 
 * @param login {String}
 * @param offsetLeft {Number}
 * @param offsetTop {Number}
 * @param isPasswordOnly {Boolean}
 * @param windowWidth {Number}
 * @param windowHeight {Number}
 * @param hideCustomCredentials {Boolean}
 */
 
window.data = JSON.parse(decodeURIComponent(window.location.search.slice(1)));

$(function () {
    // Display strings in proper locale
    initLocale()

	startEventHandling()
	onShow(data)
	$('#mooltipass-username').val(data.login);
	
	// Credential Actions Event Listeners
	$('#mooltipass-store-credentials').hover( function() {
		messaging({
			action: 'create_action',
			args: [{
				action: 'password_dialog_highlight_fields',
				args: {
					highlight: true
				}
			}]
		});
	}, function() {
		messaging({
			action: 'create_action',
			args: [{
				action: 'password_dialog_highlight_fields',
				args: {
					highlight: false
				}
			}]
		});
	}).click( function(e) {
		e.preventDefault();
		
		messaging({
			action: 'create_action',
			args: [{
				action: 'password_dialog_store_credentials',
				args: {
					username: $('#mooltipass-username').val()
				}
			}]
		});
	});

	$('.mooltipass-select-custom').on('click', function( e ) {
		e.preventDefault();
		messaging({
			action: 'create_action',
			args: [{
				action: 'password_dialog_custom_credentials_selection',
				args: {}
			}]
		});
	});
	
	// Password Generator Event Listeners
	$('.mooltipass-new-password').on('click', function( e ) {
		e.preventDefault();
		messaging({
			action: 'create_action',
			args: [{
				action: 'password_dialog_generate_password',
				args: {}
			}]
		});
	});

	$('#copy-to-fields').on('click', function( e ) {
		e.preventDefault();
		e.stopPropagation();

		var password = $(".mooltipass-password-generator").val();
		messaging({
			action: 'create_action',
			args: [{
				action: 'password_dialog_copy_password_to_fields',
				args: {
					password: password
				}
			}]
		});
	});

	$('#copy-to-clipboard').on('click', function( e ) {
		e.preventDefault();
		e.stopPropagation();

		var copyInput = document.querySelector('.mooltipass-password-generator');
		copyInput.select();
		document.execCommand('copy');
	});
	
	$('.mp-genpw-overlay').on('click', function( e ) {
		if ( $(e.target).hasClass('mp-genpw-overlay') ) {
			messaging({
				action: 'create_action',
				args: [{
					action: 'password_dialog_hide',
					args: {}
				}]
			});
		}
	})
	
	function onShow(data) {
		var mpBox = $('.mooltipass-box');
		
		mpBox.css({ top: data.offsetTop, left: data.offsetLeft });
		mpBox.find('.mp-triangle-in, .mp-triangle-out').css('top', '')

		// Generate password if empty
		if ( mpBox.find('.mooltipass-password-generator').val() === '' ) {
			
            if (data.isSafari){
                GeneratePasswordSafari();				
            }
			
			messaging({
				action: 'create_action',
				args: [{
					action: 'password_dialog_generate_password',
					args: {}
				}]
			});
		}

		// Move dialog if exceeding right area
		if (data.offsetLeft + mpBox.outerWidth() > data.windowWidth) {
			mpBox.css({ left: Math.max(0, data.offsetLeft - mpBox.outerWidth() - 50) + 'px' });
			mpBox.addClass('inverted-triangle');
		}

		// Move dialog if exceeding bottom
		var exceedingBottom = data.offsetTop + mpBox.innerHeight() - data.windowHeight
		if ( exceedingBottom > 0 ) mpBox.css({ top: Math.max(0, mpBox.position().top - exceedingBottom) + 'px' });

		// Move Arrows to the right place
		if ( exceedingBottom > 0 ) mpBox.find('.mp-triangle-in, .mp-triangle-out').css({ top: 8 + exceedingBottom + 'px' });
    
		if (data.hideCustomCredentials) {
			mpBox.find('.mooltipass-select-custom').hide()
		}
		
    if (data.isPasswordOnly) {
  		mpBox.find('.mp-first').removeClass('mp-first');
  		mpBox.find('.login-area').addClass('mp-first').show();
    }
		
		// Overflow password dialog.
		if (mpBox.innerHeight() >= data.windowHeight) {
			mpBox.css('overflow', 'auto')
			mpBox.css('top', '0')
			mpBox.css('max-height', '100vh')
		}
	}
	
	function startEventHandling() {
		/*
		* Receive a message from WS_SOCKET or MooltiPass APP
		*/
		listenerCallback = function(req, sender, callback) {
			if ('action' in req) {
				switch (req.action) {
					case 'password_dialog_show':
						onShow(req.args);
						break;
					case 'password_dialog_generated_password':
						$('.mooltipass-password-generator').val(req.args.password);
						break;
				}
			}
		};

		chrome.runtime.onMessage.removeListener( listenerCallback );
		chrome.runtime.onMessage.addListener( listenerCallback );
    }

    function initLocale() {

        $("#currentLogIn").text(chrome.i18n.getMessage("PasswordDialogHtml_CurrentLogIn"));
        $("#CurrentLogInText").text(chrome.i18n.getMessage("PasswordDialogHtml_CurrentLogInText"));
        $("#credentialStorage").text(chrome.i18n.getMessage("PasswordDialogHtml_CredentialStorage"));
        $("#credentialStorageText").text(chrome.i18n.getMessage("PasswordDialogHtml_CredentialStorageText"));
        $("#mooltipass-store-credentials").text(chrome.i18n.getMessage("PasswordDialogHtml_Button_StoreCredentials"));
        $("a.mooltipass-select-custom").text(chrome.i18n.getMessage("PasswordDialogHtml_SelectCustom"));
        $("#passwordGen").text(chrome.i18n.getMessage("PasswordDialogHtml_PasswordGen"));
        $("a.mooltipass-new-password").text(chrome.i18n.getMessage("PasswordDialogHtml_Regenerate"));
        $("#copy-to-fields").text(chrome.i18n.getMessage("PasswordDialogHtml_Button_CopyToFields"));
        $("#copy-to-clipboard").text(chrome.i18n.getMessage("PasswordDialogHtml_Button_CopyToClip"));
    };
});


// Unify messaging method - And eliminate callbacks (a message is replied with another message instead)
function messaging( message ) {
	if (content_debug_msg > 4) cipDebug.log('%c Sending message to background:','background-color: #0000FF; color: #FFF; padding: 5px; ', message);
    chrome.runtime.sendMessage( message );
};

// For Safari case we not ask the background to generate the password, but do this here
function GeneratePasswordSafari(){
    var randomPassword = generatePasswordFromSettings({'seeds': generateRandomNumbers(data.passwordGenLength)});
    $('.mooltipass-password-generator').val(randomPassword);
}

function generatePasswordFromSettings(passwordSettings){
        var charactersLowercase = 'abcdefghijklmnopqrstuvwxyz';
        var charactersUppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var charactersNumbers = '1234567890';
        var charactersSpecial = '!$%*()_+{}-[]:"|;\'?,./';
        var hash = "";
        var possible = "";
        var length = data.passwordGenLength;

        if (data["usePasswordGeneratorLowercase"]) possible += charactersLowercase;
        if (data["usePasswordGeneratorUppercase"]) possible += charactersUppercase;
        if (data["usePasswordGeneratorNumbers"]) possible += charactersNumbers;
        if (data["usePasswordGeneratorSpecial"]) possible += charactersSpecial;

        for (var i = 0; i < length; i++) {
            hash += possible.charAt(Math.floor(passwordSettings.seeds[i] * possible.length));
        }
        return hash;
}

function generateRandomNumbers(length){
    
    var seeds = [];
    for(var i = 0; i < length; i++) 
    {
        seeds.push(Math.random());
    }

    return seeds;
}

var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
var content_debug_msg = (!isFirefox && chrome.runtime && !('update_url' in chrome.runtime.getManifest())) ? 55 : false;

var cipDebug = {};
if (content_debug_msg) {
	cipDebug.log = function( message ) {
		this.log( message );
	}
	cipDebug.log = console.log.bind(window.console);
	cipDebug.warn = console.warn.bind(window.console);
	cipDebug.trace = console.trace.bind(window.console);
	cipDebug.error = console.error.bind(window.console);
} else {
	cipDebug.log = function() {}
	cipDebug.log = function() {}
	cipDebug.warn = function() {}
	cipDebug.trace = function() {}
	cipDebug.error = function() {}
}
