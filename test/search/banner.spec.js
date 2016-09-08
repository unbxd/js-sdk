describe('Banners', function () {
  var expect = window.expect;
  fixture.setBase('mock');
  var bannerResponse = fixture.load('bannerResponse.json');

  before(function(){
    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];

    //initialize search
    window.searchobj = new window.Unbxd.setSearch(window.config);

    //stub search ajax call with mock response
    this.stub = sinon.stub(jQuery, 'ajax').yieldsTo('success',bannerResponse);

  });

  after(function(){
    this.stub.restore();
    fixture.cleanup();
  });

  beforeEach(function(){
    window.searchobj.callResults(window.searchobj.paintResultSet);
  });

  it('Should update the Banner landingUrl', function(){
    expect(jQuery(window.searchobj.options.bannerSelector + ' a').attr('href'))
      .to.be.equal(bannerResponse.banner.banners[0].landingUrl);
  });

  it('Should update the Banner imageUrl', function(){
    expect(jQuery(window.searchobj.options.bannerSelector + ' img').attr('src'))
      .to.be.equal(bannerResponse.banner.banners[0].imageUrl);
  });
});
