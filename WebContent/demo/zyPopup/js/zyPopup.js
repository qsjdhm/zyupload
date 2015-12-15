/*
 * zyPopup.js 基于HTML5 文件上传的弹出层脚本 http://www.czlqibu.com
 * by zhangyan 2014-07-12   QQ : 623585268
*/

(function($,undefined){
	$.fn.zyPopup = function(options,param){
		var otherArgs = Array.prototype.slice.call(arguments, 1);
		if (typeof options == "string") {
			var fn = this[0][options];
			if($.isFunction(fn)){
				return fn.apply(this, otherArgs);
			}else{
				throw ("zyPopup - No such method: " + options);
			}
		}

		return this.each(function(){
			var para = {};    // 保留参数
			var self = this;  // 保存组件对象
			var zoom = "",
		    zoomContent = "",
		    zoomedIn = false,
		    openedImage = null,
		    windowWidth = "",
		    windowHeight = "";
			var tailorVal = {};  // 保留裁剪之后的值
			
			var defaults = {
					src          :     "",                // 图片的src地址
					index        :     0,                 // 图片在预览区域的索引
					name         :     "",                // 图片的名字
					onTailor     :     function(val){}    // 返回图片裁剪的坐标和宽高的值
			};
			
			para = $.extend(defaults,options);
			
			this.init = function(){
				this.createHtml();      // 创建组件html
				this.openPopup();       // 打开弹出层
				this.bindPopupEvent();  // 绑定弹出层事件
			};
			
			/**
			 * 功能：创建弹出层所使用的html
			 * 参数: 无
			 * 返回: 无
			 */
			this.createHtml = function(){
				// 有可能多次创建此插件，所以要先删除
				$("#zoom").remove();
				$("body").append('<div id="zoom"><a class="finish"></a><a class="close"></a><div class="content loading"></div></div>');

				zoom = $("#zoom").hide(),
				zoomContent = $("#zoom .content"),
				zoomedIn = false,
				openedImage = null,
				windowWidth = $(window).width(),
				windowHeight = $(window).height();
			};
			
			/**
			 * 功能：打开弹出层
			 * 参数: 无
			 * 返回: 无
			 */
			this.openPopup = function(){
				var self = this;
				var image = $(new Image()).attr("id","tailorImg").hide();
				$("#zoom .previous, #zoom .next").show();
				if (!zoomedIn) {
					zoomedIn = true;
					zoom.show();
					$("body").addClass("zoomed");
				}
				zoomContent.html(image).delay(500).addClass("loading");
				image.load(render).attr("src", para.src);
				
				// 渲染
				function render() {
					var image = $(this),
					    borderWidth = parseInt(zoomContent.css("borderLeftWidth")),
					    maxImageWidth = windowWidth - (borderWidth * 2),
					    maxImageHeight = windowHeight - (borderWidth * 2),
					    imageWidth = image.width(),
					    imageHeight = image.height();
					if (imageWidth == zoomContent.width() && imageWidth <= maxImageWidth && imageHeight == zoomContent.height() && imageHeight <= maxImageHeight) {
							show(image);
							return;
					}
					zoomContent.animate({
						width: image.width(),
						height: image.height(),
						marginTop: -(image.height() / 2) - borderWidth,
						marginLeft: -(image.width() / 2) - borderWidth
					}, 200, function() {
						show(image);
					});

					// 显示
					function show(image) {
						image.show();
						zoomContent.removeClass("loading");
						self.createTailorPlug();
					}
				}
			};
			
			/**
			 * 功能: 加载裁剪插件
			 * 参数: 无
			 * 返回: 无
			 */
			this.createTailorPlug = function(){
				if($("head").html().indexOf("jquery.Jcrop")<0){  // 代表没有加载过js和css文件
					// 动态引入裁剪的js和css文件
					$("<link>").attr({ rel: "stylesheet",
				        type: "text/css",
				        href: "jcrop_zh/css/jquery.Jcrop.css"
				    }).appendTo("head");
					$.getScript("jcrop_zh/js/jquery.Jcrop.js", function(){
						// 设置默认选择区域的范围
						var width = $("#tailorImg").width();
						var height = $("#tailorImg").height();
						var x1 = (width/2)-(width/5);
						var y1 = (height/2)-(height/5);
						var x2 = (width/2)+(width/5);
						var y2 = (height/2)+(height/5);
						// 创建插件
						var api = $.Jcrop("#tailorImg",{
					        setSelect : [x1,y1,x2,y2], //setSelect是Jcrop插件内部已定义的运动方法
					        onChange : setCoords,
							onSelect : setCoords
					    });
					});
				}else{  // 加载过js和css文件
					// 设置默认选择区域的范围
					var width = $("#tailorImg").width();
					var height = $("#tailorImg").height();
					var x1 = (width/2)-(width/5);
					var y1 = (height/2)-(height/5);
					var x2 = (width/2)+(width/5);
					var y2 = (height/2)+(height/5);
					// 创建插件
					var api = $.Jcrop("#tailorImg",{
				        setSelect : [x1,y1,x2,y2], //setSelect是Jcrop插件内部已定义的运动方法
				        onChange : setCoords,
						onSelect : setCoords
				    });
				}
				
				// 设置选择区域的值
				function setCoords(obj){
					tailorVal = {"leftX" : obj.x, "leftY" : obj.y, "rightX" : obj.x2, "rightY" : obj.y2, "width" : obj.w, "height" : obj.h};
				}
			};
			
			/**
			 * 功能: 绑定事件
			 * 参数: 无
			 * 返回: 无
			 */
			this.bindPopupEvent = function(){
				var self = this;
				// 弹出层本身的点击事件
				zoom.bind("click", function(event) {
					event.preventDefault();
					if ($(event.target).attr("id") == "zoom"){
						// 关闭弹出层
						self.closePopup(event);
					}
				});
				
				// 弹出层完成按钮的点击事件
				$("#zoom .finish").bind("click", function(event){
					var quondamImgInfo = new Object();
					quondamImgInfo["width"]  = $(".jcrop-holder>div>div>img").width();
					quondamImgInfo["height"] = $(".jcrop-holder>div>div>img").height();
					// 回调方法，将裁减的数据返回
					para.onTailor(tailorVal, quondamImgInfo);  
					// 关闭弹出层
					self.closePopup(event);
				});
				
				// 弹出层关闭按钮的点击事件
				$("#zoom .close").bind("click", function(event){
					// 关闭弹出层
					self.closePopup(event);
				});
			};
			
			/**
			 * 功能: 打开弹出层
			 * 参数: event 事件源
			 * 返回: 无
			 */
			this.closePopup = function(event){
				if (event){
					event.preventDefault();
				}
				zoomedIn = false;
				openedImage = null;
				zoom.hide();
				$("body").removeClass("zoomed");
				zoomContent.empty();
			};
			
			// 初始化裁剪插件
			this.init();
		});
	};
})(jQuery);

