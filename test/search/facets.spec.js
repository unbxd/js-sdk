describe('Facets', function () {

  before(function(){
    this.searchTest = fixture.load('mock/searchTestResponse.json');

    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];

    //initialize search
    this.searchobj = new window.Unbxd.setSearch(window.config);

    //stub search ajax call with mock response
    this.stub = sinon.stub(jQuery, 'ajax').yieldsTo('success', this.searchTest);

    this.spyOnFacetLoad = sinon.spy(this.searchobj.options, 'onFacetLoad');
    this.spyFacetOnSelect = sinon
      .spy(this.searchobj.options, 'facetOnSelect');
    this.spyFacetOnDeselect = sinon
      .spy(this.searchobj.options, 'facetOnDeselect');
    this.spyRemoveFilter = sinon.spy(this.searchobj, 'removeFilter');
    this.spyClearFilters = sinon.spy(this.searchobj, 'clearFilters');

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

  it('Should call onFacetLoad on selecting facet', function(){
    var beforeCallCount = this.spyOnFacetLoad.callCount;
    var afterCallCount;
    jQuery(this.searchobj.options.facetContainerSelector +' label')[0]
      .click();
    afterCallCount = this.spyOnFacetLoad.callCount;
    expect(beforeCallCount + 1).to.be.equal(afterCallCount);
  });

  it('Should call facetOnSelect with element as args on facet select',
    function(){
      var facetElement = jQuery(this.searchobj.options
        .facetContainerSelector + ' label').first();
      //apply facet
      facetElement.click();
      expect(jQuery(this.spyFacetOnSelect.args[0][0][0]).text())
      .to.be.equal(jQuery(this.searchobj.options.facetContainerSelector +
       ' label').first().text());
    }
  );

  it('Should call facetOnDeselect with element as args on deselecting facet',
    function(){
      var facetElement = jQuery(this.searchobj.options
        .facetContainerSelector +' label').first();
      //apply facet
      facetElement.click();
      //remove facet
      facetElement.click();
      expect(jQuery(this.spyFacetOnDeselect.args[0][0][0]).text())
        .to.be.equal(jQuery(this.searchobj.options
          .facetContainerSelector +' label').first().text());
    }
  );

  it('addFilter - Should add filters to search params', function(){
    var field = 'color_fq';
    var value = 'Black';
    this.searchobj.addFilter(field,value);
    expect(this.searchobj.params.filters[field][value]).to.exist;
  });

  it('removeFilter - Should remove filters from search params', function(){
    var field = 'color_fq';
    var value = 'Black';
    this.searchobj.addFilter(field,value);
    this.searchobj.removeFilter(field,value);
    expect(this.searchobj.params.filters[field]).to.not.exist;
  });

  it('clearFilter - Should clear search param filters',function(){
    var field = 'color_fq';
    var value = 'Black';
    this.searchobj.addFilter(field,value);
    this.searchobj.clearFilters();
    expect(this.searchobj.params.filters).to.be.empty;
  });

  it('clearFilter(including range) -Should clear filters and rangeFilters',
    function(){
      var field = 'color_fq';
      var value = 'Black';
      var rangeField = 'price_fq';
      var start = '30';
      var end = '60';

      this.searchobj.addFilter(field,value);
      this.searchobj.addRangeFilter(rangeField,start,end);
      this.searchobj.clearFilters(true);
      expect(this.searchobj.params.filters).to.be.empty;
      expect(this.searchobj.params.ranges).to.be.empty;
    }
  );

  it('addRangeFilter - Should add rangeFilters to search params',
    function(){
      var rangeField = 'price_fq';
      var start = '30';
      var end = '60';
      this.searchobj.addRangeFilter(rangeField,start,end);
      expect(this.searchobj.params.ranges[rangeField][start + ' TO ' + end])
        .to.exist;
    }
  );

  it('removeRangeFilter - Should remove rangeFilters from search params',
    function(){
      var rangeField = 'price_fq';
      var start = '30';
      var end = '60';
      this.searchobj.addRangeFilter(rangeField,start,end);
      this.searchobj.removeRangeFilter(rangeField,start,end);
      expect(this.searchobj.params.ranges[rangeField]).to.not.exist;
    }
  );

  it('clearRangeFilter - Should clear search param rangeFilters',
    function(){
      var rangeField = 'price_fq';
      var start = '30';
      var end = '60';
      this.searchobj.addRangeFilter(rangeField,start,end);
      this.searchobj.clearRangeFiltes();
      expect(this.searchobj.params.ranges).to.be.empty;
    }
  );

  it('MultiSelect - Should be able to apply multiple filters on same facet',
    function(){
      var field = 'color_fq';
      var value1 = 'Black';
      var value2 = 'Red';
      this.searchobj.addFilter(field,value1);
      this.searchobj.addFilter(field,value2);
      expect(this.searchobj.params.filters[field][value1])
        .to.equal(this.searchobj.params.filters[field][value2]).and.exist;
    }
  );

  it('Should remove applied filter on clicking on removeSelectedFacetSelector',
    function(){
      var field = 'color_fq';
      var value = 'Black';

      this.searchobj.addFilter(field,value);
      this.searchobj.callResults(this.searchobj.paintResultSet);
      jQuery(this.searchobj.options.removeSelectedFacetSelector +
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

      this.searchobj.addFilter(field,value);
      this.searchobj.addRangeFilter(rangeField,start,end);
      this.searchobj.callResults(this.searchobj.paintResultSet);
      jQuery(this.searchobj.options.clearSelectedFacetsSelector).click();

      expect(this.spyClearFilters.calledWith(true)).to.be.true;
    }
  );

});
