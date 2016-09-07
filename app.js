var config = {
  siteName : 'newtest-u1436941805532'
  ,APIKey : 'cd97d8b7741240763b89e5c014bc3aab'
  ,type : 'search'
  ,getCategoryId : ''
  ,inputSelector : '#search_input'
  ,searchButtonSelector : '#search_button'
  ,spellCheck : '#did_you_mean'
  ,spellCheckTemp : 'Did you mean : {{suggestion}} ?'
  ,searchQueryDisplay : '#search_title'
  ,searchQueryDisplayTemp : 'Showing results for {{query}} - {{start}}-{{end}} of {{numberOfProducts}} Results'
  ,pageSize : 12
  ,searchResultSetTemp :
  {
    "grid" : [
      '{{#products}}'
        ,'<li class="grid_view">'
          ,'<a href="product.html?pid={{uniqueId}}" id="pdt-{{uniqueId}}" class="result-item" unbxdParam_sku="{{uniqueId}}" unbxdParam_pRank="{{unbxdprank}}" unbxdAttr="product">'
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
          ,'</a>'
        ,'</li>'
      ,'{{/products}}'
    ].join(''),
    "list" : [
      '{{#products}}'
        ,'<li class="list_view">'
          ,'<a href="product.html?pid={{uniqueId}}" id="pdt-{{uniqueId}}" class="result-item" unbxdParam_sku="{{uniqueId}}" unbxdParam_pRank="{{unbxdprank}}" unbxdAttr="product">'
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
          ,'</a>'
        ,'</li>'
      ,'{{/products}}'
    ].join('')
  }
  ,searchResultContainer : '#results_container'
  ,isClickNScroll: false
  ,clickNScrollSelector : ''
  ,isAutoScroll : true
  ,facetTemp : [
    '{{#facets}}'
      ,'<div class="facet-block">'
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
      ,'</div>'
    ,'{{/facets}}'
    ,'{{#rangefacets}}'
      ,'<div class="facet-block"'
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
      ,'</div>'
    ,'{{/rangefacets}}'
  ].join('')
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
  ,selectedFacetTemp : [
    '{{#each filters}}'
      ,'{{#each this}}'
        ,'<div class="selected-facet clearfix">'
          ,'<div class="selected-facet-name lt">{{{prepareFacetValue @key}}}</div>'
          ,'<div class="selected-facet-delete rt" unbxdParam_facetName="{{this}}" unbxdParam_facetValue="{{@key}}">&times;</div>'
        ,'</div>'
      ,'{{/each}}'
    ,'{{/each}}'
    ,'{{#each ranges}}'
      ,'{{#each this}}'
        ,'<div class="selected-facet clearfix">'
          ,'<div class="selected-facet-name lt">{{{prepareFacetValue @key}}}</div>'
          ,'<div class="selected-facet-delete rt" unbxdParam_facetName="{{this}}" unbxdParam_facetValue="{{@key}}">&times;</div>'
        ,'</div>'
      ,'{{/each}}'
    ,'{{/each}}'
  ].join('')
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
  ,sortContainerSelector: '#sort_container'
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
  ,paginationContainerSelector : '#pagination_container'
  ,paginationTemp: [
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
  ,fields : ['image_url','title','brand','price','uniqueId']
  ,searchQueryParam:"q"
  ,viewTypes: ['grid', 'list']
  ,viewTypeContainerSelector: '.view_type_select'
  ,viewTypeContainerTemp: [
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
};
