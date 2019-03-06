describe('Sort', function () {

  before(function(done){
    this.searchTest = fixture.load('mock/searchTestResponse.json');

    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];
    
    //initialize search
    this.searchobj = new window.Unbxd.setSearch(window.config);

    //stub search ajax call with mock response
    this.stub = sinon.stub(jQuery, 'ajax').yieldsTo('success',this.searchTest);
    this.spyAddSort = sinon.spy(this.searchobj,'addSort');
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

  it('Should call Addsort with field and value on which sort applied',
    function(){
      var field = this.searchobj.options.sortOptions[2].field;
      var value = this.searchobj.options.sortOptions[2].order;
      jQuery(this.searchobj.options.sortContainerSelector + ' select')
        .prop('selectedIndex',2).change();
      expect(this.spyAddSort.calledWith(field,value)).to.equal(true);
    }
  );

  it('Addsort - Should add sort fields to params', function(){
    this.searchobj.addSort('price','asc');
    expect(this.searchobj.params.sort.price).to.be.equal('asc');
  });

  it('Removesort - Should remove sort fields from params ', function(){
    this.searchobj.removeSort('price');
    expect(this.searchobj.params.sort.price).to.not.exist;
  });

  it('resetSort - Should clear sort params ', function(){
    this.searchobj.addSort('price','asc');
    this.searchobj.resetSort();
    expect(this.searchobj.params.sort).to.be.empty;
  });
});
