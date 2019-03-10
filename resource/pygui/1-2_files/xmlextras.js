//<script>
//////////////////
// Helper Stuff //
//////////////////

/* predefine node type string */
var NODE_ELEMENT                =  1;
var NODE_ATTRIBUTE              =  2;
var NODE_TEXT                   =  3;
var NODE_CDATA_SECTION          =  4;
var NODE_ENTITY_REFERENCE       =  5;
var NODE_ENTITY                 =  6;
var NODE_PROCESSING_INSTRUCTION =  7;
var NODE_COMMENT                =  8;
var NODE_DOCUMENT               =  9;
var NODE_DOCUMENT_TYPE          = 10;
var NODE_DOCUMENT_FRAGMENT      = 11;
var NODE_NOTATION               = 12;

/**
 * Unescape the given string. This turns the occurences of the predefined XML
 * entities to become the characters they represent correspond to the five predefined XML entities
 * @param sXml the string to unescape
 */
function xmlEscape(sXml) {
	var txt = sXml;
	txt = txt.replace("&", /&amp;/g);
	txt = txt.replace("'", /&apos;/g);
	// txt = txt.replace('"', /&quot;/g);
	txt = txt.replace(">", /&gt;/g);
	txt = txt.replace("<", /&lt;/g);
	return txt;
}

// ****************************************************************************
/**
 * used to get title
 *     @param object node : get title of node
 *     @param string node_name : title node name
 *     @return string title
 **/
function getCaption(node, node_name, unnamed) {
	var code = "";
	var nodes = null, def = null, titles = null;
	var re = /^(big5|gb2312|en|euc-jp|user-define)$/gi;
	var syslang = (typeof(lang) == "undefined") ? '' : lang.toLowerCase();

	if (typeof(unnamed) == 'undefined') unnamed = '--=[unnamed]=--';

	if ((typeof(node) != "object") || (node == null) || !node.hasChildNodes())
		return '';

	if ((typeof(node_name) == "undefined") || (node_name == "")) node_name = "title";

	nodes = node.childNodes;
	for (var i = 0; i < nodes.length; i++) {
		if ((nodes[i].nodeType != 1) || (nodes[i].nodeName != node_name)) continue;
		if (typeof(syslang) == "undefined" || syslang.search(re) < 0) {
			code = "big5";
			def = nodes.item(i).getAttribute('default');
			if ((def != null) && (def.search(re) >= 0)) code = def;
		} else {
			code = syslang;
		}

		titles = nodes[i].getElementsByTagName(code);
		if ((titles == null) || (titles.length < 1)) {
			return unnamed;
		} else {
			if (titles[0].firstChild != null)
			{
				return titles[0].firstChild.nodeValue;
			}
			else
			{
				var tmp = nodes[i].selectSingleNode('./*[text()]');	 // 若無設定當前語系, 則取第一個有設定的語系
				return tmp && tmp.firstChild ? tmp.firstChild.nodeValue : unnamed;
			}
		}
	}
	return unnamed;
}

/**
 * used to get title
 *     @param object node : get title of node
 *     @param string node_name : title node name
 *     @return string title
 **/
function getNodeValue(node, node_name) {
	var nodes = null;

	if ((typeof(node) != "object") || (node == null) || !node.hasChildNodes())
		return "";

	if ((typeof(node_name) == "undefined") || (node_name == "")) return "";

	nodes = node.childNodes;
	for (var i = 0; i < nodes.length; i++) {
		if ((nodes[i].nodeType != 1) || (nodes[i].nodeName != node_name)) continue;
		if (nodes[i].firstChild != null)
			return nodes[i].firstChild.nodeValue;
		else
			return "";
	}
	return "";
}
// ****************************************************************************
/**
 * used to clean empty text node
 * @param object node
 */
function rm_whitespace(node){
	if (node == null) return false;
	var nodes = node.childNodes;
	if (nodes.length == 0 || (nodes.length == 1 && nodes.item(0).nodeType == 3)) return;

	var i = nodes.length - 1;
	var prev_node;
	var cur_node = nodes.item(i);

	while(i > -1){
		cur_node = nodes.item(i);
		if (cur_node.nodeType == 3 && cur_node.nodeValue.search(/^\s+$/) == 0){
			node.removeChild(nodes.item(i));

		}
		else if(cur_node.nodeType == 1){
			rm_whitespace(cur_node);
		}
		i--;
	}
}

// used to find the Automation server name
function getDomDocumentPrefix() {
	if (getDomDocumentPrefix.prefix)
		return getDomDocumentPrefix.prefix;

	var prefixes = ['Msxml2.DomDocument.6.0', 'Msxml2.DomDocument.3.0', 'Microsoft.DomDocument'];
	var o;
	for (var i = 0; i < prefixes.length; i++) {
		try {
			// try to create the objects
			o = new ActiveXObject(prefixes[i]);
			return getDomDocumentPrefix.prefix = prefixes[i];
		}
		catch (ex) {};
	}

	throw new Error("Could not find an installed XML parser");
}

function getXmlHttpPrefix() {
	if (getXmlHttpPrefix.prefix)
		return getXmlHttpPrefix.prefix;

	var prefixes = ['Msxml2.XmlHttp.6.0', 'Msxml2.XmlHttp.3.0', 'Microsoft.XmlHttp'];
	var o;
	for (var i = 0; i < prefixes.length; i++) {
		try {
			// try to create the objects
			o = new ActiveXObject(prefixes[i]);
			return getXmlHttpPrefix.prefix = prefixes[i];
		}
		catch (ex) {};
	}

	throw new Error("Could not find an installed XML parser");
}

//////////////////////////
// Start the Real stuff //
//////////////////////////

// XmlHttp factory
function XmlHttp() {}

XmlHttp.create = function () {
	try {
		if (window.XMLHttpRequest) {
			var req = new XMLHttpRequest();

			// some versions of Moz do not support the readyState property
			// and the onreadystate event so we patch it!
			if (req.readyState == null) {
				req.readyState = 1;
				req.addEventListener("load", function () {
					req.readyState = 4;
					if (typeof req.onreadystatechange == "function")
						req.onreadystatechange();
				}, false);
			}

			return req;
		}
		if (window.ActiveXObject) {
			return new ActiveXObject(getXmlHttpPrefix());
		}
	}
	catch (ex) {}
	// fell through
	throw new Error("Your browser does not support XmlHttp objects");
};

// XmlDocument factory
function XmlDocument() {}

