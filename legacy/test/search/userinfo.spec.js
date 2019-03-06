describe('UserInfo as params', function () {

  before(function(done){
    this.searchTest = fixture.load('mock/searchTestResponse.json');
    this.userInfo = fixture.load('mock/userInfo.json');

    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];

    //initialize search
    this.searchobj = new window.Unbxd.setSearch(window.config);
    
    //stub search ajax call with mock response
    this.stub = sinon.stub(jQuery, 'ajax').yieldsTo('success',this.searchTest);
    //spy OnIntialResultLoad
    this.spyOnIntialResultLoad = sinon.spy(this.searchobj.options,
     'onIntialResultLoad');

    //stub getUserId
    this.stubGetUserId = sinon.stub(this.searchobj,
      'getUserId');
    this.stubGetUserId.returns(this.userInfo.uid);
    //stub getUserType
    this.stubGetUserType = sinon.stub(this.searchobj,
      'getUserType');
    this.stubGetUserType.returns(this.userInfo.userType);

    this.searchobj.callResults(this.searchobj.paintResultSet);
    done();
  });

  after(function(){
    this.stub.restore();
    fixture.cleanup();
  });
  
  it('Should pass user-info as query params', function(){
    var userInfoSent = {
      'uid': this.userInfo.uid,
      'user-type': this.userInfo.userType,
      'unbxd-url': document.URL,
      'unbxd-referrer': document.referrer,
      'api-key': this.searchobj.options.APIKey
    },
      userInfoInUrl = {},
      searchApi = jQuery.ajax.getCall(0).args[0].url,
      params;
    if(searchApi.indexOf('search.unbxdapi.com')){
      params = searchApi.split('?').length > 0 ? searchApi.split('?')[1] : '';
      params.split('&').forEach(function(param){
        var queryName = param.split('=')[0],
          queryValue = decodeURIComponent(param.split('=')[1]);

        if(queryName in userInfoSent){
          userInfoInUrl[queryName] = queryValue;
        }
      });
    }
    expect(userInfoSent).to.deep.equal(userInfoInUrl);
  });

});
