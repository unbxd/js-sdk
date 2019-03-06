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

Unbxd.prepareSearch = function(query, secure){
	var ref = new Unbxd.search(secure);

	ref.ruleSet = 'search';
	ref.query = query;
	return ref;
}

Unbxd.prepareBrowse = function(categoryId, secure){
	var ref = new Unbxd.search(secure);

	ref.ruleSet = 'browse';
	ref.categoryId = categoryId;
	return ref;
}

Unbxd.search = function(secure){
	this.secure = secure || false;

	this.reset = function(){
		this.params = {
			query : {},
			filters : 
		};
	}
	this.reset();

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

	this.params.filters = [];

	this.addFilter = function(field, value){
		
		this.params.filters[field][value] = 1;

		return this;
	}

	this.removeFilter = function(field, value){
		if(value in this.params.filters[field])
			delete this.params.filters[field][value];

		return this;
	}

	this.params.ranges = [];

	this.addRangeFilter = function(field, lb, ub){
		
		this.params.ranges[field] = {lb : lb || '*', ub : ub || '*'};

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
					+ "://search.unbxdapi.com/" + UnbxdAPIKey + "/" + UnbxdSiteName + "/" + this.ruleSet + "?format=json";
		if(this.ruleSet == 'search' && this['query'] != undefined){
			url += '&q=' + encodeURIComponent(this.query);
		}else if(this.ruleSet == 'browse' && this['categoryId'] != undefined){
			url += '&category-id=' + encodeURIComponent(this.categoryId);
		}

		//if(this.params.filters != undefined){
		//	url += '&filter=' + encodeURIComponent(this.params.filters.toString());
		//}

		for(var x in this.params.filters){
			if(this.params.filters.hasOwnProperty(x)){
				var a = [];
				for(var y in this.params.filters[x]){
					a.push(x+':"'+y+'" ');
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

		if(this.params.sort != undefined){
			url += '&sort=' + encodeURIComponent(this.params.url.toString());
		}

		for(var key in this.params.query){
			if (this.params.query.hasOwnProperty(key)) {
				var value = this.params.query[key];
				url += '&' + key + '=' + encodeURIComponent(value);
			}
		}

		return url;
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

Unbxd.widgets = {
	version: 'v1.0',
	region : 'apac',
	siteName : UnbxdSiteName,
	types : {
		recommendationsForYou : 'recommend'
		,recentlyVeiwed: 'recently-viewed'
		,similarProducts : 'more-like-these'
		,alsoViewed : 'also-viewed'
		,alsoBought: 'also-bought'
		,cartRecommendations: 'cart-recommend'
		,homeTop: 'top-sellers'
		,categoryTop: 'category-top-sellers'
		,brandTop: 'brand-top-sellers'
		,pdpTop: 'pdp-top-sellers'
	},
	format: 'JSON',
	getUID: function(){
		if(Unbxd.readCookie != undefined)
			return Unbxd.readCookie('userId');
		return null;
	},
	getRecommendationsForYou: function(cb){
		//http(s)://{region}-recommendations.unbxdapi.com/{version}/{key}/{site-name}/{widget-type}/{uid}/?ip={ip}&format={format}
		Unbxd.widgets.getWidget('recommendationsForYou',cb);
	},
	getRecentlyViewed : function(cb){
		//http(s)://{region}-recommendations.unbxdapi.com/{version}/{key}/{site-name}/{widget-type}/{uid}/?ip={ip}&format={format}
		Unbxd.widgets.getWidget('recentlyVeiwed',cb);
	},
	getMoreLikeThese: function(cb,pid){
		//http(s)://{region}-recommendations.unbxdapi.com/{version}/{site-name}/{widget-type}/{pid}/?uid={userId}&ip={ip}&format={format}
		Unbxd.widgets.getWidget('similarProducts',cb,pid);
	},
	getAlsoViewed: function(cb,pid){
		//http(s)://{region}-recommendations.unbxdapi.com/{version}/{site-name}/{widget-type}/{pid}/?uid={userId}&ip={ip}&format={format}
		Unbxd.widgets.getWidget('alsoViewed',cb,pid);
	},
	getAlsoBought: function(cb,pid){
		//http(s)://{region}-recommendations.unbxdapi.com/{version}/{site-name}/{widget-type}/{pid}/?uid={userId}&ip={ip}&format={format}
		Unbxd.widgets.getWidget('alsoBought',cb,pid);
	},
	// getCartRecommendations: function(cb){
	// 	//http(s)://{region}-recommendations.unbxdapi.com/{version}/{site-name}/{widget-type}/{pids}/?uid={userId}&ip={ip}&format={format}
	// 	Unbxd.widgets.getWidget('cartRecommendations',cb);
	// },
	getTopSellers: function(cb){
		//http(s)://{region}-recommendations.unbxdapi.com/{version}/{site-name}/{widget-type}?ip={ip}&format={format}
		Unbxd.widgets.getWidget('homeTop',cb);
	},
	getCategoryTopSellers: function(cb,cid){
		//http(s)://{region}-recommendations.unbxdapi.com/{version}/{site-name}/{widget-type}/{categoryid}?uid={userId}&ip={ip}&format={format}
		Unbxd.widgets.getWidget('categoryTop',cb, cid);
	},
	getBrandTopSellers: function(cb,bid){
		//http(s)://{region}-recommendations.unbxdapi.com/{version}/{site-name}/{widget-type}/{brandid}?uid={userId}&ip={ip}&format={format}
		Unbxd.widgets.getWidget('brandTop',cb,bid);
	},
	getPDPTopSellers: function(cb,pid){
		//http(s)://{region}-recommendations.unbxdapi.com/{version}/{site-name}/{widget-type}/{pid}?uid={userId}&ip={ip}&format={format}
		Unbxd.widgets.getWidget('pdpTop',cb,pid);
	},
	getWidget: function(type,cb,id){
		var url = Unbxd.widgets.getURI(type,id)
		
		$.ajax({
	        url: url,
	        dataType: "jsonp",
	        jsonp: 'json.wrf',	        
	        success: function(d){
				if(parseInt(d.count) >= 1)
					cb(null, d);
				else
					cb(d);
			}
	    });
	},
	getURI: function(type, arg2){
		var url = 'http://'+ Unbxd.widgets.region +'-recommendations.unbxdapi.com/'+Unbxd.widgets.version+'/';

		//lets append unbxd key if needed
		//if(type == 'recommendationsForYou' || type == 'recentlyVeiwed' || type == 'similarProducts')
		url += UnbxdAPIKey+'/';

		//lets append site name
		url += Unbxd.widgets.siteName+'/';

		//lets add widget type to url
		url += Unbxd.widgets.types[type] + '/';

		//lets append the second argument
		if(type == 'recommendationsForYou' || type == 'recentlyVeiwed' || type == 'cartRecommendations'){
			url += Unbxd.widgets.getUID() +'/';
		}else if(type != 'homeTop'){
			url += arg2+'/';
		}

		//lets attach query parameters
		url += '?';

		if(type != 'recommendationsForYou' && type != 'recentlyVeiwed' && type != 'homeTop')
			url += '&uid='+ encodeURIComponent(Unbxd.widgets.getUID());

		url += '&format='+ Unbxd.widgets.format;
		
		return url;
	}
};