//uglifyjs unbxdSearch.js -o unbxdSearch.min.js && gzip -c unbxdSearch.min.js > unbxdSearch.min.js.gz && aws s3 cp unbxdSearch.min.js.gz s3://unbxd/unbxdSearch.js --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers --content-encoding gzip --cache-control max-age=3600
var unbxdSearchInit = function(jQuery, Handlebars){
  window.Unbxd = window.Unbxd || {};
  Unbxd.jsSdkVersion = "1.0.9";

  // Production steps of ECMA-262, Edition 5, 15.4.4.14
  // Reference: http://es5.github.io/#x15.4.4.14
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement, fromIndex) {

      var k;

      // 1. Let O be the result of calling ToObject passing
      //    the this value as the argument.
      if (this == null) {
	throw new TypeError('"this" is null or not defined');
      }

      var O = Object(this);

      // 2. Let lenValue be the result of calling the Get
      //    internal method of O with the argument "length".
      // 3. Let len be ToUint32(lenValue).
      var len = O.length >>> 0;

      // 4. If len is 0, return -1.
      if (len === 0) {
	return -1;
      }

      // 5. If argument fromIndex was passed let n be
      //    ToInteger(fromIndex); else let n be 0.
      var n = +fromIndex || 0;

      if (Math.abs(n) === Infinity) {
	n = 0;
      }

      // 6. If n >= len, return -1.
      if (n >= len) {
	return -1;
      }

      // 7. If n >= 0, then Let k be n.
      // 8. Else, n<0, Let k be len - abs(n).
      //    If k is less than 0, then let k be 0.
      k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      // 9. Repeat, while k < len
      while (k < len) {
	// a. Let Pk be ToString(k).
	//   This is implicit for LHS operands of the in operator
	// b. Let kPresent be the result of calling the
	//    HasProperty internal method of O with argument Pk.
	//   This step can be combined with c
	// c. If kPresent is true, then
	//    i.  Let elementK be the result of calling the Get
	//        internal method of O with the argument ToString(k).
	//   ii.  Let same be the result of applying the
	//        Strict Equality Comparison Algorithm to
	//        searchElement and elementK.
	//  iii.  If same is true, return k.
	if (k in O && O[k] === searchElement) {
	  return k;
	}
	k++;
      }
      return -1;
    };
  }
  
  /**
   * Shim for "fixing" IE's lack of support (IE < 9) for applying slice
   * on host objects like NamedNodeMap, NodeList, and HTMLCollection
   * (technically, since host objects have been implementation-dependent,
   * at least before ES6, IE hasn't needed to work this way).
   * Also works on strings, fixes IE < 9 to allow an explicit undefined
   * for the 2nd argument (as in Firefox), and prevents errors when
   * called on other DOM objects.
   */
  (function () {
    'use strict';
    var _slice = Array.prototype.slice;
    
    try {
      // Can't be used with DOM elements in IE < 9
      _slice.call(document.documentElement);
    } catch (e) { // Fails in IE < 9
      // This will work for genuine arrays, array-like objects,
      // NamedNodeMap (attributes, entities, notations),
      // NodeList (e.g., getElementsByTagName), HTMLCollection (e.g., childNodes),
      // and will not fail on other DOM objects (as do DOM elements in IE < 9)
      Array.prototype.slice = function(begin, end) {
	// IE < 9 gets unhappy with an undefined end argument
	end = (typeof end !== 'undefined') ? end : this.length;

	// For native Array objects, we use the native slice function
	if (Object.prototype.toString.call(this) === '[object Array]'){
	  return _slice.call(this, begin, end);
	}

	// For array like object we handle it ourselves.
	var i, cloned = [],
	    size, len = this.length;

	// Handle negative value for "begin"
	var start = begin || 0;
	start = (start >= 0) ? start : Math.max(0, len + start);

	// Handle negative value for "end"
	var upTo = (typeof end == 'number') ? Math.min(end, len) : len;
	if (end < 0) {
	  upTo = len + end;
	}

	// Actual expected size of the slice
	size = upTo - start;

	if (size > 0) {
	  cloned = new Array(size);
	  if (this.charAt) {
	    for (i = 0; i < size; i++) {
	      cloned[i] = this.charAt(start + i);
	    }
	  } else {
	    for (i = 0; i < size; i++) {
	      cloned[i] = this[start + i];
	    }
	  }
	}

	return cloned;
      };
    }
  }());

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

  // Production steps of ECMA-262, Edition 5, 15.4.4.19
  // Reference: http://es5.github.io/#x15.4.4.19
  if (!Array.prototype.map) {

    Array.prototype.map = function(callback, thisArg) {

      var T, A, k;

      if (this == null) {
	throw new TypeError(' this is null or not defined');
      }

      // 1. Let O be the result of calling ToObject passing the |this|
      //    value as the argument.
      var O = Object(this);

      // 2. Let lenValue be the result of calling the Get internal
      //    method of O with the argument "length".
      // 3. Let len be ToUint32(lenValue).
      var len = O.length >>> 0;

      // 4. If IsCallable(callback) is false, throw a TypeError exception.
      // See: http://es5.github.com/#x9.11
      if (typeof callback !== 'function') {
	throw new TypeError(callback + ' is not a function');
      }

      // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
      if (arguments.length > 1) {
	T = thisArg;
      }

      // 6. Let A be a new array created as if by the expression new Array(len)
      //    where Array is the standard built-in constructor with that name and
      //    len is the value of len.
      A = new Array(len);

      // 7. Let k be 0
      k = 0;

      // 8. Repeat, while k < len
      while (k < len) {

	var kValue, mappedValue;

	// a. Let Pk be ToString(k).
	//   This is implicit for LHS operands of the in operator
	// b. Let kPresent be the result of calling the HasProperty internal
	//    method of O with argument Pk.
	//   This step can be combined with c
	// c. If kPresent is true, then
	if (k in O) {

	  // i. Let kValue be the result of calling the Get internal
	  //    method of O with argument Pk.
	  kValue = O[k];

	  // ii. Let mappedValue be the result of calling the Call internal
	  //     method of callback with T as the this value and argument
	  //     list containing kValue, k, and O.
	  mappedValue = callback.call(T, kValue, k, O);

	  // iii. Call the DefineOwnProperty internal method of A with arguments
	  // Pk, Property Descriptor
	  // { Value: mappedValue,
	  //   Writable: true,
	  //   Enumerable: true,
	  //   Configurable: true },
	  // and false.

	  // In browsers that support Object.defineProperty, use the following:
	  // Object.defineProperty(A, k, {
	  //   value: mappedValue,
	  //   writable: true,
	  //   enumerable: true,
	  //   configurable: true
	  // });

	  // For best browser support, use the following:
	  A[k] = mappedValue;
	}
	// d. Increase k by 1.
	k++;
      }

      // 9. return A
      return A;
    };
  }
  
  if (!Array.prototype.filter) {
    Array.prototype.filter = function(fun/*, thisArg*/) {
      'use strict';

      if (this === void 0 || this === null) {
	throw new TypeError();
      }

      var t = Object(this);
      var len = t.length >>> 0;
      if (typeof fun !== 'function') {
	throw new TypeError();
      }

      var res = [];
      var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
      for (var i = 0; i < len; i++) {
	if (i in t) {
	  var val = t[i];

	  // NOTE: Technically this should Object.defineProperty at
	  //       the next index, as push can be affected by
	  //       properties on Object.prototype and Array.prototype.
	  //       But that method's new, and collisions should be
	  //       rare, so use the more-compatible alternative.
	  if (fun.call(thisArg, val, i, t)) {
	    res.push(val);
	  }
	}
      }

      return res;
    };
  }
  
  // Production steps of ECMA-262, Edition 5, 15.4.4.21
  // Reference: http://es5.github.io/#x15.4.4.21
  if (!Array.prototype.reduce) {
    Array.prototype.reduce = function(callback /*, initialValue*/) {
      'use strict';
      if (this == null) {
	throw new TypeError('Array.prototype.reduce called on null or undefined');
      }
      if (typeof callback !== 'function') {
	throw new TypeError(callback + ' is not a function');
      }
      var t = Object(this), len = t.length >>> 0, k = 0, value;
      if (arguments.length == 2) {
	value = arguments[1];
      } else {
	while (k < len && !(k in t)) {
	  k++;
	}
	if (k >= len) {
	  throw new TypeError('Reduce of empty array with no initial value');
	}
	value = t[k++];
      }
      for (; k < len; k++) {
	if (k in t) {
	  value = callback(value, t[k], k, t);
	}
      }
      return value;
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
    ,deferInitRender: []
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
    ,paginationContainerSelector: ''
    ,paginationTemp:[
      '{{#if hasFirst}}',
      '<span class="unbxd_first" unbxdaction="first"> &laquo; </span>',
      '{{/if}}',
      '{{#if hasPrev}}',
      '<span class="unbxd_prev" unbxdaction="prev"> &lt; </span>',
      '{{/if}}',
      '{{#pages}}',
      '{{#if current}}',
      '<span class="unbxd_page highlight"> {{page}} </span>',
      '{{else}}',
      '<span class="unbxd_page" unbxdaction="{{page}}"> {{page}} </span>',
      '{{/if}}',
      '{{/pages}}',
      '<span class="unbxd_pageof"> of </span>',
      '<span class="unbxd_totalPages" unbxdaction="{{totalPages}}">{{totalPages}}</span>',
      '{{#if hasNext}}',
      '<span class="unbxd_next" unbxdaction="next"> &gt; </span>',
      '{{/if}}',
      '{{#if hasLast}}',
      '<span class="unbxd_last" unbxdaction="last">&raquo;</span>',
      '{{/if}}'
    ].join('')
    ,clickNScrollElementSelector : '#load-more'
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
    ,bannerCount: 1
    ,sortContainerSelector: ''
    ,sortOptions: [{
      name: 'Relevancy'
    },{
      name: 'Price: H-L',
      field: 'price',
      order: 'desc'
    },{
      name: 'Price: L-H',
      field: 'price',
      order: 'asc'
    }]
    ,sortContainerType: 'select' /* value can be select or click */
    ,sortContainerTemp: [
      '<select>',
      '{{#options}}',
      '{{#if selected}}',
      '<option value="{{field}}-{{order}}" unbxdsortField="{{field}}" unbxdsortValue="{{order}}" selected>{{name}}</option>',
      '{{else}}',
      '<option value="{{field}}-{{order}}" unbxdsortField="{{field}}" unbxdsortValue="{{order}}">{{name}}</option>',
      '{{/if}}',
      '{{/options}}',
      '</select>'
    ].join('')
    ,pageSize : 12
    ,pageSizeContainerSelector: ''
    ,pageSizeOptions: [{
      name: '12',
      value: '12'
    },{
      name: '24',
      value: '24'
    }]
    ,pageSizeContainerType: 'select' /* value can be select or click */
    ,pageSizeContainerTemp: [
      '<select>',
      '{{#options}}',
      '{{#if selected}}',
      '<option value="{{value}}" selected unbxdpageSize="{{value}}">{{name}}</option>',
      '{{else}}',
      '<option value="{{value}}" unbxdpageSize="{{value}}">{{name}}</option>',
      '{{/if}}',
      '{{/options}}',
      '</select>'
    ].join(''),
    viewTypeContainerTemp: [
      '{{#options}}',
      '<li class="unbxd-{{#if selected}}current{{/if}}">',
      '<a title="{{value}} View" class="unbxd-{{value}}view-button" {{#unless selected}}unbxdviewtype="{{value}}"{{/unless}}>',
      '<span class="icon-{{value}}view">',
      '{{value}}',
      '</span>',
      '</a>',
      '</li>',
      '{{/options}}'
    ].join('')
    ,searchQueryParam:"q"
    ,retainbaseParam: false
    ,baseParams:[]
    ,requestHeaders: {}
  };

  jQuery.extend(Unbxd.setSearch.prototype,{
    compiledResultTemp : false
    ,compiledSpellCheckTemp : false
    ,compiledSearchQueryTemp: false
    ,compiledFacetTemp : false
    ,compiledSelectedFacetTemp : false
    ,compiledBannerTemp: false
    ,compiledSortContainerTemp: false
    ,compiledPageSizeContainerTemp: false
    ,compiledPaginationTemp: false
    ,currentNumberOfProducts : 0
    ,totalNumberOfProducts : 0
    ,productStartIdx: 0
    ,productEndIdx: 0
    ,totalPages: 0
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
    ,defaultParams: {
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

      var cur_url = this.getUrlSubstring()
      ,urlqueryparams = this.getQueryParams(cur_url)
      // add test to check if the url is encoded,
      // decode the query parameters only if url is encoded
      // fixes SKU searches like writ0035/WRIT0035 & HSWD0015
      ,decodedParams = !(/[^A-Za-z0-9\+\/\=]/g.test(cur_url)) ? this.getQueryParams(this.decode(cur_url)) : {}
      ,queryparamcount = Object.keys(urlqueryparams).length
      ,decodedParamscount = Object.keys(decodedParams).length
      ,finalParams = null;

      if(!this.options.noEncoding && decodedParamscount > 0){
        finalParams = this._processURL(decodedParams);
      }else{
        finalParams = this._processURL(urlqueryparams);
      }

      if(this.options.deferInitRender.indexOf('search') > -1
	 && !this.isUsingPagination()
	 && finalParams.extra.hasOwnProperty('page')
	 && finalParams.extra.page >= 1)
	finalParams.extra.page = finalParams.extra.page + 1;

      this.params = finalParams;

      this.params.categoryId = this.options.type == "browse" && typeof this.options.getCategoryId == "function" ?
	this.options.getCategoryId() : (this.params.categoryId ? this.params.categoryId : "");

      this.setPage("page" in finalParams.extra ? finalParams.extra.page : 1)
	.setPageSize("rows" in finalParams.extra ? finalParams.extra.rows :  this.options.pageSize);

      if(this.options.type == "search"){
	if(this.input.value.trim().length)
	  this.params.query = this.$input.val().trim();
        else if(!("query" in this.params) || (this.params.query + "").trim().length == 0)
	  this.params.query = "*";

        this.params.query = this.options.sanitizeQueryString.call(this,this.params.query);

        this.$input.val(this.params.query != "*" ? this.params.query : "");

	if(this.options.deferInitRender.indexOf('search') === -1)
	  jQuery(this.options.searchResultContainer).html('');

      }

      if(typeof this.options.setDefaultFilters == "function")
	this.setDefaultParams(this.params);

      if((this.options.type == "search" && "query" in this.params && this.params["query"].trim().length > 0) ||
	 (this.options.type == "browse" && "categoryId" in this.params && this.params["categoryId"].trim().length > 0))
	this.callResults(this.paintResultSet);
    }
    ,getClass : function(object){
      return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
    }
    ,setEvents : function(){
      var self = this;

      var changeViewType = function(e) {
        e.preventDefault();
        var $t = jQuery(this);
        var selected = $t.attr("unbxdviewtype");
        self.setViewType(selected);
        if(selected && self.options.viewTypes.indexOf(selected) > -1) {
	  if(!self.isUsingPagination()) self.setPage(1);
	  if(self.options.deferInitRender.indexOf('search') > 0
	     && !self.isUsingPagination()) self.setPage(2);
          self.callResults(self.paintOnlyResultSet, true);
        }
      };

      var changeSort = function(e){
	e.preventDefault();
	var $t = jQuery(this),
	    $selected = (e.type === 'change') ? $t.find(':selected') :
	    (e.currentTarget === e.target) ? $t : undefined,
	    field = $selected && $selected.attr('unbxdsortfield'),
	    value = $selected && $selected.attr('unbxdsortvalue');
	
	if($selected){
	  self
	    .resetSort()
	    .setPage(1);
	  
	  if(field && value)
	    self.addSort(field, value);
	  
	  self.callResults(self.paintOnlyResultSet, true);
	}
      };

      var changePageSize = function(e){
	e.preventDefault();
	var $t = jQuery(this),
	    $selected = (e.type === 'change') ? $t.find(':selected') :
	    (e.currentTarget === e.target) ? $t : undefined,
	    pageSize = $selected && $selected.attr('unbxdpagesize');

	if($selected && pageSize){
	  self
	    .setPage(1)
	    .setPageSize(pageSize)
	    .callResults(self.paintOnlyResultSet, true);
	}
      };

      if(this.options.type == "search"){
	if("form" in this.input && this.input.form){
	  jQuery(this.input.form).bind("submit",function(e){
	    e.preventDefault();

	    self.reset();

	    self.params.query = self.options.sanitizeQueryString.call(self, self.input.value);

	    if(self.options.deferInitRender.indexOf('search') === -1)
	      jQuery(self.options.searchResultContainer).html('');

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

	      if(self.options.deferInitRender.indexOf('search') === -1)
		jQuery(self.options.searchResultContainer).html('');

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

	      if(self.options.deferInitRender.indexOf('search') === -1)
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
	  ,vals = val.split(' TO ')
	  ,checkbox_sel = self.options.facetCheckBoxSelector + "[unbxdParam_facetName='"+ name +"'][unbxdParam_facetValue='" + val + "']";

	  jQuery(checkbox_sel).removeAttr("checked");
	  
	  if(typeof self.options.facetOnDeselect == "function"){
	    self.options.facetOnDeselect(jQuery(checkbox_sel).parents(self.options.facetElementSelector));
	  }

	  if(vals.length > 1)
	    self.removeRangeFilter(name, vals[0], vals[1]);
	  else
	    self.removeFilter(name, val);

	  self.setPage(1)
	    .callResults(self.paintResultSet,true);
	});
      }

      if(this.options.sortContainerSelector.length > 0){
	if(this.options.sortContainerType === 'select'){
	  jQuery(this.options.sortContainerSelector).on({
	    change: changeSort
	  }, '*');
	} else if(this.options.sortContainerType === 'click'){
	  jQuery(this.options.sortContainerSelector).on({
	    click: changeSort
	  }, '[unbxdsortfield]');
	}
      }

      if(this.options.pageSizeContainerSelector.length > 0){
	if(this.options.pageSizeContainerType === 'select'){
	  jQuery(this.options.pageSizeContainerSelector).on({
	    change: changePageSize
	  }, '*');
	} else if(this.options.pageSizeContainerType === 'click'){
	  jQuery(this.options.pageSizeContainerSelector).on({
	    click: changePageSize
	  }, '[unbxdpagesize]');
	}
	jQuery(this.options.pageSizeContainerSelector).delegate('*', 'change', function(e){

	});
      }

      if(this.options.paginationContainerSelector.length > 0){
	jQuery(this.options.paginationContainerSelector).delegate('*', 'click', function(e) {
	  e.preventDefault();
	  var $t = jQuery(this),
	      keys = {
		first: 1,
		prev: self.getPage() - 1,
		next: self.getPage() + 1,
		last: self.totalPages
	      },
	      action = $t.attr('unbxdaction') || '';

	  if(action){
	    if(keys[action]){
	      self.setPage(keys[action]);
	    } else if(!isNaN(parseInt(action, 10))){
	      self.setPage(parseInt(action, 10));
	    }
	    self.callResults(self.paintOnlyResultSet, true);
	  }
	  
	});
      }

      if(this.isHistory){
	self.popped = ('state' in window.history);
	self.initialURL = location.href;

	jQuery(window).bind('popstate', function(e) {
	  var initialPop = self.popped && location.href == self.initialURL;
	  self.popped = false;

	  if ( initialPop || !e.originalEvent.state ) { self.init(); return; }

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
	  } else {
	    self.init();
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

      if (this.options.searchResultSetTemp !== null && typeof this.options.searchResultSetTemp === 'object') {
        jQuery(this.options.viewTypeContainerSelector).on("click", '[unbxdviewtype]',changeViewType);
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

      if(Object.keys(this.params.ranges[field]).length == 0)
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

    ,setViewType: function(viewType) {
      this.params.extra.view = viewType;
      return this;
    }
    ,getViewType: function() {
      return this.params.extra.view;
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
    ,isUsingPagination: function(){
      return !this.options.isAutoScroll && this.options.isPagination;
    }
    ,getHostNPath: function(){
      return "//search.unbxdapi.com/"+ this.options.APIKey + "/" + this.options.siteName + "/"  + (this.options.type == "browse" ? "browse" : "search" )
    }
    ,getUrlSubstring: function(){
      return window.location.search.substring(1) || window.location.hash.substring(1);
    }
    ,url : function(){
      var host_path = this.getHostNPath();

      var url ="";
      var nonhistoryPath = "";
      // To Retain the fields which are are required from the params of the base URL
      var cur_url = this.getUrlSubstring();
      var urlParams = this.getQueryParams(cur_url);
      var baseParams = {};
      if( typeof(this.options.baseParams) == "object" && this.options.baseParams.length > 0 ){
        for( i in urlParams ){
          if((urlParams.hasOwnProperty(i)) && !(i in this.params)){
            for( param in this.options.baseParams ){
              if(i == this.options.baseParams[param]){
                baseParams[i] = urlParams[i]
              }
            }
          }
        }
      }

      if(this.options.type == "search" && this.params['query'] != undefined){
	url += '&'+ this.options.searchQueryParam +'='+ encodeURIComponent(this.params.query);
      }else if(this.options.type == "browse" && this.params['categoryId'] != undefined){
	url += '&category-id=' + encodeURIComponent(this.params.categoryId);
      }

      for(var x in this.params.filters){
	if(this.params.filters.hasOwnProperty(x)){
	  var a = [];
	  var b = [];
	  for(var y in this.params.filters[x]){
	    if(this.defaultParams.hasOwnProperty('filters')
	       && this.defaultParams.filters.hasOwnProperty(x)
	       && this.defaultParams.filters[x].hasOwnProperty(y)
	       && this.params.filters[x].hasOwnProperty(y)){
	      b.push((x+':\"'+ encodeURIComponent(y.replace(/\"/g, "\\\"")) +'\"').replace(/\"{2,}/g, '"'));
	    } else if(this.params.filters[x].hasOwnProperty(y)){
	      a.push((x+':\"'+ encodeURIComponent(y.replace(/\"/g, "\\\"")) +'\"').replace(/\"{2,}/g, '"'));
	    }
	  }

	  if(a.length > 0)
	    url += '&filter='+a.join(' OR ') + b.join(' OR ');
	  else if(b.length > 0)
	    nonhistoryPath += '&filter='+b.join(' OR ');
	}
      }

      for(var x in this.params.ranges){
	var a = [];
	var b = [];
	for(var y in this.params.ranges[x]){
	  if(this.defaultParams.hasOwnProperty('ranges')
	     && this.defaultParams.ranges.hasOwnProperty(x)
	     && this.defaultParams.ranges[x].hasOwnProperty(y)
	     && this.params.ranges[x].hasOwnProperty(y)){
	    b.push(x + ':[' + this.params.ranges[x][y].lb + " TO " + this.params.ranges[x][y].ub + ']');
	  }else if(this.params.ranges[x].hasOwnProperty(y)){
	    a.push(x + ':[' + this.params.ranges[x][y].lb + " TO " + this.params.ranges[x][y].ub + ']');
	  }
	}

	if(a.length > 0)
	  url += '&filter='+a.join(' OR ') + b.join(' OR ');
	else if(b.length > 0)
	  nonhistoryPath += '&filter='+b.join(' OR ');
      }
      
      var a = [];
      var b = [];
      for(var field in this.params.sort){
	if(this.defaultParams.hasOwnProperty('sort')
	   && this.defaultParams.sort.hasOwnProperty(field)
	   && this.params.sort.hasOwnProperty(field)){
	  var dir = this.params.sort[field] || 'desc';
	  b.push(field + " " + dir);
	} else if (this.params.sort.hasOwnProperty(field)) {
	  var dir = this.params.sort[field] || 'desc';
	  a.push(field + " " + dir);
	}
      }

      if(a.length)
	url += '&sort='+a.join(',');

      if(b.length)
	nonhistoryPath += '&sort='+b.join(',');


      for(var key in this.params.extra){
	if (this.params.extra.hasOwnProperty(key) && key != 'page') {
	  var value = this.params.extra[key];
	  if(this.getClass(value) == "Array"){
	    value = value.getUnique();
	    for(var i = 0;i < value.length; i++){
	      url += '&' + key + '=' + encodeURIComponent(value[i]);
	    }
	  } else if(key === 'wt' || key === 'format') {
	    nonhistoryPath += '&' + key + '=' + encodeURIComponent(value);
	  } else if((this.isUsingPagination() && key === 'rows') || key === "view"){
	    url += '&' + key + '=' + encodeURIComponent(value);
	  } else if(this.defaultParams.hasOwnProperty('extra') && this.defaultParams.extra.hasOwnProperty(key)){
	    nonhistoryPath += '&' + key + '=' + encodeURIComponent(value);
	  } else
	    url += '&' + key + '=' + encodeURIComponent(value);
	}
      }

      if(this.isUsingPagination())
	url += '&start=' + (this.params.extra.page <= 1 ? 0  : (this.params.extra.page - 1) * this.params.extra.rows);
      else
	nonhistoryPath += '&start=' + (this.params.extra.page <= 1 ? 0  : (this.params.extra.page - 1) * this.params.extra.rows);

      nonhistoryPath += this.options.getFacetStats.length > 0 ? "&stats=" + this.options.getFacetStats : "";

      if(this.options.fields.length){
	nonhistoryPath += '&fields=' + this.options.fields.join(',');
      }

      if(this.options.facetMultiSelect)
	nonhistoryPath += '&facet.multiselect=true';
      
      nonhistoryPath += '&indent=off';

      return {
	url : host_path + "?" + url + nonhistoryPath
	,query : url
	,host : host_path
	,baseParams : baseParams
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
      ,urlobj = self.url()
      ,requestHeaders = this.serializeRequestHeaders(jQuery.extend({}
        ,this.getDefaultRequestHeaders(), this.options.requestHeaders));

      if(doPush){
	var finalquery = this.options.noEncoding ? urlobj.query : this.encode( urlobj.query );
	if(this.isHistory){
	  if( self.options.retainbaseParam == true ){
	    var finalBaseParams = '';
	    for( i in urlobj.baseParams){
	      if(urlobj.baseParams.hasOwnProperty(i)){
	        finalBaseParams += "&" + i + "=" + urlobj.baseParams[i];
	      }
	    }
	    finalquery += finalquery + this.options.noEncoding ? finalBaseParams : this.encode(finalBaseParams);
	  }
	  history.pushState(this.params,null,location.protocol + "//" + location.host + location.pathname + "?" + finalquery);
	}else{
	  window.location.hash = finalquery;
	  this.currentHash = finalquery;
	}
      }
      if(requestHeaders){
        urlobj.url += '&' + requestHeaders
      }
      this.ajaxCall = jQuery.ajax({
	url: urlobj.url.replace(this.options.searchQueryParam+"=", "q=")
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
      if(this.options.deferInitRender.indexOf('search') === -1)
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
          format: "json"
          ,page: 1
          ,rows: 12
	}
      };

      if( this.options.viewTypes && this.options.viewTypes.length > 0)
	this.params.extra.view = this.options.viewTypes[0];

      if(typeof this.options.customReset == "function")
	this.options.customReset.call(this);

      if(typeof this.options.setDefaultFilters == "function")
	this.setDefaultParams(this.params);

      return this;
    }
    ,setDefaultParams: function(params){
      var newparams, diff;
      var oldparams = JSON.stringify(params);
      this.options.setDefaultFilters.call(this);
      newparams = JSON.stringify(this.params);

      if(Object.keys(this.defaultParams).length === 0)
	this.defaultParams = JSON.parse(newparams);
    }
    ,_processURL: function(url){
      var obj = typeof url == "string" ? this.getQueryParams(url) : url
      ,params = {
	query : ''
        ,filters : {}
	,sort : {}
	,ranges : {}
	,extra : {
          format : "json"
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
	      arr[1] = arr[1].replace(/(^")|("$)/g, '').replace(/\"{2,}/g, '"').replace(/\\\"/g, '"').replace(/(^\[)|(\]$)/g, '');

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
      else
	params.extra.rows = this.options.pageSize;

      //lets get query
      if(this.options.searchQueryParam in obj)
	params.query = obj[this.options.searchQueryParam];

      //lets get category-id
      if("category-id" in obj)
	params.categoryId = obj["category-id"];

      //lets get boost
      if("boost" in obj)
	params.extra.boost = obj.boost;

      //lets get pageNo
      if("start" in obj)
	params.extra.page = (parseInt(obj.start) / parseInt(params.extra.rows)) + 1;

      if("view" in obj)
	params.extra.view = obj['view'];
      else if(this.options.viewTypes && this.options.viewTypes.length > 0)
	params.extra.view = this.options.viewTypes[0];

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

      if(obj.hasOwnProperty('redirect')) {
	window.location = obj['redirect']['value'];
	return false;
      }

      if (!obj.hasOwnProperty('banner')){
	this.options.bannerSelector.length
	  && jQuery(this.options.bannerSelector).empty();
      }else{
	this.paintBanners(obj);
      }

      if(obj.hasOwnProperty('didYouMean')){
	if(obj.response.numberOfProducts == 0 ) { //> this.options.pageSize){
	  if(this.params.extra.page > 1)
	    this.params.extra.page = this.params.extra.page - 1;

	  this.params.query = obj.didYouMean[0].suggestion;
	  
	  if(!this.compiledSpellCheckTemp)
	    this.compiledSpellCheckTemp = Handlebars.compile(this.options.spellCheckTemp);
	  
	  jQuery(this.options.spellCheck).html(this.compiledSpellCheckTemp({suggestion : obj.didYouMean[0].suggestion  , numberOfProducts : obj.response.numberOfProducts })).show();
	  
	  facetsAlso ? this.callResults(this.paintAfterSpellCheck) : this.callResults(this.paintOnlyResultSet) ;

	}else{
	  
	  this.params.query = obj.searchMetaData.queryParams.q;   //obj.didYouMean[0].suggestion;
	  
	  if(!this.compiledSpellCheckTemp)
	    this.compiledSpellCheckTemp = Handlebars.compile(this.options.spellCheckTemp);

	  jQuery(this.options.spellCheck).html(this.compiledSpellCheckTemp({suggestion : obj.didYouMean[0].suggestion  , numberOfProducts : obj.response.numberOfProducts })).show();

	  facetsAlso ? this.callResults(this.paintAfterSpellCheck) : this.callResults(this.paintOnlyResultSet) ;
	}
      }else{
	jQuery(this.options.spellCheck).hide();
	if(this.options.deferInitRender.indexOf('search') === -1)
	  jQuery(this.options.searchResultContainer).empty();
	this.paintProductPage(obj);
	facetsAlso && this.paintFacets(obj);
      }
    }
    ,paintOnlyResultSet : function(obj){
      if(this.options.deferInitRender.indexOf('search') === -1)
	jQuery(this.options.searchResultContainer).empty();
      this.paintProductPage(obj);
    }
    ,paintAfterSpellCheck : function(obj){
      if(this.options.deferInitRender.indexOf('search') === -1)
	jQuery(this.options.searchResultContainer).empty();
      this.paintProductPage(obj);
      this.paintFacets(obj);
    }
    ,paintAfterFacetChange : function(obj){
      if(this.options.deferInitRender.indexOf('search') === -1)
	jQuery(this.options.searchResultContainer).empty();
      this.paintProductPage(obj);
      this.paintSelectedFacets();
    }
    ,paintProductPage : function(obj){
      var start = 1;
      if("error" in obj)
	return;

      if(!obj.response.numberOfProducts){
	this.reset();

	this.options.onNoResult.call(this,obj);

	return this;
      }

      if(!this.compiledSearchQueryTemp)
	this.compiledSearchQueryTemp = Handlebars.compile(this.options.searchQueryDisplayTemp);

      this.productStartIdx = (this.isUsingPagination()) ? obj.response.start + 1 : 1;
      this.productEndIdx = (this.getPage() * this.getPageSize() <= obj.response.numberOfProducts) ?
	this.getPage() * this.getPageSize() : obj.response.numberOfProducts;
      this.totalPages = Math.ceil(obj.response.numberOfProducts/this.getPageSize());

      jQuery(this.options.searchQueryDisplay).html(this.compiledSearchQueryTemp({
	query : obj.searchMetaData.queryParams.q
	,numberOfProducts : obj.response.numberOfProducts
	,start: this.productStartIdx
	,end: this.productEndIdx
      })).show();

      this.paintSort(obj);
      this.paintPageSize(obj);
      this.paintPagination(obj);
      obj.response.products = obj.response.products.map(function(product){
	product['unbxdprank'] = obj.response.start + start;
	start += 1;
	return product;
      });

      if(this.getClass(this.options.searchResultSetTemp) == 'Function'){
	this.options.searchResultSetTemp.call(this,obj);
      } else if (this.options.searchResultSetTemp !== null && typeof this.options.searchResultSetTemp === 'object') {
        this.paintViewTypes(obj);
        var currentViewType = this.getViewType();
        if (!this.compiledResultTemp) {
          this.compiledResultTemp = {};
          this.options.viewTypes.forEach(function(val) {
            this.compiledResultTemp[val] = Handlebars.compile(this.options.searchResultSetTemp[val]);
          }.bind(this));
        }
        if (this.options.deferInitRender.indexOf('search') === -1 || !this.isUsingPagination()) {
          jQuery(this.options.searchResultContainer).append(this.compiledResultTemp[currentViewType](obj.response));
        }
      }else{
	if(!this.compiledResultTemp)
	  this.compiledResultTemp = Handlebars.compile(this.options.searchResultSetTemp);

	if(this.options.deferInitRender.indexOf('search') === -1 || !this.isUsingPagination()){
	  jQuery(this.options.searchResultContainer).append(this.compiledResultTemp(obj.response));
	}
      }

      if(!this.currentNumberOfProducts && typeof this.options.onIntialResultLoad == "function") {
	this.options.onIntialResultLoad.call(this, obj);
      }

      if(this.currentNumberOfProducts && typeof this.options.onPageLoad == "function") {
	this.options.onPageLoad.call(this, obj);
      }

      this.totalNumberOfProducts = obj.response.numberOfProducts;

      this.currentNumberOfProducts = obj.response.start + obj.response.products.length;

      if(typeof this.options.setPagination == "function"){
	this.options.setPagination.call(this,this.totalNumberOfProducts,this.getPageSize(),this.getPage());
      }

      if(this.options.isClickNScroll)
	jQuery(this.options.clickNScrollElementSelector)[(this.currentNumberOfProducts < this.totalNumberOfProducts) ? 'show' : 'hide']();

    }
    ,paintSort: function(obj) {
      if("error" in obj)
	return;
      if(this.options.sortContainerSelector.length <= 0)
	return;

      if(!this.compiledSortContainerTemp)
	this.compiledSortContainerTemp = Handlebars.compile(this.options.sortContainerTemp);

      var sortOptions = this.options.sortOptions.map(function(opt){
	opt['selected'] = (opt.hasOwnProperty('field') && opt.field in this.params.sort && this.params.sort[opt.field] === opt.order) ?
	  true : (!opt.hasOwnProperty('field') && Object.keys(this.params.sort).length === 0) ? true: false;
	return opt;
      }.bind(this));

      jQuery(this.options.sortContainerSelector).html(this.compiledSortContainerTemp({
	options: sortOptions
      }));
    }
    ,paintPageSize: function(obj) {
      if("error" in obj)
	return;
      if(this.options.pageSizeContainerSelector.length <= 0)
	return;
      if(!this.isUsingPagination())
	return;

      if(!this.compiledPageSizeContainerTemp)
	this.compiledPageSizeContainerTemp = Handlebars.compile(this.options.pageSizeContainerTemp);

      var pageSizeOptions = this.options.pageSizeOptions.map(function(opt){
	opt['selected'] = (this.getPageSize() == opt.value) ? true : false;
	return opt;
      }.bind(this));

      jQuery(this.options.pageSizeContainerSelector).html(this.compiledPageSizeContainerTemp({
	options: pageSizeOptions
      }));
    }

    ,paintViewTypes: function(obj) {
      if ("error" in obj || this.options.viewTypeContainerSelector.length <= 0) {
        return;
      }
      if (!this.compiledViewTypesContainerTemp) {
        this.compiledViewTypesContainerTemp = Handlebars.compile(this.options.viewTypeContainerTemp);
      }
      var viewTypeOptions = this.options.viewTypes.map(function(opt) {

        var values = {};
        values["value"] = opt;
        values["selected"] = this.getViewType() == opt ? true : false;
        return values;

      }.bind(this));
      jQuery(this.options.viewTypeContainerSelector).html(this.compiledViewTypesContainerTemp({
        options: viewTypeOptions
      }));
      return this.getViewType();
    }

    ,paintPagination: function(obj) {
      if("error" in obj)
	return;
      if(this.options.paginationContainerSelector.length <= 0)
	return;
      if(!this.isUsingPagination())
	return;

      if(!this.compiledPaginationTemp)
	this.compiledPaginationTemp = Handlebars.compile(this.options.paginationTemp);

      var seq = [{
	page: this.getPage() - 2,
	current: false
      },{
	page: this.getPage() - 1,
	current: false
      },{
	page: this.getPage(),
	current: true
      },{
	page: this.getPage() + 1,
	current: false
      },{
	page: this.getPage() + 2,
	current: false
      }];

      var pagesToShow = seq.filter(function(obj){
	return obj.page > 0 && obj.page <= this.totalPages;
      }.bind(this))

      
      
      jQuery(this.options.paginationContainerSelector).html(this.compiledPaginationTemp({
	hasFirst: this.getPage() > 1 ? true : false,
	hasPrev: this.getPage() > 1 ? true : false,
	pages: pagesToShow,
	totalPages: this.totalPages,
	hasNext: this.getPage() < this.totalPages ? true : false,
	hasLast: this.getPage() < this.totalPages ? true : false
      }));
    }
    ,paintBanners : function(obj){
      if("error" in obj)
	return;
      if(this.options.bannerCount <= 0)
	return;
      if(this.options.bannerSelector.length === 0 )
	return;
      var banner = obj.banner;
      var bannersToDraw = [];

      if(!this.compiledBannerTemp)
	this.compiledBannerTemp = Handlebars.compile(this.options.bannerTemp);

      bannersToDraw = banner.banners.slice(0, this.options.bannerCount)
	.reduce(function(prev, curr){
	  if(curr.hasOwnProperty('bannerHtml') && curr['bannerHtml']) {
	    return prev.concat(curr.bannerHtml);
	  } else {
	    return prev.concat(this.compiledBannerTemp(
	      {
		landingUrl: curr.landingUrl,
		imageUrl: curr.imageUrl
	      }
	    ));
	  }
	}.bind(this), []);
      
      jQuery(this.options.bannerSelector).html(bannersToDraw.join(''));
      
    }
    ,paintFacets: function(obj){
      if("error" in obj)
	return;

      if(!obj.response.numberOfProducts)
	return this;

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

      var positionExists = false;
      for(var x in facets) {
        if("position" in facets[x]) {
          positionExists = true;
        }
        break;
      }
      var sortable = [];
      for(var facet in facets) {
        sortable.push(positionExists ? ([facet, facets[facet]["position"]]) : [facet]);
      }

      if(positionExists) {
        sortable.sort(function(a, b) {return a[1] - b[1]});
      }
      for(var newI = 0; newI < sortable.length; newI++) {

        var x = sortable[newI][0];
	// for(var x in facets) {
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

      if (this.options.deferInitRender.indexOf('search') > -1){
	this.options.deferInitRender = [];
      }
      
      if (typeof this.options.onFacetLoad == "function") {
	this.options.onFacetLoad.call(this, obj);
      }

      if(this.options.getFacetStats.length &&
	 typeof this.options.processFacetStats == "function" &&
	 "stats" in obj && obj.stats[this.options.getFacetStats] != null){
	
	obj.stats[this.options.getFacetStats].values = {
	  min: obj.stats[this.options.getFacetStats].min,
	  max: obj.stats[this.options.getFacetStats].max
	};
	if(this.options.getFacetStats in this.params.ranges){
	  for (var x in this.params.ranges[this.options.getFacetStats]){
	    obj.stats[this.options.getFacetStats].values = {
	      min: this.params.ranges[this.options.getFacetStats][x].lb != "*" ?
		this.params.ranges[this.options.getFacetStats][x].lb :
		obj.stats[this.options.getFacetStats].min
	      ,max: this.params.ranges[this.options.getFacetStats][x].ub != "*" ?
		this.params.ranges[this.options.getFacetStats][x].ub :
		obj.stats[this.options.getFacetStats].max
	    };
	  }
	  
	}

	this.options.processFacetStats.call(this,obj.stats);
      }
    }
    ,paintSelectedFacets : function(){
      var selFacetKeysLength = Math.max(Object.keys(this.params.filters).length,
					Object.keys(this.params.ranges).length);
      var selectedFacets = {};
      
      if(selFacetKeysLength){
	selectedFacets.filters = this.params.filters;
	selectedFacets.ranges = {};

	for (var x in this.params.ranges){
	  if(!selectedFacets.ranges.hasOwnProperty(x))
	    selectedFacets.ranges[x] = {};
	  
	  for (var y in this.params.ranges[x]){
	    selectedFacets.ranges[x][y] = x;
	  }
	}

	if(this.options.selectedFacetTemp  && this.options.selectedFacetContainerSelector){
	  if(!this.compiledSelectedFacetTemp)
	    this.compiledSelectedFacetTemp = Handlebars.compile(this.options.selectedFacetTemp);

	  jQuery(this.options.selectedFacetContainerSelector).html(this.compiledSelectedFacetTemp(selectedFacets));
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
      var e, //replace + character before decoding the URL
	  d = function (s) { return decodeURIComponent(s.replace(/\+/g, " ")).trim(); },
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

	if( v.length == 0 )
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
    ,log : function(str){
      if(this.readCookie("debug") === '1'){
        console.log("Unbxd : " + str);
      }
    }
    ,decodeAndParse : function(s) {
      if (s.indexOf('"') === 0) {
        // This is a quoted cookie as according to RFC2068, unescape...
        s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      }

      return this.decodeCookie(s);
    }
    ,decodeCookie : function(s) {
      var pluses = /\+/g;
      return decodeURIComponent(s.replace(pluses, ' '));
    }
    ,cookie : function (key) {
      // Read
      var cookies = document.cookie.split('; ');
      var result;
      for (var i = 0, l = cookies.length; i < l; i++) {
        var parts = cookies[i].split('=');
        var name = this.decodeCookie(parts.shift());
        var cookie = parts.join('=');

        if (key && key === name) {
          try{
            result = this.decodeAndParse(cookie);
            break;
          }catch(e){
            this.log(e);
          }
        }
      }

      return result;
    }
    ,readCookie : function(name){
      try{
        return this.cookie('unbxd.' + name);
      }catch(e){
        this.log(e);
      }

      return undefined;
    }
    ,getDeviceInfo : function(){
      var smallDeviceMaxWidth = 768,
      mediumDeviceMaxWidth = 992;
      if(window.outerWidth < smallDeviceMaxWidth){
        return "Mobile";
      } else if(window.outerWidth < mediumDeviceMaxWidth){
        return "Tablet";
      } else {
        return "Desktop";
      }
    }
    ,getUserType : function(){
      return this.readCookie('visit') === "repeat" ? "repeat" : "new";
    }
    ,getUserId : function(){
      return this.readCookie('userId');
    }
    ,getDefaultRequestHeaders : function(){
      var self = this,
      userId = this.getUserId(),
      defaultRequestHeaders = {
        "device-type": self.getDeviceInfo()
        ,"unbxd-url": document.URL
        ,"unbxd-referrer": document.referrer
        ,"user-type": self.getUserType()
        ,"api-key": self.options.APIKey
      };
      if(userId){
        defaultRequestHeaders["uid"] = userId;
      }
      return defaultRequestHeaders;
    }
    ,serializeRequestHeaders : function(headers){
      if(jQuery.param){
        return jQuery.param(headers)
      } else {
        var str = [];
        for(var header in headers)
          if (headers.hasOwnProperty(header)) {
            str.push(encodeURIComponent(header) + "=" + encodeURIComponent(headers[header]));
          }
        return str.join("&");
      }
    }
  });
};

if(!window.jQuery || !window.Handlebars) 
  throw "Please include jQuery & Handlebars libraries before loading unbxdSearch.js";

var arr = jQuery.fn.jquery.split('.');
if( arr[0] < 1 || (arr[0] == 1 && arr[1] < 7) ) 
  throw "jQuery version needs to be greater than 1.7 to use unbxdSearch.js. You can pass custom jQuery & Handlebars by calling unbxdSeachInit(jQuery, Handlebars)";


unbxdSearchInit(jQuery, Handlebars);
