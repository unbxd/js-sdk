//uglifyjs unbxdSearch.js -o unbxdSearch.min.js && gzip -c unbxdSearch.min.js > unbxdSearch.min.js.gz && aws s3 cp unbxdSearch.min.js.gz s3://unbxd/unbxdSearch.js --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers --content-encoding gzip --cache-control max-age=3600
window.Unbxd = window.Unbxd || {};

if (!Function.prototype.bind) {
	Function.prototype.bind = function (oThis) {
		if (typeof this !== "function") {
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		}

		var aArgs = Array.prototype.slice.call(arguments, 1), 
			fToBind = this, 
			fNOP = function () {},
			fBound = function () {
			return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
		};

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();

		return fBound;
	};
}

if (!Object.keys) Object.keys = function(o) {
	if (o !== Object(o))
		throw new TypeError('Object.keys called on a non-object');
	var k=[],p;
	for (p in o) if (Object.prototype.hasOwnProperty.call(o,p)) k.push(p);
	return k;
};

Array.prototype.getUnique = function(){
	var u = {}, a = [];
	for(var i = 0, l = this.length; i < l; ++i){
		if(u.hasOwnProperty(this[i])) {
			continue;
		}
		a.push(this[i]);
		u[this[i]] = 1;
	}
	return a;
}

if(typeof String.prototype.trim !== 'function'){String.prototype.trim = function() {return this.replace(/^\s+|\s+$/g, '');};};

Unbxd.setSearch = function(options){
	this.options = jQuery.extend( {}, this.defaultOptions, options);

	this.init();
}

Handlebars.registerHelper('prepareFacetName', function(txt){
	txt = txt.replace("_fq","");
	return txt.replace("_"," ");
});

Handlebars.registerHelper('prepareFacetValue', function(txt){
	return txt.trim().length > 0 ? txt : "&nbsp;&nbsp;&nbsp;";
});

