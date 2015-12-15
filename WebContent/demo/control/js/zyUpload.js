/*
 * zyUpload.js 基于HTML5 文件上传的血肉脚本 http://www.czlqibu.com
 * by zhangyan 2014-06-26   QQ : 623585268
*/

(function($,undefined){
	$.fn.zyUpload = function(options,param){
		var otherArgs = Array.prototype.slice.call(arguments, 1);
		if (typeof options == 'string') {
			var fn = this[0][options];
			if($.isFunction(fn)){
				return fn.apply(this, otherArgs);
			}else{
				throw ("zyUpload - No such method: " + options);
			}
		}

		return this.each(function(){
			var para = {};    // 保留参数
			var self = this;  // 保存组件对象
			
			var defaults = {
					width            : "700px",  					      // 宽度
					height           : "400px",  					      // 宽度
					itemWidth        : "140px",                           // 文件项的宽度
					itemHeight       : "120px",                           // 文件项的高度
					url              : "/upload/UploadAction",  	      // 上传文件的路径
					fileType         : [],                                // 上传文件的类型
					fileSize         : 51200000,                          // 上传文件的大小
					fileLength       : 5,                                 // 上传文件的个数
					multiple         : true,  						      // 是否可以多个文件上传
					dragDrop         : true,  						      // 是否可以拖动上传文件
					del              : true,  						      // 是否可以删除文件
					edit             : true,  						      // 是否可以重新上传文件
					tailor           : true,  						      // 是否可以截取图片
					finishDel        : false,  						      // 是否在上传文件完成后删除预览
					/* 提供给外部的接口方法 */
					onSelect         : function(selectFiles, allFiles){}, // 选择文件的回调方法  selectFile:当前选中的文件  allFiles:还没上传的全部文件
					onDelete		 : function(file, files){},           // 删除一个文件的回调方法 file:当前删除的文件  files:删除之后的文件
					onSuccess		 : function(file, response){},        // 文件上传成功的回调方法
					onFailure		 : function(file, response){},        // 文件上传失败的回调方法
					onComplete		 : function(response){}               // 上传完成的回调方法
			};
			
			para = $.extend(defaults,options);
			
			this.init = function(){
				this.createHtml();  // 创建组件html
				this.createCorePlug();  // 调用核心js
			};
			
			/**
			 * 功能：创建上传所使用的html
			 * 参数: 无
			 * 返回: 无
			 */
			this.createHtml = function(){
				var multiple = "";  // 设置多选的参数
				para.multiple ? multiple = "multiple" : multiple = "";
				var html= '';
				
				if(para.dragDrop){
					// 创建带有拖动的html
					html += '<form id="uploadForm" action="'+para.url+'" method="post" enctype="multipart/form-data">';
					html += '	<div class="upload_box">';
					html += '		<div class="upload_main">';
					html += '			<div class="upload_choose">';
	            	html += '				<div class="convent_choice">';
	            	html += '					<div class="andArea">';
	            	html += '						<div class="filePicker">点击选择文件</div>';
	            	html += '						<input id="fileImage" type="file" size="30" name="fileselect[]" '+multiple+'>';
	            	html += '					</div>';
	            	html += '				</div>';
					html += '				<span id="fileDragArea" class="upload_drag_area">或者将文件拖到此处</span>';
					html += '			</div>';
		            html += '			<div class="status_bar">';
		            html += '				<div id="status_info" class="info">选中0张文件，共0B。</div>';
		            html += '				<div class="btns">';
		            html += '					<div class="webuploader_pick">继续选择</div>';
		            html += '					<div class="upload_btn">开始上传</div>';
		            html += '				</div>';
		            html += '			</div>';
					html += '			<div id="preview" class="upload_preview"></div>';
					html += '		</div>';
					html += '		<div class="upload_submit">';
					html += '			<button type="button" id="fileSubmit" class="upload_submit_btn">确认上传文件</button>';
					html += '		</div>';
					html += '		<div id="uploadInf" class="upload_inf"></div>';
					html += '	</div>';
					html += '</form>';
				}else{
					var imgWidth = parseInt(para.itemWidth.replace("px", ""))-15;
					
					// 创建不带有拖动的html
					html += '<form id="uploadForm" action="'+para.url+'" method="post" enctype="multipart/form-data">';
					html += '	<div class="upload_box">';
					html += '		<div class="upload_main single_main">';
		            html += '			<div class="status_bar">';
		            html += '				<div id="status_info" class="info">选中0张文件，共0B。</div>';
		            html += '				<div class="btns">';
		            html += '					<input id="fileImage" type="file" size="30" name="fileselect[]" '+multiple+'>';
		            html += '					<div class="webuploader_pick">选择文件</div>';
		            html += '					<div class="upload_btn">开始上传</div>';
		            html += '				</div>';
		            html += '			</div>';
		            html += '			<div id="preview" class="upload_preview">';
				    html += '				<div class="add_upload">';
				    html += '					<a style="height:'+para.itemHeight+';width:'+para.itemWidth+';" title="点击添加文件" id="rapidAddImg" class="add_imgBox" href="javascript:void(0)">';
				    html += '						<div class="uploadImg" style="width:'+imgWidth+'px">';
				    html += '							<img class="upload_image" src="control/images/add_img.png" style="width:expression(this.width > '+imgWidth+' ? '+imgWidth+'px : this.width)" />';
				    html += '						</div>';
				    html += '					</a>';
				    html += '				</div>';
					html += '			</div>';
					html += '		</div>';
					html += '		<div class="upload_submit">';
					html += '			<button type="button" id="fileSubmit" class="upload_submit_btn">确认上传文件</button>';
					html += '		</div>';
					html += '		<div id="uploadInf" class="upload_inf"></div>';
					html += '	</div>';
					html += '</form>';
				}
				
	            $(self).append(html).css({"width":para.width,"height":para.height});
	            
	            // 初始化html之后绑定按钮的点击事件
	            this.addEvent();
			};
			
			/**
			 * 功能：显示统计信息和绑定继续上传和上传按钮的点击事件
			 * 参数: 无
			 * 返回: 无
			 */
			this.funSetStatusInfo = function(files){
				var size = 0;
				var num = files.length;
				$.each(files, function(k,v){
					// 计算得到文件总大小
					size += v.size;
				});
				
				// 转化为kb和MB格式。文件的名字、大小、类型都是可以现实出来。
				if (size > 1024 * 1024) {                    
					size = (Math.round(size * 100 / (1024 * 1024)) / 100).toString() + 'MB';                
				} else {                    
					size = (Math.round(size * 100 / 1024) / 100).toString() + 'KB';                
				}  
				
				// 设置内容
				$("#status_info").html("选中"+num+"张文件，共"+size+"。");
			};
			
			/**
			 * 功能：过滤上传的文件格式等
			 * 参数: files 本次选择的文件
			 * 返回: 通过的文件
			 */
			this.funFilterEligibleFile = function(files){
				var arrFiles = [];  // 替换的文件数组
				for (var i = 0, file; file = files[i]; i++) {
					// 获取上传文件的后缀名
					var newStr = file.name.split("").reverse().join("");
					if(newStr.split(".")[0] != null){
						var type = newStr.split(".")[0].split("").reverse().join("");
						if(jQuery.inArray(type, para.fileType) > -1){
							// 类型符合，可以上传
							if (file.size >= para.fileSize) {
								alert('您这个"'+ file.name +'"文件大小过大');	
							} else {
								// 在这里需要判断当前所有文件中
								arrFiles.push(file);	
							}
						}else{
							alert('您这个"'+ file.name +'"上传类型不符合');	
						}
					}else{
						alert('您这个"'+ file.name +'"没有类型, 无法识别');	
					}
				}
				return arrFiles;
			};
			
			/**
			 * 功能： 处理参数和格式上的预览html
			 * 参数: files 本次选择的文件
			 * 返回: 预览的html
			 */
			this.funDisposePreviewHtml = function(file, e){
				var html = "";
				var imgWidth = parseInt(para.itemWidth.replace("px", ""))-15;
				var imgHeight = parseInt(para.itemHeight.replace("px", ""))-10;
				
				// 处理配置参数编辑和删除按钮
				var editHtml = "";
				var delHtml = "";
				
				if(para.edit){  // 显示编辑按钮
					editHtml = '<span class="file_edit" data-index="'+file.index+'" title="编辑"></span>';
				}
				if(para.del){  // 显示删除按钮
					delHtml = '<span class="file_del" data-index="'+file.index+'" title="删除"></span>';
				}
				
				// 处理不同类型文件代表的图标
				var fileImgSrc = "control/images/fileType/";
				if(file.type.indexOf("rar") > 0){
					fileImgSrc = fileImgSrc + "rar.png";
				}else if(file.type.indexOf("zip") > 0){
					fileImgSrc = fileImgSrc + "zip.png";
				}else if(file.type.indexOf("text") > 0){
					fileImgSrc = fileImgSrc + "txt.png";
				}else{
					fileImgSrc = fileImgSrc + "txt.png";
				}
				
				
				// 图片上传的是图片还是其他类型文件
				if (file.type.indexOf("image") == 0) {
					html += '<div id="uploadList_'+ file.index +'" class="upload_append_list">';
					html += '	<div class="file_bar">';
					html += '		<div style="padding:5px;">';
					html += '			<p class="file_name" title="'+file.name+'">' + file.name + '</p>';
					html += editHtml;  // 编辑按钮的html
					html += delHtml;   // 删除按钮的html
					html += '		</div>';
					html += '	</div>';
					html += '	<a style="height:'+para.itemHeight+';width:'+para.itemWidth+';" href="#" class="imgBox">';
					html += '		<div class="uploadImg" style="width:'+imgWidth+'px;max-width:'+imgWidth+'px;max-height:'+imgHeight+'px;">';				
					html += '			<img id="uploadImage_'+file.index+'" class="upload_image" src="' + e.target.result + '" style="width:expression(this.width > '+imgWidth+' ? '+imgWidth+'px : this.width);" />';                                                                 
					html += '		</div>';
					html += '	</a>';
					html += '	<p id="uploadProgress_'+file.index+'" class="file_progress"></p>';
					html += '	<p id="uploadFailure_'+file.index+'" class="file_failure">上传失败，请重试</p>';
					html += '	<p id="uploadTailor_'+file.index+'" class="file_tailor" tailor="false">裁剪完成</p>';
					html += '	<p id="uploadSuccess_'+file.index+'" class="file_success"></p>';
					html += '</div>';
                	
				}else{
					html += '<div id="uploadList_'+ file.index +'" class="upload_append_list">';
					html += '	<div class="file_bar">';
					html += '		<div style="padding:5px;">';
					html += '			<p class="file_name">' + file.name + '</p>';
					html += delHtml;   // 删除按钮的html
					html += '		</div>';
					html += '	</div>';
					html += '	<a style="height:'+para.itemHeight+';width:'+para.itemWidth+';" href="#" class="imgBox">';
					html += '		<div class="uploadImg" style="width:'+imgWidth+'px">';				
					html += '			<img id="uploadImage_'+file.index+'" class="upload_file" src="' + fileImgSrc + '" style="width:expression(this.width > '+imgWidth+' ? '+imgWidth+'px : this.width)" />';                                                                 
					html += '		</div>';
					html += '	</a>';
					html += '	<p id="uploadProgress_'+file.index+'" class="file_progress"></p>';
					html += '	<p id="uploadFailure_'+file.index+'" class="file_failure">上传失败，请重试</p>';
					html += '	<p id="uploadSuccess_'+file.index+'" class="file_success"></p>';
					html += '</div>';
				}
				
				return html;
			};
			
			/**
			 * 功能: 创建弹出层插件，会在其中进行裁剪操作
			 * 参数: imgSrc 当前裁剪图片的路径
			 * 返回: 无
			 */
			this.createPopupPlug = function(imgSrc, index, name){
				// 初始化裁剪插件
				$("body").zyPopup({
					src        :   imgSrc,            // 图片的src路径
					index      :   index,             // 图片在预览区域的索引
					name       :   name,              // 图片的名字
					onTailor   :   function(val, quondamImgInfo){     // 回调返回裁剪的坐标和宽高的值
						// 做裁剪成功的图片预览处理
						var nWidth = parseInt(para.itemWidth.replace("px", ""));
						var nHeight = parseInt(para.itemHeight.replace("px", ""));
						var qWidth = val.width;
						var qHeight = val.height;
						
						// 计算出选中区域的的比例
						var ratio = nWidth / qWidth;
						// 计算出原图片在预览区域的宽度和高度
						var width = ratio * quondamImgInfo.width;
						var height = ratio * quondamImgInfo.height;
						// 计算出margin-left和margin-top的值
						var left = val.leftX * ratio;
						var top  = val.rightY * ratio - qHeight * ratio;
						
						$("#uploadImage_" + index).css({
							"width"    : width,
							"height"   : height,
							"margin-left" : -left,
							"margin-top" : -top
						});
						
						$("#uploadTailor_" + index).show();       
						$.getScript("jquery.json-2.4.js", function(){
							$("#uploadTailor_" + index).attr("tailor",$.toJSON(val));
						});
					}
				});
			};
			
			/**
			 * 功能：调用核心插件
			 * 参数: 无
			 * 返回: 无
			 */
			this.createCorePlug = function(){
				var params = {
					fileInput: $("#fileImage").get(0),
					uploadInput: $("#fileSubmit").get(0),
					dragDrop: $("#fileDragArea").get(0),
					url: $("#uploadForm").attr("action"),
					
					filterFile: function(files) {
						// 过滤合格的文件
						return self.funFilterEligibleFile(files);
					},
					onSelect: function(selectFiles, allFiles) {
						if(allFiles.length > para.fileLength){
							alert("您选择文件的个数超出了"+para.fileLength+"张，请上传后在进行选择！");
							return false;
						}
						para.onSelect(selectFiles, allFiles);  // 回调方法
						self.funSetStatusInfo(ZYFILE.funReturnNeedFiles());  // 显示统计信息
						var html = '', i = 0;
						// 组织预览html
						var funDealtPreviewHtml = function() {
							file = selectFiles[i];
							if (file) {
								var reader = new FileReader();
								reader.onload = function(e) {
									// 处理下配置参数和格式的html
									html += self.funDisposePreviewHtml(file, e);
									
									i++;
									// 再接着调用此方法递归组成可以预览的html
									funDealtPreviewHtml();
								}
								reader.readAsDataURL(file);
							} else {
								// 走到这里说明文件html已经组织完毕，要把html添加到预览区
								funAppendPreviewHtml(html);
							}
						};
						
						// 添加预览html
						var funAppendPreviewHtml = function(html){
							// 添加到添加按钮前
							if(para.dragDrop){
								$("#preview").append(html);
							}else{
								$(".add_upload").before(html);
							}
							// 绑定删除按钮
							funBindDelEvent();
							funBindHoverEvent();
						};
						
						// 绑定删除按钮事件
						var funBindDelEvent = function(){
							if($(".file_del").length>0){
								// 删除方法
								$(".file_del").click(function() {
									ZYFILE.funDeleteFile(parseInt($(this).attr("data-index")), true);
									return false;	
								});
							}
							
							if($(".file_edit").length>0){
								if($("head").html().indexOf("zyPopup")<0){  // 代表没有加载过js和css文件
									// 动态引入裁剪的js和css文件
									$("<link>").attr({ rel: "stylesheet",
								        type: "text/css",
								        href: "zyPopup/css/zyPopup.css"
								    }).appendTo("head");
									$.getScript("zyPopup/js/zyPopup.js", function(){
										// 编辑方法
										$(".file_edit").click(function() {
											// 获取选择的文件索引
											var imgIndex = $(this).attr("data-index");
											var imgName = $(this).prev(".file_name").attr("title");
											var imgSrc = $("#uploadImage_"+imgIndex).attr("src");
											// 打开弹出层
											self.createPopupPlug(imgSrc, imgIndex, imgName);
											return false;	
										});
									});
								}else{  // 加载过js和css文件
									// 编辑方法
									$(".file_edit").click(function() {
										// 获取选择的文件索引
										var imgIndex = $(this).attr("data-index");
										var imgName = $(this).prev(".file_name").attr("title");
										var imgSrc = $("#uploadImage_"+imgIndex).attr("src");
										// 打开弹出层
										self.createPopupPlug(imgSrc, imgIndex, imgName);
										return false;	
									});
								}
							}
						};
						
						// 绑定显示操作栏事件
						var funBindHoverEvent = function(){
							$(".upload_append_list").hover(
								function (e) {
									$(this).find(".file_bar").addClass("file_hover");
								},function (e) {
									$(this).find(".file_bar").removeClass("file_hover");
								}
							);
						};
						
						funDealtPreviewHtml();		
					},
					onDelete: function(file, files) {
						para.onDelete(file, files);  // 回调方法
						// 移除效果
						$("#uploadList_" + file.index).fadeOut();
						// 重新设置统计栏信息
						self.funSetStatusInfo(files);
						console.info("剩下的文件");
						console.info(files);
					},
					onProgress: function(file, loaded, total) {
						var eleProgress = $("#uploadProgress_" + file.index), percent = (loaded / total * 100).toFixed(2) + '%';
						if(eleProgress.is(":hidden")){
							eleProgress.show();
						}
						eleProgress.css("width",percent);
					},
					onSuccess: function(file, response) {
						para.onSuccess(file, response);  // 回调方法
						$("#uploadProgress_" + file.index).hide();
						$("#uploadSuccess_" + file.index).show();
						$("#uploadInf").append("<p>上传成功，文件地址是：" + response + "</p>");
						// 根据配置参数确定隐不隐藏上传成功的文件
						if(para.finishDel){
							// 移除效果
							$("#uploadList_" + file.index).fadeOut();
							// 重新设置统计栏信息
							self.funSetStatusInfo(ZYFILE.funReturnNeedFiles());
						}
						if($("#uploadTailor_"+file.index).length>0){
							$("#uploadTailor_" + file.index).hide();
						}
					},
					onFailure: function(file, response) {
						para.onFailure(file, response);  // 回调方法
						$("#uploadProgress_" + file.index).hide();
						$("#uploadSuccess_" + file.index).show();
						if($("#uploadTailor_"+file.index).length>0){
							$("#uploadTailor_" + file.index).hide();
						}
						$("#uploadInf").append("<p>文件" + file.name + "上传失败！</p>");	
						//$("#uploadImage_" + file.index).css("opacity", 0.2);
					},
					onComplete: function(response){
						para.onComplete(response);  // 回调方法
						console.info(response);
					},
					onDragOver: function() {
						$(this).addClass("upload_drag_hover");
					},
					onDragLeave: function() {
						$(this).removeClass("upload_drag_hover");
					}

				};
				
				ZYFILE = $.extend(ZYFILE, params);
				ZYFILE.init();
			};
			
			/**
			 * 功能：绑定事件
			 * 参数: 无
			 * 返回: 无
			 */
			this.addEvent = function(){
				// 如果快捷添加文件按钮存在
				if($(".filePicker").length > 0){
					// 绑定选择事件
					$(".filePicker").bind("click", function(e){
		            	$("#fileImage").click();
		            });
				}
	            
				// 绑定继续添加点击事件
				$(".webuploader_pick").bind("click", function(e){
	            	$("#fileImage").click();
	            });
				
				// 绑定上传点击事件
				$(".upload_btn").bind("click", function(e){
					// 判断当前是否有文件需要上传
					if(ZYFILE.funReturnNeedFiles().length > 0){
						$("#fileSubmit").click();
					}else{
						alert("请先选中文件再点击上传");
					}
	            });
				
				// 如果快捷添加文件按钮存在
				if($("#rapidAddImg").length > 0){
					// 绑定添加点击事件
					$("#rapidAddImg").bind("click", function(e){
						$("#fileImage").click();
		            });
				}
			};
			
			
			// 初始化上传控制层插件
			this.init();
		});
	};
})(jQuery);

