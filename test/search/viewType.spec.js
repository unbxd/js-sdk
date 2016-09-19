describe('ViewTypes', function () {

  before(function(done){
    this.searchTest = fixture.load('mock/searchTestResponse.json');
    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];

    //initialize search
    this.searchobj = new window.Unbxd.setSearch(window.config);

    //stub search ajax call with mock response
    this.stub = sinon.stub(jQuery, 'ajax').yieldsTo('success', this.searchTest);
    done();
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

  it('Should load List view', function(){
    jQuery('[unbxdviewtype="list"]').click();
    expect(this.searchobj.getViewType()).to.be.equal('list');
  });

  it('Should load Grid view', function(){
    jQuery('[unbxdviewtype="grid"]').click();
    expect(this.searchobj.getViewType()).to.be.equal('grid');
  });
});
