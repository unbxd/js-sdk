describe('Facets Position', function () {

  before(function(done){
    this.searchTest = fixture.load('mock/searchTestResponse.json');

    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];

    var searchConfig = jQuery.extend({}, window.config);
    searchConfig.facetTemp = function(){};
    //initialize search
    this.searchobj = new window.Unbxd.setSearch(searchConfig);

    //stub search ajax call with mock response
    this.stub = sinon.stub(jQuery, 'ajax').yieldsTo('success', this.searchTest);
    this.spyOnFacetTemp = sinon.spy(this.searchobj.options, 'facetTemp');
    done();
  });

  after(function(){
    this.stub.restore();
    fixture.cleanup();
  });

  beforeEach(function(){
    //reset filters applied
    this.searchobj.clearFilters(true);
    this.searchobj.callResults(this.searchobj.paintResultSet);
  });

  it('Facets should be sorted based on position', function(){
		var facetElement = jQuery(this.searchobj.options
        .facetContainerSelector + ' label').first(),
			sortedFacets,
			isSorted = true;
    //apply facet
    facetElement.click();
    sortedFacets = this.spyOnFacetTemp.args[0][0].sortedFacets;
    sortedFacets.forEach(function(facet, index){
    	if(index < sortedFacets.length && 
    		facet.position && sortedFacets[index + 1].position &&
    		facet.position > sortedFacets[index + 1].position) {
    		isSorted = false;
    	}
    });
    expect(isSorted).to.be.true;
  });
 });