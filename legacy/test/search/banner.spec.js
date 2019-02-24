describe('Banners', function () {

  before(function(done){
    this.bannerResponse = fixture.load('mock/bannerResponse.json');
    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];

    //initialize search
    this.searchobj = new window.Unbxd.setSearch(window.config);

    //stub search ajax call with mock response
    this.stub = sinon.stub(jQuery, 'ajax')
      .yieldsTo('success',this.bannerResponse);
    done();
  });

  after(function(){
    this.stub.restore();
    fixture.cleanup();
  });

  beforeEach(function(){
    this.searchobj.callResults(this.searchobj.paintResultSet);
  });

  it('Should update the Banner landingUrl', function(){
    expect(jQuery(this.searchobj.options.bannerSelector + ' a').attr('href'))
      .to.be.equal(this.bannerResponse.banner.banners[0].landingUrl);
  });

  it('Should update the Banner imageUrl', function(){
    expect(jQuery(this.searchobj.options.bannerSelector + ' img').attr('src'))
      .to.be.equal(this.bannerResponse.banner.banners[0].imageUrl);
  });
});
