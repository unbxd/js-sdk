describe('Facets', function () {
  var expect = window.expect;

  before(function(){
    fixture.setBase('mock');
    var searchTest = fixture.load('searchTestResponse.json');

    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];

    //initialize search
    window.searchobj = new window.Unbxd.setSearch(window.config);

    //stub search ajax call with mock response
    this.stub = sinon.stub(jQuery, 'ajax').yieldsTo('success', searchTest);

    this.spyOnFacetLoad = sinon.spy(window.searchobj.options, 'onFacetLoad');
    this.spyFacetOnSelect = sinon
      .spy(window.searchobj.options, 'facetOnSelect');
    this.spyFacetOnDeselect = sinon
      .spy(window.searchobj.options, 'facetOnDeselect');
    this.spyRemoveFilter = sinon.spy(window.searchobj, 'removeFilter');
    this.spyClearFilters = sinon.spy(window.searchobj, 'clearFilters');

  });

  after(function(){
    this.stub.restore();
    fixture.cleanup();
  });

  beforeEach(function(){
    //reset filters applied
    window.searchobj.clearFilters(true);
    window.searchobj.callResults(window.searchobj.paintResultSet);
  });

  it('Should call onFacetLoad on selecting facet', function(){
    var beforeCallCount = this.spyOnFacetLoad.callCount;
    var afterCallCount;
    jQuery(window.searchobj.options.facetContainerSelector +' label')[0]
      .click();
    afterCallCount = this.spyOnFacetLoad.callCount;
    expect(beforeCallCount + 1).to.be.equal(afterCallCount);
  });

  it('Should call facetOnSelect with element as args on facet select',
    function(){
      var facetElement = jQuery(window.searchobj.options
        .facetContainerSelector + ' label').first();
      //apply facet
      facetElement.click();
      expect(jQuery(this.spyFacetOnSelect.args[0][0][0]).text())
      .to.be.equal(jQuery(window.searchobj.options.facetContainerSelector +
       ' label').first().text());
    }
  );

  it('Should call facetOnDeselect with element as args on deselecting facet',
    function(){
      var facetElement = jQuery(window.searchobj.options
        .facetContainerSelector +' label').first();
      //apply facet
      facetElement.click();
      //remove facet
      facetElement.click();
      expect(jQuery(this.spyFacetOnDeselect.args[0][0][0]).text())
        .to.be.equal(jQuery(window.searchobj.options
          .facetContainerSelector +' label').first().text());
    }
  );

  it('addFilter - Should add filters to search params', function(){
    var field = 'color_fq';
    var value = 'Black';
    window.searchobj.addFilter(field,value);
    expect(window.searchobj.params.filters[field][value]).to.exist;
  });

  it('removeFilter - Should remove filters from search params', function(){
    var field = 'color_fq';
    var value = 'Black';
    window.searchobj.addFilter(field,value);
    window.searchobj.removeFilter(field,value);
    expect(window.searchobj.params.filters[field]).to.not.exist;
  });

  it('clearFilter - Should clear search param filters',function(){
    var field = 'color_fq';
    var value = 'Black';
    window.searchobj.addFilter(field,value);
    window.searchobj.clearFilters();
    expect(window.searchobj.params.filters).to.be.empty;
  });

  it('clearFilter(including range) -Should clear filters and rangeFilters',
    function(){
      var field = 'color_fq';
      var value = 'Black';
      var rangeField = 'price_fq';
      var start = '30';
      var end = '60';

      window.searchobj.addFilter(field,value);
      window.searchobj.addRangeFilter(rangeField,start,end);
      window.searchobj.clearFilters(true);
      expect(window.searchobj.params.filters).to.be.empty;
      expect(window.searchobj.params.ranges).to.be.empty;
    }
  );

  it('addRangeFilter - Should add rangeFilters to search params',
    function(){
      var rangeField = 'price_fq';
      var start = '30';
      var end = '60';
      window.searchobj.addRangeFilter(rangeField,start,end);
      expect(window.searchobj.params.ranges[rangeField][start + ' TO ' + end])
        .to.exist;
    }
  );

  it('removeRangeFilter - Should remove rangeFilters from search params',
    function(){
      var rangeField = 'price_fq';
      var start = '30';
      var end = '60';
      window.searchobj.addRangeFilter(rangeField,start,end);
      window.searchobj.removeRangeFilter(rangeField,start,end);
      expect(window.searchobj.params.ranges[rangeField]).to.not.exist;
    }
  );

  it('clearRangeFilter - Should clear search param rangeFilters',
    function(){
      var rangeField = 'price_fq';
      var start = '30';
      var end = '60';
      window.searchobj.addRangeFilter(rangeField,start,end);
      window.searchobj.clearRangeFiltes();
      expect(window.searchobj.params.ranges).to.be.empty;
    }
  );

  it('MultiSelect - Should be able to apply multiple filters on same facet',
    function(){
      var field = 'color_fq';
      var value1 = 'Black';
      var value2 = 'Red';
      window.searchobj.addFilter(field,value1);
      window.searchobj.addFilter(field,value2);
      expect(window.searchobj.params.filters[field][value1])
        .to.equal(window.searchobj.params.filters[field][value2]).and.exist;
    }
  );

  it('Should remove applied filter on clicking on removeSelectedFacetSelector',
    function(){
      var field = 'color_fq';
      var value = 'Black';

      window.searchobj.addFilter(field,value);
      window.searchobj.callResults(window.searchobj.paintResultSet);
      jQuery(window.searchobj.options.removeSelectedFacetSelector +
       '[unbxdparam_facetvalue="'+value+'"]').click();

      expect(this.spyRemoveFilter.calledWith(field,value)).to.be.true;
    }
  );

  it('Should remove all filters on clicking on clearSelectedFacetsSelector',
    function(){
      var field = 'color_fq';
      var value = 'Black';
      var rangeField = 'price_fq';
      var start = '30';
      var end = '60';

      window.searchobj.addFilter(field,value);
      window.searchobj.addRangeFilter(rangeField,start,end);
      window.searchobj.callResults(window.searchobj.paintResultSet);
      jQuery(window.searchobj.options.clearSelectedFacetsSelector).click();

      expect(this.spyClearFilters.calledWith(true)).to.be.true;
    }
  );

});
