describe('Redirect', function () {
  
  before(function(){
    this.RedirectTest = fixture.load('mock/redirect.json');
    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];

    //initialize search
    this.searchobj = new window.Unbxd.setSearch(window.config);

    //stub search ajax call with mock response
    this.stub = sinon.stub(jQuery, 'ajax')
      .yieldsTo('success',this.RedirectTest);

    this.spyOnIntialResultLoad = sinon.spy(this.searchobj.options,
      'onIntialResultLoad');

    //stubbing _internalPaintResultSet here to avoid page reload
    this.stubInternalPaintResultSet = sinon.stub(this.searchobj,
      '_internalPaintResultSet');
    this.stubInternalPaintResultSet.withArgs(this.RedirectTest,true)
      .returns(false);
    
    this.searchobj.callResults(this.searchobj.paintResultSet);
  });

  after(function(){
    this.stub.restore();
    this.stubInternalPaintResultSet.restore();
    fixture.cleanup();
  });
  
  it('Should not call onIntialResultLoad',function(){
    expect(this.spyOnIntialResultLoad.called).to.equal(false);
  });

  it('Should have redirect in response', function(){
    expect(this.stubInternalPaintResultSet.args[0][0]
      .hasOwnProperty('redirect')).to.equal(true);
  });

  it('paintResultSet - Should return false',function(){
    expect(this.stubInternalPaintResultSet.returned(false)).to.equal(true);
  });
});