Handlebars.registerHelper('unbxdIf', function(v1,v2,options){
	return v1 === v2 ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('unbxdlog', function(){
	console.log(arguments);
});

Unbxd.setSearch.prototype.defaultOptions = {
	inputSelector : '#search_query'
	,searchButtonSelector : '#search_button'
	,type : "search"
	,getCategoryId: ""
	,spellCheck : '' //
	,spellCheckTemp : '<h3>Did you mean : {{suggestion}}</h3>'
	,searchQueryDisplay : ''
	,searchQueryDisplayTemp : '<h3>Search results for {{query}} - {{numberOfProducts}}</h3>'
	,searchResultContainer : ''
	,searchResultSetTemp : '' //function or handlebars template, register any helpers if needed
	,isAutoScroll : false
	,isClickNScroll : false
	,isPagination : false
	,setPagination : function(totalNumberOfProducts,pageSize,currentPage){}
	,clickNScrollElementSelector : '#load-more'
	,pageSize : 15
	,facetMultiSelect : true
	,facetContainerSelector : ''
	,facetCheckBoxSelector : ''
	,selectedFacetTemp : '{{#each filters}}' 
			+'<ol>'
				+'<li>'
					+'<span class="label">{{prepareFacetName @key}}:</span>'
					+'{{#each this}}'
					+'<div class="refineSect">{{@key}}<a href="#" class="btn-remove"></a>'
					+'</div>'
					+'{{/each}}'
				+'</li>'
			+ '</ol>'
		+'{{/each}}'
	,selectedFacetContainerSelector : ""
	,clearSelectedFacetsSelector : ""
	,removeSelectedFacetSelector : ""
	,loaderSelector : ""
	,onFacetLoad : ""
	,onIntialResultLoad : ""
	,onPageLoad : ""
	,sanitizeQueryString : function(q){ return q;}
	,getFacetStats : ""
	,processFacetStats : function(obj){}
	,setDefaultFilters : function(){}
	,fields : []
	,onNoResult : function(obj){}
	,noEncoding : false
	,heightDiffToTriggerNextPage : 100

	,asMinChars : 0
	,as_resultsClass : 'unbxd-as-wrapper'
	,as_minChars : 3
	,as_delay : 100
	,as_loadingClass : 'unbxd-as-loading'
	,as_width : 0
	,as_zIndex : 0
	,as_position : 'absolute'
	,as_sideContentOn : "right" //"left"
	,as_template : "1column" // "2column"
	,as_showCarts : true
	,as_cartType : "inline" // "separate"
	,as_onCartClick : function(obj){}
	,as_inFields:{
		count: 2,
		fields:{
			'brand':3
			,'category':3
			,'color':3
		}
	}
	,as_topQueries:{
		count: 2
	}
	,as_keywordSuggestions:{
		count: 2
	}
	,as_popularProducts:{
		count: 2
		,price:true
		,priceFunctionOrKey : "price"
		,image:true
		,imageUrlOrFunction: "imageUrl"
		,currency : "Rs."
	}
	,as_resultsContainerSelector : null
	,as_processResultsStyles : null
};

jQuery.extend(Unbxd.setSearch.prototype,{
	compiledResultTemp : false
	,compiledSpellCheckTemp : false
	,compiledSearchQueryTemp: false
	,compiledFacetTemp : false
	,compiledSelectedFacetTemp : false
	,currentNumberOfProducts : 0
	,totalNumberOfProducts : 0
	,isLoading : false
	,params : {
		query : '*'
		,filters : {}
		,ranges : {}
		,sort : {}
		,categoryId : ""
		,extra : {
			wt : "json"
			,page : 1
			,rows : 0
		}
	}
	,isHistory : !!(window.history && history.pushState)
	,popped : false //there is an edge case in Mozilla that fires popstate initially
	,initialURL : ''
	,isHashChange : false
	,currentHash : ""
	,hashChangeInterval : null

	//autosuggest internal params
	,as_$results : null
	,as_timeout : null
	,as_previous  : ''
	,as_activeRow : -1//keeps track of focused result in navigation
	,as_activeColumn : 0
	,as_keyb : false
	,as_hasFocus : false
	,as_lastKeyPressCode : null
	,as_ajaxCall : null//keeps track of current ajax call
	,as_currentResults	: []
	,as_cache : {}
	,as_params : {
		query : '*'
		,filters : {}
	}
	,as_selectedClass : "unbxd-ac-selected"
	,as_scrollbarWidth : null
	,init : function(){
		this.isHashChange = !!("onhashchange" in window.document.body);

		this.$input = jQuery(this.options.inputSelector);
		this.$input.val('');
		this.input = this.$input[0];

		if(this.options.enableAutoSuggest){
			this.as_$results = $('<div/>', {'class' :this.options.as_resultsClass})
				.css('position', this.options.as_position)
				.hide();

			if(this.options.as_zIndex > 0)
				this.as_$results.css('zIndex',this.options.as_zIndex);

			if(typeof this.options.as_resultsContainerSelector == "string" && this.options.as_resultsContainerSelector.length)
				$(this.options.as_resultsContainerSelector).append(this.as_$results);
			else
				$("body").append(this.as_$results);
		}

		this.setEvents();

		this.reset();

		this.params.categoryId = this.options.type == "browse" && typeof this.options.getCategoryId == "function" ? this.options.getCategoryId() : "";

		if(this.params.categoryId.length > 0){
			if(typeof this.options.setDefaultFilters == "function")
				this.options.setDefaultFilters.call(this);

			this.setPage(1)
				.setPageSize(this.options.pageSize);

			this.callResults(this.paintResultSet);
		}else if(this.options.type == "search" && this.input.value.trim().length){
			if(typeof this.options.setDefaultFilters == "function")
				this.options.setDefaultFilters.call(this);

			this.params.query = this.$input.val().trim();

			jQuery(this.options.searchResultContainer).html('');

			this.setPage(1)
				.setPageSize(this.options.pageSize);

			this.callResults(this.paintResultSet);
		 }else{
			var cur_url = window.location.hash.substring(1) || window.location.search.substring(1)
				,urlqueryparams = this.getQueryParams(cur_url)
				,decodedParams = this.getQueryParams(this.decode(cur_url))
				,queryparamcount = Object.keys(urlqueryparams).length
				,decodedParamscount = Object.keys(decodedParams).length
				,finalParams = null;

			if(decodedParamscount > 0){
				finalParams = this._processURL(decodedParams);
			}else{
				finalParams = this._processURL(urlqueryparams);
			}

			if(this.options.type == "search"){
				this.params = finalParams;

				if(typeof this.options.setDefaultFilters == "function")
					this.options.setDefaultFilters.call(this);


				if(!("query" in this.params) || (this.params.query + "").trim().length == 0)
					this.params.query = "*";

				this.params.query = this.options.sanitizeQueryString.call(this,this.params.query);

				this.$input.val(this.params.query != "*" ? this.params.query : "");

				jQuery(this.options.searchResultContainer).html('');

				this.setPage("page" in finalParams.extra ? finalParams.extra.page : 1)
					.setPageSize(this.options.pageSize);

				if(this.params.query){
					this.callResults(this.paintResultSet);
				}
			}else if(this.options.type == "browse" && "categoryId" in finalParams && finalParams["categoryId"].trim().length > 0){
				this.params = finalParams;

				if(typeof this.options.setDefaultFilters == "function")
					this.options.setDefaultFilters.call(this);

				this.setPage("page" in finalParams.extra ? finalParams.extra.page : 1)
					.setPageSize(this.options.pageSize);

				this.callResults(this.paintResultSet);
			}
		}
	}
	,getClass : function(object){
		return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
	}
	,setEvents : function(){
		var self = this;

		if(this.options.type == "search" || this.options.enableAutoSuggest){
			this.$input.bind('select.auto',function(){
				self.log("select : setting focus");
				self.hasFocus = true;
			});

			this.$input.bind('keydown',function(e){
				if(!self.options.enableAutoSuggest){
					if(e.which == 13){
						e.preventDefault();

						self.reset();

						self.params.query = self.options.sanitizeQueryString.call(self, this.value );

						jQuery(self.options.searchResultContainer).html('');

						if(typeof self.options.setDefaultFilters == "function")
							self.options.setDefaultFilters.call(self);

						self.clearFilters().setPage(1)
							.setPageSize(self.options.pageSize)

						if(self.params.query)
							self.callResults(self.paintResultSet,true);
					}
				}else{
					self.as_lastKeyPressCode = e.keyCode;
					self.as_lastKeyEvent = e;
					switch(e.keyCode) {
						case 38: // up
							e.preventDefault();
							self.as_moveSelect(-1);
							break;
						case 40: // down
							e.preventDefault();
							self.as_moveSelect(1);
							break;
						case 39: // right
							e.preventDefault();
							self.as_moveSide(1);
							break;
						case 37: // left
							e.preventDefault();
							self.as_moveSide(-1);
							break;
						case 9:  // tab
						case 13: // return
							if( self.as_selectCurrent() ){
								e.preventDefault();
							}else{
								self.as_hideResultsNow();
							}
							break;
						default:
							self.as_activeRow = -1;
							self.as_hasFocus = true;
							
							if (self.as_timeout) 
								clearTimeout(self.as_timeout);
							
							self.as_timeout = setTimeout(function(){self.as_onChange();}, self.options.as_delay);
							
							break;
					}
				}
			});

			if(this.options.searchButtonSelector.length){
				jQuery(this.options.searchButtonSelector).bind("click",function(e){
					e.preventDefault();

					self.reset();

					self.params.query = self.options.sanitizeQueryString.call(self, self.input.value);

					jQuery(self.options.searchResultContainer).html('');

					self.clearFilters().setPage(1)
						.setPageSize(self.options.pageSize)

					if(self.params.query)
						self.callResults(self.paintResultSet,true);
				});
			}

			$(document).bind("click.auto",function(e){
				if(e.target == self.input){
					self.log("clicked on input : focused");
					self.hasFocus = true;
					if(self.previous === self.$input.val())
						self.as_showResults();
				}else if(e.target == self.as_$results[0]){
					self.log("clicked on results block : selecting")
					self.as_hasFocus = false;
				}else if($.contains(self.as_$results[0], e.target)){
					self.log("clicked on element for selection",e.target.tagName);
					var $et = $(e.target), p = $et;

					self.as_hasFocus = false;

					if(e.target.tagName !== "LI"){
						p = $et.parents("li");
					}

					if(!p || p.hasClass(".unbxd-as-header") || e.target.tagName == "INPUT")
						return;

					if(e.target.tagName == "BUTTON" && $et.hasClass("unbxd-as-popular-product-cart-button") && typeof self.options.as_onCartClick == "function"){
						self.log("BUTTON click");
						var data = p.data();
						data.quantity = parseFloat(p.find("input.unbxd-popular-product-qty-input").val());

						self.as_addToAnalytics("click",{
							pr : parseInt(data.index) + 1
							,pid : data.pid || null
							,url : window.location.href
						});

						self.options.as_onCartClick.call(self,data, self.as_currentResults.POPULAR_PRODUCTS[parseInt(data['index'])]._original) && self.as_hideResults();

						self.as_addToAnalytics("addToCart",{
							pid : data.pid || null
							,url : window.location.href
						});

						return;
					}

					self.as_selectItem(p.data());
				}else{
					self.as_hasFocus = false;
					self.as_hideResults();
				}
			});
		}

		//click on somthing like "Load more results" to fetch next page
		if(this.options.isClickNScroll){
			jQuery(this.options.clickNScrollElementSelector).bind('click',function(e){
				e.preventDefault();

				self.setPage(self.getPage() + 1);

				if(self.params.query)
					self.callResults(self.paintProductPage);
			});
		}

		//to load results on scrolling down
		if(this.options.isAutoScroll){
			jQuery(window).scroll(function() {
				var wind = jQuery(window),docu = jQuery(document);
				if((wind.scrollTop()) > (docu.height()- window.innerHeight - self.options.heightDiffToTriggerNextPage) && self.currentNumberOfProducts < self.totalNumberOfProducts && !self.isLoading){
					self.setPage(self.getPage() + 1)
						.callResults(self.paintProductPage);
				}
			});
		}

		//click on facet checkboxes
		if(this.options.facetContainerSelector.length > 0){
			jQuery(this.options.facetContainerSelector).delegate(self.options.facetCheckBoxSelector,'change',function(e){
				var box = jQuery(this),el = box.parents(self.options.facetElementSelector);

				if(box.is(':checked') && typeof self.options.facetOnSelect == "function"){
					self.options.facetOnSelect(el);
				}

				if(!box.is(':checked') && typeof self.options.facetOnDeselect == "function"){
					self.options.facetOnDeselect(el);
				}
				
				self[box.is(':checked') ? 'addFilter' : 'removeFilter'](box.attr("unbxdParam_facetName"),box.attr("unbxdParam_facetValue"));
				
				self.setPage(1)
					.callResults(self.paintResultSet,true);
			});
		}

		if(this.options.clearSelectedFacetsSelector.length > 0){
			jQuery('body').delegate(this.options.clearSelectedFacetsSelector,'click',function(e){
				e.preventDefault();
				
				self.clearFilters().setPage(1)
					.callResults(self.paintResultSet,true);
			});
		}

		if(this.options.removeSelectedFacetSelector.length > 0){
			jQuery(this.options.selectedFacetContainerSelector).delegate(this.options.removeSelectedFacetSelector,'click',function(e){
				e.preventDefault();
				var $t = jQuery(this)
				,name = $t.attr("unbxdParam_facetName")
				,val = $t.attr("unbxdParam_facetValue")
				,checkbox_sel = self.options.facetCheckBoxSelector + "[unbxdParam_facetName='"+ name +"'][unbxdParam_facetValue='" + val + "']";

				jQuery(checkbox_sel).removeAttr("checked");

				if(typeof self.options.facetOnDeselect == "function"){
					self.options.facetOnDeselect(jQuery(checkbox_sel).parents(self.options.facetElementSelector));
				}

				self.removeFilter(name,val)
					.setPage(1)
					.callResults(self.paintResultSet,true);
			});
		}

		if(this.isHistory){
			self.popped = ('state' in window.history);
			self.initialURL = location.href;
			
			jQuery(window).bind('popstate', function(e) {
				var initialPop = self.popped && location.href == self.initialURL;
				self.popped = false;
				
				if ( initialPop || !e.originalEvent.state) return;

				var old_params = e.originalEvent.state;
				
				old_params.query = self.options.type == "search" ? self.options.sanitizeQueryString.call(self, old_params.query) : "";

				self.reset();

				self.setPage(1);

				if((old_params.query) || (old_params.categoryId)){
					self.params = old_params;
					self.callResults(self.paintResultSet);
				}
			});
		}else if(this.isHashChange){
			jQuery(window).bind("hashchange",function(e){
				var newhash = window.location.hash.substring(1);
				if(newhash && newhash != self.currentHash){
					self.reset();
					var old_params = self._processURL(self.options.noEncoding ? newhash : self.decode(newhash));

					old_params.query = self.options.type == "search" ? self.options.sanitizeQueryString.call(self,old_params.query) : "";

					self.currentHash = newhash;

					if((old_params.query) || (old_params.categoryId)){
						self.params = old_params;
						self.callResults(self.paintResultSet);
					}
				}
			});
		}else{
			self.hashChangeInterval = setInterval(function() {
				var newhash = location.hash.substring(1);

				if (newhash && newhash != self.currentHash) {
					self.reset();
					var old_params = self._processURL(self.options.noEncoding ? newhash : self.decode(newhash));

					old_params.query = self.options.type == "search" ? self.options.sanitizeQueryString.call(self, old_params.query) : "";

					self.currentHash = newhash;

					if((old_params.query) || (old_params.categoryId)){
						self.params = old_params;
						self.callResults(self.paintResultSet);
					}
				}
			}, 3000);
		}
	}
	,addSort : function(field, dir){
		this.params.sort[field] = dir || "desc";
		return this;
	}
	,removeSort : function(field){
		if(field in this.params.sort)
			delete this.params.sort[field];

		return this;
	}
	,resetSort : function(){
		this.params.sort = {};
		return this;
	}
	,addFilter : function(field, value){
		if(!(field in this.params.filters))
			this.params.filters[field] = {};

		this.params.filters[field][value] = field;

		return this;
	}
	,removeFilter  : function(field, value){
		if(value in this.params.filters[field])
			delete this.params.filters[field][value];

		if(Object.keys(this.params.filters[field]).length == 0)
			delete this.params.filters[field];			

		return this;
	}
	,clearFilters : function(){
		this.params.filters = {}
		return this;
	}
	,addRangeFilter : function(field, lb, ub){
		this.params.ranges[field] = {lb : lb || '*', ub : ub || '*'};

		return this;
	}
	,removeRangeFilter : function(field){
		if(field in this.params.ranges)
			delete this.params.ranges[field];

		return this;
	}
	,clearRangeFiltes : function(){
		this.params.ranges = {};

		return this;
	}
	,setPage : function(pageNo){
		this.params.extra.page = pageNo;
		return this;
	}
	,getPage : function(){
		return this.params.extra.page;
	}
	,setPageSize : function(pageSize){
		this.params.extra.rows = pageSize;
		return this;
	}
	,getPageSize : function(){
		return this.params.extra.rows;
	}
	,addQueryParam : function(key, value, dontOverried){
		if(!(key in this.params.extra) || !dontOverried){
			this.params.extra[key] = value;
		}else{
			if(this.getClass(this.params.extra[key]) != "Array")
				this.params.extra[key] = [this.params.extra[key]];

			this.params.extra[key].push(value);
		}
		
		return this;
	}
	,getHostNPath: function(ruleset){
		return "//search.unbxdapi.com/"+ this.options.APIKey + "/" + this.options.siteName + "/"  + ruleset
	}
	,url : function(){
		var host_path = this.getHostNPath(this.options.type == "browse" ? "browse" : "search" );

		var url ="";
		
		if(this.options.type == "search" && this.params['query'] != undefined){
			url += '&q=' + encodeURIComponent(this.params.query);
		}else if(this.options.type == "browse" && this.params['categoryId'] != undefined){
			url += '&category-id=' + encodeURIComponent(this.params.categoryId);
		}

		for(var x in this.params.filters){
			if(this.params.filters.hasOwnProperty(x)){
				var a = [];
				for(var y in this.params.filters[x]){
					if(this.params.filters[x].hasOwnProperty(y)){
						a.push((x+':\"'+ encodeURIComponent(y.replace(/(^")|("$)/g, '')) +'\"').replace(/\"{2,}/g, '"'));
					}
				}

				url += '&filter='+a.join(' OR ');
			}
		}

		var a = [];

		for(var x in this.params.ranges){
			if(this.params.ranges.hasOwnProperty(x)){
				a.push(x + ':[' + this.params.ranges[x].lb + " TO " + this.params.ranges[x].ub + ']');
			}
		}

		if(a.length)
			url += '&filter='+a.join(' OR ');

		a = [];
		for(var field in this.params.sort){
			if (this.params.sort.hasOwnProperty(field)) {
				var dir = this.params.sort[field] || 'desc';
				a.push(field + " " + dir);
			}
		}

		if(a.length)
			url += '&sort='+a.join(',');


		for(var key in this.params.extra){
			if (this.params.extra.hasOwnProperty(key) && key != 'page') {
				var value = this.params.extra[key];
				if(this.getClass(value) == "Array"){
					value = value.getUnique();
					for(var i = 0;i < value.length; i++){
						url += '&' + key + '=' + encodeURIComponent(value[i]);
					}
				}else
					url += '&' + key + '=' + encodeURIComponent(value);
			}
		}

		url += '&start=' + (this.params.extra.page <= 1 ? 0  : (this.params.extra.page - 1) * this.params.extra.rows);

		url += this.options.getFacetStats.length > 0 ? "&stats=" + this.options.getFacetStats : "";

		if(this.options.fields.length){
			url += '&fl=' + this.options.fields.join(',');
		}

		if(this.options.facetMultiSelect)
			url += '&facet.multiselect=true';

		url += '&indent=off';

		return {
			url : host_path + "?" + url
			,query : url
			,host : host_path
		};
	}
	,callResults : function(callback, doPush){
		if(this.isLoading)
			return;

		this.isLoading = true;

		if(this.options.loaderSelector.length > 0)
			jQuery(this.options.loaderSelector).show();

		var self = this
		,modifiedCB = callback.bind(self)
		,cb = function(data){
			this.isLoading = false;
			if(this.options.loaderSelector.length > 0)
				jQuery(this.options.loaderSelector).hide();

			if("error" in data)
				return false;

			modifiedCB(data);
		}
		,urlobj = self.url();

		if(doPush){
			var finalquery = this.options.noEncoding ? urlobj.query : this.encode( urlobj.query );
			if(this.isHistory){
				history.pushState(this.params,null,location.protocol + "//" + location.host + location.pathname + "?" + finalquery);
			}else{
				window.location.hash = finalquery;
				this.currentHash = finalquery;
			}
		}

		jQuery.ajax({
			url: urlobj.url
			,dataType: "jsonp"
			,jsonp: 'json.wrf'
			,success: cb.bind(self)
	    });
	}
	,reset: function(){
		this.totalNumberOfProducts = 0;
		this.currentNumberOfProducts = 0;
		jQuery(this.options.spellCheck).hide();
		jQuery(this.options.searchQueryDisplay).empty();
		jQuery(this.options.searchResultContainer).empty();
		jQuery(this.options.facetContainerSelector).empty();

		this.options.selectedFacetHolderSelector && jQuery(this.options.selectedFacetHolderSelector).hide();

		this.options.loaderSelector.length > 0 && jQuery(this.options.loaderSelector).hide();

		this.params = {
			query : '*'
			,filters : {}
			,sort : {}
			,ranges : {}
			,categoryId : ""
			,extra : {
				wt : "json"
				,page : 1
				,rows : 12
			}
		};

		return this;
	}
	,_processURL: function(url){
		var obj = typeof url == "string" ? this.getQueryParams(url) : url
		,params = {
			query : ''
			,filters : {}
			,sort : {}
			,ranges : {}
			,extra : {
				wt : "json"
				,page : 1
				,rows : 12
			}
		};

		//lets get filters
		if("filter" in obj){
			if (this.getClass(obj.filter) == "String")
				obj.filter = Array(obj.filter);
			
			for (var i = 0; i < obj.filter.length; i++) {
				
				var filterStrArr = obj.filter[i].split(" OR ");
				
				for(var x = 0; x < filterStrArr.length; x++){
					var arr = filterStrArr[x].split(":");
					if(arr.length == 2){
						arr[1] = arr[1].replace(/\"{2,}/g, '"').replace(/(^")|("$)/g, '').replace(/(^\[)|(\]$)/g, '');
						
						if(!(arr[0] in params.filters))
							params.filters[arr[0]] = {}

						var vals = arr[1].split(" TO ");
						if(vals.length > 1){
							params.ranges[arr[0]] = {lb : isNaN(parseFloat(vals[0])) ? '*' : parseFloat(vals[0]), ub : isNaN(parseFloat(vals[1])) ? '*' : parseFloat(vals[1])};
						}else{
							params.filters[arr[0]][arr[1]] = arr[0];
						}
					}
				}
			}
		}

		//lets get sort now
		if("sort" in obj){
			var sortarr = obj.sort.split(",");

			for (var i = 0; i < sortarr.length; i++) {
				var arr = sortarr[i].split(/\s+(?=\S+$)/);
				if(arr.length == 2){
					params.sort[arr[0]] = arr[1] || "desc";
				}
			}
		}

		//lets get page size
		if("rows" in obj)
			params.extra.rows = parseInt(obj.rows);

		//lets get query
		if("q" in obj)
			params.query = obj.q;

		//lets get category-id
		if("category-id" in obj)
			params.categoryId = obj["category-id"];

		//lets get boost
		if("boost" in obj)
			params.extra.boost = obj.boost;

		//lets get pageNo
		if("start" in obj)
			params.extra.page = (parseInt(obj.start) / parseInt(params.extra.rows)) + 1;

		return params;
	}
	,paintResultSet: function(obj){
		this._internalPaintResultSet(obj,true);
	}
	,_internalPaintResultSet: function(obj, facetsAlso){
		if("error" in obj)
			return false;

		this.totalNumberOfProducts = 0;

		this.currentNumberOfProducts = 0;
		
		if(obj.hasOwnProperty('didYouMean')){
			if(obj.response.numberOfProducts > this.options.pageSize){
				jQuery(this.options.spellCheck).hide();
				jQuery(this.options.searchResultContainer).empty();
				this.paintProductPage(obj);
				facetsAlso && this.paintFacets(obj);
			}else{
				this.params.query = obj.didYouMean[0].suggestion;

				if(!this.compiledSpellCheckTemp)
					this.compiledSpellCheckTemp = Handlebars.compile(this.options.spellCheckTemp);

				jQuery(this.options.spellCheck).html(this.compiledSpellCheckTemp({suggestion : obj.didYouMean[0].suggestion})).show();

				facetsAlso ? this.callResults(this.paintAfterSpellCheck) : this.callResults(this.paintOnlyResultSet) ;
			}
		}else{
			jQuery(this.options.spellCheck).hide();
			jQuery(this.options.searchResultContainer).empty();
			this.paintProductPage(obj);
			facetsAlso && this.paintFacets(obj);
		}
	}
	,paintOnlyResultSet : function(obj){
		jQuery(this.options.searchResultContainer).empty();
		this.paintProductPage(obj);
	}
	,paintAfterSpellCheck : function(obj){
		jQuery(this.options.searchResultContainer).empty();
		this.paintProductPage(obj);
		this.paintFacets(obj);
	}
	,paintAfterFacetChange : function(obj){
		jQuery(this.options.searchResultContainer).empty();
		this.paintProductPage(obj);
		this.paintSelectedFacets();
	}
	,paintProductPage : function(obj){
		if("error" in obj)
			return;

		if(!obj.response.numberOfProducts){
			this.reset();

			this.options.onNoResult.call(this,obj);

			return this;
		}

		if(!this.compiledSearchQueryTemp)
			this.compiledSearchQueryTemp = Handlebars.compile(this.options.searchQueryDisplayTemp);

		jQuery(this.options.searchQueryDisplay).html(this.compiledSearchQueryTemp({
			query : obj.searchMetaData.queryParams.q
			,numberOfProducts : obj.response.numberOfProducts
		})).show();

		if(this.getClass(this.options.searchResultSetTemp) == 'Function'){
			this.options.searchResultSetTemp.call(this,obj);
		}else{
			if(!this.compiledResultTemp)
				this.compiledResultTemp = Handlebars.compile(this.options.searchResultSetTemp);

			jQuery(this.options.searchResultContainer).append(this.compiledResultTemp(obj.response));
		}

		if(!this.currentNumberOfProducts && typeof this.options.onIntialResultLoad == "function") {
			this.options.onIntialResultLoad.call(this);
		}

		if(this.currentNumberOfProducts && typeof this.options.onPageLoad == "function") {
			this.options.onPageLoad.call(this);
		}

		this.totalNumberOfProducts = obj.response.numberOfProducts;

		this.currentNumberOfProducts += obj.response.products.length;

		if(typeof this.options.setPagination == "function"){
			this.options.setPagination.call(this,this.totalNumberOfProducts,this.getPageSize(),this.getPage());
		}
		
		if(this.options.isClickNScroll)
			jQuery(this.options.clickNScrollElementSelector)[(this.currentNumberOfProducts < this.totalNumberOfProducts) ? 'show' : 'hide']();

	}
	,paintFacets: function(obj){
		if("error" in obj)
			return;

		var facets = obj.facets
			,facetKeys = Object.keys(facets)
			,newfacets = []
			,singlefacet = {}
			,self = this
			,facetVal = ""
			,isSelected = false
			,selectedOnly = [];

		for(var x in facets){
			singlefacet = {
				name : self.prepareFacetName(x)
				,facet_name : x
				,type : facets[x]['type']
				,selected : []
				,unselected : []
				,unordered : []
			};
			
			for(var i = 0, len = facets[x]['values'].length/2; i < len;i++){
				facetVal = facets[x]['values'][2 * i];

				if(facetVal.trim().length == 0)
					continue;

				isSelected = x in self.params.filters && facetVal in self.params.filters[x] && self.params.filters[x][facetVal] == x ? true : false;

				singlefacet[isSelected ? "selected" : "unselected" ].push({value : facetVal , count : facets[x]['values'][2 * i + 1]});
				singlefacet.unordered.push({value : facetVal , count : facets[x]['values'][2 * i + 1], isSelected : isSelected});
			}

			if((singlefacet.unordered.length) > 0)
				newfacets.push(singlefacet);
		}

		if(this.getClass(this.options.facetTemp) == 'Function'){
			this.options.facetTemp.call(this,{facets : newfacets});
		}else{
			if(!this.compiledFacetTemp && this.options.facetTemp.length)
			this.compiledFacetTemp = Handlebars.compile(this.options.facetTemp);
		
			this.options.facetContainerSelector.length && jQuery(this.options.facetContainerSelector).html(this.compiledFacetTemp({facets : newfacets}));
		}

		this.paintSelectedFacets();

		if (typeof this.options.onFacetLoad == "function") {
			this.options.onFacetLoad.call(this);
		}

		if(this.options.getFacetStats.length && typeof this.options.processFacetStats == "function" && "stats" in obj && obj.stats[this.options.getFacetStats] != null){
			
			obj.stats[this.options.getFacetStats].values = {min : this.options.getFacetStats in this.params.ranges && this.params.ranges[this.options.getFacetStats].lb != "*" ? this.params.ranges[this.options.getFacetStats].lb : obj.stats[this.options.getFacetStats].min
				,max : this.options.getFacetStats in this.params.ranges && this.params.ranges[this.options.getFacetStats].ub != "*" ? this.params.ranges[this.options.getFacetStats].ub : obj.stats[this.options.getFacetStats].max};

			this.options.processFacetStats.call(this,obj.stats);
		}
	}
	,paintSelectedFacets : function(){
		var selFacetKeys = Object.keys(this.params.filters);
		
		if(selFacetKeys.length){
			if(this.options.selectedFacetTemp  && this.options.selectedFacetContainerSelector){
				if(!this.compiledSelectedFacetTemp)
					this.compiledSelectedFacetTemp = Handlebars.compile(this.options.selectedFacetTemp);

				jQuery(this.options.selectedFacetContainerSelector).html(this.compiledSelectedFacetTemp(this.params));
			}
			jQuery(this.options.selectedFacetHolderSelector).show();
		}else{
			jQuery(this.options.selectedFacetContainerSelector).empty();
			jQuery(this.options.selectedFacetHolderSelector).hide();
		}
	}
	,prepareFacetName : function (txt){
		txt = txt.replace("_fq","");
		return txt.replace("_"," ");
	}
	,getQueryParams : function (q){
		var e,
			d = function (s) { return decodeURIComponent(s).replace(/\+/g, " ").trim(); },
			r = /([^&=]+)=?([^&]*)/g
			,urlParams = {};

			q = q || window.location.hash.substring(1) || window.location.search.substring(1);

		while (e = r.exec(q)) {
			var e1 = e[1].indexOf("[")
				,k = e1 == "-1" ? e[1] : e[1].slice(0, e1)
				,i = e1 != "-1" ? d(e[1].slice(e1+1, e[1].indexOf("]", e1))) : ""
				,v = d(e[2]);
			
			if(v.length ==0)
				continue;

			if (!(k in urlParams)) {
				urlParams[k] = v
			}else{
				if (typeof urlParams[k] != "object"){
					var old = urlParams[k];
					
					urlParams[k] = Array(urlParams[k]);

					Array.prototype.push.call(urlParams[k], old);
				}
				
				Array.prototype.push.call(urlParams[k], v);
			}
		}

		return urlParams;
	}
	,_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
	,encode: function (e) {
		var t = "",n, r, i, s, o, u, a,f = 0;
		e = this._utf8_encode(e);
		while (f < e.length) {
			n = e.charCodeAt(f++);
			r = e.charCodeAt(f++);
			i = e.charCodeAt(f++);
			s = n >> 2;
			o = (n & 3) << 4 | r >> 4;
			u = (r & 15) << 2 | i >> 6;
			a = i & 63;
			if (isNaN(r)) {
				u = a = 64;
			} else if (isNaN(i)) {
				a = 64;
			}
			t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a);
		}
		return t;
	}
	,decode: function (e) {
		var t = "",n, r, i,s, o, u, a,f = 0;
		e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		while (f < e.length) {
			s = this._keyStr.indexOf(e.charAt(f++));
			o = this._keyStr.indexOf(e.charAt(f++));
			u = this._keyStr.indexOf(e.charAt(f++));
			a = this._keyStr.indexOf(e.charAt(f++));
			n = s << 2 | o >> 4;
			r = (o & 15) << 4 | u >> 2;
			i = (u & 3) << 6 | a;
			t = t + String.fromCharCode(n);
			if (u != 64) {
				t = t + String.fromCharCode(r);
			}
			if (a != 64) {
				t = t + String.fromCharCode(i);
			}
		}
		t = this._utf8_decode(t);
		return t;
	}
	,_utf8_encode: function (e) {
		e = e.replace(/\r\n/g, "\n");
		var t = "";
		for (var n = 0; n < e.length; n++) {
			var r = e.charCodeAt(n);
			if (r < 128) {
				t += String.fromCharCode(r)
			} else if (r > 127 && r < 2048) {
				t += String.fromCharCode(r >> 6 | 192);
				t += String.fromCharCode(r & 63 | 128);
			} else {
				t += String.fromCharCode(r >> 12 | 224);
				t += String.fromCharCode(r >> 6 & 63 | 128);
				t += String.fromCharCode(r & 63 | 128);
			}
		}
		return t;
	}
	,_utf8_decode: function (e) {
		var t = "",n = 0;
		var r = c1 = c2 = 0;
		while (n < e.length) {
			r = e.charCodeAt(n);
			if (r < 128) {
				t += String.fromCharCode(r);
				n++;
			} else if (r > 191 && r < 224) {
				c2 = e.charCodeAt(n + 1);
				t += String.fromCharCode((r & 31) << 6 | c2 & 63);
				n += 2;
			} else {
				c2 = e.charCodeAt(n + 1);
				c3 = e.charCodeAt(n + 2);
				t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
				n += 3;
			}
		}
		return t;
	}
	//autosuggest function from here
	,as_moveSide: function(step){
		//step : 1 -> right click
		//step : -1 ->left click
		var newcolumn = this.as_activeColumn;
		if(this.options.as_template == "2column"){
			//if(this.options.sideContentOn == "left" && ((this.activeColumn == 0 && step == -1) || (this.activeColumn == 1 && step == 1)))
			if(this.options.as_sideContentOn == "left"){
				(this.as_activeColumn == 0 && step == -1) && (newcolumn = 1);
				(this.as_activeColumn == 1 && step == 1) && (newcolumn = 0);
			}else{//it is on right
				(this.as_activeColumn == 0 && step == 1) && (newcolumn = 1);
				(this.as_activeColumn == 1 && step == -1) && (newcolumn = 0);
			}

			if(newcolumn != this.as_activeColumn){
				this.as_activeColumn = newcolumn;
				this.as_activeRow = -1
				this.as_moveSelect(1);
			}
		}
	}
	,as_moveSelect: function (step) {
		var lis = this.as_$results.find("ul." + (this.as_activeColumn ? "unbxd-as-sidecontent" : "unbxd-as-maincontent")).find('li:not(.unbxd-as-header)');
		
		if (!lis) return;

		this.as_activeRow += step;
		
		if(this.as_activeRow < -1)
			this.as_activeRow = lis.size()-1;
		else if(this.as_activeRow == -1)
			this.$input.focus();
		else if(this.as_activeRow >= lis.size()){
			this.as_activeRow = -1;
			this.$input.focus();
		}

		$("."+this.as_selectedClass).removeClass(this.as_selectedClass);

		$(lis[this.as_activeRow]).addClass(this.as_selectedClass);
		
		if(this.as_activeRow >= 0 && this.as_activeRow < lis.size())
			this.$input.val($(lis[this.as_activeRow]).data('value'));
		else if(this.as_activeRow == -1)
			this.$input.val(this.as_previous);
	}
	,as_selectCurrent: function () {
		var li = this.as_$results.find('li.'+this.as_selectedClass),self = this;
	
		if (li.length) {
			this.as_selectItem(li.data());
			return true;
		} else {
			this.as_lastKeyEvent.preventDefault();
			this.reset();

			this.params.query = this.input.value.trim();

			this.setPage(1)
				.setPageSize(this.options.pageSize);

			this.callResults(this.paintResultSet);
			
			return false;
		}
	}
	,as_selectItem: function (data) {
		if (!('value' in data))
			return ;
		this.log("selected Item : ",data);
		var v = $.trim(data['value']),prev = this.previous;
		
		this.previous = v;
		this.input.lastSelected = data;
		this.as_$results.html('');
		this.$input.val(v);
		this.as_hideResultsNow(this);
		
		this.as_addToAnalytics("search",{query : data.value, autosuggestParams : { 
			type : data.type
			,suggestion : data.value
			,infield_value : data.filtervalue || null
			,infield_name : data.filtername || null
			,src_field : data.source || null
			,pid : data.pid || null
			,internal_query : prev
		}});

		//	this.options.as_onItemSelect.call(this,data,this.as_currentResults[data.type][parseInt(data['index'])]._original);

			this.reset();

			this.params.query = this.input.value.trim();

			this.setPage(1)
				.setPageSize(this.options.pageSize);

			if("filtername" in data && data.filtername && "filtervalue" in data && data.filtervalue){
				this.addFilter(data.filtername+"_fq",data.filtervalue);
			}

			this.callResults(this.paintResultSet);
		//}
	}
	,as_addToAnalytics:function(type,obj){
		if("Unbxd" in window && "track" in window.Unbxd && typeof window.Unbxd.track == "function"){
			this.log("Pushing data to analytics",type,obj);
			Unbxd.track( type, obj );
		}
	}
	,as_showResults: function () {
		
		var pos = this.$input.offset()
		// either use the specified width or calculate based on form element
		,iWidth = (this.options.width > 0) ? this.options.width : this.$input.innerWidth()
		,bt = parseInt(this.$input.css("border-top-width"),10)
		,bl = parseInt(this.$input.css("border-left-width"),10)
		,br = parseInt(this.$input.css("border-right-width"),10)
		,pb = parseInt(this.$input.css("padding-bottom"),10)
		,fwidth = (parseInt(iWidth)-2+bl+br)
		,fpos = {top : pos.top + bt + this.$input.innerHeight() + 'px',left: "auto",right: "auto"};
		
		this.as_$results.find("ul.unbxd-as-maincontent").css("width", fwidth+"px");

		if(this.as_scrollbarWidth == null){
			this.as_setScrollWidth();
		}

		//set column direction
		if(this.options.template == "2column"){
			this.as_$results.removeClass("unbxd-as-extra-left unbxd-as-extra-right");
			this.as_$results.addClass("unbxd-as-extra-" + this.options.as_sideContentOn);
		}

		if(this.options.as_sideContentOn == "left"){
			fpos.right = window.innerWidth - fwidth - pos.left -2 - this.as_scrollbarWidth + "px";
		}else{
			fpos.left = pos.left + "px";
		}

		if(typeof this.options.as_processResultsStyles == "function"){
			fpos = this.options.as_processResultsStyles.call(this,fpos);
		}

		this.as_$results.css(fpos).show();
	}
	,as_setScrollWidth:function(){
		var scrollDiv = document.createElement("div");
		scrollDiv.setAttribute("style","width: 100px;height: 100px;overflow: scroll;position: absolute;top: -9999px;");

		document.body.appendChild(scrollDiv);

		this.as_scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        document.body.removeChild(scrollDiv);
	}
	,as_hideResults: function () {
		if (this.as_timeout)
			clearTimeout(this.as_timeout);

		var self = this;

		this.timeout = setTimeout(function(){self.as_hideResultsNow();}, 200);
	}
	,as_hideResultsNow: function () {
		this.log("hideResultsNow");
		if (this.as_timeout) clearTimeout(this.as_timeout);
		
		this.$input.removeClass(this.options.as_loadingClass);
		
		if (this.as_$results.is(':visible')) {
			this.as_$results.hide();
		}
		
		if(this.as_ajaxCall) this.as_ajaxCall.abort();
	}
	,as_addFilter : function(field, value){
		if(!(field in this.as_params.filters))
			this.as_params.filters[field] = {};

		this.as_params.filters[field][value] = field;

		return this;
	}
	,as_removeFilter  : function(field, value){
		if(value in this.as_params.filters[field])
			delete this.as_params.filters[field][value];

		if(Object.keys(this.as_params.filters[field]).length == 0)
			delete this.as_params.filters[field];			

		return this;
	}
	,as_clearFilters : function(){
		this.as_params.filters = {}
		return this;
	}
	,as_onChange: function () {
		// ignore if the following keys are pressed: [del] [shift] [capslock]
		if( this.as_lastKeyPressCode == 46 || (this.as_lastKeyPressCode > 8 && this.as_lastKeyPressCode < 32) )
		{
			if(this.as_lastKeyPressCode == 27 && typeof this.input.as_lastSelected == 'object'){
				this.$input.val(this.input.as_lastSelected.value);
			}

			return this.as_$results.hide();
		}
		
		var v = this.$input.val();
		if (v == this.as_previous) return;
		
		this.as_params.q = v

		this.as_previous = v;
		this.as_currentResults	=	{};
		
		if(this.as_inCache(v)){
			this.log("picked from cache : " + v);
			this.as_currentResults = this.as_getFromCache(v);

			this.as_$results.html(this.as_prepareHTML());
			
			this.as_showResults();
		}else{
			if(this.as_ajaxCall) this.as_ajaxCall.abort();
		
			if (v.length >= this.options.as_minChars) {
				this.$input.addClass(this.options.as_loadingClass);
				this.as_requestData(v);
			} else {
				this.$input.removeClass(this.options.as_loadingClass);
				this.as_$results.hide();
			}	
		}
	}
	,as_requestData: function (q) {
		var self = this,url = self.as_autosuggestUrl();
		this.log("requestData", url);
		this.as_ajaxCall = $.ajax({
			url: url
			,dataType: "jsonp"
			,jsonp: 'json.wrf'
		})
		.done(function(d) { 
			self.as_receiveData(d);
		})
		.fail(function(f) {	
			self.$input.removeClass(self.options.as_asLoadingClass);
			self.as_$results.hide();
		});
	}
	,as_autosuggestUrl : function(){
		var host_path = this.getHostNPath("autosuggest");

		var url = "q=" + encodeURIComponent(this.as_params.q);

		url += '&inFields.count=' + this.options.as_inFields.count
			+ '&topQueries.count=' + this.options.as_topQueries.count
			+ '&keywordSuggestions.count=' + this.options.as_keywordSuggestions.count
			+ '&popularProducts.count=' + this.options.as_popularProducts.count;
			+ '&indent=off';

		for(var x in this.as_params.filters){
			if(this.as_params.filters.hasOwnProperty(x)){
				var a = [];
				for(var y in this.as_params.filters[x]){
					if(this.as_params.filters[x].hasOwnProperty(y)){
						a.push((x+':\"'+ encodeURIComponent(y.replace(/(^")|("$)/g, '')) +'\"').replace(/\"{2,}/g, '"'));
					}
				}

				url += '&filter='+a.join(' OR ');
			}
		}

		return host_path + "?" + url;
	}
	,as_receiveData: function (data) {
		if (data) {
			this.$input.removeClass(this.options.as_loadingClass);
			this.as_$results.html('');

			// if the field no longer has focus or if there are no matches, do not display the drop down
			if( !this.as_hasFocus || data.response.numberOfProducts == 0 || "error" in data ) return this.as_hideResultsNow();

			this.as_processData(data);

			this.as_addToCache(this.as_params.q, this.as_currentResults);

			this.as_$results.html(this.as_prepareHTML());
			
			this.as_showResults();
		} else {
			this.as_hideResultsNow();
		}
	}
	,as_processData: function(data){
		this.as_currentResults = {
			KEYWORD_SUGGESTION : []
			,TOP_SEARCH_QUERIES : []
			,POPULAR_PRODUCTS : []
			,IN_FIELD : []
		}
		,infieldsCount = 0;

		for(var x = 0; x < data.response.products.length; x++){
			var doc = data.response.products[x]
				,o = {};
			if("TOP_SEARCH_QUERIES" == doc.doctype && this.options.as_topQueries.count > this.as_currentResults.TOP_SEARCH_QUERIES.length){
				o = {
					autosuggest : doc.autosuggest
					,highlighted : this.as_highlightStr(doc.autosuggest)
					,type : "TOP_SEARCH_QUERIES"
					,_original : doc.doctype
				};
				this.as_currentResults.TOP_SEARCH_QUERIES.push(o);
			}else if("IN_FIELD" == doc.doctype && this.options.as_inFields.count > infieldsCount){
				var ins = {}
					,asrc = " " + doc.unbxdAutosuggestSrc + " "
					,highlightedtext = this.as_highlightStr(doc.autosuggest);

				for(var a in this.options.as_inFields.fields){
					if( (a+"_in") in doc && doc[a+"_in"].length && asrc.indexOf(" " +a+" ") == -1){
						ins[a] = doc[a+"_in"].slice(0, parseInt(this.options.as_inFields.fields[a]))
					}
				}

				this.as_currentResults.IN_FIELD.push({
					autosuggest : doc.autosuggest
					,highlighted : highlightedtext
					,type : "keyword" //this is kept as keyword but in template it will be used as "IN_FIELD"
					,source : doc.unbxdAutosuggestSrc
				});

				infieldsCount++;

				for(var a in ins){
					for(var b = 0; b < ins[a].length; b++)
						this.as_currentResults.IN_FIELD.push({
							autosuggest : doc.autosuggest
							,highlighted : ins[a][b]
							,type : doc.doctype
							,filtername : a
							,filtervalue : ins[a][b]
							,_original : doc
							,source : doc.unbxdAutosuggestSrc
						})
				}
			}else if("KEYWORD_SUGGESTION" == doc.doctype  && this.options.as_keywordSuggestions.count > this.as_currentResults.KEYWORD_SUGGESTION.length){
				o = {
					autosuggest : doc.autosuggest
					,highlighted : this.as_highlightStr(doc.autosuggest)
					,type : doc.doctype
					,_original : doc
					,source : doc.unbxdAutosuggestSrc || ""
				};
				this.as_currentResults.KEYWORD_SUGGESTION.push(o);
			}else if("POPULAR_PRODUCTS" == doc.doctype && this.options.as_popularProducts.count > this.as_currentResults.POPULAR_PRODUCTS.length){
				o = {
					autosuggest : doc.autosuggest
					,highlighted : this.as_highlightStr(doc.autosuggest)
					,type : doc.doctype
					,pid : doc.uniqueId.replace("popularProduct_","")
					,_original : doc
				};

				if(this.options.as_popularProducts.price){
					if(typeof this.options.as_popularProducts.priceFunctionOrKey == "function"){
						o.price = this.options.as_popularProducts.priceFunctionOrKey(doc);
					}else if(typeof this.options.as_popularProducts.priceFunctionOrKey == "string" && this.options.as_popularProducts.priceFunctionOrKey){
						o.price = this.options.as_popularProducts.priceFunctionOrKey in doc ? doc[this.options.as_popularProducts.priceFunctionOrKey] : null;
					}else{
						o.price = "price" in doc ? doc["price"] : null;
					}

					if(this.options.as_popularProducts.currency)
						o.currency = this.options.as_popularProducts.currency;
				}

				if(this.options.as_popularProducts.image){
					if(typeof this.options.as_popularProducts.imageUrlOrFunction == "function"){
						o.image = this.options.as_popularProducts.imageUrlOrFunction(doc);
					}else if(typeof this.options.as_popularProducts.imageUrlOrFunction == "string" && this.options.as_popularProducts.imageUrlOrFunction){
						o.image = this.options.as_popularProducts.imageUrlOrFunction in doc ? doc[this.options.as_popularProducts.imageUrlOrFunction] : null;
					}
				}

				this.as_currentResults.POPULAR_PRODUCTS.push(o);
			}
		}
	}
	,as_escapeStr: function(str){return str.replace(/([\\{}()|.?*+\-\^$\[\]])/g,'\\$1');}
	,as_highlightStr : function(str){
		var output	=	str
			,q = $.trim(this.params.q +'');

		if(q.indexOf(' ')){
			var arr = q.split(' ');
			for(var k in arr){
				if(!arr.hasOwnProperty(k))continue;
				
				var l	= output.toLowerCase().lastIndexOf("</strong>");
				if(l != -1) l += 9;
				output = output.substring(0,l) + output.substring(l).replace(new RegExp(this.as_escapeStr( arr[k] ), 'gi') , function($1){
					return '<strong>'+$1+'<\/strong>';
				});
			}
		}else{
			var st = output.toLowerCase().indexOf( q );
			output = st >= 0 ? output.substring(0,st) + '<strong>' + output.substring(st, st+q.length) + '</strong>' + output.substring(st+q.length) : output;
		}

		return output;
	}
	,as_prepareHTML: function (){
		var temp1 = '<ul class="unbxd-as-maincontent">'
+'{{#if data.IN_FIELD}}'
	+'{{#each data.IN_FIELD}}'
		+'{{#unbxdIf type "keyword"}}'
		+'<li class="unbxd-as-keysuggestion" data-index="{{@index}}" data-value="{{autosuggest}}" data-type="IN_FIELD" data-source="{{source}}">'
			+'{{{highlighted}}}'
		+'</li>'
		+'{{else}}'
		+'<li class="unbxd-as-insuggestion" data-index="{{@index}}" data-type="{{type}}" data-value="{{autosuggest}}" data-filtername="{{filtername}}" data-filtervalue="{{filtervalue}}"  data-source="{{source}}">'
			+'in {{{highlighted}}}'
		+'</li>'
		+'{{/unbxdIf}}'
	+'{{/each}}'
+'{{/if}}'
+'{{#if data.KEYWORD_SUGGESTION}}'
	+'{{#each data.KEYWORD_SUGGESTION}}'
	+'<li class="unbxd-as-keysuggestion" data-value="{{autosuggest}}" data-type="{{type}}" data-index="{{@index}}" data-source="{{source}}">'
		+'{{{highlighted}}}'
	+'</li>'
	+'{{/each}}'
+'{{/if}}'
+'{{#if data.TOP_SEARCH_QUERIES}}'
	+'{{#each data.TOP_SEARCH_QUERIES}}'
	+'<li class="unbxd-as-keysuggestion" data-value="{{autosuggest}}" data-type="{{type}}" data-index="{{@index}}">'
		+'{{{highlighted}}}'
	+'</li>'
	+'{{/each}}'
+'{{/if}}'
+'{{#if data.POPULAR_PRODUCTS}}'
	+'<li class="unbxd-as-header">'
		+'Popular products'
	+'</li>'
	+'{{#data.POPULAR_PRODUCTS}}'
	+'<li class="unbxd-as-popular-product" data-value="{{autosuggest}}" data-index="{{@index}}" data-type="{{type}}" data-pid="{{pid}}" >'
		+'{{#if ../showCarts}}'
			+'{{#unbxdIf ../../cartType "inline"}}'
				+'<div class="unbxd-as-popular-product-inlinecart">'
					+'<div class="unbxd-as-popular-product-image-container">'
						+'{{#if image}}'
						+'<img src="{{image}}"/>'
						+'{{/if}}'
					+'</div>'
					+'<div  class="unbxd-as-popular-product-name">'
						+'<div style="table-layout:fixed;width:100%;display:table;">'
							+'<div style="display:table-row">'
								+'<div style="display:table-cell;text-overflow:ellipsis;overflow: hidden;white-space: nowrap;">'
									+'{{{highlighted}}}'
								+'</div>'
							+'</div>'
						+'</div>'
					+'</div>'
					+'{{#if price}}'
						+'<div class="unbxd-as-popular-product-price">'
							+'{{currency}}{{price}}'
						+'</div>'
					+'{{/if}}'
					+'<div class="unbxd-as-popular-product-quantity">'
						+'<div class="unbxd-as-popular-product-quantity-container">'
							+'<span>Qty</span>'
							+'<input class="unbxd-popular-product-qty-input" value="1"/>'
						+'</div>'
					+'</div>'
					+'<div class="unbxd-as-popular-product-cart-action">'
						+'<button class="unbxd-as-popular-product-cart-button">Add to cart</button>'
					+'</div>'
				+'</div>'
			+'{{else}}'
				+'<div class="unbxd-as-popular-product-info">'
					+'<div class="unbxd-as-popular-product-image-container">'
						+'{{#if image}}'
						+'<img src="{{image}}"/>'
						+'{{/if}}'
					+'</div>'
					+'<div  class="unbxd-as-popular-product-name">'
						+'{{{highlighted}}}'
					+'</div>'
				+'</div>'
				+'<div class="unbxd-as-popular-product-cart">'
					+'<div class="unbxd-as-popular-product-cart-action">'
						+'<button class="unbxd-as-popular-product-cart-button">Add to cart</button>'
					+'</div>'
					+'<div class="unbxd-as-popular-product-quantity">'
						+'<div class="unbxd-as-popular-product-quantity-container">'
							+'<span>Qty</span>'
							+'<input class="unbxd-popular-product-qty-input" value="1"/>'
						+'</div>'
					+'</div>'
					+'{{#if price}}'
					+'<div class="unbxd-as-popular-product-price">'
						+'{{currency}}{{price}}'
					+'</div>'
					+'{{/if}}'
				+'</div>'
			+'{{/unbxdIf}}'
		+'{{else}}'
			+'<div class="unbxd-as-popular-product-info">'
				+'<div class="unbxd-as-popular-product-image-container">'
					+'{{#if image}}'
					+'<img src="{{image}}"/>'
					+'{{/if}}'
				+'</div>'
				+'<div  class="unbxd-as-popular-product-name">'
					+'{{{highlighted}}}'
				+'</div>'
			+'</div>'
		+'{{/if}}'
	+'</li>'
	+'{{/data.POPULAR_PRODUCTS}}'
+'{{/if}}'
+'</ul>'
		,temp2 = '<ul class="unbxd-as-sidecontent">'
					+'{{#if data.KEYWORD_SUGGESTION}}'
						+'<li class="unbxd-as-header">'
							+'Keyword Suggestions'
						+'</li>'
						+'{{#each data.KEYWORD_SUGGESTION}}'
						+'<li class="unbxd-as-keysuggestion" data-value="{{autosuggest}}" data-index="{{@index}}" data-type="{{type}}"  data-source="{{source}}">'
							+'{{{highlighted}}}'
						+'</li>'
						+'{{/each}}'
					+'{{/if}}'
					+'{{#if data.TOP_SEARCH_QUERIES}}'
						+'<li class="unbxd-as-header">'
							+'Top Queries'
						+'</li>'
						+'{{#each data.TOP_SEARCH_QUERIES}}'
						+'<li class="unbxd-as-keysuggestion" data-type="{{type}}" data-index="{{@index}}" data-value="{{autosuggest}}">'
							+'{{{highlighted}}}'
						+'</li>'
						+'{{/each}}'
					+'{{/if}}'
				+'</ul>'
				+'<ul class="unbxd-as-maincontent">'
					+'{{#if data.IN_FIELD}}'
						+'{{#each data.IN_FIELD}}'
							+'{{#unbxdIf type "keyword"}}'
							+'<li class="unbxd-as-keysuggestion" data-type="IN_FIELD" data-value="{{autosuggest}}" data-index="{{@index}}" data-source="{{source}}">'
								+'{{{highlighted}}}'
							+'</li>'
							+'{{else}}'
							+'<li class="unbxd-as-insuggestion" data-index="{{@index}}" data-type="{{type}}" data-value="{{autosuggest}}" data-filtername="{{filtername}}" data-filtervalue="{{filtervalue}}"  data-source="{{source}}">'
								+'in {{{highlighted}}}'
							+'</li>'
							+'{{/unbxdIf}}'
						+'{{/each}}'
					+'{{/if}}'
					+'{{#if data.POPULAR_PRODUCTS}}'
						+'<li class="unbxd-as-header">'
							+'Popular products'
						+'</li>'
						+'{{#data.POPULAR_PRODUCTS}}'
						+'<li class="unbxd-as-popular-product" data-value="{{autosuggest}}" data-index="{{@index}}" data-type="{{type}}" data-pid="{{pid}}" >'
							+'{{#if ../showCarts}}'
								+'{{#unbxdIf ../../cartType "inline"}}'//"inline" || "separate"
									+'<div class="unbxd-as-popular-product-inlinecart">'
										+'<div class="unbxd-as-popular-product-image-container">'
											+'{{#if image}}'
											+'<img src="{{image}}"/>'
											+'{{/if}}'
										+'</div>'
										+'<div  class="unbxd-as-popular-product-name">'
											+'<div style="table-layout:fixed;width:100%;display:table;">'
												+'<div style="display:table-row">'
													+'<div style="display:table-cell;text-overflow:ellipsis;overflow: hidden;white-space: nowrap;">'
														+'{{{highlighted}}}'
													+'</div>'
												+'</div>'
											+'</div>'
										+'</div>'
										+'{{#if price}}'
											+'<div class="unbxd-as-popular-product-price">'
												+'{{currency}}{{price}}'
											+'</div>'
										+'{{/if}}'
										+'<div class="unbxd-as-popular-product-quantity">'
											+'<div class="unbxd-as-popular-product-quantity-container">'
												+'<span>Qty</span>'
												+'<input class="unbxd-popular-product-qty-input" value="1"/>'
											+'</div>'
										+'</div>'
										+'<div class="unbxd-as-popular-product-cart-action">'
											+'<button class="unbxd-as-popular-product-cart-button">Add to cart</button>'
										+'</div>'
									+'</div>'
								+'{{else}}'
									+'<div class="unbxd-as-popular-product-info">'
										+'<div class="unbxd-as-popular-product-image-container">'
											+'{{#if image}}'
											+'<img src="{{image}}"/>'
											+'{{/if}}'
										+'</div>'
										+'<div  class="unbxd-as-popular-product-name">'
											+'{{{highlighted}}}'
										+'</div>'
									+'</div>'
									+'<div class="unbxd-as-popular-product-cart">'
										+'<div class="unbxd-as-popular-product-cart-action">'
											+'<button class="unbxd-as-popular-product-cart-button">Add to cart</button>'
										+'</div>'
										+'<div class="unbxd-as-popular-product-quantity">'
											+'<div class="unbxd-as-popular-product-quantity-container">'
												+'<span>Qty</span>'
												+'<input class="unbxd-popular-product-qty-input" value="1"/>'
											+'</div>'
										+'</div>'
										+'{{#if price}}'
										+'<div class="unbxd-as-popular-product-price">'
											+'{{currency}}{{price}}'
										+'</div>'
										+'{{/if}}'
									+'</div>'
								+'{{/unbxdIf}}'
							+'{{else}}'
								+'<div class="unbxd-as-popular-product-info">'
									+'<div class="unbxd-as-popular-product-image-container">'
										+'{{#if image}}'
										+'<img src="{{image}}"/>'
										+'{{/if}}'
									+'</div>'
									+'<div  class="unbxd-as-popular-product-name">'
										+'{{{highlighted}}}'
									+'</div>'
								+'</div>'
							+'{{/if}}'
						+'</li>'
						+'{{/data.POPULAR_PRODUCTS}}'
					+'{{/if}}'
				+'</ul>';
		var cmpld = Handlebars.compile( this.options.as_template == "2column" ? temp2 : temp1);
		this.log("prepraing html :-> template : " + this.options.as_template + " ,carts : " + this.options.as_showCarts + " ,cartType : " + this.options.cartType);
		this.log("html data : ",this.as_currentResults);
		return cmpld({
			data : this.as_currentResults
			,showCarts : this.options.as_showCarts
			,cartType : this.options.as_cartType
		});
	}
	,as_addToCache: function(q, processedData){
		if(!(q in this.as_cache)) this.as_cache[q] = $.extend({},processedData);
	}
	,as_inCache: function(q){
		return q in this.as_cache && this.as_cache.hasOwnProperty(q);
	}
	,as_getFromCache: function(q){
		return this.as_cache[q];
	}
	,as_setOption : function(name,value){
		var a = name.split(".")

		if(a.length > 1){
			var o = this.options;
			for(var i = 0; i < a.length-1; i++){
				if(!(a[i] in o))
					o[a[i]] = {};

				o = o[a[i]]
			}

			o[a[a.length-1]] = value;
		}else
			this.options[name] = value;

		this.as_previous = "";
		this.as_$results.html("");
		this.as_cache = {};
		this.as_cache.length = 0;
	}
	,log: function(){
		console.log("unbxd auto :",arguments);
	}
});