XmlDocument.create = function () {
	if (window.ActiveXObject)
		return new ActiveXObject(getDomDocumentPrefix());
	else
		return Sarissa.getDomDocument();
};

// #################### sarissa.js ####################
/**
 * ====================================================================
 * About Sarissa: http://dev.abiss.gr/sarissa
 * ====================================================================
 * Sarissa is an ECMAScript library acting as a cross-browser wrapper for native XML APIs.
 * The library supports Gecko based browsers like Mozilla and Firefox,
 * Internet Explorer (5.5+ with MSXML3.0+), Konqueror, Safari and Opera
 * @author: @author: Copyright 2004-2007 Emmanouil Batsis, mailto: mbatsis at users full stop sourceforge full stop net
 * ====================================================================
 * Licence
 * ====================================================================
 * Sarissa is free software distributed under the GNU GPL version 2 (see <a href="gpl.txt">gpl.txt</a>) or higher,
 * GNU LGPL version 2.1 (see <a href="lgpl.txt">lgpl.txt</a>) or higher and Apache Software License 2.0 or higher
 * (see <a href="asl.txt">asl.txt</a>). This means you can choose one of the three and use that if you like. If
 * you make modifications under the ASL, i would appreciate it if you submitted those.
 * In case your copy of Sarissa does not include the license texts, you may find
 * them online in various formats at <a href="http://www.gnu.org">http://www.gnu.org</a> and
 * <a href="http://www.apache.org">http://www.apache.org</a>.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
 * KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY,FITNESS FOR A PARTICULAR PURPOSE
 * AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * <p>Sarissa is a utility class. Provides "static" methods for DOMDocument,
 * DOM Node serialization to XML strings and other utility goodies.</p>
 * @constructor
 * @static
 */
function Sarissa(){}
Sarissa.VERSION = "0.9.9.4";
Sarissa.PARSED_OK = "Document contains no parsing errors";
Sarissa.PARSED_EMPTY = "Document is empty";
Sarissa.PARSED_UNKNOWN_ERROR = "Not well-formed or other error";
Sarissa.IS_ENABLED_TRANSFORM_NODE = false;
Sarissa.REMOTE_CALL_FLAG = "gr.abiss.sarissa.REMOTE_CALL_FLAG";
/** @private */
Sarissa._lastUniqueSuffix = 0;
/** @private */
Sarissa._getUniqueSuffix = function(){
	return Sarissa._lastUniqueSuffix++;
};
/** @private */
Sarissa._SARISSA_IEPREFIX4XSLPARAM = "";
/** @private */
Sarissa._SARISSA_HAS_DOM_IMPLEMENTATION = document.implementation && true;
/** @private */
Sarissa._SARISSA_HAS_DOM_CREATE_DOCUMENT = Sarissa._SARISSA_HAS_DOM_IMPLEMENTATION && document.implementation.createDocument;
/** @private */
Sarissa._SARISSA_HAS_DOM_FEATURE = Sarissa._SARISSA_HAS_DOM_IMPLEMENTATION && document.implementation.hasFeature;
/** @private */
Sarissa._SARISSA_IS_MOZ = Sarissa._SARISSA_HAS_DOM_CREATE_DOCUMENT && Sarissa._SARISSA_HAS_DOM_FEATURE;
/** @private */
Sarissa._SARISSA_IS_SAFARI = navigator.userAgent.toLowerCase().indexOf("safari") != -1 || navigator.userAgent.toLowerCase().indexOf("konqueror") != -1;
/** @private */
Sarissa._SARISSA_IS_SAFARI_OLD = Sarissa._SARISSA_IS_SAFARI && (parseInt((navigator.userAgent.match(/AppleWebKit\/(\d+)/)||{})[1], 10) < 420);
/** @private */
Sarissa._SARISSA_IS_IE = document.all && window.ActiveXObject && navigator.userAgent.toLowerCase().indexOf("msie") > -1  && navigator.userAgent.toLowerCase().indexOf("opera") == -1;
/** @private */
Sarissa._SARISSA_IS_OPERA = navigator.userAgent.toLowerCase().indexOf("opera") != -1;
if(!window.Node || !Node.ELEMENT_NODE){
	Node = {ELEMENT_NODE: 1, ATTRIBUTE_NODE: 2, TEXT_NODE: 3, CDATA_SECTION_NODE: 4, ENTITY_REFERENCE_NODE: 5,  ENTITY_NODE: 6, PROCESSING_INSTRUCTION_NODE: 7, COMMENT_NODE: 8, DOCUMENT_NODE: 9, DOCUMENT_TYPE_NODE: 10, DOCUMENT_FRAGMENT_NODE: 11, NOTATION_NODE: 12};
}

//This breaks for(x in o) loops in the old Safari
if(Sarissa._SARISSA_IS_SAFARI_OLD){
	HTMLHtmlElement = document.createElement("html").constructor;
	Node = HTMLElement = {};
	HTMLElement.prototype = HTMLHtmlElement.__proto__.__proto__;
	HTMLDocument = Document = document.constructor;
	var x = new DOMParser();
	XMLDocument = x.constructor;
	Element = x.parseFromString("<Single />", "text/xml").documentElement.constructor;
	x = null;
}
if(typeof XMLDocument == "undefined" && typeof Document !="undefined"){ XMLDocument = Document; }

