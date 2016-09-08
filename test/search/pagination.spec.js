describe('Pagination', function () {
  var expect = window.expect;
  fixture.setBase('mock');
  var searchTest = fixture.load('searchTestResponse.json');

  before(function(){

    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];

    //change configuration to pagination from autoscroll
    window.config.isAutoScroll = false;
    window.config.isPagination = true;

    //initialize search
    window.searchobj = new window.Unbxd.setSearch(window.config);

    //stub search ajax call with mock response
    this.stub = sinon.stub(jQuery, 'ajax').yieldsTo('success',searchTest);

    this.spyOnIntialResultLoad = sinon.spy(window.searchobj.options,
      'onIntialResultLoad');
    this.spyOnPageLoad = sinon.spy(window.searchobj.options, 'onPageLoad');
  });

  after(function(){
    this.stub.restore();
    fixture.cleanup();
  });

  beforeEach(function(){
    //reset params applied
    window.searchobj.reset();
    window.searchobj.callResults(window.searchobj.paintResultSet);
  });


  it('Should call onPageLoad', function(){

    jQuery(window.searchobj.options.paginationContainerSelector +
      ' [unbxdaction="next"]').click();
    expect(this.spyOnPageLoad.called).to.be.true;
  });

  it('Should call Next page', function(){
    
    var beforeOnPage = window.searchobj.getPage();
    var afterOnPage;

    jQuery(window.searchobj.options.paginationContainerSelector +
      ' [unbxdaction="next"]').click();
    afterOnPage = window.searchobj.getPage();
    expect(beforeOnPage + 1).to.be.equal(afterOnPage);
  });

  it('Should call Previous page', function(){

    var beforeOnPage ,afterOnPage;
    jQuery(window.searchobj.options.paginationContainerSelector +
      ' [unbxdaction="next"]').click();
    beforeOnPage = window.searchobj.getPage();

    jQuery(window.searchobj.options.paginationContainerSelector +
      ' [unbxdaction="prev"]').click();
    afterOnPage = window.searchobj.getPage();
    expect(beforeOnPage - 1).to.be.equal(afterOnPage);
  });

  it('Should call custom page', function(){
    var customPage = 2;
  
    this.stub.yieldsTo('success',searchTest);
    jQuery(window.searchobj.options.paginationContainerSelector +
      ' [unbxdaction="'+customPage+'"]')
      .click();
    expect(window.searchobj.getPage()).to.be.equal(customPage);
  });

  it('Should call first page', function(){
   
    jQuery(window.searchobj.options.paginationContainerSelector +
      ' [unbxdaction="first"]').click();
    expect(window.searchobj.getPage()).to.be.equal(1);
  });

  it('Should call last page', function(){
    
    jQuery(window.searchobj.options.paginationContainerSelector +
      ' [unbxdaction="last"]').click();
    expect(window.searchobj.getPage()).to.be.equal(window.searchobj.totalPages);
  });

});
