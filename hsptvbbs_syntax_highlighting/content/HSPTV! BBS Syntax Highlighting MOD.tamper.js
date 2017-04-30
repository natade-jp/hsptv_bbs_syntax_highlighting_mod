// ==UserScript==
// @name       HSPTV! BBS Syntax Highlighting MOD
// @namespace  https://twitter.com/natadea
// @version    1.1.2
// @description  HSPTV!掲示板のコード表示等を変更します。非公式です。
// @match      http://hsp.tv/play/pforum.php?mode=*
// @copyright  2014, natade
// @grant      none
// ==/UserScript==

// original code by natade
// MIT License
// DOM準拠のブラウザで動作します。

var Natade = {

	init: function() {
		window.removeEventListener("load", Natade.init, false);
		window.addEventListener("DOMContentLoaded", Natade.onContentLoad, false);
	},
	
	isOperate: function() {
		if(Natade.isOperateForHspTv()) {
			return(true);
		}
		return(false);
	},
	
	getURL: function() {
		// firefox
		if(window.content && window.content.location) {
			// window.top.getBrowser().selectedBrowser.contentWindow.location.href;
			// var currentWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser");
			// currentWindow.getBrowser().currBrowseSession.currentURI.spec
			return(window.content.location.href);
		}
		else {
			// window.location.href でもいい？
			return(document.location.href);
		}
	},
	
	getDocument: function() {
		var targetwindow = window.top && window.top.getBrowser && window.top.getBrowser().selectedBrowser.contentWindow;
		if(targetwindow !== undefined) {
			return(targetwindow.document);
		}
		else {
			return(window.document);
		}
	},
	
	isOperateForHspTv: function() {
		// サイト名が正しいか
		if(!Natade.getDocument().title.match(/HSPTV!掲示板$/)) {
			return(false);
		}
		// URLが正しいか
		var href = Natade.getURL();
		if(href.indexOf("http://hsp.tv/play/pforum.php?mode=") === 0) {
			return(true);
		}
		else if(href.indexOf("file") === 0) {
			return(true);
		}
		return(false);
	},

	onContentLoad:function() {
		
		if(!Natade.isOperate()) {
			return;
		}
		
		// デバッグ用
		var mes = function(text) {
			// Chrome / Firefox / IE
			if(typeof console !== "undefined") {
				console.log(text);
			}
		};
		
		// 言語間の違い
		var Dictionary = (function() {
			function Dictionary() {
				var browser_language = window.navigator.language.toLowerCase();
				if(/ja|jp/.test(browser_language)) {
					this.language = Dictionary.LANGUAGE_JAPANESE;
				}
				else {
					this.language = Dictionary.LANGUAGE_ENGLISH;
				}
			}
			Dictionary.prototype.translation = function(text_type) {
				switch(this.language) {
					case Dictionary.LANGUAGE_JAPANESE:
						switch(text_type) {
							case Dictionary.TEXT_COPY:
								return("copy");
							case Dictionary.TEXT_PUSHCTRLC:
								return("「Ctrl + C」を押してください。");
							default:
								return("");
						}
						break;
					default:
						switch(text_type) {
							case Dictionary.TEXT_COPY:
								return("copy");
							case Dictionary.TEXT_PUSHCTRLC:
								return("Please press Ctrl + C");
							default:
								return("");
						}
						break;
				}
				return("");
			};
			return(Dictionary);
		})();
		Dictionary.LANGUAGE_ENGLISH			= 0;
		Dictionary.LANGUAGE_JAPANESE		= 1;
		Dictionary.TEXT_COPY				= 0;
		Dictionary.TEXT_PUSHCTRLC			= 1;
		var dict = new Dictionary();

		// ブラウザ間の違い
		var CompatibilityBrowser = (function() {
			function CompatibilityBrowser() {
				this._isWebKit	= false;
				this._isChrome	= false;
				this._isFirefox	= false;
				this._isTrident	= false;
				this._isSafari	= false;
				var userAgent = window.navigator.userAgent.toLowerCase();
				if(userAgent.indexOf("webkit") !== -1) {
					this._isWebKit = true;
				}
				if(userAgent.indexOf("chrome") !== -1) {
					this._isChrome = true;
				}
				else if(userAgent.indexOf("firefox") !== -1) {
					this._isFirefox = true;
				}
				// InternetExplore 9
				else if(userAgent.indexOf("trident") !== -1) {
					this._isTrident = true;
				}
				else if(userAgent.indexOf("safari") !== -1) {
					this._isSafari = true;
				}
			}
			CompatibilityBrowser.prototype.setBackgroundLinearGradient = function(style, parameter) {
				if(this._isWebKit) {
					style.background = "-webkit-linear-gradient(" + parameter + ")";
				}
				if(this._isFirefox) {
					style.background = "-moz-linear-gradient(" + parameter + ")";
				}
				if(this._isTrident) {
					style.background = "-ms-linear-gradient(" + parameter + ")";
				}
				else {
					style.background = "linear-gradient(" + parameter + ")";
				}
				style.background = "linear-gradient(" + parameter + ")";
			};
			return(CompatibilityBrowser);
		})();
		var cb = new CompatibilityBrowser();
		
		
		// ユーティリティー
		var Utility = (function() {
			function Utility() {
			}
			Utility.prototype.makeStyleSheet = function() {
				var head = doc.getElementsByTagName("head")[0];
				var style = doc.createElement("style");
				style.setAttribute("type", "text/css");
				head.appendChild(style);
				var sheet = style.sheet;
				return(sheet);
			};
			// Firefoxの拡張機能に入れた場合でも正しく取れるwindow
			Utility.prototype.getWindow = function() {
				var targetwindow = window.top && window.top.getBrowser && window.top.getBrowser().selectedBrowser.contentWindow;
				if(targetwindow !== undefined) {
					return(targetwindow);
				}
				else {
					return(window);
				}
			};
			// Firefoxの拡張機能に入れた場合でも正しく取れるdocument
			Utility.prototype.getDocument = function() {
				return(this.getWindow().document);
			};
			// モード互換のBody
			Utility.prototype.getBody = function() {
				var doc = this.getDocument();
				if(doc.compatMode === "CSS1Compat"){
					// CSS1Compat 標準モード
					return(doc.documentElement);
				} else{
					// BackCompat 後方互換モード
					return(doc.body);
				}
			};
			// 要素の位置
			Utility.prototype.getElementPosition = function(element) {
				var x	= 0;
				var y	= 0;
				while(element){
					x	+= element.offsetLeft;
					y	+= element.offsetTop;
					element = element.offsetParent;
				}
				return({"x" : x, "y" : y});
			};
			// 要素のサイズ
			Utility.prototype.getElementSize = function(element) {
				var width	= element.offsetWidth;
				var height	= element.offsetHeight;
				return({"width" : width, "height" : height});
			};
			// 要素の中央の位置
			Utility.prototype.getElementCenterPosition = function(element) {
				var position	= this.getElementPosition(element);
				var size		= this.getElementSize(element);
				var x	= position.x + size.width * 0.5;
				var y	= position.y + size.height * 0.5;
				return({"x" : x,"y" : y});
			};
			// スクロール位置
			Utility.prototype.getScrollPosition = function() {
				var body = this.getBody();
				var x	= body.scrollLeft;
				var y	= body.scrollTop;
				return({"x" : x,"y" : y});
			};
			// ページ全体からスクリーンの中央位置
			Utility.prototype.getScreenCenterPosition = function() {
				var position	= this.getScrollPosition();
				var size		= this.getScreenSize();
				var x	= position.x + size.width * 0.5;
				var y	= position.y + size.height * 0.5;
				return({"x" : x,"y" : y});
			};
			// 実際の表示させせているページの大きさ
			Utility.prototype.getPageSize = function() {
				var body = this.getBody();
				var width	= body.scrollWidth;
				var height	= body.scrollHeight;
				return({"width" : width, "height" : height});
			};
			// 画面の大きさ
			Utility.prototype.getScreenSize = function() {
				var body = this.getBody();
				var width	= body.clientWidth;
				var height	= body.clientHeight;
				return({"width" : width, "height" : height});
			};
			// スクロールできる範囲
			Utility.prototype.getClippedScrollSize = function() {
				var screen	= this.getScreenSize();
				var page	= this.getPageSize();
				var width	= page.width  - screen.width;
				var height	= page.height - screen.height;
				return({"width" : width, "height" : height});
			};
			// 指定したエレメントへ飛ぶ
			Utility.prototype.scrollToNode = function(element) {
				if(element === null) {
					return;
				}
				var dist = function(p1, p2) {
					var dx = p1.x - p2.x;
					var dy = p1.y - p2.y;
					return(Math.sqrt(dx * dx + dy * dy));
				}
				var lerp = function(v0, v1, x) {
					return((1.0 - x) * v0 + x * v1);
				}
				var hermitian5 = function(v0, v1, x) {
					return(lerp(v0, v1, x*x*x * ( 6.0*x*x - 15.0*x + 10.0 ) ));
				}
				var w			= this.getWindow();
				var start		= this.getScreenCenterPosition();
				var end			= this.getElementCenterPosition(element);
				var dist		= dist(start, end);
				var time		= 0.0003;
				var t			= 0.0;
				var fps			= 30;
				var interval	= 1000 / fps;
				var delta		= time * dist / fps;
				if(delta < 0.05) {
					delta = 0.05;
				}
				var ox 			= start.x;
				var oy 			= start.y;
				
				var scroll = function() {
					if(t >= 1.0) {
						return;
					}
					t += delta;
					var nx = Math.round(hermitian5(start.x, end.x, t));
					var ny = Math.round(hermitian5(start.y, end.y, t));
					w.scrollBy(nx - ox, ny - oy);
					ox = nx;
					oy = ny;
					setTimeout(scroll, interval);
				};
				scroll();
			};
			
			return(Utility);
			
		})();
		var util = new Utility();
		var doc = util.getDocument();
		
		//--------------------------------------------------------------------------
		// Classes - 大まかなクラス付け等

		var ClassesDefine = {
		};
		ClassesDefine.HSP			= "classes_";
		ClassesDefine.SUBMISSION	= ClassesDefine.HSP + "submission";
		ClassesDefine.ICON			= ClassesDefine.HSP + "bbsmascot";
		ClassesDefine.IPADDRESS		= ClassesDefine.HSP + "ipadress";
		ClassesDefine.NAME			= ClassesDefine.HSP + "name";
		ClassesDefine.HOMEPAGE		= ClassesDefine.HSP + "homepage";
		ClassesDefine.POSTTIME		= ClassesDefine.HSP + "post_time";
		ClassesDefine.BODYTEXT		= ClassesDefine.HSP + "body_text";
		// 本文用
		ClassesDefine.QUOTE			= ClassesDefine.BODYTEXT + "_quote";
		ClassesDefine.PLAIN			= ClassesDefine.BODYTEXT + "_plain";
		ClassesDefine.CODE			= ClassesDefine.BODYTEXT + "_code";
		ClassesDefine.LINK			= ClassesDefine.BODYTEXT + "_link";

		var Classes = (function() {
			function Classes() {
				// 変数の宣言
				this.sourcecode = [];
			}
			
			Classes.prototype.attachClassForHTB = function() {
				var my = this;
				// 色々な部分をクラスに割り当てる
				var attachClass = function() {
					{
						// ターゲットのTDを探す
						var COMMENT_NODE = 8;
						var all_table = doc.getElementsByTagName("table");
						if(all_table.length < 4) {
							return(false);
						}
						var all_td = all_table[3].getElementsByTagName("td");
						if(all_td.length < 2) {
							return(false);
						}
						var td = all_td[1];
						// まずはメインテーブル直下の書き込みとコメントアウトを抽出
						var node = td.childNodes;
						for(var ni = 0; ni < node.length; ni++){
							if(node[ni].nodeName === "TABLE") {
								var url = node[ni].getAttribute("background");
								if((url !== null) && (url.indexOf("back") !== -1)) {
									node[ni].className = ClassesDefine.SUBMISSION;
								}
							}
							else if(node[ni].nodeType === COMMENT_NODE) {
								var comment = node[ni];
								var address = comment.nodeValue;
								var p = doc.createElement("p");
								var textNode = doc.createTextNode(address);
								p.style.display = "none";
								p.className = ClassesDefine.IPADDRESS;
								p.appendChild(textNode);
								td.insertBefore(p, comment);
								td.removeChild(comment);
							}
						}
					}
					// 書き込みの中から、クラス付けしていく
					{
						var submission = doc.getElementsByClassName(ClassesDefine.SUBMISSION);
						var ipaddress = doc.getElementsByClassName(ClassesDefine.IPADDRESS);
						for(var si = 0; si < submission.length; si++){
							var target = submission[si];
							// 投稿日と本文
							var buf;
							buf = target.getElementsByClassName("numberres")[0];
							buf.className = buf.className + " " + ClassesDefine.POSTTIME;
							buf = target.getElementsByClassName("main")[0];
							buf.className = buf.className + " " + ClassesDefine.BODYTEXT;
							target.getElementsByClassName("numberres")[0].className = "numberres " + ClassesDefine.POSTTIME;
							target.getElementsByClassName("main")[0].className = "main " + ClassesDefine.BODYTEXT;
							// 画像と名前とサイト情報
							var info = target.getElementsByTagName("div")[0];
							info.getElementsByTagName("img")[0].className = ClassesDefine.ICON;
							info.getElementsByTagName("p")[0].className = ClassesDefine.NAME;
							var a = info.getElementsByTagName("a");
							if(a.length !== 0) {
								a[0].className = ClassesDefine.HOMEPAGE;
							}
						}
					}
					return(true);
				};
				// より詳細に投稿の中の本文を解析して、クラスに割り当てる
				var analysisBodyText = function() {
					var body_text = doc.getElementsByClassName(ClassesDefine.BODYTEXT);
					for(var bi = 0; bi < body_text.length; bi++){
						var body = body_text[bi];
						// pre要素の修正
						(function(){
							var pre = body.getElementsByTagName("pre");
							for(var pj = 0; pj < pre.length; pj++) {
								var code = pre[pj];
								var html = code.innerHTML;
								var s;
								// なぜか<br>が1つ入っているので削除
								html = html.replace("<br>", "");
								// 最初の連続した改行を除去
								s = html.match(/^[\n]+/);
								if(s) {
									s = s[0].length;
									html = html.substr(s, html.length - s);
								}
								// 最後の連続した改行を除去
								s = html.match(/[\n\s]+$/);
								if(s) {
									s = s[0].length;
									html = html.substr(0, html.length - s);
								}
								code.innerHTML = html;
								// コードをコピー
								my.sourcecode[my.sourcecode.length] = code.textContent;
							}
						})();
						// 本文の種類を分別
						(function(){
							var html = body.innerHTML;
							var newHtml = [];
							var type = 0;
							var old_type = 0;
							var type_plain		= 1;
							var type_quotation	= 2;
							var type_code		= 3;
							var type_code_end	= 4;
							var type_body_end	= 5;
							// 1行に書いてあるpreは分離して正規化しておく
							html = html.replace(/\n?<pre>\n{0,2}/g, "\n<pre>\n");
							html = html.replace(/\n?<\/pre>\n?/g, "\n</pre>\n");
							html = html.split("\n");
							for(var hj = 0; hj < html.length; hj++) {
								var line = html[hj];
								var isStart = hj === 0;
								var isEnd = hj === html.length - 1;
								// タイプを分別
								if(old_type === type_code) {
									if((line.indexOf("</pre>") !== -1)) {
										type = type_code_end;
										line = "";
									}
									else {
										type = type_code;
									}
								}
								else if(line.indexOf("<pre>") !== -1) {
									type = type_code;
									line = "";
								}
								else if(line.indexOf("<span class=\"quotation\">") === 0) {
									type = type_quotation;
									// span削除(改行を除いたタグ)
									line = line.replace(/<[^b][^>]+>/g, "");
								}
								else {
									type = type_plain;
								}
								var isChange = (old_type !== type);
								old_type = type;
								if(!isStart && isChange) {
									newHtml[newHtml.length] = "</div>";
								}
								// 前回と変更があったら
								if(isChange) {
									switch(type) {
										case type_plain:
											newHtml[newHtml.length] = "<div class = \"" + ClassesDefine.PLAIN + "\">";
											break;
										case type_quotation:
											newHtml[newHtml.length] = "<div class = \"quotation " + ClassesDefine.QUOTE + "\">";
											break;
										case type_code:
											newHtml[newHtml.length] = "<div class = \"" + ClassesDefine.CODE + "\">";
											break;
										case type_code_end:
											break;
										default:
											break;
									}
								}
								newHtml[newHtml.length] = line;
								if(isEnd) {
									newHtml[newHtml.length] = "</div>";
								}
							}
							body.innerHTML = newHtml.join("");
						})();
					}
				};
				var attachStyleSheet = function() {
					var sheet = util.makeStyleSheet();
					var rules = "";
					rules += "margin-top:			0.5em;";
					rules += "margin-bottom:		0.5em;";
					rules += "margin-right:			1em;";
					rules += "padding:				1em;";
					rules += "background-color:		white;";
					rules += "border-style:			solid;";
					rules += "border-width:			1px;";
					rules += "border-color:			gray;";
					rules += "border-radius:		5px;";
					rules += "color:				black;";
					rules += "font-family:			monospace;";
					rules += "white-space:			pre;";
					rules += "tab-size:				4;";	// Chrome
					rules += "-moz-tab-size:		4;";	// Firefox
					sheet.insertRule("." + ClassesDefine.CODE + "{" + rules + "}", sheet.cssRules.length);
					rules = "";
					rules += "margin-top:			0.5em;";
					rules += "margin-bottom:		0.5em;";
					rules += "margin-right:			1em;";
					rules += "padding:				0.5em;";
					rules += "color:				#57bcb8;";
					rules += "border-style:			solid;";
					rules += "border-width:			1px;";
					rules += "border-color:			#BEE;";
					rules += "border-radius:		5px;";
					sheet.insertRule("." + ClassesDefine.QUOTE + "{" + rules + "}", sheet.cssRules.length);
				};
				
				if(!attachClass()) {
					return(false);
				}
				analysisBodyText();
				attachStyleSheet();
				return(true);
			};
			
			return(Classes);
		})();
		
		//--------------------------------------------------------------------------
		// CopyButtonMaker - コピーボタン追加

		var CopyButtonMakerDefine = {
		};
		CopyButtonMakerDefine.DUMMY_TEXTAREA	= "dummy_copytextarea";
		CopyButtonMakerDefine.COPY_TARGET		= "copy_target_div";
		CopyButtonMakerDefine.BUTTON_SPAN		= "copy_button_span";
		CopyButtonMakerDefine.BUTTON_DIV		= "copy_button_div";
		var CopyButtonMaker = (function() {
			function CopyButtonMaker() {
				// textareaを用意しておく
				(function(){
					var body = doc.getElementsByTagName("body");
					var textarea = doc.createElement("textarea");
					textarea.id = CopyButtonMakerDefine.DUMMY_TEXTAREA;
					textarea.style.width	= "0px";
					textarea.style.height	= "0px";
					textarea.style.overflow	= "hidden";
					textarea.style.opacity	= "0.0";
					textarea.style.position	= "fixed";
					body[0].insertBefore(textarea, null);
				})();
				// 予めスタイルシートを設定しておく
				(function(){
					var head = doc.getElementsByTagName("head")[0];
					var style = doc.createElement("style");
					head.appendChild(style);
					var sheet = style.sheet;
					var rules = "";
					rules += "text-align:			right;";
					rules += "margin-top:			-0.3em;";
					rules += "margin-bottom:		0.3em;";
					rules += "margin-right:			1em;";
					sheet.insertRule("." + CopyButtonMakerDefine.BUTTON_DIV + "{" + rules + "}", sheet.cssRules.length);
					rules = "";
					rules += "margin-bottom:		0.1em;";
					rules += "padding:				0.3em;";
					rules += "border-style:			solid;";
					rules += "border-width:			1px;";
					rules += "border-color:			gray;";
					rules += "border-radius:		5px;";
					rules += "cursor:				pointer;";
					sheet.insertRule("." + CopyButtonMakerDefine.BUTTON_SPAN + "{" + rules + "}", sheet.cssRules.length);
				})();
				var funcStyleButton = function(event) {
					var style	= event.target.style;
					var type	= event.type;
					if((type == "mouseover") || (type == "mouseup")) {
						cb.setBackgroundLinearGradient(style, "top,#fff 0%,#eee 50%");
					}
					else if(type == "mousedown") {
						cb.setBackgroundLinearGradient(style, "top,#eee 0%,#888 50%");
					}
					else if(type == "mouseout") {
						cb.setBackgroundLinearGradient(style, "top,#fff 0%,#ccc 50%");
					}
				};
				this.attachStyleButton = function(element) {
					element.className = CopyButtonMakerDefine.BUTTON_SPAN;
					element.addEventListener("mouseover"	,funcStyleButton	,false);
					element.addEventListener("mouseout"		,funcStyleButton	,false);
					element.addEventListener("mouseup"		,funcStyleButton	,false);
					element.addEventListener("mousedown"	,funcStyleButton	,false);
					cb.setBackgroundLinearGradient(element.style, "top,#fff 0%,#ccc 50%");
				};
			}
				
			// コピーボタンを付ける
			CopyButtonMaker.prototype.attachCopyButton = function(parent, element, copytext, target_id) {
				var target_element = element;
				var text	= copytext;
				var _this	= this;
				var doCopy	= function(eve) {
					var target = eve.target;
					var num = parseInt(target.dataset.copyCodeNumber, 10);
					var textarea = doc.getElementById(CopyButtonMakerDefine.DUMMY_TEXTAREA);
					textarea.value = text;
					textarea.select();
					textarea.focus();
					target_element.style.backgroundColor = "#BEE";
					target.textContent = dict.translation(Dictionary.TEXT_PUSHCTRLC);
					setTimeout(function(){
						target_element.style.backgroundColor = "#FFF";
						target.textContent = dict.translation(Dictionary.TEXT_COPY);
					}, 1500);
				};
				(function(){
					var button_div = doc.createElement("div");
					button_div.className = CopyButtonMakerDefine.BUTTON_DIV;
					var button = doc.createElement("span");
					var textNode = doc.createTextNode(dict.translation(Dictionary.TEXT_COPY));
					button.dataset.copyCodeNumber = target_id;
					button.appendChild(textNode);
					button.addEventListener("click" ,doCopy ,false);
					_this.attachStyleButton(button);
					button_div.insertBefore(button, null);
					parent.insertBefore(button_div, element.nextSibling);
				})();
			};
			return(CopyButtonMaker);
		})();
		//--------------------------------------------------------------------------
		// HspMarker - HSPのコード解析
		var HspMarkerDefine = {
		};
		HspMarkerDefine.PRE				= "hspcode_";
		HspMarkerDefine.NUMBER		= HspMarkerDefine.PRE + "number";
		HspMarkerDefine.TEXT		= HspMarkerDefine.PRE + "text";
		HspMarkerDefine.COMMENT		= HspMarkerDefine.PRE + "comment";
		HspMarkerDefine.FUNCTION	= HspMarkerDefine.PRE + "function";
		HspMarkerDefine.COMMAND		= HspMarkerDefine.PRE + "command";
		HspMarkerDefine.SHARP		= HspMarkerDefine.PRE + "sharp";
		HspMarkerDefine.MODULE		= HspMarkerDefine.PRE + "module";
		HspMarkerDefine.VAR			= HspMarkerDefine.PRE + "var";
		HspMarkerDefine.LABEL		= HspMarkerDefine.PRE + "label";
		HspMarkerDefine.LABEL_TO	= HspMarkerDefine.PRE + "label_to";
		HspMarkerDefine.LABEL_ON	= HspMarkerDefine.PRE + "label_on";
		HspMarkerDefine.LABEL_AT	= HspMarkerDefine.PRE + "label_at";
		var HspMarker = (function() {
			function HspMarker() {
				this.TYPE_CODE		= 0;
				this.TYPE_COMMENT	= 1;
				this.TYPE_TEXT		= 2;
				this.attachStyleSheet();
				this.makeAnarysisCodeFunction();
			}
			
			HspMarker.prototype.initializeTable = function() {
				
				this.table.variable		= [];	// 変数名
				this.table.command		= [];	// 命令名
				this.table.func			= [];	// 関数名
				this.table.operation	= [];	// 数式の一部
				this.table.initvar		= [];	// 変数の初期化
				
				// 特殊な使われ方をする部分
				this.table.command["ctype"]		= true;
				this.table.command["global"]	= true;
				this.table.command["local"]		= true;
				this.table.command["oncmd"]		= true;
				this.table.command["onexit"]	= true;
				this.table.command["onclick"]	= true;
				this.table.command["onkey"]		= true;
				this.table.command["onerror"]	= true;
				this.table.command["goto"]		= true;
				this.table.command["gosub"]		= true;
				this.table.command["int"]		= true;
				this.table.command["var"]		= true;
				this.table.command["str"]		= true;
				this.table.command["wstr"]		= true;
				this.table.command["sptr"]		= true;
				this.table.command["wptr"]		= true;
				this.table.command["double"]	= true;
				this.table.command["float"]		= true;
				this.table.command["pval"]		= true;
				this.table.command["comobj"]	= true;
				this.table.command["array"]		= true;
				// 配列の初期化と見分けがつかない部分
				this.table.command["if"]		= true;
				this.table.command["return"]	= true;
				this.table.command["continue"]	= true;
				this.table.command["break"]		= true;
				this.table.command["repeat"]	= true;
				this.table.command["switch"]	= true;
				this.table.command["swend"]		= true;
				this.table.command["swbreak"]	= true;
				this.table.command["case"]		= true;
				// 数式の一部
				this.table.operation["and"]		= true;
				this.table.operation["or"]		= true;
				this.table.operation["xor"]		= true;
				this.table.operation["not"]		= true;
				// dim系による初期化
				this.table.initvar["dim"]		= true;
				this.table.initvar["sdim"]		= true;
				this.table.initvar["ddim"]		= true;
				this.table.initvar["dimtype"]	= true;
				this.table.initvar["alloc"]		= true;
				this.table.initvar["newmod"]	= true;
				// deffunc系による初期化
				this.table.initvar["int"]		= true;
				this.table.initvar["var"]		= true;
				this.table.initvar["array"]		= true;
				this.table.initvar["str"]		= true;
				this.table.initvar["double"]	= true;
				this.table.initvar["local"]		= true;
				
			}
			
			HspMarker.prototype.makeAnarysisCodeFunction = function() {
				
				var c_asta	= "*".charCodeAt(0);
				var c_lt	= "<".charCodeAt(0);
				var c_gt	= ">".charCodeAt(0);
				var c_sharp	= "#".charCodeAt(0);
				var c_dot	= ".".charCodeAt(0);
				var c_at	= "@".charCodeAt(0);
				var isStart = false, startWordEndOffset;
				
				// エスケープ文字
				var doWebEncode = function(text) {
					text = text.replace(/</g, "&lt;");
					text = text.replace(/>/g, "&gt;");
					return(text);
				};
				
				// クラスの名前を付ける
				var doHtmlClass = function(c, classname) {
					var x = [];
					x[x.length] = "<span class = \"";
					x[x.length] = classname;
					x[x.length] = "\">";
					x[x.length] = doWebEncode(c);
					x[x.length] = "</span>";
					return(x.join(""));
				};
				
				
				// ある文字列の次の文章（括弧考慮なし）から、そのある文字列が「変数」かを調べる
				var isVariableForNextTextWithoutBracket = function(pcode) {
					// 当初はif文と配列文とを見極めようと考えていたが
					// 実際は下記のように、予め予備知識がないと判断が不可能である。
					// 従って、ifやcontinueなどの制御文は辞書へ予め登録するしかない
					//  aa(a) = 1
					//  if(a) = 1
					//  
					//  onexis*test
					//  onexit*test
					//  
					// 従って、次のような単純に式になっているかどうかだけを
					// 基本的にテストとすると良い
					//
					// × x a==b	if文など	if(1)	==(1):mes "ok"
					// × x a>b		if文など	if(1)	>(1):mes "ok"
					// 〇 x ++		変数		ff(1)	++
					// 〇 x --		変数		ff(1)	--
					// 〇 x +=b		変数		ff(1)	+=(1)
					// 〇 x &=b		変数		ff(1)	+=(1)
					// × x *b		goto文		oncmd *test
					// 行頭からチェックしないと誤爆があるので注意
					// HSP特有のイコール式を使用しない特殊な書き方
					// 〇 a -  b
					// 〇 a *  b　←これはgotoと見分け付かないので除く
					// 〇 a >> b
					// × a -> b (COM)
					if(/^\s*([\+\/\\\^\|\&]|=([^=]|$)|\*=|\-[^>]|>>|<<)/.test(pcode)) {
						return(true);	// 変数・配列変数
					}
					else {
						return(false);	// if/while文
					}
				};
				
				// ある文字列の次の文章（括弧考慮あり）から、そのある文字列が「制御命令」かを調べる
				// 〇 if(12,(3)) |  (432) {}
				// × aa(12,(3)) |= (432) :
				var isCommandForNextTextWithBracket = function(pcode) {
					var depth = 1;
					// 次の文字から始める
					for(var i = 1;i < pcode.length; i++) {
						if(depth === 0) {
							// かっこの右側を解析する
							var post = pcode.substr(i, pcode.length - i);
							return(!isVariableForNextTextWithoutBracket(post));
						}
						var x = pcode.charCodeAt(i);
						if(x === 40) {		// "("
							depth++;
						}
						else if(x === 41) {	// ")"
							depth--;
						}
					}
					// ()の数があっていない→括弧の中に文字がある→COM命令
					if(depth != 0) {
						return(false);
					}
					// 例えば "if(123==123)" の場合は最後の「)」で文章が終了する
					return(true);	// if/while文
				};
				
				this.table = [];
				this.initializeTable();
				
				var table = this.table;
				
				// 宣言ならテーブルへ入れる
				var addTableForSharp = function(nword, pcode) {
					var x;
					var delete_text;
					var isfunction = false;
					// 置き換えによる命令・関数など
					if(nword === "#define") {
						//変数か関数として宣言している場合を調べる
						// × #define test (2 + 3)
						// 〇 #define test(%1)
						// 〇 #define ctype test(%1)
						// 〇 #define global ctype test(%1)
						x = pcode.toLowerCase();
						if(x.match(/^\s+((global|ctype)\s+)*[\w\u00A0-\uFF9F]+\s*\(\%/)) {
							if(x.match(/ +ctype +/)) {
								isfunction = true;
							}
							// global と ctype を除去
							delete_text = x.match(/^\s+((global|ctype)\s+)*/)[0];
							x = x.substr(delete_text.length, x.length - delete_text.length);
							x = x.match(/^[\w\u00A0-\uFF9F]+/)[0];
							if(isfunction) {
								table.func[x] = true;
							}
							else {
								table.command[x] = true;
							}
							return(true);
						}
					}
					// 単純な定数
					if((nword === "#define") || (nword === "#const")) {
						x = pcode.toLowerCase();
						delete_text = x.match(/^\s+(global\s+)*/i);
						if(delete_text) {
							x = x.substr(delete_text[0].length, x.length - delete_text[0].length);
							x = x.match(/[\w\u00A0-\uFF9F]+/);
							if(x) {
								table.command[x[0]] = true;
							}
						}
						return(true);
					}
					// 関数・命令
					if(/func$/.test(nword)) {
						if((nword === "#func")||(nword === "#cfunc")) {
							delete_text = pcode.match(/^\s+(global\s+)*/i)[0];
							pcode = pcode.substr(delete_text.length, pcode.length - delete_text.length);
						}
						x = pcode.toLowerCase().match(/[\w\u00A0-\uFF9F]+/);
						if(x) {
							// modcfunc, cfunc, defcfunc
							if(/cfunc$/.test(nword)) {
								table.func[x[0]] = true;
							}
							// modfunc, func. deffunc
							else {
								table.command[x[0]] = true;
							}
							return(true);
						}
					}
					return(false);
				};
				
				var addTableForInitialize = function(nword, pcode) {
					var name = pcode.match(/[^\s\(\),]+/);
					if(name) {
						var s = name[0].toLowerCase();
						// #func, #cfuncなどでは、int や var が使用されているためここで防ぐ
						if(!table.command[s]) {
							table.variable[s] = true;
							return(true);
						}
					}
					return(false);
				};
				
				var anarysisWord = function(word) {
					// 0バイトの文字
					if(word.length === 0) {
						return(word);
					}
					// 最初の文字の最後の位置はメモリしておく
					if(isStart) {
						startWordEndOffset = word.length + arguments[arguments.length - 2];
					}
					var ch		= word.charCodeAt(0);				// 1文字目
					var nword	= word.toLowerCase();				// 小文字
					var offset,code,pcode,isNextBracket;
					// 特別な文字列
					if(ch === c_lt) {
						return("&lt;");
					}
					if(ch === c_gt) {
						return("&gt;");
					}
					if(ch === c_dot) {
						isStart = false;
						if(word.length == 1) {
							return(".");
						}
						else {
							return(
								"." + anarysisWord(
									word.substr(1, word.length - 1),
									arguments[arguments.length - 2] + 1,
									arguments[arguments.length - 1] )	);
						}
					}
					if(ch === c_at) {
						return(doHtmlClass(word, HspMarkerDefine.MODULE));
					}
					// すでに辞書に登録されている
					if(table.variable[nword]) {
						isStart = false;
						return(doHtmlClass(word, HspMarkerDefine.VAR));
					}
					else if(table.command[nword]) {
						isStart = false;
						// sdim, array, local などの場合を右側を登録する
						if(table.initvar[nword]) {
							offset	= arguments[arguments.length - 2];						// 先頭の番目
							code	= arguments[arguments.length - 1];						// 全体の文字
							pcode	= code.substr(offset + word.length, code.length - offset - word.length);	// 後ろの文字列
							addTableForInitialize(nword, pcode);
						}
						return(doHtmlClass(word, HspMarkerDefine.COMMAND));
					}
					else if(table.func[nword]) {
						isStart = false;
						return(doHtmlClass(word, HspMarkerDefine.FUNCTION));
					}
					else if(table.operation[nword]) {
						isStart = false;
						return(word);
					}
					// define の引数
					else if(/^\%[1-9][0-9]*$/.test(nword)) {
						// %1, %2 等
						isStart = false;
						return(doHtmlClass(word, HspMarkerDefine.VAR));
					}
					// 数値
					else if(/^\*?[\$\%0-9]/.test(nword)) {
						// $, %, 0x30, 0.03, 2f, 等
						// 厳密には
						// 整数・実数	([0-9]+\.?[0-9]*[fF]?)
						// 2進数		((%|0[bB])[0-1]*)
						// 16進数		((\$|0[xX])[0-9a-fA-F]*))
						// [x-x]+と、「+」を着けずに「*」とする。これは a = $ でも問題がないため。
						if(ch === c_asta) {
							return("*" + doHtmlClass(word.substr(1, word.length - 1), HspMarkerDefine.NUMBER));
						}
						else {
							return(doHtmlClass(word, HspMarkerDefine.NUMBER));
						}
					}
					// 特殊ラベル
					else if(/^\*@/.test(nword)) {
						return(doHtmlClass(word, HspMarkerDefine.LABEL + " " + HspMarkerDefine.LABEL_AT));
					}
					
					// ここからより詳細な解析
					offset			= arguments[arguments.length - 2];						// 先頭の番目
					code			= arguments[arguments.length - 1];						// 全体の文字
					pcode			= code.substr(offset + word.length, code.length - offset - word.length);	// 後ろの文字列
					isNextBracket	= /^\s*\(/.test(pcode);
					
					// 1文字目より前に何かある場合は、1文字目ではない
					// 例えば "eee", ee の場合がカンマで文章が切れてしまう
					if(isStart) {
						if(!(/^\s*$/.test(code.substr(0, offset)))) {
							isStart = false;
						}
					}
					
					// 文章の中に "." | "@" が含まれていたら、そこで区切る
					if(/^.+[@.]/.test(word)) {
						var left	= word.match(/^.+?(?=[@.])/)[0]; // 最初に文字が出てくるまでを抜き出す
						var right	= word.substr(left.length, word.length - left.length);
						// 辞書登録
						if(isStart) {
							isStart = false;
							// @や.の右側を解析したいので、この時点で右側のチェックを行う
							// 次が()なら配列変数か、IF系命令である
							if(isNextBracket) {
								if(isCommandForNextTextWithBracket(pcode)) {
									table.command[left.toLowerCase()] = true;
								}
								else {
									// 配列変数か、com
									table.variable[left.toLowerCase()] = true;
								}
							}
							// そうでなければ、 = を探す
							else {
								if(isVariableForNextTextWithoutBracket(pcode)) {
									table.variable[left.toLowerCase()] = true;
								}
								// これ以外は、.が続くかもしれないため断定不能
								if(left.charCodeAt(0) === c_asta) {
									return(
										doHtmlClass(left, HspMarkerDefine.LABEL + " " + HspMarkerDefine.LABEL_ON) +
										anarysisWord(right,  offset + left.length, code)	);
								}
								// COM
								if(/^\s+\->/.test(pcode)) {
									table.variable[left.toLowerCase()] = true;
								}
							}
						}
						return(
							anarysisWord(left, offset, code) +
							anarysisWord(right,  offset + left.length, code)	);
					}
					
					// 一番最初に書いてこそ意味があるワード
					if(isStart) {
						isStart = false;
						// 次が()なら配列変数か、IF系命令である
						if(isNextBracket) {
							if(isCommandForNextTextWithBracket(pcode)) {
								table.command[nword] = true;
								return(doHtmlClass(word, HspMarkerDefine.COMMAND));
							}
							else {
								// 配列変数か、com
								table.variable[nword] = true;
								return(doHtmlClass(word, HspMarkerDefine.VAR));
							}
						}
						// そうでなければ、 = を探す
						if(isVariableForNextTextWithoutBracket(pcode)) {
							table.variable[nword] = true;
							return(doHtmlClass(word, HspMarkerDefine.VAR));
						}
						// *
						if(ch === c_asta) {
							return(doHtmlClass(word, HspMarkerDefine.LABEL + " " + HspMarkerDefine.LABEL_ON));
						}
						// COM
						if(/^\s*\->/.test(pcode)) {
							table.variable[nword] = true;
							return(doHtmlClass(word, HspMarkerDefine.VAR));
						}
						// sharp
						if(ch === c_sharp) {
							addTableForSharp(nword, pcode);
							return(doHtmlClass(word, HspMarkerDefine.SHARP));
						}
						// 命令
						if(table.initvar[nword]) {
							addTableForInitialize(nword, pcode);
						}
						table.command[nword] = true;
						return(doHtmlClass(word, HspMarkerDefine.COMMAND));
					}
					
					// 掛け算かどうかを確認する
					if(ch === c_asta) {
						// 〇 a ,*test
						// 〇  a,*test
						// × a *test
						// ×  a*test
						// 〇 = *test
						// 〇  =*test
						// 〇 onexit goto *test
						// 〇 button gosub *test
						// 〇 goto (*test)
						// 〇 goto*test
						if(/((\sgosub|\sgoto|,|=|\()\s*$)|(^\s*$)/i.test(code.substr(startWordEndOffset, offset - startWordEndOffset))) {
							return(doHtmlClass(word, HspMarkerDefine.LABEL + " " + HspMarkerDefine.LABEL_TO));
						}
						else {
							return("*" + anarysisWord(word.substr(1, word.length - 1), offset + 1, code));
						}
					}
					
					if(isNextBracket) {
						// 関数か配列の未確定だが、配列宣言をしていないと思うので、とりあえず関数へ
						table.func[nword] = true;
						return(doHtmlClass(word, HspMarkerDefine.FUNCTION));
					}
					
					// 未識別は辞書登録せずに変数で
					return(doHtmlClass(word, HspMarkerDefine.VAR));
				};
				
				// 各1文に対して下記の処理を行う
				var anarysisCode = function(code) {
					isStart = true;
					// ([\<\>])				エスケープ用
					// (\*@[\w]*)			*@f など用
					// [\#\$\%]?			プリプロセッサ(#)と数値(%$)　これだけでも検出可能
					// [\*]?				ラベル検出（この後に文字列は必須）
					// [\w\u00A0-\uFF9F]+	※後述をまとめたもの
					// [\@\.]?				モジュール空間や配列の区切り検出
					// ※
					// \w					0-9A-Za-z_
					// \u00A0-\u0FFF		ロシア語など
					// \u2000-\u2FFF		記号全般
					// \u3000-\u30FF		全角記号ひらがなカタカナ
					// \uFF00-\uFF9F		全角英数字記号
					// \u4E00-\u9FFF		漢字
					return(code.replace(/[\<\>]|\*@[\w]*|[\#\$\%]?([\*]?([\w\u00A0-\uFF9F]+[\@\.]?)+)?/g, anarysisWord));
				};
				
				// HSPの文字列とコメント以外の箇所を分析する
				this.anarysisCodeText = function(code) {
					var allline = code.split("\n");
					for(var ai = 0;ai < allline.length; ai++) {
						allline[ai] = allline[ai].replace(/[^:{}]+/g, anarysisCode);	
					}
					return(allline.join("<br>"));
				};
				
				// コメント、文章などを1行ずつにばらして、クラスを付ける
				this.doHtmlTextAndComment = function(c, classname) {
					var allline = c.split("\n");
					for(var ai = 0;ai < allline.length; ai++) {
						allline[ai] = doHtmlClass(allline[ai], classname);
					}
					return(allline.join("<br>"));
				};
				
			};
			
			HspMarker.prototype.doAnarysis = function(hspcode) {
				var x = this.anarysisCommentAndText(hspcode);
				return(this.attachClass(x[0], x[1]));
			};
			
			HspMarker.prototype.attachClass = function(array_code, array_type) {
				
				this.initializeTable();
				
				// anarysisCommentAndTextで分解したテキストについて、1つ1つ分析を行う
				for(var ci = 0;ci < array_code.length; ci++) {
					var c = array_type[ci];
					if(c === this.TYPE_CODE) {
						array_code[ci] = this.anarysisCodeText(array_code[ci]);
					}
					else if(c === this.TYPE_COMMENT) {
						array_code[ci] = this.doHtmlTextAndComment(array_code[ci], HspMarkerDefine.COMMENT);
					}
					else {
						array_code[ci] = this.doHtmlTextAndComment(array_code[ci], HspMarkerDefine.TEXT);
					}
				}
				
				// 最後は接続して、分析済みHTMLの完成
				return(array_code.join(""));
			};
			
			
			HspMarker.prototype.anarysisCommentAndText = function(hspcode) {
				var array_code = [];
				var array_type = [];
				var array_character = [];
				var TYPE_DEFAULT = -1;
				var now_type = TYPE_DEFAULT;
				
				// 1文字、1文字を追加していく
				// 以前と違うタイプなら、新規にグループを作る
				var addCharacter = function(character, type) {
					if(now_type === TYPE_DEFAULT) {
						now_type = type;
					}
					else if(now_type !== type) {
						array_code[array_code.length] = array_character.join("");
						array_type[array_type.length] = now_type;
						array_character = [];
						now_type = type;
					}
					array_character[array_character.length] = character;
				};
				var endCharacter = function() {
					array_code[array_code.length] = array_character.join("");
					array_type[array_type.length] = now_type;
				};
				
				var code = hspcode;
				var istextA1  = false;
				var istextB1  = false;
				var istextB2  = false;
				var istextB3  = false;
				var istextC1  = false;
				var isescape = false;
				var commentA1 = false;
				var commentA2 = false;
				var commentB2 = false;
				var commentB3 = false;
				
				for(var i = 0;i < code.length;i++) {
					var character = code.charAt(i);

					//1行文字列
					if(istextA1) {
						if(isescape) {
							isescape = false;
						}
						else if(character === "\\") {
							isescape = true;
						}
						else if(character === "\"") {
							istextA1 = false;
						}
						addCharacter(character, this.TYPE_TEXT);
						continue;
					}
					
					//1行文字列
					if(istextC1) {
						if(isescape) {
							isescape = false;
						}
						else if(character === "\\") {
							isescape = true;
						}
						else if(character === "'") {
							istextC1 = false;
						}
						addCharacter(character, this.TYPE_TEXT);
						continue;
					}
					
					//複数行文字列
					if(istextB2) {
						if(istextB3){
							istextB3 = false;
							//文字列終了
							if(character === "}") {
								istextB2 = false;
							}
						}
						if(isescape) {
							isescape = false;
						}
						else if(character === "\\") {
							isescape = true;
						}
						else if(character === "\"") {
							istextB3 = true;
						}
						addCharacter(character, this.TYPE_TEXT);
						continue;
					}
					
					//複数行コメント
					if(commentB2) {
						//前回複数行コメントが終了の可能性があった場合
						if(commentB3){
							commentB3 = false;
							//コメント終了
							if(character === "/") {
								commentB2 = false;
							}
						}
						//ここにelseをつけると、**/ が抜ける
						if(character === "*") {
							commentB3 = true;
						}
						addCharacter(character, this.TYPE_COMMENT);
						continue;
					}

					//前回コメントの開始点だと思われている場合
					if(commentA1){
						commentA1 = false;
						//1行コメントの場合
						if(character === "/") {
							commentA2 = true;
							addCharacter("//", this.TYPE_COMMENT);
							continue;
						}
						//複数行コメントの場合
						else if(character === "*") {
							commentB2 = true;
							addCharacter("/*", this.TYPE_COMMENT);
							continue;
						}
						// コメントではなかった
						else {
							addCharacter("/", this.TYPE_CODE);
						}
					}
					
					//１行コメントである
					if(commentA2) {
						//改行でコメント修了
						if(character === "\n"){
							commentA2 = false;
						}
						addCharacter(character, this.TYPE_COMMENT);
						continue;
					}

					//前回文字列の開始点だと思われている場合
					if(istextB1){
						istextB1 = false;
						//複数行コメントの場合
						if(character === "\"") {
							istextB2 = true;
							addCharacter("{\"", this.TYPE_TEXT);
							continue;
						}
						// 文字列ではなかった
						else {
							addCharacter("{", this.TYPE_CODE);
						}
					}
					
					//必ず文字列の場合
					if(character === "\"") {
						istextA1 = true;
						addCharacter(character, this.TYPE_TEXT);
						continue;
					}
					else if(character === "'") {
						istextC1 = true;
						addCharacter(character, this.TYPE_TEXT);
						continue;
					}
					//文字列の開始点だと思われる場合
					else if(character === "{") {
						istextB1 = true;
						continue;
					}
					//コメントの開始点だと思われる場合
					else if(character === "/") {
						commentA1 = true;
						continue;
					}
					//必ずコメントの場合
					else if(character === ";") {
						commentA2 = true;
						addCharacter(character, this.TYPE_COMMENT);
						continue;
					}
					addCharacter(character, this.TYPE_CODE);
				}
				endCharacter();
				return([array_code, array_type]);
			};
			
			// スタイルシートを設定する
			HspMarker.prototype.attachStyleSheet = function() {
				var sheet = util.makeStyleSheet();
				var rules = "";
				rules = "color:				#C00;";
				sheet.insertRule("." + HspMarkerDefine.NUMBER	+ "{" + rules + "}", sheet.cssRules.length);
				rules = "color:				#080;";
				rules+= "font-weight:		bold;";
				sheet.insertRule("." + HspMarkerDefine.TEXT		+ "{" + rules + "}", sheet.cssRules.length);
				rules = "color:				#550;";
				sheet.insertRule("." + HspMarkerDefine.COMMENT	+ "{" + rules + "}", sheet.cssRules.length);
				rules = "color:				#505;";
				sheet.insertRule("." + HspMarkerDefine.FUNCTION	+ "{" + rules + "}", sheet.cssRules.length);
				rules = "color:				#008;";
				sheet.insertRule("." + HspMarkerDefine.COMMAND	+ "{" + rules + "}", sheet.cssRules.length);
				rules = "color:				#00F;";
				sheet.insertRule("." + HspMarkerDefine.SHARP	+ "{" + rules + "}", sheet.cssRules.length);
				rules = "color:				#00D;";
				rules+= "font-weight:		bold;";
				sheet.insertRule("." + HspMarkerDefine.LABEL	+ "{" + rules + "}", sheet.cssRules.length);
				rules = "color:				#080;";
				sheet.insertRule("." + HspMarkerDefine.MODULE	+ "{" + rules + "}", sheet.cssRules.length);
				rules = "color:				#71E;";
				sheet.insertRule("." + HspMarkerDefine.VAR 		+ "{" + rules + "}", sheet.cssRules.length);
			};
			
			return(HspMarker);
		})();

		//--------------------------------------------------------------------------
		// LineNumberMaker - 各行に行番号を付ける

		var LineNumberMakerDefine = {
		};
		LineNumberMakerDefine.CODE_LINENUMBER	= "code_linenumber";
		LineNumberMakerDefine.CODE_MAIN			= "code_body";
		LineNumberMakerDefine.CODE_LINE			= "code_line";
		LineNumberMakerDefine.CODE_LINE_ODD		= "code_line_odd";
		LineNumberMakerDefine.CODE_LINE_EVEN	= "code_line_even";
		var LineNumberMaker = (function() {
			function LineNumberMaker() {
				(function(){
					// スタイルシートを作成
					var sheet = util.makeStyleSheet();
					var rules = "";
					var selector;
					// 行番号ブロックは左へよせて、文字色も変更
					rules  = "float:				left;";
					rules += "color:				gray;";
					selector = "." + LineNumberMakerDefine.CODE_LINENUMBER;
					sheet.insertRule(selector + "{" + rules + "}", sheet.cssRules.length);
					
					// 行番号ブロックの中の各行の設定
					rules  = "text-align:			right;";
					rules += "padding-left:			1em;";
					rules += "padding-right:		1em;";
					rules += "margin-right:			1em;";
					rules += "border-right:			gray 1px solid;";
					selector = "." + LineNumberMakerDefine.CODE_LINENUMBER + " ." + LineNumberMakerDefine.CODE_LINE;
					sheet.insertRule(selector + "{" + rules + "}", sheet.cssRules.length);
					
					// 1行の設定
					rules = "height:				1.5em;";
					selector = "." + LineNumberMakerDefine.CODE_LINE;
					sheet.insertRule(selector + "{" + rules + "}", sheet.cssRules.length);
					
					// 偶数行の設定
					selector = "." + LineNumberMakerDefine.CODE_MAIN + " ." + LineNumberMakerDefine.CODE_LINE_EVEN;
					rules = "background-color:		rgba(0, 0, 0, 0.06);";
					sheet.insertRule(selector + "{" + rules + "}", sheet.cssRules.length);
					
				})();
			}
			LineNumberMaker.prototype.attachLineNumber = function(node) {
				this.attachLineNumberHtml(node, node.innerHTML);
			};
			
			LineNumberMaker.prototype.attachLineNumberHtml = function(node, node_html) {
				var codeline = node_html.split("<br>");
				var num  = [];
				var code = [];
				for(var cj = 0; cj < codeline.length; cj++) {
					var div;
					var text = codeline[cj];
					if((cj % 2) === 0) {
						div = "<div class = \"" + LineNumberMakerDefine.CODE_LINE + " " + LineNumberMakerDefine.CODE_LINE_ODD + "\">";
					}
					else {
						div = "<div class = \"" + LineNumberMakerDefine.CODE_LINE + " " + LineNumberMakerDefine.CODE_LINE_EVEN + "\">";
					}
					num[num.length]   = div + (cj + 1) + "</div>";
					code[code.length] = div + text + "</div>";
				}
				var node_line = doc.createElement("div");
				var node_code = doc.createElement("div");
				node_line.className = LineNumberMakerDefine.CODE_LINENUMBER;
				node_code.className = LineNumberMakerDefine.CODE_MAIN;
				node_line.innerHTML = num.join("");
				node_code.innerHTML = code.join("");
				node.innerHTML = "";
				node.appendChild(node_line);
				node.appendChild(node_code);
			};
			return(LineNumberMaker);
		})();

		//--------------------------------------------------------------------------
		// HspDynamicMarker - より動的にコードを魅せる
		// イベントなどは、innerHTMLをいじると消えてしまうため、後で載せる

		var HspDynamicMarker = (function() {
			
			function HspDynamicMarker() {
				var getClass = function(name) {
					name = name.toLowerCase();
					var n = name.charCodeAt(0);
					for(var i = 1;i < name.length;i++) {
						n = (n * name.charCodeAt(i)) + 1;
						n = n % 0x100000000;
					}
					return("hsp_class=" + (n).toString(16));
				};
				var getId = function(num, name) {
					name = name.toLowerCase();
					var n = name.charCodeAt(0);
					for(var i = 1;i < name.length;i++) {
						n = (n * name.charCodeAt(i)) + 1;
						n = n % 0x100000000;
					}
					return("hsp["+ num + "]_id=" + (n).toString(16));
				};
				var overKeyword = function(eve) {
					var classname = getClass(eve.target.textContent);
					var e = doc.getElementsByClassName(classname);
					for(var i = 0;i < e.length;i++) {
						e[i].style.backgroundColor = "#FF0";
					}
				};
				var outKeyword = function(eve) {
					var classname = getClass(eve.target.textContent);
					var e = doc.getElementsByClassName(classname);
					for(var i = 0;i < e.length;i++) {
						e[i].style.backgroundColor = "";
					}
				};
				var scrollToLabel = function(eve) {
					var from_id = eve.target.id;
					var to_id = eve.target.dataset.labelTargetId;
					var to_element = doc.getElementById(to_id);
					util.scrollToNode(to_element);
					// ジャンプ先も押せるようにする
					to_element.dataset.labelTargetId = from_id;
					to_element.removeEventListener("click", scrollToLabel, false);
					to_element.addEventListener("click", scrollToLabel, false);
					to_element.style.cursor = "pointer";
				};
				this.setClassForKeyword = function(elements) {
					for(var i = 0;i < elements.length;i++) {
						var classname = getClass(elements[i].textContent);
						elements[i].className = elements[i].className + " " + classname;
						elements[i].addEventListener("mouseover"	,overKeyword	,false);
						elements[i].addEventListener("mouseout"		,outKeyword		,false);
					}
				};
				this.setForToLabel = function(num, elements) {
					for(var i = 0;i < elements.length;i++) {
						var id = getId(num, elements[i].textContent);
						elements[i].id = id + "_from=" + i;
						elements[i].dataset.labelTargetId = id;
						elements[i].style.cursor = "pointer";
						elements[i].addEventListener("click" ,scrollToLabel ,false);
					}
				};
				this.setForOnLabel = function(num, elements) {
					for(var i = 0;i < elements.length;i++) {
						var id = getId(num, elements[i].textContent);
						elements[i].id = id;
					}
				};
			}
			HspDynamicMarker.prototype.attachDynamicMarker = function(num, target) {
				this.setClassForKeyword(target.getElementsByClassName(HspMarkerDefine.FUNCTION));
				this.setClassForKeyword(target.getElementsByClassName(HspMarkerDefine.COMMAND));
				this.setClassForKeyword(target.getElementsByClassName(HspMarkerDefine.VAR));
				this.setClassForKeyword(target.getElementsByClassName(HspMarkerDefine.MODULE));
				this.setClassForKeyword(target.getElementsByClassName(HspMarkerDefine.LABEL));
				this.setClassForKeyword(target.getElementsByClassName(HspMarkerDefine.SHARP));
				this.setForOnLabel(num, target.getElementsByClassName(HspMarkerDefine.LABEL_ON));
				this.setForToLabel(num, target.getElementsByClassName(HspMarkerDefine.LABEL_TO));
			};
			return(HspDynamicMarker);
		})();
		
		var ifHspTvBbs = function() {
			var classes = new Classes();
			if(!classes.attachClassForHTB()) {
				return;
			}
			var copybuttonmaker = new CopyButtonMaker();
			var codemarker = new HspMarker();
			var linemaker = new LineNumberMaker();
			var dynamiccodemarker = new HspDynamicMarker();
			var body_text = doc.getElementsByClassName(ClassesDefine.BODYTEXT);
			var codeid = 0;
			for(var bi = 0; bi < body_text.length; bi++){
				var body = body_text[bi];
				var nodes = body.getElementsByTagName("div");
				for(var sj = 0; sj < nodes.length; sj++){
					var node = nodes[sj];
					if(node.className !== ClassesDefine.CODE) {
						continue;
					}
					copybuttonmaker.attachCopyButton(body, node, classes.sourcecode[codeid], codeid);
					linemaker.attachLineNumberHtml(node, codemarker.doAnarysis(classes.sourcecode[codeid]));
					dynamiccodemarker.attachDynamicMarker(codeid, node);
					sj = sj + 1;
					codeid = codeid + 1;
				}
			}
			var sheet = util.makeStyleSheet();
			var rules = "";
			// コードブロックの再設定
			rules  = "padding-right:		0em;";
			rules += "padding-left:			0em;";
			sheet.insertRule("." + ClassesDefine.CODE + "{" + rules + "}", sheet.cssRules.length);
		};
		
		if(Natade.isOperateForHspTv) {
			ifHspTvBbs();
		}
	}
	
};

// Firefox用
window.addEventListener("load", Natade.init, false);

// GreaseMonkey用
Natade.onContentLoad();
