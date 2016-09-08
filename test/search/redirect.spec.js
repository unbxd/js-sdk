describe('Redirect', function () {
  var expect = window.expect;
  
  before(function(){
    fixture.setBase('mock');
    var RedirectTest = fixture.load('redirect.json');
    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];

    //initialize search
    window.searchobj = new window.Unbxd.setSearch(window.config);

    //stub search ajax call with mock response
    this.stub = sinon.stub(jQuery, 'ajax').yieldsTo('success',RedirectTest);

    this.spyOnIntialResultLoad = sinon.spy(window.searchobj.options,
      'onIntialResultLoad');

    //stubbing _internalPaintResultSet here to avoid page reload
    this.stubInternalPaintResultSet = sinon.stub(window.searchobj,
      '_internalPaintResultSet');
    this.stubInternalPaintResultSet.withArgs(RedirectTest,true).returns(false);
    
    window.searchobj.callResults(window.searchobj.paintResultSet);
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
