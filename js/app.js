$(document).ready(function(){


	$(function () {
		var app = app || {};
		app.models = {};
		app.viewmodels = {};
		var paperItemsSubscribed ='';
		var newspaperLists = "";
		//logger.log("s:::::::"+ko.toJS(paperItemsSubscribed));



		app.models.newspaperModel = function(newspaperItem){
			var self= this;
			//self.newspaperid = ko.observable(newspaperItem.newspaperid ? newspaperItem.newspaperid :"");
			self.newspapertitle = ko.observable(newspaperItem.newspapertitle ? newspaperItem.newspapertitle :"");
			self.newspaperlanguage = ko.observable(newspaperItem.newspaperlanguage ? newspaperItem.newspaperlanguage :"");
			self.monthlyoffer = ko.observable(newspaperItem.monthlyoffer ? newspaperItem.monthlyoffer :"");			
			self.quaterlyoffer = ko.observable(newspaperItem.quaterlyoffer ? newspaperItem.quaterlyoffer :"");
			self.halfyearlyoffer = ko.observable(newspaperItem.halfyearlyoffer ? newspaperItem.halfyearlyoffer :"");
			self.yearlyoffer = ko.observable(newspaperItem.yearlyoffer ? newspaperItem.yearlyoffer :"");
			self.onSubscribeNewsPaper = function(){
				logger.log("subscribe submit");

				var data = JSON.stringify(
		        {
		            newspapertitle : self.newspapertitle(), newspaperlanguage : self.newspaperlanguage(), monthlyoffer:self.monthlyoffer(), 
		            quaterlyoffer: self.quaterlyoffer(), halfyearlyoffer : self.halfyearlyoffer(), yearlyoffer: self.yearlyoffer()

		        });
		        logger.log(data);
		        app.post.postSearchPaperList(data);
		        

			};
		};

		app.models.paperModel = function(paperItem){
			//paperItem = ko.toJS(paperItemsSubscribed) || "";
			var self = this;
			//self.id = ko.observable(paperItem.id ? paperItem.id : "");
			self.papertitle = ko.observable(paperItem.papertitle ? paperItem.papertitle : "");
			self.startdt = ko.observable(paperItem.startdt ? paperItem.startdt : "");
			self.enddt = ko.observable(paperItem.enddt ? paperItem.enddt : "");
			self.plan = ko.observable(paperItem.plan ? paperItem.plan : "");
			self.paymentmode = ko.observable(paperItem.paymentmode ? paperItem.paymentmode : "");
			self.paperstatus = ko.observable(paperItem.paperstatus ? paperItem.paperstatus : "");
			self.paperstatusclass = ko.computed(function(){
										var cssclass="";
										if(self.paperstatus() == "Active"){
											cssclass = "success";
										}
										else if(self.paperstatus() == "Pending"){
											cssclass = "warning";
										}
										else if(self.paperstatus() == "Expired"){
											cssclass = "error";
										}
										else{
											cssclass = "info";
										}
										return cssclass;
									});
		};

		app.viewmodels.newspaperViewModel = function(){
			var self= this;
			self.newspaperList = ko.observableArray(
									ko.utils.arrayMap(newspaperLists,function(newspaperitem){
										//logger.log(newspaperitem);
										return new app.models.newspaperModel(newspaperitem);
									})
								);
		};

		app.viewmodels.paperViewModel = function(){
			var self = this;
			self.paperList = ko.observableArray(
								ko.utils.arrayMap(paperItemsSubscribed, function(paperItem){
									//logger.log(paperItem);
									return new app.models.paperModel(paperItem);
								})
							 );
		};

		app.servicelayer = (function($){

			function _getData(url, callbackFun){

				/*$.get( url,  function( data ) {
				    
				 		 logger.log( "Load was performed." + data);
				 		
				 		 callbackFun(data);
					}, "json")
					.done(function() {
				    	//logger.log( "second success" );
				 	})
				 	.fail(function() {
				    	logger.log( "error" );
				 	})
				 	.always(function() {
				    	//logger.log( "finished" );
				  });*/

				 	var request = $.ajax({
			            type: "GET",
			            url: url,
			            contentType: "application/json; charset=utf-8",
			            dataType: "json"
			        });
			        request.done(function (data) {
			          	logger.log( "ajax success" );
			            callbackFun(data); //Put the response in ObservableArray
			        });
			        request.fail( function (err) {
			            logger.log(err.status + " : " + err.statusText);
			        });
			        request.always(function() {
				    	logger.log( "finished" );
				  	});


			};

			function _postData(url, data, callbackFun){
				
				/*$.post(url, data, function(response)
				{
				    // on success callback
				   logger.log(response);
				    callbackFun(response);
				});*/
				var request = $.ajax({
				  url: url,
				  method: "POST",
				  data: data,
				  dataType: "json"
				});
				 
				request.done(function( msg ) {
					logger.log( "Data Saved: " + msg )
				    callbackFun(response);
				});
				 
				request.fail(function( jqXHR, textStatus ) {
					logger.log( "Request failed: " + textStatus );
				});
				
			};

			return{
				getData: _getData,
				postData: _postData
			}
		})($);

		app.utilities = (function($, ko){
			function _applyTemplate(vmInst, ele){
				var jqElement = $(ele)[0];
				if(typeof jqElement !== "undefined"){
					ko.cleanNode(jqElement);
					ko.applyBindings(vmInst, jqElement);
				}
				else{
					ko.applyBindings(vmInst);
				}
				_stepsHeight();
			};
			function _stepsHeight(){
				 $("ul#pre, ul#post, ul#pre > li.post, ul#post > li.post").css({"min-height":$(".body.current").height()});
			};


			return{
				applyTemplate: _applyTemplate,
			}

		})($, ko);
		app.post = (function($){
			function _postSearchPaperList(data){
				var url="postdata.json"
				app.servicelayer.postData(url, data, app.fetch.postSearchSubscribeList);
					
			};

			return{
				postSearchPaperList: _postSearchPaperList
			}

		})($);

		app.fetch = (function($){
			function _getHomePaperList(data){
				paperItemsSubscribed = data;
				//paperItemsSubscribed = ko.utils.parseJson(paperItemsSubscribed);
		
				var paperInstance = new app.viewmodels.paperViewModel();
				app.utilities.applyTemplate(paperInstance, "#home");
 
			};
			function _getSearchPaperList(data){
				newspaperLists = data;
				//newspaperLists = ko.utils.parseJson(newspaperLists);
				var newspaperListsInstance = new app.viewmodels.newspaperViewModel();
				app.utilities.applyTemplate(newspaperListsInstance, "#searchcard");
			};
			function _postSearchSubscribeList(returnedData){
				logger.log("posted search paper list"+returnedData);
				
				    // This callback is executed if the post was successful 
				    // self.responseJSON(returnedData);   
				
			};

			return{
				getHomePaperList: _getHomePaperList,
				getSearchPaperList: _getSearchPaperList,
				postSearchSubscribeList: _postSearchSubscribeList
			}
		})($);

		app.run = (function($, app){

			function _init(){
					app.servicelayer.getData("../nwspaper/paperItemsSubscribed.json", app.fetch.getHomePaperList);
					app.servicelayer.getData("../nwspaper/newspaperItemsListed.json", app.fetch.getSearchPaperList);
					
			
			};

			return{
				init: _init
			}

		})($, app);

		var logger = (function (_window) {

		    function _log(msg) {

		        _window.console.log(msg);
		    };

		    return {
		        log: _log
		    };

		})(window);

		app.run.init();
		logger.log("end::::::");
	});
});




			
				$(document).ready(function(){
					$("#wizard").steps({
							
							transitionEffect: $.fn.steps.transitionEffect.fade,
							transitionEffectSpeed: 300,
							stepsOrientation: $.fn.steps.stepsOrientation.vertical,
							/* Labels */
								labels: {							
									finish: "<i class='fa fa-check-circle' title='Finish'></i>",
									next: "<i class='fa fa-arrow-circle-right' title='Next'></i>",
									previous: "<i class='fa fa-arrow-circle-left' title='Previous'></i>"
									
								}
					});
						
						
					for(var i=2;i<= $(".steps .number").length;i++)
					{
						$("#post").show( "normal", function() {
						var rcol = 30+(i*9); var gcol = 131+(i*9); var bcol = 174+(i*9);
							$(this).html( $(this).html() + "<li class=post style='background-color: rgb("+rcol+","+gcol+","+bcol+");'> <span class='TabNameSpan'>"+i+"</span></li>");	
						});
					}
					
					var cnt = 1;
					$("a[href='#next']").click(function(){
						var postel;
								
							$("#post li:first-child").hide( "normal", function() {
								postel = $( this ).remove();
								
									$("#pre").show( "normal", function() {
											postel.appendTo( $(this) ).show("normal").fadeIn('normal');
											for(var i=0;i<= $("#pre .post").length;i++)
											{
												$(postel).html("<span class='TabNameSpan'>"+i+"</span>");	
											}	
											postel.addClass( "block" );								
									});
							});
							  $("ul#pre, ul#post, ul#pre > li.post, ul#post > li.post").css({"min-height":$(".body.current").height()});
							  $(".steps ul > li").attr({"class":"disabled", "aria-disabled":"true"});
					});
						
					$("a[href='#previous']").click(function(){
																	
							$("#pre li:last-child").hide( "normal", function() {
								preel = $( this ).remove();	
								
									$("#post").show( "normal", function() {
											preel.prependTo( $(this)).show("normal").fadeIn('normal');
											for(var i= $("#pre .post").length;i>=0;i--)
											{
												i=i+2;
												$(preel).html("<span class='TabNameSpan'>"+i+"</span>");	
												break;
											}	
											preel.addClass( "block" );
									});
								
							});
                            $("ul#pre, ul#post, ul#pre > li.post, ul#post > li.post").css({"min-height":$(".body.current").height()});
                            $(".steps ul > li").attr({"class":"disabled", "aria-disabled":"true"});
					});
//					if($("ul >li.current")) $("ul >li.current").css({"background-color": "#DFF0D8"});
					
					$(".steps ul > li").attr({"class":"disabled", "aria-disabled":"true"});

				}); 
				