// IE initialization
if(Sarissa._SARISSA_IS_IE){
	// for XSLT parameter names, prefix needed by IE
	Sarissa._SARISSA_IEPREFIX4XSLPARAM = "xsl:";
	// used to store the most recent ProgID available out of the above
	var _SARISSA_DOM_PROGID = "";
	var _SARISSA_XMLHTTP_PROGID = "";
	var _SARISSA_DOM_XMLWRITER = "";
	/**
	 * Called when the sarissa.js file is parsed, to pick most recent
	 * ProgIDs for IE, then gets destroyed.
	 * @memberOf Sarissa
	 * @private
	 * @param idList an array of MSXML PROGIDs from which the most recent will be picked for a given object
	 * @param enabledList an array of arrays where each array has two items; the index of the PROGID for which a certain feature is enabled
	 */
	Sarissa.pickRecentProgID = function (idList){
		// found progID flag
		var bFound = false, e;
		var o2Store;
		for(var i=0; i < idList.length && !bFound; i++){
			try{
				var oDoc = new ActiveXObject(idList[i]);
				o2Store = idList[i];
				bFound = true;
			}catch (objException){
				// trap; try next progID
				e = objException;
			}
		}
		if (!bFound) {
			throw "Could not retrieve a valid progID of Class: " + idList[idList.length-1]+". (original exception: "+e+")";
		}
		idList = null;
		return o2Store;
	};
	// pick best available MSXML progIDs
	_SARISSA_DOM_PROGID = null;
	_SARISSA_THREADEDDOM_PROGID = null;
	_SARISSA_XSLTEMPLATE_PROGID = null;
	_SARISSA_XMLHTTP_PROGID = null;
		/**
		 * Emulate XMLHttpRequest
		 * @constructor
		 */
		XMLHttpRequest = function() {
			if(!_SARISSA_XMLHTTP_PROGID){
				_SARISSA_XMLHTTP_PROGID = Sarissa.pickRecentProgID(["Msxml2.XMLHTTP.6.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP"]);
			}
			return new ActiveXObject(_SARISSA_XMLHTTP_PROGID);
		};
	// we dont need this anymore
	//============================================
	// Factory methods (IE)
	//============================================
	// see non-IE version
	Sarissa.getDomDocument = function(sUri, sName){
		if(!_SARISSA_DOM_PROGID){
			_SARISSA_DOM_PROGID = Sarissa.pickRecentProgID(["Msxml2.DOMDocument.6.0", "Msxml2.DOMDocument.3.0", "MSXML2.DOMDocument", "MSXML.DOMDocument", "Microsoft.XMLDOM"]);
		}
		var oDoc = new ActiveXObject(_SARISSA_DOM_PROGID);
		// if a root tag name was provided, we need to load it in the DOM object
		if (sName){
			// create an artifical namespace prefix
			// or reuse existing prefix if applicable
			var prefix = "";
			if(sUri){
				if(sName.indexOf(":") > 1){
					prefix = sName.substring(0, sName.indexOf(":"));
					sName = sName.substring(sName.indexOf(":")+1);
				}else{
                    prefix = "a" + Sarissa._getUniqueSuffix();
				}
			}
			// use namespaces if a namespace URI exists
			if(sUri){
				oDoc.loadXML('<' + prefix+':'+sName + " xmlns:" + prefix + "=\"" + sUri + "\"" + " />");
			} else {
				oDoc.loadXML('<' + sName + " />");
			}
		}
		return oDoc;
	};
	// see non-IE version
	Sarissa.getParseErrorText = function (oDoc) {
		var parseErrorText = Sarissa.PARSED_OK;
        if(oDoc && oDoc.parseError && oDoc.parseError.errorCode && oDoc.parseError.errorCode != 0){
			parseErrorText = "XML Parsing Error: " + oDoc.parseError.reason +
				"\nLocation: " + oDoc.parseError.url +
				"\nLine Number " + oDoc.parseError.line + ", Column " +
				oDoc.parseError.linepos +
				":\n" + oDoc.parseError.srcText +
				"\n";
			for(var i = 0;  i < oDoc.parseError.linepos;i++){
				parseErrorText += "-";
			}
			parseErrorText +=  "^\n";
		}
		else if(oDoc.documentElement === null){
			parseErrorText = Sarissa.PARSED_EMPTY;
		}
		return parseErrorText;
	};
	// see non-IE version
	Sarissa.setXpathNamespaces = function(oDoc, sNsSet) {
		oDoc.setProperty("SelectionLanguage", "XPath");
		oDoc.setProperty("SelectionNamespaces", sNsSet);
	};
	/**
	 * An implementation of Mozilla's XSLTProcessor for IE.
	 * Reuses the same XSLT stylesheet for multiple transforms
	 * @constructor
	 */
	XSLTProcessor = function(){
		if(!_SARISSA_XSLTEMPLATE_PROGID){
			_SARISSA_XSLTEMPLATE_PROGID = Sarissa.pickRecentProgID(["Msxml2.XSLTemplate.6.0", "MSXML2.XSLTemplate.3.0"]);
		}
		this.template = new ActiveXObject(_SARISSA_XSLTEMPLATE_PROGID);
		this.processor = null;
	};
	/**
	 * Imports the given XSLT DOM and compiles it to a reusable transform
	 * <b>Note:</b> If the stylesheet was loaded from a URL and contains xsl:import or xsl:include elements,it will be reloaded to resolve those
	 * @argument xslDoc The XSLT DOMDocument to import
	 */
	XSLTProcessor.prototype.importStylesheet = function(xslDoc){
		if(!_SARISSA_THREADEDDOM_PROGID){
			_SARISSA_THREADEDDOM_PROGID = Sarissa.pickRecentProgID(["MSXML2.FreeThreadedDOMDocument.6.0", "MSXML2.FreeThreadedDOMDocument.3.0"]);
		}
		xslDoc.setProperty("SelectionLanguage", "XPath");
		xslDoc.setProperty("SelectionNamespaces", "xmlns:xsl='http://www.w3.org/1999/XSL/Transform'");
		// convert stylesheet to free threaded
		var converted = new ActiveXObject(_SARISSA_THREADEDDOM_PROGID);
		// make included/imported stylesheets work if exist and xsl was originally loaded from url
		try{
			converted.resolveExternals = true;
			converted.setProperty("AllowDocumentFunction", true);
		}
		catch(e){
			// Ignore. "AllowDocumentFunction" is only supported in MSXML 3.0 SP4 and later.
		}
		if(xslDoc.url && xslDoc.selectSingleNode("//xsl:*[local-name() = 'import' or local-name() = 'include']") !== null){
			converted.async = false;
			converted.load(xslDoc.url);
		}
		else {
			converted.loadXML(xslDoc.xml);
		}
		converted.setProperty("SelectionNamespaces", "xmlns:xsl='http://www.w3.org/1999/XSL/Transform'");
		var output = converted.selectSingleNode("//xsl:output");
		//this.outputMethod = output ? output.getAttribute("method") : "html";
		if(output) {
			this.outputMethod = output.getAttribute("method");
		}
		else {
			delete this.outputMethod;
		}
		this.template.stylesheet = converted;
		this.processor = this.template.createProcessor();
		// for getParameter and clearParameters
		this.paramsSet = [];
	};

	/**
	 * Transform the given XML DOM and return the transformation result as a new DOM document
	 * @argument sourceDoc The XML DOMDocument to transform
	 * @return The transformation result as a DOM Document
	 */
	XSLTProcessor.prototype.transformToDocument = function(sourceDoc){
		// fix for bug 1549749
		var outDoc;
		if(_SARISSA_THREADEDDOM_PROGID){
			this.processor.input=sourceDoc;
			outDoc=new ActiveXObject(_SARISSA_DOM_PROGID);
			this.processor.output=outDoc;
			this.processor.transform();
			return outDoc;
		}
		else{
			if(!_SARISSA_DOM_XMLWRITER){
				_SARISSA_DOM_XMLWRITER = Sarissa.pickRecentProgID(["Msxml2.MXXMLWriter.6.0", "Msxml2.MXXMLWriter.3.0", "MSXML2.MXXMLWriter", "MSXML.MXXMLWriter", "Microsoft.XMLDOM"]);
			}
			this.processor.input = sourceDoc;
			outDoc = new ActiveXObject(_SARISSA_DOM_XMLWRITER);
			this.processor.output = outDoc;
			this.processor.transform();
			var oDoc = new ActiveXObject(_SARISSA_DOM_PROGID);
			oDoc.loadXML(outDoc.output+"");
			return oDoc;
		}
	};

	/**
	 * Transform the given XML DOM and return the transformation result as a new DOM fragment.
	 * <b>Note</b>: The xsl:output method must match the nature of the owner document (XML/HTML).
	 * @argument sourceDoc The XML DOMDocument to transform
	 * @argument ownerDoc The owner of the result fragment
	 * @return The transformation result as a DOM Document
	 */
	XSLTProcessor.prototype.transformToFragment = function (sourceDoc, ownerDoc) {
		this.processor.input = sourceDoc;
		this.processor.transform();
		var s = this.processor.output;
		var f = ownerDoc.createDocumentFragment();
		var container;
		if (this.outputMethod == 'text') {
			f.appendChild(ownerDoc.createTextNode(s));
		} else if (ownerDoc.body && ownerDoc.body.innerHTML) {
			container = ownerDoc.createElement('div');
			container.innerHTML = s;
			while (container.hasChildNodes()) {
				f.appendChild(container.firstChild);
			}
		}
		else {
			var oDoc = new ActiveXObject(_SARISSA_DOM_PROGID);
			if (s.substring(0, 5) == '<?xml') {
				s = s.substring(s.indexOf('?>') + 2);
			}
			var xml = ''.concat('<my>', s, '</my>');
			oDoc.loadXML(xml);
			container = oDoc.documentElement;
			while (container.hasChildNodes()) {
				f.appendChild(container.firstChild);
			}
		}
		return f;
	};

	/**
	 * Set global XSLT parameter of the imported stylesheet
	 * @argument nsURI The parameter namespace URI
	 * @argument name The parameter base name
	 * @argument value The new parameter value
	 */
	 XSLTProcessor.prototype.setParameter = function(nsURI, name, value){
		 // make value a zero length string if null to allow clearing
		 value = value ? value : "";
		 // nsURI is optional but cannot be null
		 if(nsURI){
			 this.processor.addParameter(name, value, nsURI);
		 }else{
			 this.processor.addParameter(name, value);
		 }
		 // update updated params for getParameter
		 nsURI = "" + (nsURI || "");
		 if(!this.paramsSet[nsURI]){
			 this.paramsSet[nsURI] = [];
		 }
		 this.paramsSet[nsURI][name] = value;
	 };
	/**
	 * Gets a parameter if previously set by setParameter. Returns null
	 * otherwise
	 * @argument name The parameter base name
	 * @argument value The new parameter value
	 * @return The parameter value if reviously set by setParameter, null otherwise
	 */
	XSLTProcessor.prototype.getParameter = function(nsURI, name){
		nsURI = "" + (nsURI || "");
		if(this.paramsSet[nsURI] && this.paramsSet[nsURI][name]){
			return this.paramsSet[nsURI][name];
		}else{
			return null;
		}
	};

	/**
	 * Clear parameters (set them to default values as defined in the stylesheet itself)
	 */
	XSLTProcessor.prototype.clearParameters = function(){
		for(var nsURI in this.paramsSet){
			for(var name in this.paramsSet[nsURI]){
                if(nsURI!=""){
					this.processor.addParameter(name, "", nsURI);
				}else{
					this.processor.addParameter(name, "");
				}
			}
		}
		this.paramsSet = [];
	};
}else{ /* end IE initialization, try to deal with real browsers now ;-) */
	if(Sarissa._SARISSA_HAS_DOM_CREATE_DOCUMENT){
		/**
		 * <p>Ensures the document was loaded correctly, otherwise sets the
		 * parseError to -1 to indicate something went wrong. Internal use</p>
		 * @private
		 */
		Sarissa.__handleLoad__ = function(oDoc){
			Sarissa.__setReadyState__(oDoc, 4);
		};
		/**
		* <p>Attached by an event handler to the load event. Internal use.</p>
		* @private
		*/
		_sarissa_XMLDocument_onload = function(){
			Sarissa.__handleLoad__(this);
		};
		/**
		 * <p>Sets the readyState property of the given DOM Document object.
		 * Internal use.</p>
		 * @memberOf Sarissa
		 * @private
		 * @argument oDoc the DOM Document object to fire the
		 *          readystatechange event
		 * @argument iReadyState the number to change the readystate property to
		 */
		Sarissa.__setReadyState__ = function(oDoc, iReadyState){
			oDoc.readyState = iReadyState;
			oDoc.readystate = iReadyState;
            if (oDoc.onreadystatechange != null && typeof oDoc.onreadystatechange == "function") {
				oDoc.onreadystatechange();
			}
		};

		Sarissa.getDomDocument = function(sUri, sName){
			var oDoc = document.implementation.createDocument(sUri?sUri:null, sName?sName:null, null);
			if(!oDoc.onreadystatechange){

				/**
				* <p>Emulate IE's onreadystatechange attribute</p>
				*/
				oDoc.onreadystatechange = null;
			}
			if(!oDoc.readyState){
				/**
				* <p>Emulates IE's readyState property, which always gives an integer from 0 to 4:</p>
				* <ul><li>1 == LOADING,</li>
				* <li>2 == LOADED,</li>
				* <li>3 == INTERACTIVE,</li>
				* <li>4 == COMPLETED</li></ul>
				*/
				oDoc.readyState = 0;
			}
			oDoc.addEventListener("load", _sarissa_XMLDocument_onload, false);
			return oDoc;
		};
		if(window.XMLDocument){
			// do nothing
		}// TODO: check if the new document has content before trying to copynodes, check  for error handling in DOM 3 LS
		else if(Sarissa._SARISSA_HAS_DOM_FEATURE && window.Document && !Document.prototype.load && document.implementation.hasFeature('LS', '3.0')){
			//Opera 9 may get the XPath branch which gives creates XMLDocument, therefore it doesn't reach here which is good
			/**
			* <p>Factory method to obtain a new DOM Document object</p>
			* @memberOf Sarissa
			* @argument sUri the namespace of the root node (if any)
			* @argument sUri the local name of the root node (if any)
			* @returns a new DOM Document
			*/
			Sarissa.getDomDocument = function(sUri, sName){
				var oDoc = document.implementation.createDocument(sUri?sUri:null, sName?sName:null, null);
				return oDoc;
			};
		}
		else {
			Sarissa.getDomDocument = function(sUri, sName){
				var oDoc = document.implementation.createDocument(sUri?sUri:null, sName?sName:null, null);
				// looks like safari does not create the root element for some unknown reason
				if(oDoc && (sUri || sName) && !oDoc.documentElement){
					oDoc.appendChild(oDoc.createElementNS(sUri, sName));
				}
				return oDoc;
			};
		}
	}//if(Sarissa._SARISSA_HAS_DOM_CREATE_DOCUMENT)
}
//==========================================
// Common stuff
//==========================================
if(!window.DOMParser){
	if(Sarissa._SARISSA_IS_SAFARI){
		/*
		 * DOMParser is a utility class, used to construct DOMDocuments from XML strings
		 * @constructor
		 */
		DOMParser = function() { };
		/**
		* Construct a new DOM Document from the given XMLstring
		* @param sXml the given XML string
		* @param contentType the content type of the document the given string represents (one of text/xml, application/xml, application/xhtml+xml).
		* @return a new DOM Document from the given XML string
		*/
		DOMParser.prototype.parseFromString = function(sXml, contentType){
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.open("GET", "data:text/xml;charset=utf-8," + encodeURIComponent(sXml), false);
			xmlhttp.send(null);
			return xmlhttp.responseXML;
		};
	}else if(Sarissa.getDomDocument && Sarissa.getDomDocument() && Sarissa.getDomDocument(null, "bar").xml){
		DOMParser = function() { };
		DOMParser.prototype.parseFromString = function(sXml, contentType){
			var doc = Sarissa.getDomDocument();
			doc.loadXML(sXml);
			return doc;
		};
	}
}

