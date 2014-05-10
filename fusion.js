var connectHandlers = WebApp.connectHandlers;

var FUSION         = 0;
var FUSION_CORDOVA = 1;

getPayload = function(hostName, method) {
	var jsFiles = [];
	var cssFiles = [];
	var rootUrl = Meteor.absoluteUrl("", { rootUrl: hostName });
	var clientManifest = WebApp.clientProgram.manifest;

	if(rootUrl[rootUrl.length - 1] == "/") {
		rootUrl = rootUrl.substr(0, rootUrl.length - 1);
	}

	var runTimeConfig = JSON.parse(JSON.stringify(__meteor_runtime_config__));
	runTimeConfig.ROOT_URL = rootUrl + "/";

	_.each(clientManifest, function(fileSpec) {
		if(fileSpec.type === 'js' && fileSpec.where === 'client') {
			jsFiles.push(rootUrl+fileSpec.url);
		} else if(fileSpec.type === 'css' && fileSpec.where === 'client') {
			cssFiles.push(rootUrl+fileSpec.url);
		}
	});

	var __meteor_fusion__ = {
		js: jsFiles,
		css: cssFiles
	}

	// regular script loading - uses appcache if device is offline
	if(method == FUSION) {
		// client use appcache - scripts are stored cached
		return "(function(){"
		+" window.history.replaceState( {} , '', '"+rootUrl+"' );"
		+"  __meteor_runtime_config__ = " + JSON.stringify(runTimeConfig) + ";"
		+" var __meteor_fusion__ = " + JSON.stringify(__meteor_fusion__) + ";"
		+""
		+""
		+"  function addScript(src, loadCb, errorCb){"
		+"    var script = document.createElement('script');"
		+"    script.type = 'text/javascript';"
		+"    script.src = src;"
		+"    script.async = false;"
		+"    script.onload = loadCb;"
		+"    script.onerror = errorCb;"
		+""
		+"    var head = document.getElementsByTagName('head')[0];"
		+"    head.appendChild(script);"
		+"  }"
		+""
		+"  function addLink(src){"
		+"    var link = document.createElement('link');"
		+"    link.rel = 'stylesheet';"
		+"    link.href = src;"
		+""
		+"    var head = document.getElementsByTagName('head')[0];"
		+"    head.appendChild(link);"
		+"  }"
		+""
		+"  for(var i = 0; i < __meteor_fusion__.css.length; i++){"
		+"    addLink(__meteor_fusion__.css[i]);"
		+"  }"
		+""
		+"  for(var i = 0; i < __meteor_fusion__.js.length - 1; i++){"
		+"    addScript(__meteor_fusion__.js[i]);"
		+"  }"
		+"  addScript(__meteor_fusion__.js[__meteor_fusion__.js.length - 1], function(){"
		+"    if (typeof Package === 'undefined' || "
		+"        ! Package.webapp || "
		+"        ! Package.webapp.WebApp || "
		+"        ! Package.webapp.WebApp._isCssLoaded()) "
		+"      document.location.reload();"
		+"  });"
		+"})()";
	}

	// loads scripts from localStorage (TODO: use cordova file system instead of localStorage!!!)
	if(method == FUSION_CORDOVA) {
		// client doesn't use appcache - scripts are stored in localStorage
		return "(function() {"
		+"\r\n window.history.replaceState({}, '', '" + rootUrl + "');"
		+"\r\n __meteor_runtime_config__ = " + JSON.stringify(runTimeConfig) + ";"
		+"\r\n var __meteor_fusion__ = " + JSON.stringify(__meteor_fusion__) + ";"
		+"\r\n "
		+"\r\n function hashCode(str) {"
		+"\r\n 	var hash = 0;"
		+"\r\n 	if (str.length == 0) return hash;"
		+"\r\n 	for (i = 0; i < str.length; i++) {"
		+"\r\n 		char = str.charCodeAt(i);"
		+"\r\n 		hash = ((hash << 5) - hash) + char;"
		+"\r\n 		hash = hash & hash;"
		+"\r\n 	}"
		+"\r\n 	return (hash >>> 0).toString(36);"
		+"\r\n }"

		+"\r\n function addLink(src) {"
		+"\r\n 	var link = document.createElement('link');"
		+"\r\n 	link.rel = 'stylesheet';"
		+"\r\n 	link.innerHTML = src;"
		+"\r\n "
		+"\r\n 	var head = document.getElementsByTagName('head')[0];"
		+"\r\n 	if(head) {"
		+"\r\n 		head.appendChild(link);"
		+"\r\n 	} else {"
		+"\r\n 		document.appendChild(link);"
		+"\r\n 	}"
		+"\r\n }"

		+"\r\n function addScript(src) {"
		+"\r\n 	var script = document.createElement('script');"
		+"\r\n 	script.type = 'text/javascript';"
		+"\r\n 	script.innerHTML = src;"
		+"\r\n 	var head = document.getElementsByTagName('head')[0];"
		+"\r\n 	if(head) {"
		+"\r\n 		head.appendChild(script);"
		+"\r\n 	} else {"
		+"\r\n 		document.appendChild(script);"
		+"\r\n 	}"
		+"\r\n }"

		+"\r\n function addFiles(fileList, typeOfFiles) {"
		+"\r\n 	fileList.map(function(fileURL) {"
		+"\r\n 	  var hash = hashCode(fileURL);"
		+"\r\n 	  var fileContent = window.localStorage.getItem(hash);"
		+"\r\n 	  if(!fileContent) {"
		+"\r\n 		var request = new XMLHttpRequest();"
		+"\r\n 		request.open('GET', fileURL, false);"
		+"\r\n 		request.send(null);"

		+"\r\n 		if (request.status === 200) {"
		+"\r\n 			fileContent = request.responseText;"
		+"\r\n 			window.localStorage.setItem(hash, fileContent);"
		+"\r\n 		} else {"
		+"\r\n 			console.log('Error ' + request.status + ' ' + request.statusText);"
		+"\r\n 		}"
		+"\r\n 	  }"

		+"\r\n 	  if(fileContent) {"
		+"\r\n 		if(typeOfFiles == 'css') addLink(fileContent);"
		+"\r\n 		if(typeOfFiles == 'js') addScript(fileContent);"
		+"\r\n 	  }"
		+"\r\n   });"
		+"\r\n }"
		+"\r\n addFiles(__meteor_fusion__.css, 'css');"
		+"\r\n addFiles(__meteor_fusion__.js, 'js');"
		+"\r\n addScript("
		+"\r\n 	  'if (typeof Package === \"undefined\" || '"
		+"\r\n 	+ '        ! Package.webapp || '"
		+"\r\n 	+ '        ! Package.webapp.WebApp || '"
		+"\r\n 	+ '        ! Package.webapp.WebApp._isCssLoaded()) '"
		+"\r\n 	+ '  document.location.reload();'"
		+"\r\n );"
		+"\r\n })()";
	}
}

connectHandlers.use(handleFusionRequest);

function handleFusionRequest(req, res, next) {
	if(req.url.match('/fusion$')) {
		res.setHeader("Content-Type", "application/javascript");
		res.end(getPayload(req.headers.host, FUSION));
	} else {
		if(req.url.match('/fusion-cordova$')) {
			res.setHeader("Content-Type", "application/javascript");
			res.end(getPayload(req.headers.host, FUSION_CORDOVA));
		} else {
			return next();
		}
	}
}
