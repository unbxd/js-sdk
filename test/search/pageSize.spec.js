describe('PageSize', function () {
  var expect = window.expect;
  fixture.setBase('mock');
  var searchTest = fixture.load('searchTestResponse.json');

  before(function(){

    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];

    window.config.isAutoScroll = false;
    window.config.isPagination = true;

    //initialize search
    window.searchobj = new window.Unbxd.setSearch(window.config);

    //stub search ajax call with mock response
    this.stub = sinon.stub(jQuery, 'ajax').yieldsTo('success',searchTest);
  });

  after(function(){
    this.stub.restore();
  });
  
  beforeEach(function(){
    //reset filters applied
    window.searchobj.reset();
    window.searchobj.callResults(window.searchobj.paintResultSet);
  });

  it('Should update the PageSize', function(){
    
    var pageSize = window.searchobj.options.pageSizeOptions[2].value;
    searchTest.searchMetaData.queryParams.rows = pageSize;
    this.stub.yieldsTo('success',searchTest);
    jQuery(window.searchobj.options.pageSizeContainerSelector + ' select')
    	.val(pageSize).change();
    expect(window.searchobj.getPageSize()).to.be.equal(pageSize);
  });
});
