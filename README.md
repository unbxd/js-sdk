Unbxd JavaScript Search library
===============================
unbxdSearch.js library can be used to integrated UNBXD search or browse on client side. It supports History API, so users can share the URI. 

Note : _*This library makes use of jQuery selectors and Handlebars templates.*_

##Usage
Just include [unbxdSearch.js](//d21gpk1vhmjuf5.cloudfront.net/unbxdSearch.js) in HTML and include the configuration.

##configuration
Consider a normal search page with basic layout as shown in the figure below and respective configuration below the image.

![Basic search layout](https://raw.githubusercontent.com/unbxd/js-sdk/master/images/search_layout.png "Basic search layout")

```javascript
	Handlebars.registerHelper('getIndex', function(index){
		var total = $('#results_container li').length;
		return total + index + 1;
	});
	
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
		,searchQueryDisplayTemp : 'Search results for {{query}} - {{numberOfProducts}}'
		,pageSize : 12
		,searchResultSetTemp : '{{#products}}'
			+'<li><a href="product.html?pid={{uniqueId}}" id="pdt-{{uniqueId}}" class="result-item" unbxdParam_sku="{{uniqueId}}" unbxdParam_pRank="{{getIndex @index}}" unbxdAttr="product">'
				+'<div class="result-image-container">'
					+'<span class="result-image-horizontal-holder">'
						+'<img src="{{{image_url}}}" alt="{{{title}}}">'
					+'</span>'
				+'</div>'
				+'<hr class="result-image-border">'
				+'<div class="result-title">{{{title}}}</div>'
				+'<div class="clearfix result-actions">'
					+'<span class="result-price">USD {{price}}</span>'
					+'<button class="btn rt unbxd-add-cart" unbxdparam_sku="{{uniqueId}}" unbxdattr="AddToCart">BUY NOW</button>'
				+'</div>'
			+'</a></li>'
		+'{{/products}}'
		,searchResultContainer : '#results_container'
		,isClickNScroll: false
		,clickNScrollSelector : ''
		,isAutoScroll : true
		,facetTemp : '<h2>Narrow result set</h2>'
			+'{{#facets}}<div class="facet-block">'
				+'<h3>{{name}}</h3>'
				+'<div class="facet-values">'
					+'<ul>'
						+'{{#selected}}'
						+'<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}">'
							+'<label for="{{../facet_name}}_{{value}}">'
								+'<input type="checkbox" checked class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" id="{{../facet_name}}_{{value}}"> {{prepareFacetValue value}} ({{count}})'
							+'</label>'
						+'</li>'
						+'{{/selected}}'
						+'{{#unselected}}'
						+'<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}">'
							+'<label for="{{../facet_name}}_{{value}}">'
								+'<input type="checkbox" class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" id="{{../facet_name}}_{{value}}"> {{prepareFacetValue value}} ({{count}})'
							+'</label>'
						+'</li>'
						+'{{/unselected}}'
					+'</ul>'
				+'</div>'
			+'</div>{{/facets}}'
		,facetContainerSelector : "#facets_container"
		,facetCheckBoxSelector : "input[type='checkbox']"
		,facetElementSelector : "label"
		,facetOnSelect : function(el){
			//jQuery(el).addClass('selected');
		}
		,facetOnDeselect : function(el){
		    //jQuery(el).removeClass('selected');
		}
		,selectedFacetTemp : '{{#each filters}}'
			+'{{#each this}}'
				+'<div class="selected-facet clearfix">'
					+'<div class="selected-facet-name lt">{{{prepareFacetValue @key}}}</div>'
					+'<div class="selected-facet-delete rt" unbxdParam_facetName="{{this}}" unbxdParam_facetValue="{{@key}}">&times;</div>'
				+'</div>'
			+'{{/each}}'
		+'{{/each}}'
		,selectedFacetContainerSelector : "#selected_facets"
		,clearSelectedFacetsSelector : "#clear_all_selected_facets"
		,removeSelectedFacetSelector : ".selected-facet-delete"
		,selectedFacetHolderSelector : ".result-selected-facets"//to hide selected facets if nothing is available
		,loaderSelector : ""//".result-loader"
		,onFacetLoad : function(){}
		,sanitizeQueryString : function(q){ return q;}
		,getFacetStats : ""
		,processFacetStats : function(obj){}
		,setDefaultFilters : function(){}
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
		,searchQueryDisplayTemp : 'Search results for {{query}} - {{numberOfProducts}}'
		...

		//JSON used for this template
		{
			query : "something"
			,numberOfProducts : 1234
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
		,searchResultSetTemp : '{{#products}}'
			+'<li><a href="product.html?pid={{uniqueId}}" id="pdt-{{uniqueId}}" class="result-item" unbxdParam_sku="{{uniqueId}}" unbxdParam_pRank="{{getIndex @index}}" unbxdAttr="product">'
				+'<div class="result-image-container">'
					+'<span class="result-image-horizontal-holder">'
						+'<img src="{{{getFirst imageUrl}}}" alt="{{{title}}}">'
					+'</span>'
				+'</div>'
				+'<hr class="result-image-border">'
				+'<div class="result-title">{{{title}}}</div>'
				+'<div class="clearfix result-actions">'
					+'<span class="result-price">USD {{price}}</span>'
					+'<button class="btn rt unbxd-add-cart" unbxdparam_sku="{{uniqueId}}" unbxdattr="AddToCart">BUY NOW</button>'
				+'</div>'
			+'</a></li>'
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
- **searchResultContainer** : The jQuery selector of DOM element to append the HTML generated from **searchResultSetTemp** (*#results_container* in the first image). 
- **isClickNScroll** : Set it to true if you want users to click an element to fetch the next page.
- **clickNScrollSelector** : The jQuery selector of the DOM element that can be clicked for displaying the next page.(PS. in this case the new results will be appended to the **searchResultContainer**.)
- **isAutoScroll** : Set this to true if you want the new pages to be displayed while user scrolls to the bottom of page.
- **facetTemp** : Handlebars template for the repetitive facet block to display the individual facet. This can also be function which take a single argument (a JSON block as shown below).

	![Basic search layout](https://raw.githubusercontent.com/unbxd/js-sdk/master/images/facet_block.png "Basic search layout")

	```javascript
		//configuration
		...
		,facetTemp : '<h2>Narrow result set</h2>'
			+'{{#facets}}<div class="facet-block">'
				+'<h3>{{name}}</h3>'
				+'<div class="facet-values">'
					+'<ul>'
						+'{{#selected}}'
						+'<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}">'
							+'<label for="{{../facet_name}}_{{value}}">'
								+'<input type="checkbox" checked class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" id="{{../facet_name}}_{{value}}"> {{prepareFacetValue value}} ({{count}})'
							+'</label>'
						+'</li>'
						+'{{/selected}}'
						+'{{#unselected}}'
						+'<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}">'
							+'<label for="{{../facet_name}}_{{value}}">'
								+'<input type="checkbox" class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" id="{{../facet_name}}_{{value}}"> {{prepareFacetValue value}} ({{count}})'
							+'</label>'
						+'</li>'
						+'{{/unselected}}'
					+'</ul>'
				+'</div>'
			+'</div>{{/facets}}'
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
- **selectedFacetTemp** : Handlebars template for generating HTML to show the currently selected filters. Please check below image and code snippet.

    ![Seleted filters block](https://raw.githubusercontent.com/unbxd/js-sdk/master/images/selected_facet_layout.png "Selected filters block")

    ```javascript
        //configuration
        ...
        ,selectedFacetTemp : '{{#each filters}}'
			+'{{#each this}}'
				+'<div class="selected-facet clearfix">'
					+'<div class="selected-facet-name lt">{{{prepareFacetValue @key}}}</div>'
					+'<div class="selected-facet-delete rt" unbxdParam_facetName="{{this}}" unbxdParam_facetValue="{{@key}}">&times;</div>'
				+'</div>'
			+'{{/each}}'
		+'{{/each}}'
        ...
        
        //JSON used for above template
        {
            "filters": {
                "Category_fq": {
                    //the name of parent property is duplicated for rendering purpose
                    "Shirts": "Category_fq",
                    "Shoes": "Category_fq"
                }
            }
        }
    ```
- **selectedFacetContainerSelector** : jQuery selector of DOM element to place the generated HTML from **selectedFacetTemp**. (_Please refer to above image._)
- **clearSelectedFacetsSelector** : jQuery selector of DOM element on click which removes all the selected filters.(_Please refer to above image._)
- **removeSelectedFacetSelector** : jQuery selector of DOM element to remove respective filter.(_This is useful in removing single filter. Example **selected-facet-delete** from above template. Please refer to above image._)
- **selectedFacetHolderSelector** : jQuery selector of DOM element which 
- **loaderSelector** : The jQuery selector of the loading GIF image. This will be shown during the fetching process and hidden after the call.
- **onFacetLoad** : This option takes a function which will be called after rendering the facet block.
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
			price":
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
		}
		...
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
			<div class="header-search lt">
				<div class="search-input-button-holder clearfix">
					<form method="GET" action="search.html">
						<input type="text" class="search-input lt" id="search" value="" unbxdattr="sq" name="q" autocomplete="off"/>
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