if((typeof(document.importNode) == "undefined") && Sarissa._SARISSA_IS_IE){
	try{
		/**
		* Implementation of importNode for the context window document in IE.
		* If <code>oNode</code> is a TextNode, <code>bChildren</code> is ignored.
		* @param oNode the Node to import
		* @param bChildren whether to include the children of oNode
		* @returns the imported node for further use
		*/
		document.importNode = function(oNode, bChildren){
			var tmp;
			if (oNode.nodeName=='#text') {
				return document.createTextNode(oNode.data);
			}
			else {
				if(oNode.nodeName == "tbody" || oNode.nodeName == "tr"){
					tmp = document.createElement("table");
				}
				else if(oNode.nodeName == "td"){
					tmp = document.createElement("tr");
				}
				else if(oNode.nodeName == "option"){
					tmp = document.createElement("select");
				}
				else{
					tmp = document.createElement("div");
				}
				if(bChildren){
					tmp.innerHTML = oNode.xml ? oNode.xml : oNode.outerHTML;
				}else{
					tmp.innerHTML = oNode.xml ? oNode.cloneNode(false).xml : oNode.cloneNode(false).outerHTML;
				}
				return tmp.getElementsByTagName("*")[0];
			}
		};
	}catch(e){ }
}
if(!Sarissa.getParseErrorText){
	/**
	 * <p>Returns a human readable description of the parsing error. Usefull
	 * for debugging. Tip: append the returned error string in a &lt;pre&gt;
	 * element if you want to render it.</p>
	 * <p>Many thanks to Christian Stocker for the initial patch.</p>
	 * @memberOf Sarissa
	 * @argument oDoc The target DOM document
	 * @returns The parsing error description of the target Document in
	 *          human readable form (preformated text)
	 */
	Sarissa.getParseErrorText = function (oDoc){
		var parseErrorText = Sarissa.PARSED_OK;
        if((!oDoc) || (!oDoc.documentElement)){
			parseErrorText = Sarissa.PARSED_EMPTY;
		} else if(oDoc.documentElement.tagName == "parsererror"){
			parseErrorText = oDoc.documentElement.firstChild.data;
			parseErrorText += "\n" +  oDoc.documentElement.firstChild.nextSibling.firstChild.data;
		} else if(oDoc.getElementsByTagName("parsererror").length > 0){
			var parsererror = oDoc.getElementsByTagName("parsererror")[0];
			parseErrorText = Sarissa.getText(parsererror, true)+"\n";
        } else if(oDoc.parseError && oDoc.parseError.errorCode != 0){
			parseErrorText = Sarissa.PARSED_UNKNOWN_ERROR;
		}
		return parseErrorText;
	};
}
/**
 * Get a string with the concatenated values of all string nodes under the given node
 * @memberOf Sarissa
 * @argument oNode the given DOM node
 * @argument deep whether to recursively scan the children nodes of the given node for text as well. Default is <code>false</code>
 */
