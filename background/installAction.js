var isFirefox = typeof(browser) == "object";

if(isFirefox){
	browser.runtime.onInstalled.addListener(function(details) {
		if(details.reason != "install"){
			return;
		}
		browser.tabs.create({url: "first_run_documents/firefox/firefox.html"});
	});
}else if(navigator.userAgent.indexOf("OPR/") != -1 ){
	chrome.runtime.onInstalled.addListener(function (details) {
		if(details.reason != "install"){
			return;
		}
		chrome.tabs.create({url: "first_run_documents/opera/opera.html"});
	});
}else if(navigator.userAgent.indexOf("Chrome") != -1 ){
	chrome.runtime.onInstalled.addListener(function (details) {
		if(details.reason != "install"){
			return;
		}
		chrome.tabs.create({url: "first_run_documents/chrome/chrome.html"});
	});
}
