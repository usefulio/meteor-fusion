var connectHandlers = WebApp.connectHandlers;

getPayload = function(hostName) {
	var jsFiles = [];
	var cssFiles = [];
	var rootUrl = Meteor.absoluteUrl("", { rootUrl: hostName });
	var clientManifest = WebApp.clientProgram.manifest;

	if(rootUrl[rootUrl.length - 1] == "/") {
		rootUrl = rootUrl.substr(0, rootUrl.length - 1);
	}

	_.each(clientManifest, function(fileSpec) {
		if(fileSpec.type === 'js' && fileSpec.where === 'client') {
			jsFiles.push(rootUrl+fileSpec.url);
		} else if(fileSpec.type === 'css' && fileSpec.where === 'client') {
			cssFiles.push(rootUrl+fileSpec.url);
		}
	});

	return "(function(){"
	+" window.history.replaceState( {} , '', '"+rootUrl+"' );"
	+"  var __meteor_fusion__ = {"
	+"    js: " + JSON.stringify(jsFiles)
	+"    , css: " + JSON.stringify(cssFiles)
	+"  };"
	+""
	+"  function addScript(src, loadCb, errorCb){"
	+"    var script = document.createElement('script');"
	+"    script.type = 'text/javascript';"
	+"    script.src = src;"
	+"    script.onload = loadCb;"
	+"    script.onerror = errorCb;"
	+"    script.async = false;"
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
	+"  __meteor_runtime_config__ = " + JSON.stringify(__meteor_runtime_config__) + ";"
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

connectHandlers.use(handleFusionRequest);

function handleFusionRequest(req, res, next) {
	if(req.url.match('/fusion$')) {
		res.setHeader("Content-Type", "application/javascript");
		res.end(getPayload(req.headers.host));
	} else {
		return next();
	}
}