Sarissa.getText = function(oNode, deep){
	var s = "";
	var nodes = oNode.childNodes;
	for(var i=0; i < nodes.length; i++){
		var node = nodes[i];
		var nodeType = node.nodeType;
		if(nodeType == Node.TEXT_NODE || nodeType == Node.CDATA_SECTION_NODE){
			s += node.data;
		} else if(deep === true && (nodeType == Node.ELEMENT_NODE || nodeType == Node.DOCUMENT_NODE || nodeType == Node.DOCUMENT_FRAGMENT_NODE)){
			s += Sarissa.getText(node, true);
		}
	}
	return s;
};
if(!window.XMLSerializer && Sarissa.getDomDocument && Sarissa.getDomDocument("","foo", null).xml){
	/**
	 * Utility class to serialize DOM Node objects to XML strings
	 * @constructor
	 */
	XMLSerializer = function(){};
	/**
	 * Serialize the given DOM Node to an XML string
	 * @param oNode the DOM Node to serialize
	 */
	XMLSerializer.prototype.serializeToString = function(oNode) {
		return oNode.xml;
	};
}

/**
 * Strips tags from the given markup string
 * @memberOf Sarissa
 */
Sarissa.stripTags = function (s) {
    return s?s.replace(/<[^>]+>/g,""):s;
};
/**
 * <p>Deletes all child nodes of the given node</p>
 * @memberOf Sarissa
 * @argument oNode the Node to empty
 */
