var isFirefox = typeof(browser) == "object";

if(isFirefox){
	browser.runtime.onInstalled.addListener(function(details) {
		if (details.reason == "update"){
			CreateMooltipassMenu();
		} else if(details.reason == "install"){
	        browser.tabs.create({url: "first_run_documents/firefox/firefox.html"});
            CreateMooltipassMenu();
        }
	});
}else if(navigator.userAgent.indexOf("OPR/") != -1 ){
	chrome.runtime.onInstalled.addListener(function (details) {
		if (details.reason == "update"){
			CreateMooltipassMenu();
		} else if(details.reason == "install"){
            chrome.tabs.create({url: "first_run_documents/opera/opera.html"});
            CreateMooltipassMenu();
		}		
	});
}else if(navigator.userAgent.indexOf("Chrome") != -1 ){
    chrome.runtime.onInstalled.addListener(function (details) {
        if (details.reason == "update"){
            CreateMooltipassMenu();
        } else if(details.reason == "install"){
            chrome.tabs.create({url: "first_run_documents/chrome/chrome.html"});
            CreateMooltipassMenu();
        }		
    });
}


function CreateMooltipassMenu(){
	console.log('-------------------------------------CreateMooltipassMenu============================');
    /**
     * Add context menu entry for filling in username only
     */
    chrome.contextMenus.create({
        "id": 'InitJs_ContextMenu_FillUserOnly',
        "title": chrome.i18n.getMessage("InitJs_ContextMenu_FillUserOnly"),
        "contexts": ["editable"]
    });

    /**
     * Add context menu entry for filling in username + password
     */	
    chrome.contextMenus.create({
        "id": 'InitJs_ContextMenu_FillUserPass',
        "title": chrome.i18n.getMessage("InitJs_ContextMenu_FillUserPass"),
        "contexts": ["editable"],
    });	

    /**
     * Add context menu entry for filling in only password which matches for given username
     */	
    chrome.contextMenus.create({
        "id": 'InitJs_ContextMenu_FillPass',		
        "title": chrome.i18n.getMessage("InitJs_ContextMenu_FillPass"),
        "contexts": ["editable"],
    });

    /**
     * Add context menu entry for creating icon for generate-password dialog
     */
    chrome.contextMenus.create({
        "id": 'InitJs_ContextMenu_ShowPassGenIcons',
        "title": chrome.i18n.getMessage("InitJs_ContextMenu_ShowPassGenIcons"),
        "contexts": ["editable"],
    });

    /**
     * Add context menu entry for Save Credentials
     */
    chrome.contextMenus.create({
        "id": 'InitJs_ContextMenu_SaveCredentials',
        "title": chrome.i18n.getMessage("InitJs_ContextMenu_SaveCredentials"),
        "contexts": ["editable"],
    });

    /**
     * Add context menu entry for filling TOTP code
     */
    chrome.contextMenus.create({
        "id": 'InitJs_ContextMenu_fetchTOTPcode',
        "title": chrome.i18n.getMessage("InitJs_ContextMenu_fetchTOTPcode"),
        "contexts": ["editable"],
    });
}

chrome.contextMenus.onClicked.addListener(function(info, tab){
    switch (info.menuItemId) {
        case "InitJs_ContextMenu_FillUserOnly": 
            chrome.tabs.sendMessage(tab.id, {
                action: "fill_user_only"
            });
            break;
        case "InitJs_ContextMenu_FillUserPass": 
            chrome.tabs.sendMessage(tab.id, {
                action: "fill_user_pass"
            });
            break;		
        case "InitJs_ContextMenu_FillPass": 
            chrome.tabs.sendMessage(tab.id, {
                action: "fill_pass_only"
            });
            break;	
        case "InitJs_ContextMenu_ShowPassGenIcons": 
            chrome.tabs.sendMessage(tab.id, {
                action: "activate_password_generator"
            });
            break;	
        case "InitJs_ContextMenu_SaveCredentials": 
            chrome.tabs.sendMessage(tab.id, {
                action: "remember_credentials"
            });
            break;
        case "InitJs_ContextMenu_fetchTOTPcode": 
            chrome.tabs.sendMessage(tab.id, {
                action: "fetch_totp_code"
            });
            break;			
    }
});
