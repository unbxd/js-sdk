Unbxd JavaScript Search library
===============================
[![Build Status](https://travis-ci.org/unbxd/js-sdk.svg?branch=master)](https://travis-ci.org/unbxd/js-sdk.svg?branch=master)

unbxdSearch.js library can be used to integrated UNBXD search or browse on client side. It supports History API, so users can share the URI. 

Note : _*This library makes use of jQuery selectors and Handlebars templates.*_

_*Please find an example of implementation in demo folder.*_

##Usage
Just include [unbxdSearch.js](//d21gpk1vhmjuf5.cloudfront.net/unbxdSearch.js) in HTML and include the configuration.

##configuration
Consider a normal search page with basic layout as shown in the figure below and respective configuration below the image.

![Basic search layout](https://raw.githubusercontent.com/unbxd/js-sdk/master/images/search_layout.png "Basic search layout")

```javascript
	window.searchobj = new Unbxd.setSearch({
		siteName : 'demo-u1393483043451'
		,APIKey : 'ae30782589df23780a9d98502388555f'
		,type : 'search'
		,getCategoryId : ''
		,inputSelector : '#search_input'
		,searchButtonSelector : '#search_button'
		,spellCheck : '#did_you_mean'
		,spellCheckTemp : 'Did you mean : {{suggestion}} ?'
		,searchQueryDisplay : '#search_title'
		,searchQueryDisplayTemp : 'Showing results for {{query}} - {{start}}-{{end}} of {{numberOfProducts}} Results'
		,pageSize : 12
		,searchResultSetTemp : ['{{#products}}<li><a href="product.html?pid={{uniqueId}}" id="pdt-{{uniqueId}}" class="result-item" unbxdParam_sku="{{uniqueId}}" unbxdParam_pRank="{{unbxdprank}}" unbxdAttr="product">'
				,'<div class="result-image-container">'
					,'<span class="result-image-horizontal-holder">'
						,'<img src="{{{image_url}}}" alt="{{{title}}}">'
					,'</span>'
				,'</div>'
				,'<div class="result-brand">{{{brand}}}</div>'
				,'<div class="result-title">{{{title}}}</div>'
				,'<div class="result-price">'
					,'${{price}}'
				,'</div>'
			,'</a></li>{{/products}}'].join('')
		,searchResultContainer : '#results_container'
		,isClickNScroll: false
		,clickNScrollSelector : ''
		,isAutoScroll : true
		,facetTemp : ['{{#facets}}<div class="facet-block">'
				,'<h3>{{name}}</h3>'
				,'<div class="facet-values">'
					,'<ul>'
						,'{{#selected}}'
						,'<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}">'
							,'<label for="{{../facet_name}}_{{value}}">'
								,'<input type="checkbox" checked class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" id="{{../facet_name}}_{{value}}"> {{prepareFacetValue value}} ({{count}})'
							,'</label>'
						,'</li>'
						,'{{/selected}}'
						,'{{#unselected}}'
						,'<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}">'
							,'<label for="{{../facet_name}}_{{value}}">'
								,'<input type="checkbox" class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" id="{{../facet_name}}_{{value}}"> {{prepareFacetValue value}} ({{count}})'
							,'</label>'
						,'</li>'
						,'{{/unselected}}'
					,'</ul>'
				,'</div>'
			,'</div>{{/facets}}'
			,'{{#rangefacets}}<div class="facet-block"'
			,'<h3>{{name}}</h3>'
				,'<div class="facet-values">'
					,'<ul>'
						,'{{#selected}}'
						,'<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}">'
							,'<label for="{{../facet_name}}_{{value}}">'
								,'<input type="checkbox" checked class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" id="{{../facet_name}}_{{value}}"> {{prepareFacetValue begin}} - {{prepareFacetValue end}} ({{count}})'
							,'</label>'
						,'</li>'
						,'{{/selected}}'
						,'{{#unselected}}'
						,'<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}">'
							,'<label for="{{../facet_name}}_{{value}}">'
								,'<input type="checkbox" class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" id="{{../facet_name}}_{{value}}"> {{prepareFacetValue begin}} - {{prepareFacetValue end}} ({{count}})'
							,'</label>'
						,'</li>'
						,'{{/unselected}}'
					,'</ul>'
				,'</div>'
			,'</div>{{/rangefacets}}'].join('')
		,facetContainerSelector : "#facets_container"
		,facetCheckBoxSelector : "input[type='checkbox']"
		,facetElementSelector : "label"
		,facetOnSelect : function(el){
			//jQuery(el).addClass('selected');
		}
		,facetOnDeselect : function(el){
		    //jQuery(el).removeClass('selected');
		}
		,facetMultiSelect : true
		,selectedFacetTemp : ['{{#each filters}}'
			,'{{#each this}}'
				,'<div class="selected-facet clearfix">'
					,'<div class="selected-facet-name lt">{{{prepareFacetValue @key}}}</div>'
					,'<div class="selected-facet-delete rt" unbxdParam_facetName="{{this}}" unbxdParam_facetValue="{{@key}}">&times;</div>'
				,'</div>'
			,'{{/each}}'
		,'{{/each}}'
		'{{#each ranges}}'
			,'{{#each this}}'
				,'<div class="selected-facet clearfix">'
					,'<div class="selected-facet-name lt">{{{prepareFacetValue @key}}}</div>'
					,'<div class="selected-facet-delete rt" unbxdParam_facetName="{{this}}" unbxdParam_facetValue="{{@key}}">&times;</div>'
				,'</div>'
			,'{{/each}}'
		,'{{/each}}'].join('')
		,selectedFacetContainerSelector : "#selected_facets"
		,clearSelectedFacetsSelector : "#clear_all_selected_facets"
		,removeSelectedFacetSelector : ".selected-facet-delete"
		,selectedFacetHolderSelector : ""
		,loaderSelector : ""//".result-loader"
		,onFacetLoad : function(obj){}
		,sanitizeQueryString : function(q){ return q;}
		,getFacetStats : ""
		,processFacetStats : function(obj){}
		,setDefaultFilters : function(){}
		,onIntialResultLoad : function(obj){}
		,onPageLoad : function(obj){}
		,onNoResult : function(obj){}
		,bannerSelector: ".banner"
		,bannerTemp: "<a href='{{landingUrl}}'><img src='{{imageUrl}}'/></a>"
		,fields : ['image_url','title','brand','price','uniqueId']
		,searchQueryParam:"q"
		,retainbaseParam: false
		,baseParams:[]
    });
```

- **siteName** : This value can be found in UNBXD dashboard. It is unique for every search site created in the dashboard.
- **APIKey** : This is a unique for every user account. It can also be found in dashboard.
- **type** : It has to be either _*search*_ or _*browse*_.
- **getCategoryId** : This option has to be a function which return the category_id in case of *browse*. Please ignore incase of *search*.
- **inputSelector** : The jQuery selector for search input. Please make sure that the form of this input has no action and method is GET. Please ignore incase of *browse*.
- **searchButtonSelector** : The jQuery selector for search submit button. Please ignore incase of *browse*.
- **spellCheck** : The jQuery selector for DOM element to display spell suggestion. Please ignore incase of *browse*.
- **spellCheckTemp** : Handlebars template for generating the spell suggestion template.
	```javascript
		...
		,spellCheck : '#did_you_mean'
		,spellCheckTemp : 'Did you mean : {{suggestion}} ?'
		...

		//JSON used for this template
		{
			suggestion : "something else"
		}
	```
- **searchQueryDisplay** : The jQuery selector of DOM element to display the query (which use has searched for) and total number of results from search. Please ignore incase of *browse*.
- **searchQueryDisplayTemp** : Handlebars template for displaying the search query and total number of results. Please ignore incase of *browse*.
	```javascript
		...
		,searchQueryDisplay : '#search_title'
		,searchQueryDisplayTemp : 'Search results for {{query}} - Showing {{start}}-{{end}} of {{numberOfProducts}} Results'
		...

		//JSON used for this template
		{
			query : "something"
			,numberOfProducts : 1234
			,start: 1
			,end: 24
		}
	```
- **pageSize** : The total number of results to be displayed in a single call. The value should be greater than ZERO. *It is suggested that the value to be multiple of number of columns (ex. if 3 columns then 15 or 18 or 21).*
- **searchResultSetTemp** : Handlebars template for the repetitive result block to display the individual product. This can also be function which take a single argument (a JSON block as shown below).
	
	![Basic search layout](https://raw.githubusercontent.com/unbxd/js-sdk/master/images/result_block.png "Basic search layout")

	```javascript
		//handlebars helper, to get first element from array
		Handlebars.registerHelper('getFirst', function(arr){
			return arr.length > 0 ? arr[0] : "http://www.cdn.com/dummy.png";
		});

		//configuration
		...
		,searchResultSetTemp : ['{{#products}}<li><a href="product.html?pid={{uniqueId}}" id="pdt-{{uniqueId}}" class="result-item" unbxdParam_sku="{{uniqueId}}" unbxdParam_pRank="{{unbxdprank}}" unbxdAttr="product">'
				,'<div class="result-image-container">'
					,'<span class="result-image-horizontal-holder">'
						,'<img src="{{{image_url}}}" alt="{{{title}}}">'
					,'</span>'
				,'</div>'
				,'<div class="result-brand">{{{brand}}}</div>'
				,'<div class="result-title">{{{title}}}</div>'
				,'<div class="result-price">'
					,'${{price}}'
				,'</div>'
			,'</a></li>{{/products}}'].join('')
			,searchResultContainer : '#results_container'
		...

		//JSON used for this template
		{
			products : [
				{
					uniqueId : "SKU_1"
					,imageUrl : "http://www.cdn.com/image1.png"
					,title : "First product title"
					,price : 2345
				}
				,{
					uniqueId : "SKU_2"
					,imageUrl : "http://www.cdn.com/image2.png"
					,title : "Second product title"
					,price : 1234
				}
			]
		}
	```
It can also contain multiple templates to include different view types(grid view/list view) like below:

	```
	,searchResultSetTemp:
    {
        "grid":
            ['{{#products}}<li class="grid_view"><a href="product.html?pid={{uniqueId}}" id="pdt-{{uniqueId}}" class="result-item" unbxdParam_sku="{{uniqueId}}" unbxdParam_pRank="{{unbxdprank}}" unbxdAttr="product">'
				,'<div class="result-image-container">'
					,'<span class="result-image-horizontal-holder">'
						,'<img src="{{{image_url}}}" alt="{{{title}}}">'
					,'</span>'
				,'</div>'
				,'<div class="result-brand">{{{brand}}}</div>'
				,'<div class="result-title">{{{title}}}</div>'
				,'<div class="result-price">'
					,'${{price}}'
				,'</div>'
			,'</a></li>{{/products}}'].join(''),
        "list":
            ['{{#products}}<li class="list_view"><a href="product.html?pid={{uniqueId}}" id="pdt-{{uniqueId}}" class="result-item" unbxdParam_sku="{{uniqueId}}" unbxdParam_pRank="{{unbxdprank}}" unbxdAttr="product">'
				,'<div class="result-image-container">'
					,'<span class="result-image-horizontal-holder">'
						,'<img src="{{{image_url}}}" alt="{{{title}}}">'
					,'</span>'
				,'</div>'
				,'<div class="result-brand">{{{brand}}}</div>'
				,'<div class="result-title">{{{title}}}</div>'
				,'<div class="result-price">'
					,'${{price}}'
				,'</div>'
			,'</a></li>{{/products}}'].join('')
    }
	```

In this case, we need to also mention the different view types under 'viewTypes':

```
,viewTypes: ['grid', 'list']
```

- **viewTypeContainerSelector** : The selector for the container of view types

```
,viewTypeContainerSelector: '.view_type_select'
```

- **viewTypeContainerTemp** : The template which paints the view type to the view type container selector

```
,viewTypeContainerTemp:
    '{{#options}}'
    +'<li class="nxt-{{#if selected}}current{{/if}}">'
        +'<a title="{{value}} View" class="nxt-{{value}}view-button" {{#unless selected}}unbxdviewtype="{{value}}"{{/unless}}>'
            +'<span class="icon-{{value}}view">'
            +'</span>'
        +'</a>'
    +'</li>'
    +'{{/options}}'
```

JSON used for this template:

```
{
	options: [{
		"selected": true,
		"value": "grid"
	},
	{
		"selected": false,
		"value": "list"
	}]
}
```

- **searchResultContainer** : The jQuery selector of DOM element to append the HTML generated from **searchResultSetTemp** (*#results_container* in the first image). 
- **isClickNScroll** : Set it to **true** if you want users to click an element to fetch the next page.
- **clickNScrollSelector** : The jQuery selector of the DOM element that can be clicked for displaying the next page.(PS. in this case the new results will be appended to the **searchResultContainer**.)
- **isAutoScroll** : Set this to **true** if you want the new pages to be displayed while user scrolls to the bottom of page.
- **facetTemp** : Handlebars template for the repetitive facet block to display the individual facet. This can also be function which take a single argument (a JSON block as shown below).

	![Basic search layout](https://raw.githubusercontent.com/unbxd/js-sdk/master/images/facet_block.png "Basic search layout")

	```javascript
		//configuration
		...
		,facetTemp : ['{{#facets}}<div class="facet-block">'
				,'<h3>{{name}}</h3>'
				,'<div class="facet-values">'
					,'<ul>'
						,'{{#selected}}'
						,'<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}">'
							,'<label for="{{../facet_name}}_{{value}}">'
								,'<input type="checkbox" checked class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" id="{{../facet_name}}_{{value}}"> {{prepareFacetValue value}} ({{count}})'
							,'</label>'
						,'</li>'
						,'{{/selected}}'
						,'{{#unselected}}'
						,'<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}">'
							,'<label for="{{../facet_name}}_{{value}}">'
								,'<input type="checkbox" class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" id="{{../facet_name}}_{{value}}"> {{prepareFacetValue value}} ({{count}})'
							,'</label>'
						,'</li>'
						,'{{/unselected}}'
					,'</ul>'
				,'</div>'
			,'</div>{{/facets}}'
			,'{{#rangefacets}}<div class="facet-block"'
			,'<h3>{{name}}</h3>'
				,'<div class="facet-values">'
					,'<ul>'
						,'{{#selected}}'
						,'<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}">'
							,'<label for="{{../facet_name}}_{{value}}">'
								,'<input type="checkbox" checked class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" id="{{../facet_name}}_{{value}}"> {{prepareFacetValue begin}} - {{prepareFacetValue end}} ({{count}})'
							,'</label>'
						,'</li>'
						,'{{/selected}}'
						,'{{#unselected}}'
						,'<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}">'
							,'<label for="{{../facet_name}}_{{value}}">'
								,'<input type="checkbox" class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" id="{{../facet_name}}_{{value}}"> {{prepareFacetValue begin}} - {{prepareFacetValue end}} ({{count}})'
							,'</label>'
						,'</li>'
						,'{{/unselected}}'
					,'</ul>'
				,'</div>'
			,'</div>{{/rangefacets}}'].join('')
		...

		//JSON used for generation is
		{
			"facets": [//this is an array
				{
					"name": "Category",//to display as title for facet
					"facet_name": "Category_fq",//actual internal facet name
					"type": "facet_fields",
					"selected": [
						{
							"value": "Shirts",
							"count": 114
						},
						{
							"value": "Shoes",
							"count": 29
						}
					],
					"unselected": [
						{
							"value": "Footwear",
							"count": 27
						},
						{
							"value": "Jackets",
							"count": 27
						},
						{
							"value": "Accessories",
							"count": 8
						}
					]
				}
			],
			"rangefacets": [//this is an array
			     {
					"name": "Price", //to display title for range facet
					"facet_name": "Price_fq", //actual internal range facet name
					"type": "facet_ranges",
					"selected": [
						  {
						    "value": "200 TO 300",
						    "begin": "200",
						    "end": "300",
						    "count": 352
						  }
					],
					unselected: [
						  {
						    "value": "0 TO 100",
						    "begin": "0",
						    "end": "100",
						    "count": 44
						  },
						  {
						    "value": "100 TO 200",
						    "begin": "100",
						    "end": "200",
						    "count": 74
						  }
					]
			     }
			 ]
		}
	```
	Note: 
	1. Please dont remove or forget to keep the unbxdParam* attributes to respective fields. These are internally used to handle filters.
	2. If you dont have a checkbox or a custom image in its place, please keep it hidden and wrap it with **label** DOM element.
	3. In handlebars template, inside the loop for *selected* array, dont forget to keep the **checked** attribute for checkbox. You can also add custom classes for **label** or **li** elements here for highlighting them.
- **facetContainerSelector** : The jQuery selector of DOM element to append the HTML generated from **facetTemp** (*#facets_container* in the first image).
- **facetCheckBoxSelector** : jQuery selector for checkbox(*input.filter-checkbox* from facet template).
- **facetElementSelector** : The parent element of checkbox which has to be returned the next config options (_in the given facetTemp, it can be **label** or **li**_).
- **facetOnSelect** : This is function with single argument as DOM element of type given in **facetElementSelector** and executed when a facet is selected.
- **facetOnDeselect** : This is function with single argument as DOM element of type given in **facetElementSelector** and executed when a facet is deselected.
- **facetMultiSelect** : Set this value to **false**, incase if you dont want to enable multiselect on facets. It has a default value **true**.
- **selectedFacetTemp** : Handlebars template for generating HTML to show the currently selected filters. Please check below image and code snippet.

	![Seleted filters block](https://raw.githubusercontent.com/unbxd/js-sdk/master/images/selected_facet_layout.png "Selected filters block")

	```javascript
		//configuration
		...
		,selectedFacetTemp : ['{{#each filters}}'
			,'{{#each this}}'
				,'<div class="selected-facet clearfix">'
					,'<div class="selected-facet-name lt">{{{prepareFacetValue @key}}}</div>'
					,'<div class="selected-facet-delete rt" unbxdParam_facetName="{{this}}" unbxdParam_facetValue="{{@key}}">&times;</div>'
				,'</div>'
			,'{{/each}}'
		,'{{/each}}'
		,'{{#each ranges}}'
			  ,'{{each this}}'
			  	,'<div class="selected-facet clearfix">'
					,'<div class="selected-facet-name lt">{{{prepareFacetValue @key}}}</div>'
					,'<div class="selected-facet-delete rt" unbxdParam_facetName="{{this}}" unbxdParam_facetValue="{{@key}}">&times;</div>'
				,'</div>'
			,'{{/each}}'
		'{{/each}}'].join('')
		...

		//JSON used for above template
		{
			"filters": {
				"Category_fq": {
					//the name of parent property is duplicated for rendering purpose
					"Shirts": "Category_fq",
					"Shoes": "Category_fq"
				}
			},
			"ranges": {
				"Price_fq": {
					"200 TO 300": "Price_fq",
					"300 TO 400": "Price_fq"
				}
			}	
		}
	```
- **selectedFacetContainerSelector** : jQuery selector of DOM element to place the generated HTML from **selectedFacetTemp**. (_Please refer to above image._)
- **clearSelectedFacetsSelector** : jQuery selector of DOM element on click which removes all the selected filters.(_Please refer to above image._)
- **removeSelectedFacetSelector** : jQuery selector of DOM element to remove respective filter.(_This is useful in removing single filter. Example **selected-facet-delete** from above template. Please refer to above image._)
- **selectedFacetHolderSelector** : jQuery selector of DOM element which 
- **loaderSelector** : The jQuery selector of the loading GIF image. This will be shown during the fetching process and hidden after the call.
- **onFacetLoad** : This option takes a function which will be called after rendering the facet block, with the search response as its first argument.
- **sanitizeQueryString** : This option should be a function with single argument as query which modifies and returns a new query against which the search has to be performed.
	
	```javascript
		//configuration
		...
		,sanitizeQueryString : function (query){
			//simple to condition which check if search query has min length of 3 or not
			if(query && query.length > 2){
				return query;
			}else
				return '';
		}
		...
	```
- **getFacetStats** : The field for which you want to get stats for. General example is price or discouts.
- **processFacetStats** : This options is a function which takes single argument (a JSON) of the stats. This can be used to set a price slider.
	```javascript
		//configuration
		...
		,processFacetStats : function(obj){
			//set up the price slider here
			jQuery("#price-slider").slider({
				range: !0
				,animate: !0
				,min: obj.price.min
				,max: obj.price.max
				,values: [obj.price.values.min, obj.price.values.max]
				,create: function() {
					jQuery("#amount").html(obj.price.values.min +' - '+ obj.price.values.max);
				},slide: function(b, c) {
					jQuery("#amount").html(c.values[0] +' - '+ c.values[1]);
				},change: function(b, c) {
					searchobj
					.clearRangeFiltes()
					.addRangeFilter("price",c.values[0],c.values[1])
					.setPage(1)
					.callResults(searchobj.paintOnlyResultSet,true);
				}
			})
		}
		...

		//sample JSON object for stats
		{
			price:
			{
				min : 90 //complete min value in result set
				,max: 400 //complete max value in result set
				//the above 2 values can be used to set the whole range of slider
				,count : 30283
				,sum: 7411762
				,mean:244.7499257008883
				,values:{
					min:100 //selected min value if user has changed the range else complete min value in result set
					,max:300//selected max value if user has changed the range else complete max value in result set
					//the above 2 values are for setting the slider positions
				}
			}
		} 
	```
- **setDefaultFilters** : This option is a function which can be used to set default filters and/or sorts. An example implementation is below.
  	```javascript
		...
		,setDefaultFilters : function(){
			//to make the results by default sorted by quantity
			this.addQueryParam('sort',"quantity desc");
			//to make default filter by category shoes
			this.addFilter('category_fq', 'shoes');
		}
		...
	```
	
- **onIntialResultLoad** : This option takes a function which will be executed after rendering of first result page with the search response as its first argument.
- **onPageLoad** : This option takes a function which will be executed after rendering of new result page from second page with the search response as its first argument.
- **onNoResult** : This option takes a function which will be executed if there are no results available.
- **bannerSelector** : The jQuery selector for the container where the banner needs to be displayed.
- **bannerTemp** : The template to be used when rendering the banner.
- **isPagination** : Set to _true_ when using pagination, also set **isAutoScroll** to _false_ when this is set to _true_
- **paginationContainerSelector** : The jQuery selector for the container where pagination needs to be displayed.
- **paginationTemp** : The template to be used when rendering pagination
  ```javascript
	//configuration
	,paginationTemp: ['{{#if hasFirst}}',
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

	//JSON used for the above template
	{
		hasFirst: false,
		hasPrev: false,
		pages: [{
			page: 1,
			current: false
		},{
			page: 2,
			current: false
		},{
			page: 3,
			current: true
		},{
			page: 4,
			current: false
		},{
			page: 5,
			current: false
		}]
		totalPages: 42,
		hasNext: true,
		hasLast: true
	}
  ```

- **sortContainerSelector** : The jQuery selector for the container where sort template needs to be displayed
- **sortOptions** : An array of objects containing the name, fieldname and order. These options will be used to display the sort options available
- **sortContainerType** : Specifies the type of sort container. The value can be either 'select' or 'click'
- **sortContainerTemp** : The template to be used when rendering the sort options
  ```javascript
	//configuration
	...
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
	,sortContainerType: 'select'
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
	...

	//sample JSON for sort
	{
		options: [{
			name: 'Relevancy',
			selected: true
		},{
			name: 'Price: H-L',
			field: 'price',
			order: 'desc',
			selected: false
		},{
			name: 'Price: L-H',
			field: 'price',
			order: 'asc',
			selected: false
		}]
	}
  ```

- **pageSizeContainerSelector** : The jQuery selector for the container where page size template needs to be displayed
- **pageSizeOptions** : An array of objects containing the name and value. These options will be used to display the page size options available
- **pageSizeContainerType** : Specifies the type of page size container. The value can be either 'select' or 'click'
- **pageSizeContainerTemp** : The template to be used when rendering the page size options
  ```javascript
	//configuration
	...
	,pageSizeOptions: [{
		name: '12',
		value: '12'
	},{
		name: '24',
		value: '24'
	},{
		name: '36',
		value: '36'
	}]
	,pageSizeContainerType: 'select'
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
	].join('')
	...

	//sample JSON for page size
	{
		options: [{
			name: '12',
			value: '12',
			selected: true
		},{
			name: '24',
			value: '24',
			selected: false
		},{
			name: '36',
			value: '36',
			selected: false
		}]
	}
  ```
- **fields** : This is an array of all required fields for generating result template. This is helpful to load the results faster. An example implementation is below
```javascript
	...
	,fields : ['image_url','title','brand','price','uniqueId']
	...
```
- **searchQueryParam** : searh query param name to be shown in browser url, default is "q"    
- **retainbaseParam** : Set this to true, if you want to retain some extra url params from the SRP
- **baseParams** : Array of params which will be retained from SRP. This will come into picture only if retainbaseParam is set to true
- **deferInitRender** : This is an array of library features that need to be disabled on initial load.
```javascript
	...
	,deferInitRender: ['search']
	...
	// The above config means the search results wont be rendered by the SDK on the first page.
	// The other pages though, will be rendered by the SDK.
```

Note: The HTML served by the server to client should have the minimum requred structure. *Check the below image.*

![Basic search layout](https://raw.githubusercontent.com/unbxd/js-sdk/master/images/search_template_basic.png "Basic search layout")

```html
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>UNBXD - Search</title>
	<link rel="stylesheet" type="text/css" href="css/style.css">
	<script type="text/javascript" src="jquery-1.9.1.js"></script>
	<script type="text/javascript" src="handlebars.js"></script>
	<script type="text/javascript" src="unbxdSearch.js"></script>
</head>
<body>
	<div class="header-container clearfix">
		<div class="header row clearfix">
			<div class="header-search">
				<div class="search-input-button-holder clearfix">
					<form method="GET" action="search.html">
						<input type="text" class="search-input lt" id="search_input" value="" unbxdattr="sq" name="q" autocomplete="off"/>
						<button type="submit" class="search-button lt" id="search_button" unbxdattr="sq_bt"></button>
					</form>
				</div>
			</div>
		</div>
	</div>
	<div class="search-container">
		<div class="row clearfix">
			<div class="lt search-facet-column" id="facets_container">
			</div>
			<div class="rt search-result-column">
				<h2 class="result-spell-check" id="did_you_mean">
				</h2>
				<h3 class="result-title-count" id="search_title">
				</h3>
				<div class="result-selected-facets clearfix" id="selected_facets">
				</div>
				<ul class="search-result-list clearfix" id="results_container">
				</ul>
				<div class="result-loader" id="ajax_loader">
				<a href="#"><img src="images/loader.gif">Loading more...</a>
			</div>
			</div>
		</div>
	</div>
	<div class="footer">
		Copyright &copy; 2014 Unbxd
	</div>
	<script type="text/javascript">
	jQuery(function(){
		//search configuration here
	});
	</script>
</body>
</html>
```
