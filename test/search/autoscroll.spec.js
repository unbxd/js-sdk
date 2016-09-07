describe('Autoscroll', function () {
  var expect = window.expect;

  before(function(){
    fixture.setBase('mock');
    var searchTest = fixture.load('searchTestResponse.json');
    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];

    window.config.isAutoScroll = true;
    window.config.isPagination = false;
    window.config.isClickNScroll = false;

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
    window.searchobj.clearFilters(true);
    window.searchobj.callResults(window.searchobj.paintResultSet);
  });

  it('Should load Next page on scroll trigger', function(){
    var beforeAtPage = window.searchobj.getPage();
    var AfterAtPage;
    jQuery(window).trigger('scroll');
    // expect(this.spyOnPageLoad.called).to.be.true;
    AfterAtPage = window.searchobj.getPage();
    expect(beforeAtPage + 1).to.be.equal(AfterAtPage);
  });
});
