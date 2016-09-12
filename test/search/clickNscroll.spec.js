describe('clickNScroll', function () {

  before(function(){

    this.searchTest = fixture.load('mock/searchTestResponse.json');
    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];

    //change configuration to pagination from autoscroll
    window.config.isAutoScroll = false;
    window.config.isPagination = false;
    window.config.isClickNScroll = true;

    //initialize search
    this.searchobj = new window.Unbxd.setSearch(window.config);

    //stub search ajax call with mock response
    this.stub = sinon.stub(jQuery, 'ajax')
      .yieldsTo('success',this.searchTest);

  });

  after(function(){
    this.stub.restore();
    fixture.cleanup();
  });

  beforeEach(function(){
    //reset params applied
    this.searchobj.reset();
    this.searchobj.callResults(this.searchobj.paintResultSet);
  });

  it('Should load Next page on clicking on clickNScrollElement',function(){
    var beforeAtPage = this.searchobj.getPage();
    var AfterAtPage;
    jQuery(this.searchobj.options.clickNScrollElementSelector).click();
    AfterAtPage = this.searchobj.getPage();
    expect(beforeAtPage + 1).to.be.equal(AfterAtPage);
  });

  it('Should hide clickNScrollElement on last page', function(){
    this.searchTest.response.start = this.searchTest
      .response.numberOfProducts - 
      this.searchTest.searchMetaData.queryParams.rows;
    this.searchobj.setPage(this.searchobj.totalPages);
    this.searchobj.callResults(this.searchobj.paintResultSet);

    expect(jQuery(this.searchobj.options.clickNScrollElementSelector)
      .is(':visible')).to.be.false;
  });
});
