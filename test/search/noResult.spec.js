describe('No results', function () {
  var expect = window.expect;
  before(function(){
    fixture.setBase('mock');
    var zeroResultTest = fixture.load('zeroResult.json');
    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];

    //initialize search
    window.searchobj = new window.Unbxd.setSearch(window.config);

    //stub search ajax call with mock response
    this.stub = sinon.stub(jQuery, 'ajax').yieldsTo('success',zeroResultTest);
    
    this.spyOnIntialResultLoad = sinon.spy(window.searchobj.options,
    	'onIntialResultLoad');
    this.spyOnNoResult = sinon.spy(window.searchobj.options,'onNoResult');
    window.searchobj.callResults(window.searchobj.paintResultSet);
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
