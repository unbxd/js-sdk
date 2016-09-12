describe('On Init', function () {

  before(function(){
    this.searchTest = fixture.load('mock/searchTestResponse.json');

    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];

    //initialize search
    this.searchobj = new window.Unbxd.setSearch(window.config);
    
    //stub search ajax call with mock response
    this.stub = sinon.stub(jQuery, 'ajax').yieldsTo('success',this.searchTest);

    //spy OnIntialResultLoad, OnFacetLoad, OnPageLoad  and OnNoResult
    this.spyOnIntialResultLoad = sinon.spy(this.searchobj.options,
     'onIntialResultLoad');
    this.spyOnFacetLoad = sinon.spy(this.searchobj.options, 'onFacetLoad');
    this.spyOnPageLoad = sinon.spy(this.searchobj.options, 'onPageLoad');
    this.spyOnNoResult = sinon.spy(this.searchobj.options, 'onNoResult');

    this.searchobj.callResults(this.searchobj.paintResultSet);
  });

  after(function(){
    this.stub.restore();
    fixture.cleanup();
  });
  
  it('Should call onIntialResultLoad', function(){
    expect(this.spyOnIntialResultLoad.called).to.equal(true);
  });

  it('Should call onFacetLoad', function(){
    expect(this.spyOnFacetLoad.called).to.equal(true);
  });

  it('Should not call onPageLoad', function(){
    expect(this.spyOnPageLoad.called).to.equal(false);
  });
  
  it('Should not call onNoResult', function(){
    expect(this.spyOnNoResult.called).to.equal(false);
  });
});
