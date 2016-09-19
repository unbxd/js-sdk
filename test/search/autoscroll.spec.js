describe('Autoscroll', function () {

  before(function(done){
    this.searchTest = fixture.load('mock/searchTestResponse.json');
    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];

    window.config.isAutoScroll = true;
    window.config.isPagination = false;
    window.config.isClickNScroll = false;

    //initialize search
    this.searchobj = new window.Unbxd.setSearch(window.config);

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
    this.searchobj.clearFilters(true);
    this.searchobj.callResults(this.searchobj.paintResultSet);
  });

  it('Should load Next page on scroll trigger', function(){
    var beforeAtPage = this.searchobj.getPage();
    var AfterAtPage;
    jQuery(window).trigger('scroll');
    // expect(this.spyOnPageLoad.called).to.be.true;
    AfterAtPage = this.searchobj.getPage();
    expect(beforeAtPage + 1).to.be.equal(AfterAtPage);
  });
});
