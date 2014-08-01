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
	,clickNScrollSelector : ''
	//,isPagination : false
	//,clickNScrollElementSelector : '#load-more'
	,pageSize : 15
	,facetMultiSelect : false
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
	,sanitizeQueryString : function(q){ return q;}
	,getFacetStats : ""
	,processFacetStats : function(obj){}
	,setDefaultFilters : function(){}
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
			,rows : 12
		}
	}
	,isHistory : !!(window.history && history.pushState)
	,popped : false //there is an edge case in Mozilla that fires popstate initially
	,initialURL : ''
	,isHashChange : !!("onhashchange" in window.document.body)
	,currentHash : ""
	,hashChangeInterval : null
	,init : function(){
		this.$input = jQuery(this.options.inputSelector);
		this.$input.val('');
		this.input = this.$input[0];

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
				,decodedParamscount = Object.keys(decodedParams).length;

			if(decodedParamscount > 0){
				urlqueryparams = this._processURL(decodedParams);
			}else{
				urlqueryparams = this._processURL(urlqueryparams);
			}

			if(this.options.type == "search"){
				this.params = urlqueryparams;

				if(typeof this.options.setDefaultFilters == "function")
					this.options.setDefaultFilters.call(this);


				if(!("query" in this.params) || (this.params.query + "").trim().length == 0)
					this.params.query = "*";

				this.params.query = this.options.sanitizeQueryString(this.params.query);

				this.$input.val(this.params.query != "*" ? this.params.query : "");

				jQuery(this.options.searchResultContainer).html('');

				this.setPage(1)
					.setPageSize(this.options.pageSize);

				if(this.params.query){
					this._getFacetsFromHistory();
					this._getResultsFromHistory();
				}
			}else if(this.options.type == "browse" && "categoryId" in urlqueryparams && urlqueryparams["categoryId"].trim().length > 0){
				this.params = urlqueryparams;

				if(typeof this.options.setDefaultFilters == "function")
					this.options.setDefaultFilters.call(this);

				this.setPage(1)
					.setPageSize(this.options.pageSize);

				this._getFacetsFromHistory();
				this._getResultsFromHistory();
			}
		}
	}
	,getClass : function(object){
		return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
	}
	,setEvents : function(){
		var self = this;

		if(this.options.type == "search"){
			if("form" in this.input && this.input.form){
				jQuery(this.input.form).bind("submit",function(e){
					e.preventDefault();

					self.reset();

					self.params.query = self.options.sanitizeQueryString( self.input.value );

					jQuery(self.options.searchResultContainer).html('');

					self.clearFilters().setPage(1)
						.setPageSize(self.options.pageSize)

					if(self.params.query)
						self.callResults(self.paintResultSet,true);
				});
			}else{
				this.$input.bind('keydown',function(e){
					if(e.which == 13){
						e.preventDefault();

						self.reset();

						self.params.query = self.options.sanitizeQueryString( this.value );

						jQuery(self.options.searchResultContainer).html('');

						self.clearFilters().setPage(1)
							.setPageSize(self.options.pageSize)

						if(self.params.query)
							self.callResults(self.paintResultSet,true);
					}
				});

				if(this.options.searchButtonSelector.length){
					jQuery(this.options.searchButtonSelector).bind("click",function(e){
						e.preventDefault();

						self.reset();

						self.params.query = self.options.sanitizeQueryString( self.input.value );

						jQuery(self.options.searchResultContainer).html('');

						self.clearFilters().setPage(1)
							.setPageSize(self.options.pageSize)

						if(self.params.query)
							self.callResults(self.paintResultSet,true);
					});
				}
			}
		}

		//click on somthing like "Load more results" to fetch next page
		if(this.options.isClickNScroll){
			jQuery(this.options.clickNScrollSelector).bind('click',function(e){
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
				if((wind.scrollTop()) > (docu.height()- window.innerHeight -100) && self.currentNumberOfProducts < self.totalNumberOfProducts && !self.isLoading){
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
					.callResults(self.paintAfterFacetChange,true);
			});
		}

		if(this.options.clearSelectedFacetsSelector.length > 0){
			jQuery(this.options.clearSelectedFacetsSelector).bind('click',function(e){
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
					.callResults(self.paintAfterFacetChange,true);
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

				self.reset();

				self.setPage(1);

				if((old_params.query) || (old_params.categoryId)){
					if((self.options.type == "search" && self.params.query != old_params.query) || (self.options.type == "search" && self.params.categoryId != old_params.categoryId)){
						self.params = old_params;
						self._getFacetsFromHistory();
						self._getResultsFromHistory();
					}else{
						self.params = old_params;
						self._getResultsFromHistory();
					}
				}
			});
		}else if(this.isHashChange){
			jQuery(window).bind("hashchange",function(e){
				var newhash = window.location.hash.substring(1);
				if(newhash && newhash != self.currentHash){
					self.reset();
					var old_params = self._processURL(self.decode(newhash));

					old_params.query = self.options.type == "search" ? self.options.sanitizeQueryString(old_params.query) : "";

					self.currentHash = newhash;

					if((old_params.query) || (old_params.categoryId)){
						if((self.options.type == "search" && self.params.query != old_params.query) || (self.options.type == "search" && self.params.categoryId != old_params.categoryId)){
							self.params = old_params;
							self._getFacetsFromHistory();
							self._getResultsFromHistory();
						}else{
							self.params = old_params;
							self._getResultsFromHistory();
						}
					}
				}
			});
		}else{
			self.hashChangeInterval = setInterval(function() {
				var newhash = location.hash.substring(1);

				if (newhash && newhash != self.currentHash) {
					self.reset();
					var old_params = self._processURL(self.decode(newhash));

					old_params.query = self.options.type == "search" ? self.options.sanitizeQueryString(old_params.query) : "";

					self.currentHash = newhash;

					if((old_params.query) || (old_params.categoryId)){
						if((self.options.type == "search" && self.params.query != old_params.query) || (self.options.type == "search" && self.params.categoryId != old_params.categoryId)){
							self.params = old_params;
							self._getFacetsFromHistory();
							self._getResultsFromHistory();
						}else{
							self.params = old_params;
							self._getResultsFromHistory();
						}
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
			delete delete this.params.filters[field];			

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
	,getHostNPath: function(){
		return window.location.protocol + "//" + this.options.siteName + ".search.unbxdapi.com/" + this.options.APIKey + "/" + (this.options.type == "browse" ? "browse" : "search" )
	}
	,url : function(){
		var host_path = this.getHostNPath();

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
			if (this.params.extra.hasOwnProperty(key)) {
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
			if(this.isHistory){
				history.pushState(this.params,null,location.protocol + "//" + location.host + location.pathname + "?" + this.encode( urlobj.query ));
			}else{
				window.location.hash = this.encode( urlobj.query );
				this.currentHash = this.encode( urlobj.query );
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
			params.extra.rows = obj.rows;

		//lets get query
		if("q" in obj)
			params.query = obj.q;

		//lets get category-id
		if("category-id" in obj)
			params.categoryId = obj["category-id"];

		//lets get boost
		if("boost" in obj)
			params.extra.boost = obj.boost;

		return params;
	}
	,_getFacetsFromHistory: function(q){
		jQuery.ajax({
			url: this.getHostNPath() + "?rows=0&" 
				+ (this.options.type == "browse" ? "category-id="+ this.params.categoryId : "q=" + (q ? q : this.params.query) )
				+ (this.options.getFacetStats.length > 0 ? "&stats=" + this.options.getFacetStats : "")
			,dataType: "jsonp"
			,jsonp: 'json.wrf'
			,success: this._internalPaintFacets.bind(this)
	    });
	}
	,_internalPaintFacets: function(obj){
		if("error" in obj)
			return false;

		if(obj.hasOwnProperty('didYouMean')){
			if(obj.response.numberOfProducts > this.options.pageSize){
				this.paintFacets(obj);
			}else{
				this._getFacetsFromHistory(obj.didYouMean[0].suggestion)
			}
		}else{
			this.paintFacets(obj);
		}
	}
	,_getResultsFromHistory: function(){
		var urlobj = this.url();
		jQuery.ajax({
			url: urlobj.url
			,dataType: "jsonp"
			,jsonp: 'json.wrf'
			,success: this.paintResultsFromHistory.bind(this)
	    });
	}
	,paintResultsFromHistory: function(obj){
		this._internalPaintResultSet(obj,false);
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

		if(!this.compiledSearchQueryTemp)
			this.compiledSearchQueryTemp = Handlebars.compile(this.options.searchQueryDisplayTemp);

		jQuery(this.options.searchQueryDisplay).html(this.compiledSearchQueryTemp({
			query : obj.searchMetaData.queryParams.q
			,numberOfProducts : obj.response.numberOfProducts
		})).show();

		if(this.getClass(this.options.searchResultSetTemp) == 'Function'){
			this.options.searchResultSetTemp(obj);
		}else{
			if(!this.compiledResultTemp)
				this.compiledResultTemp = Handlebars.compile(this.options.searchResultSetTemp);

			jQuery(this.options.searchResultContainer).append(this.compiledResultTemp(obj.response));
		}

		this.totalNumberOfProducts = obj.response.numberOfProducts;

		this.currentNumberOfProducts += obj.response.products.length;
		
		if(this.options.isClickNScroll)
			jQuery(this.options.clickNScrollSelector)[(this.currentNumberOfProducts < this.totalNumberOfProducts) ? 'show' : 'hide']();
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
			};
			
			for(var i = 0, len = facets[x]['values'].length/2; i < len;i++){
				facetVal = facets[x]['values'][2 * i];

				if(facetVal.trim().length == 0)
					continue;

				isSelected = x in self.params.filters && facetVal in self.params.filters[x] && self.params.filters[x][facetVal] == x ? true : false;

				singlefacet[isSelected ? "selected" : "unselected" ].push({value : facetVal , count : facets[x]['values'][2 * i + 1]});
			}

			if((singlefacet.selected.length + singlefacet.unselected.length) > 0)
				newfacets.push(singlefacet);
		}

		if(this.getClass(this.options.facetTemp) == 'Function'){
			this.options.facetTemp({facets : newfacets});
		}else{
			if(!this.compiledFacetTemp && this.options.facetTemp.length)
			this.compiledFacetTemp = Handlebars.compile(this.options.facetTemp);
		
			this.options.facetContainerSelector.length && jQuery(this.options.facetContainerSelector).html(this.compiledFacetTemp({facets : newfacets}));
		}

		this.paintSelectedFacets();

		if (typeof this.options.onFacetLoad == "function") {
			this.options.onFacetLoad();
		}

		if(this.options.getFacetStats.length && typeof this.options.processFacetStats == "function" && "stats" in obj){
			
			obj.stats[this.options.getFacetStats].values = {min : this.options.getFacetStats in this.params.ranges && this.params.ranges[this.options.getFacetStats].lb != "*" ? this.params.ranges[this.options.getFacetStats].lb : obj.stats[this.options.getFacetStats].min
				,max : this.options.getFacetStats in this.params.ranges && this.params.ranges[this.options.getFacetStats].ub != "*" ? this.params.ranges[this.options.getFacetStats].ub : obj.stats[this.options.getFacetStats].max};

			this.options.processFacetStats(obj.stats);
		}
	}
	,paintSelectedFacets : function(){
		var selFacetKeys = Object.keys(this.params.filters);
		
		if(selFacetKeys.length && this.options.selectedFacetTemp && this.options.selectedFacetContainerSelector){
			if(!this.compiledSelectedFacetTemp)
				this.compiledSelectedFacetTemp = Handlebars.compile(this.options.selectedFacetTemp);

			jQuery(this.options.selectedFacetContainerSelector).html(this.compiledSelectedFacetTemp(this.params));
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
			// if (!i && !(k in urlParams)) {
			// 	urlParams[k] = v
			// }else if (i && !(k in urlParams)) {
			// 	urlParams[k] = [];

			// 	urlParams[k][i] = v;
			// }else if (!i && (k in urlParams)){
			// 	if (typeof urlParams[k] != "object"){
			// 		var old = urlParams[k];

			// 		urlParams[k] = [];

			// 		Array.prototype.push.call(urlParams[k], old);
			// 	}

			// 	Array.prototype.push.call(urlParams[k], v);
			// }else{
			// 	if (typeof urlParams[k] != "object"){
			// 		var old = urlParams[k];
					
			// 		urlParams[k] = [];

			// 		Array.prototype.push.call(urlParams[k], old);
			// 	}

			// 	urlParams[k][i] = v;
			// }
			
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
});