Sarissa.clearChildNodes = function(oNode) {
	// need to check for firstChild due to opera 8 bug with hasChildNodes
	while(oNode.firstChild) {
		oNode.removeChild(oNode.firstChild);
	}
};
/**
 * <p> Copies the childNodes of nodeFrom to nodeTo</p>
 * <p> <b>Note:</b> The second object's original content is deleted before
 * the copy operation, unless you supply a true third parameter</p>
 * @memberOf Sarissa
 * @argument nodeFrom the Node to copy the childNodes from
 * @argument nodeTo the Node to copy the childNodes to
 * @argument bPreserveExisting whether to preserve the original content of nodeTo, default is false
 */
Sarissa.copyChildNodes = function(nodeFrom, nodeTo, bPreserveExisting) {
	if(Sarissa._SARISSA_IS_SAFARI && nodeTo.nodeType == Node.DOCUMENT_NODE){ // SAFARI_OLD ??
		nodeTo = nodeTo.documentElement; //Appearantly there's a bug in safari where you can't appendChild to a document node
	}

	if((!nodeFrom) || (!nodeTo)){
		throw "Both source and destination nodes must be provided";
	}
	if(!bPreserveExisting){
		Sarissa.clearChildNodes(nodeTo);
	}
	var ownerDoc = nodeTo.nodeType == Node.DOCUMENT_NODE ? nodeTo : nodeTo.ownerDocument;
	var nodes = nodeFrom.childNodes;
	var i;
	if(typeof(ownerDoc.importNode) != "undefined")  {
		for(i=0;i < nodes.length;i++) {
			nodeTo.appendChild(ownerDoc.importNode(nodes[i], true));
		}
	} else {
		for(i=0;i < nodes.length;i++) {
			nodeTo.appendChild(nodes[i].cloneNode(true));
		}
	}
};

/**
 * <p> Moves the childNodes of nodeFrom to nodeTo</p>
 * <p> <b>Note:</b> The second object's original content is deleted before
 * the move operation, unless you supply a true third parameter</p>
 * @memberOf Sarissa
 * @argument nodeFrom the Node to copy the childNodes from
 * @argument nodeTo the Node to copy the childNodes to
 * @argument bPreserveExisting whether to preserve the original content of nodeTo, default is
 */
Sarissa.moveChildNodes = function(nodeFrom, nodeTo, bPreserveExisting) {
	if((!nodeFrom) || (!nodeTo)){
		throw "Both source and destination nodes must be provided";
	}
	if(!bPreserveExisting){
		Sarissa.clearChildNodes(nodeTo);
	}
	var nodes = nodeFrom.childNodes;
	// if within the same doc, just move, else copy and delete
	if(nodeFrom.ownerDocument == nodeTo.ownerDocument){
		while(nodeFrom.firstChild){
			nodeTo.appendChild(nodeFrom.firstChild);
		}
	} else {
		var ownerDoc = nodeTo.nodeType == Node.DOCUMENT_NODE ? nodeTo : nodeTo.ownerDocument;
		var i;
		if(typeof(ownerDoc.importNode) != "undefined") {
		   for(i=0;i < nodes.length;i++) {
			   nodeTo.appendChild(ownerDoc.importNode(nodes[i], true));
		   }
		}else{
		   for(i=0;i < nodes.length;i++) {
			   nodeTo.appendChild(nodes[i].cloneNode(true));
		   }
		}
		Sarissa.clearChildNodes(nodeFrom);
	}
};

/**
 * <p>Serialize any <strong>non</strong> DOM object to an XML string. All properties are serialized using the property name
 * as the XML element name. Array elements are rendered as <code>array-item</code> elements,
 * using their index/key as the value of the <code>key</code> attribute.</p>
 * @memberOf Sarissa
 * @argument anyObject the object to serialize
 * @argument objectName a name for that object
 * @return the XML serialization of the given object as a string
 */
Sarissa.xmlize = function(anyObject, objectName, indentSpace){
	indentSpace = indentSpace?indentSpace:'';
	var s = indentSpace  + '<' + objectName + '>';
	var isLeaf = false;
	if(!(anyObject instanceof Object) || anyObject instanceof Number || anyObject instanceof String || anyObject instanceof Boolean || anyObject instanceof Date){
		s += Sarissa.escape(""+anyObject);
		isLeaf = true;
	}else{
		s += "\n";
		var isArrayItem = anyObject instanceof Array;
		for(var name in anyObject){
			s += Sarissa.xmlize(anyObject[name], (isArrayItem?"array-item key=\""+name+"\"":name), indentSpace + "   ");
		}
		s += indentSpace;
	}
	return (s += (objectName.indexOf(' ')!=-1?"</array-item>\n":"</" + objectName + ">\n"));
};

/**
 * Escape the given string chacters that correspond to the five predefined XML entities
 * @memberOf Sarissa
 * @param sXml the string to escape
 */
Sarissa.escape = function(sXml){
	return sXml.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
};

/**
 * Unescape the given string. This turns the occurences of the predefined XML
 * entities to become the characters they represent correspond to the five predefined XML entities
 * @memberOf Sarissa
 * @param sXml the string to unescape
 */
Sarissa.unescape = function(sXml){
	return sXml.replace(/&apos;/g,"'").replace(/&quot;/g,"\"").replace(/&gt;/g,">").replace(/&lt;/g,"<").replace(/&amp;/g,"&");
};

/** @private */
Sarissa.updateCursor = function(oTargetElement, sValue) {
    if(oTargetElement && oTargetElement.style && oTargetElement.style.cursor != undefined ){
		oTargetElement.style.cursor = sValue;
	}
};
//   EOF

