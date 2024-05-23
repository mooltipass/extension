try {
	importScripts(
            "shared_scripts/psl.min.js",
	);	
	console.log('shared_scripts/psl.min.js loaded');
	
	importScripts(
            "vendor/seedrandom.js",
	);	
	console.log('vendor/seedrandom.js loaded');	
	
	importScripts(
            "background/httpauth.js",
	);	
	console.log('background/httpauth.js loaded');
	
	importScripts(
            "background/browserAction.js",
	);	
	console.log('background/browserAction.js loaded');
	
	importScripts(
            "background/page.js",
	);	
	console.log('background/page.js loaded');	
	
	importScripts(
            "vendor/mooltipass/backend.js",
	);	
	console.log('vendor/mooltipass/backend.js loaded');		
	
	importScripts(
            "vendor/mooltipass/moolticute.js",
	);	
	console.log('vendor/mooltipass/moolticute.js loaded');			
	
	importScripts(
            "vendor/mooltipass/device.js",
	);	
	console.log('vendor/mooltipass/device.js loaded');		
	
	importScripts(
            "background/event.js",
	);	
	console.log('background/event.js loaded');	

	importScripts(
            "background/init.js",
	);	
	console.log('background/init.js loaded');
	
	importScripts(
            "background/installAction.js",
	);	
	console.log('background/installAction.js loaded');	
	
/*	
      "shared_scripts/psl.min.js",
      "vendor/seedrandom.js",
      "background/httpauth.js",
      "background/browserAction.js",
      "background/page.js",
      "vendor/mooltipass/backend.js",
      "vendor/mooltipass/moolticute.js",
      "vendor/mooltipass/device.js",
      "background/event.js",
      "background/init.js",
      "background/installAction.js"
*/
  
} catch (e) {
    console.error(e);
}