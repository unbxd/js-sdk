/*
Unbxd
	.prepareSearch(query) // Should return an object for search api call.
    	.setFilter(field, value) // Sets a filter
    	.andFilter(field, value) // ANDs a filter
    	.orFilter(field, value)	 // ORs a filter
    	.setRangeFilter(field, value) // Sets a range filter with lower bound(lb) and upper bound(ub) 
    	.andRangeFilter(field, value) // ANDs a range filter with lower bound(lb) and upper bound(ub) 
    	.orRangeFilter(field, value)  // ORs a range filter with lower bound(lb) and upper bound(ub) 
    	.addSort(field, dir) // Adds a sort. dir can be asc/desc. desc is default
    	.setPage(page)
    	.setPageSize(pageSize)
    	.setUserId(userId)
    	.setIP(ip)
    	.addQueryParam(key, value) // Add an arbit query parameter
    	.call() // Should fire the api and return the results.

*/
var Unbxd = window.Unbxd || {};

Unbxd.prepareSearch = function(query){
	var ref = new Unbxd.search();

	ref.ruleSet = 'search';
	ref.query = query;
	return ref;
}

Unbxd.prepareBrowse = function(categoryId){
	var ref = new Unbxd.search();

	ref.ruleSet = 'browse';
	ref.categoryId = categoryId;
	return ref;
}

Unbxd.search = function(secure){
	this.secure = secure || false;

	this.reset = function(){
		this.params = {query : {}};
	}
	this.reset();

	var Filters = function(){
		this.str = '(*:* ';

		this.and = function(field, value){
			this.str += ' AND ';
			this.str += field + ':"' + value + '"';
		}

		this.or = function(field, value){
			this.str += ' OR ';
			this.str += field + ':"' + value + '"';
		}

		this.andRange = function(field, lb, ub){
			lb = lb || "*";
			ub = ub || "*";
			this.str += ' AND ';
			this.str += field + ':[' + lb + " TO " + ub + ']';
		}

		this.orRange = function(field, lb, ub){
			lb = lb || "*";
			ub = ub || "*";
			this.str += ' OR ';
			this.str += field + ':[' + lb + " TO " + ub + ']';
		}

		this.toString = function(){
			return this.str + ")";
		}
	}

	var Sort = function(){
		this.fields = {};
		
		this.add = function(field, dir){
			this.fields[field] = dir || 'desc';
		}

		this.toString = function(){
			var sortStr = '';
			for(var field in this.fields){
				if (this.fields.hasOwnProperty(field)) {
					if(sortStr != '') sortStr += ',';
					
					var dir = this.fields[field] || 'desc';
					sortStr += field + " " + dir;
				}
			}
			return sortStr;
		}
	}

	this.addSort = function(field, dir){
		this.params.sort = this.params.sort || new Sort();
		this.params.sort.add(field, dir);
		return this;
	}

	this.setFilter = function(field, value){
		var filters = this.params['filters'] || new Filters();
		filters.and(field, value);
		return this;
	}

	this.andFilter = function(field, value){
		var filters = this.params['filters'] || new Filters();
		filters.and(field, value);
		return this;
	}

	this.orFilter = function(field, value){
		var filters = this.params['filters'] || new Filters();
		filters.or(field, value);
		return this;
	}

	this.setRangeFilter = function(field, lb, ub){
		var filters = this.params['filters'] || new Filters();
		filters.andRange(field, lb, ub);
		return this;
	}

	this.andRangeFilter = function(field, lb, ub){
		var filters = this.params['filters'] || new Filters();
		filters.andRange(field, lb, ub);
		return this;
	}

	this.orRangeFilter = function(field, lb, ub){
		var filters = this.params['filters'] || new Filters();
		filters.orRange(field, lb, ub);
		return this;
	}

	this.addRangeFilter = function(field, values){
		var filters = this.params['rangeFilters'] || {};
		filters[field] = values;
		this.params.filters = filters;
		return this;
	}

	this.setPage = function(pageNo){
		this.params.query.page = pageNo;
		return this;
	}

	this.setPageSize = function(pageSize){
		this.params.query.pageSize = pageSize;
		return this;
	}

	this.setUserId = function(userId){
		this.params.query.userId = userId;
		return this;
	}

	this.setIP = function(ip){
		this.params.query.ip = ip;
		return this;
	}

	this.addQueryParam = function(key, value){
		this.params.query[key] = value;
		return this;
	}

	this.url = function(){
		var url = (secure ? "https" : "http")
					+ "://" + UnbxdSiteName + ".search.unbxdapi.com/" + UnbxdApiKey
					+ "/" + this.ruleSet + "?format=json";
		if(this.ruleSet == 'search' && this['query'] != undefined){
			url += '&q=' + this.query;
		}else if(this.ruleSet == 'browse' && this['categoryId'] != undefined){
			url += '&category-id=' + this.categoryId;
		}

		if(this.params.filters != undefined){
			url += '&filter=' + this.params.filters.toString();
		}

		if(this.params.sort != undefined){
			url += '&sort=' + this.params.url.toString();
		}

		for(var key in this.params.query){
			if (this.params.query.hasOwnProperty(key)) {
				var value = this.params.query[key];
				url += '&' + key + '=' + value;
			}
		}
	}

	this.call = function(callback){
		var url = this.url();

		$.ajax({
	        url: url,
	        dataType: "jsonp",
	        jsonp: 'json.wrf',	        
	        success: callback
	    });
	}
}