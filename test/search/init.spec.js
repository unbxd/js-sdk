describe('On Init', function () {
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

    //spy OnIntialResultLoad, OnFacetLoad, OnPageLoad  and OnNoResult
    this.spyOnIntialResultLoad = sinon.spy(window.searchobj.options,
     'onIntialResultLoad');
    this.spyOnFacetLoad = sinon.spy(window.searchobj.options, 'onFacetLoad');
    this.spyOnPageLoad = sinon.spy(window.searchobj.options, 'onPageLoad');
    this.spyOnNoResult = sinon.spy(window.searchobj.options, 'onNoResult');

    window.searchobj.callResults(window.searchobj.paintResultSet);
  });

  after(function(){
    this.stub.restore();
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
