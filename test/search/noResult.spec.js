describe('No results', function () {

  before(function(){
    this.zeroResultTest = fixture.load('mock/zeroResult.json');
    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];

    //initialize search
    this.searchobj = new window.Unbxd.setSearch(window.config);

    //stub search ajax call with mock response
    this.stub = sinon.stub(jQuery, 'ajax')
      .yieldsTo('success',this.zeroResultTest);
    
    this.spyOnIntialResultLoad = sinon.spy(this.searchobj.options,
      'onIntialResultLoad');
    this.spyOnNoResult = sinon.spy(this.searchobj.options,'onNoResult');
    this.searchobj.callResults(this.searchobj.paintResultSet);
  });

  after(function(){
    this.stub.restore();
    fixture.cleanup();
  });
  
  it('Should call onNoResult',function(){
    expect(this.spyOnNoResult.called).to.equal(true);
  });

  it('Should not call OnIntialResultLoad',function(){
    expect(this.spyOnIntialResultLoad.called).to.equal(false);
  });
});
