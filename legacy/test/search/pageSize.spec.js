describe('PageSize', function () {

  before(function(done){
    this.searchTest = fixture.load('mock/searchTestResponse.json');
    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];

    var searchConfig = jQuery.extend({}, window.config);
    searchConfig.isAutoScroll = false;
    searchConfig.isPagination = true;

    //initialize search
    this.searchobj = new window.Unbxd.setSearch(searchConfig);

    //stub search ajax call with mock response
    this.stub = sinon.stub(jQuery, 'ajax').yieldsTo('success',this.searchTest);
    done();
  });

  after(function(){
    this.stub.restore();
    fixture.cleanup();
  });
  
  beforeEach(function(){
    //reset filters applied
    this.searchobj.reset();
    this.searchobj.callResults(this.searchobj.paintResultSet);
  });

  it('Should update the PageSize', function(){
    
    var pageSize = this.searchobj.options.pageSizeOptions[2].value;
    this.searchTest.searchMetaData.queryParams.rows = pageSize;
    this.stub.yieldsTo('success',this.searchTest);
    jQuery(this.searchobj.options.pageSizeContainerSelector + ' select')
      .val(pageSize).change();
    expect(this.searchobj.getPageSize()).to.be.equal(pageSize);
  });
});
