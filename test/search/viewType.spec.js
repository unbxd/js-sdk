describe('ViewTypes', function () {
  var expect = window.expect;
  before(function(){
    fixture.setBase('mock');
    var searchTest = fixture.load('searchTestResponse.json');
    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];

    //initialize search
    window.searchobj = new window.Unbxd.setSearch(window.config);

    //stub search ajax call with mock response
    this.stub = sinon.stub(jQuery, 'ajax').yieldsTo('success', searchTest);

  });

  after(function(){
    this.stub.restore();
  });

  beforeEach(function(){
    //reset params applied
    window.searchobj.reset();
    window.searchobj.callResults(window.searchobj.paintResultSet);
  });

  it('Should load List view', function(){
    jQuery('[unbxdviewtype="list"]').click();
    expect(window.searchobj.getViewType()).to.be.equal('list');
  });

  it('Should load Grid view', function(){
    jQuery('[unbxdviewtype="grid"]').click();
    expect(window.searchobj.getViewType()).to.be.equal('grid');
  });
});
