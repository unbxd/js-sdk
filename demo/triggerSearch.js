var config = {
    siteName: "<yoursiteKey>",
    APIKey: "<yourAPIkey>",
    type: 'search',
    getCategoryId: function () {
        var path = '';
        if (window.Unbxd_Category_Page && window.Unbxd_Category_Page.path != undefined) {
            path = window.Unbxd_Category_Page["path"];
        }
        return path;
    },
    inputSelector: '#search_input',
    searchButtonSelector: '#search_button',
    spellCheck: '#did_you_mean',
    spellCheckTemp: 'Did you mean : {{suggestion}} ?',
    searchQueryDisplay: '#search_title',
    searchQueryDisplayTemp: 'Showing results for {{query}} - {{start}}-{{end}} of {{numberOfProducts}} Results',
    pageSize: 24,
    noEncoding: true,
    facetMultilevel: true,
    facetMultilevelName: 'CATEGORY',
    isSwatches: true,
    swatchesSelector: ".swatch-box",
    variants: true,
    variantsCount: 3,
    searchResultSetTemp: {
        "grid": ['{{#each (productVariant products)}}<li class="grid"><a href="{{productUrl}}" id="{{sku}}" class="result-item" unbxdParam_sku="{{uniqueId}}" unbxdParam_pRank="{{unbxdprank}}" unbxdAttr="product">',
            '<div class="result-image-container">',
            '<img id="img-{{uniqueId}}" src="{{{imageUrl}}}" alt="{{{title}}}">',
            '</div>',
            '{{#isSwatches}}',
            '<div class="swatch-container">',
            '{{#each variants}}',
            '<span class="swatch-box" unbxdparam_sku={{../uniqueId}} unbxdparam_swatchImage={{getSwatchImage swatch_click_image}} style="background-image:url(\'{{swatch_background_image}}\')">',
            '</span>',
            '{{/each}}',
            '{{/isSwatches}}',
            '</div>',
            '<div class="result-brand">{{{brand}}}</div>',
            '<div class="result-title">{{{title}}}</div>',
            '<div class="result-price">', '${{price}}',
            '</div>', '</a></li>{{/each}}'].join(''),
        "list": ['{{#products}}<li class="list"><a href="{{productUrl}}" id="{sku}}" class="result-item" unbxdParam_sku="{{uniqueId}}" unbxdParam_pRank="{{unbxdprank}}" unbxdAttr="product">', '<div class="result-image-container">', '<span class="result-image-horizontal-holder">', '<img src="{{{imageUrl}}}" alt="{{{title}}}">', '</span>', '</div>', '<div class="description">', '<div class="result-brand">{{{brand}}}</div>', '<div class="result-title">{{{title}}}</div>', '<div class="result-price">', '${{price}}', '</div>', '</div>', '</a></li>{{/products}}'].join('')
    },
    searchResultContainer: '#results_container',
    isClickNScroll: false,
    clickNScrollSelector: '',
    isAutoScroll: false,
    isPagination: true,
    paginationContainerSelector: '.result-pagination',
    viewTypes: ['grid', 'list'],
    viewTypeContainerSelector: '.view-types',
    viewTypeContainerTemp: [
        '{{#options}}',
        '<div class="view-type-wrapper">',
        '<a class="{{#if selected}}active{{/if}}" unbxdviewtype="{{value}}" href="#">',
        '{{#ifGrid this}}',
        '<i class="glyphicon glyphicon-th"></i>',
        '{{else}}',
        '<i class="glyphicon glyphicon-th-list"></i>',
        '{{/ifGrid}}',
        '</a>',
        '</div>',
        '{{/options}}'
    ].join(''),
    facetTemp: [
        '<div class="facet-block">',
        '{{#facets}}',
        '<div class="facet-block">',
        '<div class="facet-title">{{name}}</div>',
        '<div class="facet-values">',
        '<ul>', '{{#selected}}',

        '<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{#isFacetMultilevel isMultilevel}}{{id}}{{else}}{{value}}{{/isFacetMultilevel}}">',
        '<input type="checkbox" checked class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{#isFacetMultilevel isMultilevel}}{{id}}{{else}}{{value}}{{/isFacetMultilevel}}" id="{{../facet_name}}_{{value}}">',
        '<label for="{{../facet_name}}_{{value}}">', '{{prepareFacetValue value}} ({{count}})', '</label>',
        '</li>',
        '{{/selected}}',
        '{{#unselected}}',
        '<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{#isFacetMultilevel isMultilevel}}{{id}}{{else}}{{value}}{{/isFacetMultilevel}}">',
        '<input type="checkbox" class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{#isFacetMultilevel isMultilevel}}{{id}}{{else}}{{value}}{{/isFacetMultilevel}}" id="{{../facet_name}}_{{value}}">',
        '<label for="{{../facet_name}}_{{value}}">',
        '{{prepareFacetValue value}} ({{count}})',
        '</label>', '</li>', '{{/unselected}}',
        '</ul>', '</div>', '</div>',
        '{{/facets}}',
        '{{#rangefacets}}<div class="facet-block">', '<div class="facet-title">{{name}}</div>',
        '<div class="facet-values">', '<ul>', '{{#selected}}',
        '<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" unbxdParam_facetType="{{../type}}">',
        '<input type="checkbox" checked class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" ',
        ' unbxdParam_facetType="{{../type}}" unbxdParam_facetValue="{{value}}" id="{{../facet_name}}_{{value}}">',
        '<label for="{{../facet_name}}_{{value}}">',
        '{{prepareFacetValue begin}} - {{prepareFacetValue end}} ({{count}})</label></li>',
        '{{/selected}}', ' {{#unselected}}',
        '<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" unbxdParam_facetType="{{../type}}">',
        '<input type="checkbox" class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" ',
        ' unbxdParam_facetType="{{../type}}" unbxdParam_facetValue="{{value}}" id="{{../facet_name}}_{{value}}">',
        '<label for="{{../facet_name}}_{{value}}">', '{{prepareFacetValue begin}} - {{prepareFacetValue end}} ({{count}})</label></li>',
        '{{/unselected}}', '</ul>', '</div>', '</div>', '{{/rangefacets}}'

    ].join(""),
    facetContainerSelector: "#facets_container",
    facetCheckBoxSelector: ".filter-checkbox",
    facetElementSelector: "label",
    facetOnSelect: function (el) { },
    facetOnDeselect: function (el) { },
    facetMultiSelect: true,
    selectedFacetTemp: [
        'Selected:', '{{#each filters}}', '{{#each this}}', '<div class="selected-facet clearfix">', '<div class="selected-facet-name lt">{{{prepareFacetValue @key}}}</div>', '<div class="selected-facet-delete rt" unbxdParam_facetName="{{this}}" unbxdParam_facetValue="{{@key}}">&times;</div>', '</div>', '{{/each}}', '{{/each}}', '{{#each ranges}}', '{{#each this}}', '<div class="selected-facet clearfix">', '<div class="selected-facet-name lt">{{{prepareFacetValue @key}}}</div>', '<div class="selected-facet-delete rt" unbxdParam_facetName="{{this}}" unbxdParam_facetValue="{{@key}}">&times;</div>', '</div>', '{{/each}}', '{{/each}}'
    ].join(''),
    selectedFacetContainerSelector: "#selected_facets",
    clearSelectedFacetsSelector: "#clear_all_selected_facets",
    removeSelectedFacetSelector: ".selected-facet-delete",
    selectedFacetHolderSelector: "",
    onFacetLoad: function () {
        console.log('onFacetLoad', arguments, this);
    },
    sanitizeQueryString: function (q) {
        return q;
    },
    loaderSelector: ".result-loader",
    getFacetStats: "price",
    setDefaultFilters: function () {
    },
    'template-features': {
        "autoScroll": false,
        "clickScroll": false,
        "gridAndListViewBoth": true,
        "listViewOnly": false,
        "isPagination": true
    },
    onIntialResultLoad: function () {
        console.log('onIntialResultLoad', arguments, this);
    },
    onPageLoad: function () {
        console.log('onPageLoad', arguments, this);
    },
    deferInitRender: [],
    bannerSelector: '.banner',
    sortContainerSelector: '.result-sort-options',
    pageSizeContainerSelector: '.result-page-size-options',
    mappedFields: {
        "imageUrl": "imageUrl",
        "productUrl": "productUrl",
        "title": "title",
        "description": "description",
        "price": "price",
        "categoryField": "categoryField",
        "variantFields": {
            "imageUrl": "v_imageUrl",
            "productUrl": "v_productUrl",
            "title": "v_title",
            "price": "v_price",
            "groupBy": "variant_color",
            "swatchFields": {
                "swatch_background_image": "variant_overhead_swatch",
                "swatch_background_color": "variant_color",
                "swatch_click_image": "variant_image_array"
            }
        }
    },
    searchEndPoint: "https://search.unbxd.io",
    categoryUrlParam: "p",
    categoryDepth: 4
}

if (window.Unbxd_Category_Page && window.Unbxd_Category_Page.hasOwnProperty("path")) {
    config['type'] = 'category';
} else {
    config['type'] = 'search';
}

window.searchobj = new window.Unbxd.setSearch(config);



