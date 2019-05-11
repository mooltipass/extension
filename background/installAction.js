if(navigator.userAgent.indexOf("Chrome") != -1 )
{
	chrome.runtime.onInstalled.addListener(function (object) {
		chrome.tabs.create({url: "first_run_documents/chrome/chrome.html"});
	});
}

if(navigator.userAgent.indexOf("Firefox") != -1 )
{
	browser.runtime.onInstalled.addListener(function() {browser.windows.create({url: "first_run_documents/firefox/firefox.html"});});
}