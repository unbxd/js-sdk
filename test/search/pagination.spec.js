describe('Pagination', function () {

  before(function(){
    this.searchTest = fixture.load('mock/searchTestResponse.json');

    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];

    //change configuration to pagination from autoscroll
    window.config.isAutoScroll = false;
    window.config.isPagination = true;

    //initialize search
    this.searchobj = new window.Unbxd.setSearch(window.config);

    //stub search ajax call with mock response
    this.stub = sinon.stub(jQuery, 'ajax').yieldsTo('success',this.searchTest);

    this.spyOnIntialResultLoad = sinon.spy(this.searchobj.options,
      'onIntialResultLoad');
    this.spyOnPageLoad = sinon.spy(this.searchobj.options, 'onPageLoad');
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


  it('Should call onPageLoad', function(){

    jQuery(this.searchobj.options.paginationContainerSelector +
      ' [unbxdaction="next"]').click();
    expect(this.spyOnPageLoad.called).to.be.true;
  });

  it('Should call Next page', function(){
    
    var beforeOnPage = this.searchobj.getPage();
    var afterOnPage;

    jQuery(this.searchobj.options.paginationContainerSelector +
      ' [unbxdaction="next"]').click();
    afterOnPage = this.searchobj.getPage();
    expect(beforeOnPage + 1).to.be.equal(afterOnPage);
  });

  it('Should call Previous page', function(){

    var beforeOnPage ,afterOnPage;
    jQuery(this.searchobj.options.paginationContainerSelector +
      ' [unbxdaction="next"]').click();
    beforeOnPage = this.searchobj.getPage();

    jQuery(this.searchobj.options.paginationContainerSelector +
      ' [unbxdaction="prev"]').click();
    afterOnPage = this.searchobj.getPage();
    expect(beforeOnPage - 1).to.be.equal(afterOnPage);
  });

  it('Should call custom page', function(){
    var customPage = 2;
  
    this.stub.yieldsTo('success',this.searchTest);
    jQuery(this.searchobj.options.paginationContainerSelector +
      ' [unbxdaction="'+customPage+'"]')
      .click();
    expect(this.searchobj.getPage()).to.be.equal(customPage);
  });

  it('Should call first page', function(){
   
    jQuery(this.searchobj.options.paginationContainerSelector +
      ' [unbxdaction="first"]').click();
    expect(this.searchobj.getPage()).to.be.equal(1);
  });

  it('Should call last page', function(){
    
    jQuery(this.searchobj.options.paginationContainerSelector +
      ' [unbxdaction="last"]').click();
    expect(this.searchobj.getPage()).to.be.equal(this.searchobj.totalPages);
  });

});
