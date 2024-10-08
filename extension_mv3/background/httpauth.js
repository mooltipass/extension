var httpAuth = httpAuth || {}

httpAuth.credentials = null

httpAuth.onSubmit = function(credentials) {
  httpAuth.credentials = credentials
}

httpAuth.handleRequest = function(details, callback) {
    // Cancel requests which are initiated not from tabs.
    if (details.tabId == -1 || details.type != 'main_frame') {
      if (!isFirefox) {
        callback({ cancel: true })
        return
      } else {
        // Firefox expects this object on return.
        return { cancel: true }
      }
    }

	if (mooltipass.backend.isBlacklisted(details.url)){
	
        if (!isFirefox) {
            callback({ cancel: false })
            return;
		} else {
            // Firefox expects this object on return.
            return { cancel: false }
		}
    }
    
    // Enter credentials that we saved last time.
    if (httpAuth.credentials) {
      var credentials = httpAuth.credentials
      httpAuth.credentials = null
      
      if (!isFirefox) {
        callback({
          authCredentials: {
            username: credentials.login,
            password: credentials.password
          }
        })
        return
      } else {
        return {
          authCredentials: {
            username: credentials.login,
            password: credentials.password
          }
        }
      }
    }
    
    // For the first HTTP Auth request we are opening http-auth.html with auth popup
    // and redirecting user to the requested url after form is submitted.
    chrome.tabs.update(details.tabId, {
      url: chrome.runtime.getURL('ui/http-auth/http-auth.html') + '?' + encodeURIComponent(JSON.stringify({
        isProxy: details.isProxy,
        proxy: isFirefox ? details.ip : details.challenger.host + ':' + details.challenger.port,
        url:  details.url
      }))
    })
    
    if (!isFirefox) {
      callback({ cancel: true })
      return
    } else {
      // Firefox expects this object on return.
      return { cancel: true }
    }
}