// #################### sarissa_ieemu_xpath.js ####################
/**
 * ====================================================================
 * About
 * ====================================================================
 * Sarissa cross browser XML library - IE XPath Emulation
 * @version 0.9.9
 * @author: Copyright 2004-2007 Emmanouil Batsis, mailto: mbatsis at users full stop sourceforge full stop net
 *
 * This script emulates Internet Explorer's selectNodes and selectSingleNode
 * for Mozilla. Associating namespace prefixes with URIs for your XPath queries
 * is easy with IE's setProperty.
 * USers may also map a namespace prefix to a default (unprefixed) namespace in the
 * source document with Sarissa.setXpathNamespaces
 *
 * ====================================================================
 * Licence
 * ====================================================================
 * Sarissa is free software distributed under the GNU GPL version 2 (see <a href="gpl.txt">gpl.txt</a>) or higher,
 * GNU LGPL version 2.1 (see <a href="lgpl.txt">lgpl.txt</a>) or higher and Apache Software License 2.0 or higher
 * (see <a href="asl.txt">asl.txt</a>). This means you can choose one of the three and use that if you like. If
 * you make modifications under the ASL, i would appreciate it if you submitted those.
 * In case your copy of Sarissa does not include the license texts, you may find
 * them online in various formats at <a href="http://www.gnu.org">http://www.gnu.org</a> and
 * <a href="http://www.apache.org">http://www.apache.org</a>.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
 * KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY,FITNESS FOR A PARTICULAR PURPOSE
 * AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
if(Sarissa._SARISSA_HAS_DOM_FEATURE && document.implementation.hasFeature("XPath", "3.0")){
	/**
	* <p>SarissaNodeList behaves as a NodeList but is only used as a result to <code>selectNodes</code>,
	* so it also has some properties IEs proprietery object features.</p>
	* @private
	* @constructor
	* @argument i the (initial) list size
	*/
	SarissaNodeList = function (i){
		this.length = i;
	};
	/** <p>Set an Array as the prototype object</p> */
    SarissaNodeList.prototype = [];
	/** <p>Inherit the Array constructor </p> */
	SarissaNodeList.prototype.constructor = Array;
	/**
	* <p>Returns the node at the specified index or null if the given index
	* is greater than the list size or less than zero </p>
	* <p><b>Note</b> that in ECMAScript you can also use the square-bracket
	* array notation instead of calling <code>item</code>
	* @argument i the index of the member to return
	* @returns the member corresponding to the given index
	*/
	SarissaNodeList.prototype.item = function(i) {
		return (i < 0 || i >= this.length)?null:this[i];
	};
	/**
	* <p>Emulate IE's expr property
	* (Here the SarissaNodeList object is given as the result of selectNodes).</p>
	* @returns the XPath expression passed to selectNodes that resulted in
	*          this SarissaNodeList
	*/
	SarissaNodeList.prototype.expr = "";
	/** dummy, used to accept IE's stuff without throwing errors */
	if(window.XMLDocument && (!XMLDocument.prototype.setProperty)){
		XMLDocument.prototype.setProperty  = function(x,y){};
    }
	/**
	* <p>Programmatically control namespace URI/prefix mappings for XPath
	* queries.</p>
	* <p>This method comes especially handy when used to apply XPath queries
	* on XML documents with a default namespace, as there is no other way
	* of mapping that to a prefix.</p>
	* <p>Using no namespace prefix in DOM Level 3 XPath queries, implies you
	* are looking for elements in the null namespace. If you need to look
	* for nodes in the default namespace, you need to map a prefix to it
	* first like:</p>
	* <pre>Sarissa.setXpathNamespaces(oDoc, &quot;xmlns:myprefix=&amp;aposhttp://mynsURI&amp;apos&quot;);</pre>
	* <p><b>Note 1 </b>: Use this method only if the source document features
	* a default namespace (without a prefix), otherwise just use IE's setProperty
	* (moz will rezolve non-default namespaces by itself). You will need to map that
	* namespace to a prefix for queries to work.</p>
	* <p><b>Note 2 </b>: This method calls IE's setProperty method to set the
	* appropriate namespace-prefix mappings, so you dont have to do that.</p>
	* @param oDoc The target XMLDocument to set the namespace mappings for.
	* @param sNsSet A whilespace-seperated list of namespace declarations as
	*            those would appear in an XML document. E.g.:
	*            <code>&quot;xmlns:xhtml=&apos;http://www.w3.org/1999/xhtml&apos;
	* xmlns:&apos;http://www.w3.org/1999/XSL/Transform&apos;&quot;</code>
	* @throws An error if the format of the given namespace declarations is bad.
	*/
	Sarissa.setXpathNamespaces = function(oDoc, sNsSet) {
		//oDoc._sarissa_setXpathNamespaces(sNsSet);
		oDoc._sarissa_useCustomResolver = true;
        var namespaces = sNsSet.indexOf(" ")>-1?sNsSet.split(" "):[sNsSet];
        oDoc._sarissa_xpathNamespaces = [];
		for(var i=0;i < namespaces.length;i++){
			var ns = namespaces[i];
			var colonPos = ns.indexOf(":");
			var assignPos = ns.indexOf("=");
			if(colonPos > 0 && assignPos > colonPos+1){
				var prefix = ns.substring(colonPos+1, assignPos);
				var uri = ns.substring(assignPos+2, ns.length-1);
				oDoc._sarissa_xpathNamespaces[prefix] = uri;
			}else{
				throw "Bad format on namespace declaration(s) given";
            }
        }
	};
	/**
	* @private Flag to control whether a custom namespace resolver should
	*          be used, set to true by Sarissa.setXpathNamespaces
	*/
	XMLDocument.prototype._sarissa_useCustomResolver = false;
	/** @private */
    XMLDocument.prototype._sarissa_xpathNamespaces = [];
	/**
	* <p>Extends the XMLDocument to emulate IE's selectNodes.</p>
	* @argument sExpr the XPath expression to use
	* @argument contextNode this is for internal use only by the same
	*           method when called on Elements
	* @returns the result of the XPath search as a SarissaNodeList
	* @throws An error if no namespace URI is found for the given prefix.
	*/
	XMLDocument.prototype.selectNodes = function(sExpr, contextNode, returnSingle){
		var nsDoc = this;
        var nsresolver;
        if(this._sarissa_useCustomResolver){
            nsresolver = function(prefix){
			var s = nsDoc._sarissa_xpathNamespaces[prefix];
                if(s){
                    return s;
                }
                else {
                    throw "No namespace URI found for prefix: '" + prefix+"'";
                }
            };
        }
        else{
            nsresolver = this.createNSResolver(this.documentElement);
			}
		var result = [];
		if(!returnSingle){
			try
			{
				var oResult = this.evaluate(sExpr,
					(contextNode?contextNode:this),
					nsresolver,
					XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
				var nodeList = new SarissaNodeList(oResult.snapshotLength);
				nodeList.expr = sExpr;
				for(var i=0;i<nodeList.length;i++){
					nodeList[i] = oResult.snapshotItem(i);
					result = nodeList;
				}
			}
			catch (ex)
			{
				result = [];
			}
		}
		else {
			try
			{
				result = this.evaluate(sExpr,
					(contextNode?contextNode:this),
					nsresolver,
					XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			}
			catch (ex)
			{
				return [];
			}
        }
		return result;
	};
	/**
	* <p>Extends the Element to emulate IE's selectNodes</p>
	* @argument sExpr the XPath expression to use
	* @returns the result of the XPath search as an (Sarissa)NodeList
	* @throws An
	*             error if invoked on an HTML Element as this is only be
	*             available to XML Elements.
	*/
	Element.prototype.selectNodes = function(sExpr){
		var doc = this.ownerDocument;
        if(doc.selectNodes){
			return doc.selectNodes(sExpr, this);
        }
        else{
			throw "Method selectNodes is only supported by XML Elements";
        }
	};
	/**
	* <p>Extends the XMLDocument to emulate IE's selectSingleNode.</p>
	* @argument sExpr the XPath expression to use
	* @argument contextNode this is for internal use only by the same
	*           method when called on Elements
	* @returns the result of the XPath search as an (Sarissa)NodeList
	*/
	XMLDocument.prototype.selectSingleNode = function(sExpr, contextNode){
		var ctx = contextNode?contextNode:null;
		return this.selectNodes(sExpr, ctx, true);
	};
	/**
	* <p>Extends the Element to emulate IE's selectSingleNode.</p>
	* @argument sExpr the XPath expression to use
	* @returns the result of the XPath search as an (Sarissa)NodeList
	* @throws An error if invoked on an HTML Element as this is only be
	*             available to XML Elements.
	*/
	Element.prototype.selectSingleNode = function(sExpr){
		var doc = this.ownerDocument;
        if(doc.selectSingleNode){
			return doc.selectSingleNode(sExpr, this);
        }
        else{
			throw "Method selectNodes is only supported by XML Elements";
        }
	};
	Sarissa.IS_ENABLED_SELECT_NODES = true;
};

// ################################################
// Create the loadXML method and xml getter for Mozilla
/*
if (window.DOMParser &&
	window.XMLSerializer &&
	window.Node && Node.prototype && Node.prototype.__defineGetter__) {
*/
if (window.DOMParser && window.XMLSerializer && window.XMLDocument)
{

	/**
	 * <p>Deletes all child Nodes of the Document. Internal use</p>
	 * @private
	 */
	XMLDocument.prototype._clearDOM = function () {
		while (this.hasChildNodes())
			this.removeChild(this.firstChild);
	};

	/**
	 * <p>Replaces the childNodes of the Document object with the childNodes of
	 * the object given as the parameter</p>
	 * @private
	 * @argument oDoc the Document to copy the childNodes from
	 */
	XMLDocument.prototype._copyDOM = function (oDoc) {
		this._clearDOM();
		if (oDoc.nodeType == NODE_DOCUMENT || oDoc.nodeType == NODE_DOCUMENT_FRAGMENT) {
			var oNodes = oDoc.childNodes;
			for (var i = 0; i < oNodes.length; i++)
				this.appendChild(this.importNode(oNodes[i], true));
		} else if (oDoc.nodeType == NODE_ELEMENT)
			this.appendChild(this.importNode(oDoc, true));
	};

	// XMLDocument did not extend the Document interface in some versions
	// of Mozilla. Extend both!
	XMLDocument.prototype.loadXML =
	Document.prototype.loadXML = function (s)
	{
		// parse the string to a new doc
		try {
			var doc2 = (new DOMParser()).parseFromString(s, "text/xml");
			// if parse error, it will return parse error message, package by xml
			// it whil be not always, so need check of have change on mozilla version change
			// mozilla 1.3 tested
			//var nodes = doc2.getElementsByTagNameNS("http://www.mozilla.org/newlayout/xml/parsererror.xml", "parsererror");
			var nodes = doc2.getElementsByTagName("parsererror");
			if ((nodes != null) && (nodes.length > 0)) {
				throw new Error("Parse Error.");
			}

			if (!this.preserveWhiteSpace) rm_whitespace(doc2.documentElement);
			this._copyDOM(doc2);
			return true;
		}
		catch (ex) {
			return false;
		}
	};


	if (window.Node && Node.prototype && Node.prototype.__defineGetter__)
	{
		/*
		 * xml getter
		 *
		 * This serializes the DOM tree to an XML String
		 *
		 * Usage: var sXml = oNode.xml
		 *
		 */
		// XMLDocument did not extend the Document interface in some versions
		// of Mozilla. Extend both!
		XMLDocument.prototype.__defineGetter__("xml", function () {
			return (new XMLSerializer()).serializeToString(this);
		});
		Document.prototype.__defineGetter__("xml", function () {
			return (new XMLSerializer()).serializeToString(this);
		});
		Node.prototype.__defineGetter__("xml", function () {
			return (new XMLSerializer()).serializeToString(this);
		});

		XMLDocument.prototype.__defineSetter__("xml", function () {
			throw new Error("Invalid assignment on read-only property 'xml'. Hint: Use the 'loadXML(String xml)' method instead.");
		});

		/**
		 * <p>Emulates IE's innerText (read/write). Note that this removes all
		 * childNodes of an HTML Element and just replaces it with a textNode</p>
		 */
		try{
		HTMLElement.prototype.innerText;
		}catch(e){
		}
		HTMLElement.prototype.__defineSetter__("innerText", function (sText) {
			var s = "" + sText;
			s = s.replace(/\&/g, "&amp;");
			s = s.replace(/</g, "&lt;");
			s = s.replace(/>/g, "&gt;");
			this.innerHTML = s;
		});

		HTMLElement.prototype.__defineGetter__("innerText", function () {
			var _WSMULT = new RegExp("^\\s*|\\s*$", "g");
			var _WSENDS = new RegExp("\\s\\s+", "g");
			var s = this.innerHTML;
			s = s.replace(/<[^>]+>/g,"");
			s = s.replace(_WSENDS, " ");
			s = s.replace(_WSMULT, " ");
			return s;
		});

		Node.prototype.__defineSetter__("text", function (sText) {
			this.nodeValue = sText;
		});

		Node.prototype.__defineGetter__("text", function () {
			return this.textContent;
		});

		Node.prototype.transformNode = function (oXslDom) {
			var oProcessor = new XSLTProcessor();
			oProcessor.importStylesheet(oXslDom);
			var oResultDom = oProcessor.transformToDocument(this);
			var sResult = oResultDom.xml;
			if (sResult.indexOf("<transformiix:result") > -1) {
				sResult = sResult.substring(sResult.indexOf(">") + 1,
											sResult.lastIndexOf("<"));
			}
			return sResult;
		};
	}
}
var isXmlExtras = true;
