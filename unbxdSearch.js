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
        ,selectedFacetTemp : ['{{#each filters}}'
        ,'<ol>'
        ,'<li>'
        ,'<span class="label">{{prepareFacetName @key}}:</span>'
        ,'{{#each this}}'
        ,'<div class="refineSect">{{@key}}<a href="#" class="btn-remove"></a>'
        ,'</div>'
        ,'{{/each}}'
        ,'</li>'
        ,'</ol>'
        ,'{{/each}}'].join('')
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
        ,customReset : function(){}
    ,bannerSelector: ""
        ,bannerTemp: '<a href="{{landingUrl}}"><img src="{{imageUrl}}"/></a>'
        ,bannerCount: 0
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
        format : "json"
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
    ,ajaxCall : null
    ,init : function(){
        this.isHashChange = !!("onhashchange" in window.document.body);

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
            var cur_url = this.getUrlSubstring()
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

    if(this.options.type == "search"){
        if("form" in this.input && this.input.form){
            jQuery(this.input.form).bind("submit",function(e){
                e.preventDefault();

                self.reset();

                self.params.query = self.options.sanitizeQueryString.call(self, self.input.value);

                jQuery(self.options.searchResultContainer).html('');

                if(typeof self.options.setDefaultFilters == "function")
                self.options.setDefaultFilters.call(self);

            self.setPage(1)
                .setPageSize(self.options.pageSize)

                if(self.params.query)
                self.callResults(self.paintResultSet,true);
            });
        }else{
            this.$input.bind('keydown',function(e){
                if(e.which == 13){
                    e.preventDefault();

                    self.reset();

                    self.params.query = self.options.sanitizeQueryString.call(self, this.value );

                    jQuery(self.options.searchResultContainer).html('');

                    if(typeof self.options.setDefaultFilters == "function")
                self.options.setDefaultFilters.call(self);

            self.clearFilters(true).setPage(1)
                .setPageSize(self.options.pageSize)

                if(self.params.query)
                self.callResults(self.paintResultSet,true);
                }
            });

            if(this.options.searchButtonSelector.length){
                jQuery(this.options.searchButtonSelector).bind("click",function(e){
                    e.preventDefault();

                    self.reset();

                    self.params.query = self.options.sanitizeQueryString.call(self, self.input.value);

                    jQuery(self.options.searchResultContainer).html('');

                    self.clearFilters(true).setPage(1)
                    .setPageSize(self.options.pageSize)

                    if(self.params.query)
                    self.callResults(self.paintResultSet,true);
                });
            }
        }
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
            if((wind.scrollTop()) > (docu.height() - wind.height() - self.options.heightDiffToTriggerNextPage) && self.currentNumberOfProducts < self.totalNumberOfProducts && !self.isLoading){
                self.setPage(self.getPage() + 1)
            .callResults(self.paintProductPage);
            }
        });
    }

    //click on facet checkboxes
    if(this.options.facetContainerSelector.length > 0){
        jQuery(this.options.facetContainerSelector).delegate(self.options.facetCheckBoxSelector,'change',function(e){
            var box = jQuery(this),
		el = box.parents(self.options.facetElementSelector),
		facetName = box.attr('unbxdParam_facetName'),
		facetValue = box.attr('unbxdParam_facetValue'),
		vals = facetValue.split(' TO ');

            if(box.is(':checked') && typeof self.options.facetOnSelect == "function"){
                self.options.facetOnSelect(el);
            }

            if(!box.is(':checked') && typeof self.options.facetOnDeselect == "function"){
                self.options.facetOnDeselect(el);
            }

	    if(vals.length > 1)
		self[box.is(':checked') ? 'addRangeFilter' : 'removeRangeFilter'](facetName, vals[0], vals[1]);
	    else
		self[box.is(':checked') ? 'addFilter' : 'removeFilter'](facetName, facetValue);

            self.setPage(1)
            .callResults(self.paintResultSet,true);
        });
    }

    if(this.options.clearSelectedFacetsSelector.length > 0){
        jQuery('body').delegate(this.options.clearSelectedFacetsSelector,'click',function(e){
            e.preventDefault();

            self.clearFilters(true).setPage(1)
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
,clearFilters : function(clearRanges){
    this.params.filters = {}

    if(clearRanges){
	this.clearRangeFiltes();
    }
    return this;
}
,addRangeFilter : function(field, lb, ub){
    if(!(field in this.params.ranges))
	this.params.ranges[field] = {}; 
	
    this.params.ranges[field][lb + ' TO ' + ub] = {lb : lb || '*', ub : ub || '*'};

    return this;
}
,removeRangeFilter : function(field, lb, ub){
    if(!lb && !ub && field in this.params.ranges)
        delete this.params.ranges[field];

    if(lb && ub && field in this.params.ranges && (lb + ' TO ' + ub in this.params.ranges[field]))
	delete this.params.ranges[field][lb + ' TO ' + ub];

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
,getHostNPath: function(){
    return "//search.unbxdapi.com/"+ this.options.APIKey + "/" + this.options.siteName + "/"  + (this.options.type == "browse" ? "browse" : "search" )
}
,getUrlSubstring: function(){
    return window.location.hash.substring(1) || window.location.search.substring(1);
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

    for(var x in this.params.ranges){
	var a = [];
        for(var y in this.params.ranges[x]){
            if(this.params.ranges[x].hasOwnProperty(y)){
		a.push(x + ':[' + this.params.ranges[x][y].lb + " TO " + this.params.ranges[x][y].ub + ']');
            }
        }

        url += '&filter='+a.join(' OR ');
    }

    var a = [];
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
        url += '&fields=' + this.options.fields.join(',');
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
    if(this.isLoading){
        this.ajaxCall.abort();
    }

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

    this.ajaxCall = jQuery.ajax({
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
                format : "json"
                    ,page : 1
                    ,rows : 12
            }
    };

    if(typeof this.options.customReset == "function")
        this.options.customReset.call(this);

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

                    var vals = arr[1].split(" TO ");
                    if(vals.length > 1){
			if(!(arr[0] in params.ranges))
                            params.ranges[arr[0]] = {};
			
                        params.ranges[arr[0]][arr[1]] = {lb : isNaN(parseFloat(vals[0])) ? '*' : parseFloat(vals[0]), ub : isNaN(parseFloat(vals[1])) ? '*' : parseFloat(vals[1])};
                    } else {
			if(!(arr[0] in params.filters))
                            params.filters[arr[0]] = {};

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

    if (obj.hasOwnProperty('banner')){
        this.paintBanners(obj);
    }else{
        this.options.bannerSelector.length && jQuery(this.options.bannerSelector).empty();
    }

    if(obj.hasOwnProperty('didYouMean')){
      if(obj.response.numberOfProducts == 0 ) { //> this.options.pageSize){
          this.params.query = obj.didYouMean[0].suggestion;

             if(!this.compiledSpellCheckTemp)
                  this.compiledSpellCheckTemp = Handlebars.compile(this.options.spellCheckTemp);

             jQuery(this.options.spellCheck).html(this.compiledSpellCheckTemp({suggestion : obj.didYouMean[0].suggestion})).show();

           facetsAlso ? this.callResults(this.paintAfterSpellCheck) : this.callResults(this.paintOnlyResultSet) ;

         }
         else{

             this.params.query = obj.searchMetaData.queryParams.q;   //obj.didYouMean[0].suggestion;

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
,paintBanners : function(obj){
    if("error" in obj)
        return ;
    if(this.options.bannerCount == 0)
        return ;
    var banner = obj.banner
        var counter = 0
        this.compiledBannerTemp = Handlebars.compile(this.options.bannerTemp)
        for( var i=0;i<banner.banners.length && i < this.options.bannerCount ; i ++){
            this.options.bannerSelector.length && jQuery(this.options.bannerSelector).append(this.compiledBannerTemp({landingUrl:banner.banners[i].landingUrl, imageUrl :banner.banners[i].imageUrl}))
        }
}
,paintFacets: function(obj){
    if("error" in obj)
        return;

    var facets = obj.facets
        ,facetKeys = Object.keys(facets)
    ,textfacets = []
    ,rangefacets = []
        ,singlefacet = {}
    ,self = this
    ,facetVal = ""
    ,facetValStart = ""
    ,facetValEnd = ""
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

	if(singlefacet.type !== 'facet_ranges'){
            for(var i = 0, len = facets[x]['values'].length/2; i < len;i++){
		facetVal = facets[x]['values'][2 * i];

		if(facetVal.trim().length == 0)
                    continue;

		isSelected = x in self.params.filters && facetVal in self.params.filters[x] && self.params.filters[x][facetVal] == x ? true : false;

		singlefacet[isSelected ? "selected" : "unselected" ].push({value : facetVal , count : facets[x]['values'][2 * i + 1]});
		singlefacet.unordered.push({value : facetVal , count : facets[x]['values'][2 * i + 1], isSelected : isSelected});
            }

	    if((singlefacet.unordered.length) > 0) textfacets.push(singlefacet);
	    
	} else {
	    for(var i = 0, len = facets[x]['values']['counts'].length/2; i < len; i++){
		facetValStart = parseFloat(facets[x]['values']['counts'][2 * i]).toString();
		facetValEnd = (parseFloat(facetValStart) + facets[x]['values'].gap).toString();
		var y = facetValStart + ' TO ' + facetValEnd;

		isSelected = x in self.params.ranges && y in self.params.ranges[x] && self.params.ranges[x][y]['lb'] == facetValStart && self.params.ranges[x][y]['ub'] == facetValEnd ? true : false;

		singlefacet[isSelected ? "selected" : "unselected" ].push({begin: facetValStart, end: facetValEnd, count: facets[x]['values']['counts'][2 * i + 1], value: y});
		singlefacet.unordered.push({begin: facetValStart, end: facetValEnd, count: facets[x]['values']['counts'][2 * i + 1], value: y, isSelected : isSelected});
	    }

	    if((singlefacet.unordered.length) > 0) rangefacets.push(singlefacet);

	}
    }

    if(this.getClass(this.options.facetTemp) == 'Function'){
        this.options.facetTemp.call(this,{facets: textfacets, rangefacets: rangefacets});
    }else{
        if(!this.compiledFacetTemp && this.options.facetTemp.length)
            this.compiledFacetTemp = Handlebars.compile(this.options.facetTemp);

        this.options.facetContainerSelector.length && jQuery(this.options.facetContainerSelector).html(this.compiledFacetTemp({facets: textfacets, rangefacets: rangefacets}));
    }

    this.paintSelectedFacets();

    if (typeof this.options.onFacetLoad == "function") {
        this.options.onFacetLoad.call(this);
    }

    if(this.options.getFacetStats.length && typeof this.options.processFacetStats == "function" && "stats" in obj && obj.stats[this.options.getFacetStats] != null){
	obj.stats[this.options.getFacetStats].values = {
	    min: obj.stats[this.options.getFacetStats].min,
	    max: obj.stats[this.options.getFacetStats].max
	};
	if(this.options.getFacetStats in this.params.ranges){
	    for (var x in this.params.ranges[this.options.getFacetStats]){
		obj.stats[this.options.getFacetStats].values = {
		    min: this.params.ranges[this.options.getFacetStats][x].lb != "*" ? this.params.ranges[this.options.getFacetStats][x].lb : obj.stats[this.options.getFacetStats].min
		    ,max: this.params.ranges[this.options.getFacetStats][x].ub != "*" ? this.params.ranges[this.options.getFacetStats][x].ub : obj.stats[this.options.getFacetStats].max
		};
	    }
	}

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
        //splits on equals
        r = /([^&=]+)=?([^&]*)/g
            ,urlParams = {};

    q = q || this.getUrlSubstring();

    while (e = r.exec(q)) {
        var e1 = e[1].indexOf("[")
            //first group of regex match
            ,k = e1 == "-1" ? e[1] : e[1].slice(0, e1) 
            ,i = e1 != "-1" ? d(e[1].slice(e1+1, e[1].indexOf("]", e1))) : ""
            ,v = d(e[2]);

        /*
         continues the loop and does not add any key,value to the urlParams
         object. check if first group matches to be contain words(\w)
         fixes an issue for capital case seen from allianceonline where the 
         queries were writ0035/WRIT0035
        */
        if( v.length == 0 || !(/\w+/g.exec(k)) )
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
});
