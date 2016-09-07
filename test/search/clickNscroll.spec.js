describe('clickNScroll', function () {
  var expect = window.expect;
  fixture.setBase('mock');
  var searchTest = fixture.load('searchTestResponse.json');

  before(function(){

    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];

    //change configuration to pagination from autoscroll
    window.config.isAutoScroll = false;
    window.config.isPagination = false;
    window.config.isClickNScroll = true;

    //initialize search
    window.searchobj = new window.Unbxd.setSearch(window.config);

    //stub search ajax call with mock response
    this.stub = sinon.stub(jQuery, 'ajax').yieldsTo('success',searchTest);

  });

  after(function(){
    this.stub.restore();
  });

  beforeEach(function(){
    //reset params applied
    window.searchobj.reset();
    window.searchobj.callResults(window.searchobj.paintResultSet);
  });

  it('Should load Next page on clicking on clickNScrollElement',function(){
    var beforeAtPage = window.searchobj.getPage();
    var AfterAtPage;
    jQuery(window.searchobj.options.clickNScrollElementSelector).click();
    AfterAtPage = window.searchobj.getPage();
    expect(beforeAtPage + 1).to.be.equal(AfterAtPage);
  });

  it('Should hide clickNScrollElement on last page', function(){
    searchTest.response.start = searchTest.response.numberOfProducts - 
      searchTest.searchMetaData.queryParams.rows;
    window.searchobj.setPage(window.searchobj.totalPages);
    window.searchobj.callResults(window.searchobj.paintResultSet);

    expect(jQuery(window.searchobj.options.clickNScrollElementSelector)
      .is(':visible')).to.be.false;
  });
});
