describe('Sort', function () {
  var expect = window.expect;
  before(function(){
    fixture.setBase('mock');
    var searchTest = fixture.load('searchTestResponse.json');

    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];
    
    //initialize search
    window.searchobj = new window.Unbxd.setSearch(window.config);

    //stub search ajax call with mock response
    this.stub = sinon.stub(jQuery, 'ajax').yieldsTo('success',searchTest);
    this.spyAddSort = sinon.spy(window.searchobj,'addSort');
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

  it('Should call Addsort with field and value on which sort applied',
    function(){
      var field = window.searchobj.options.sortOptions[2].field;
      var value = window.searchobj.options.sortOptions[2].order;
      jQuery(window.searchobj.options.sortContainerSelector + ' select')
        .prop('selectedIndex',2).change();
      expect(this.spyAddSort.calledWith(field,value)).to.equal(true);
    }
  );

  it('Addsort - Should add sort fields to params', function(){
    window.searchobj.addSort('price','asc');
    expect(window.searchobj.params.sort.price).to.be.equal('asc');
  });

  it('Removesort - Should remove sort fields from params ', function(){
    window.searchobj.removeSort('price');
    expect(window.searchobj.params.sort.price).to.not.exist;
  });

  it('resetSort - Should clear sort params ', function(){
    window.searchobj.addSort('price','asc');
    window.searchobj.resetSort();
    expect(window.searchobj.params.sort).to.be.empty;
  });
});
