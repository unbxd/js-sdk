describe('SpellCheck - Zero results', function () {
  var expect = window.expect;
  var spellCheckTest;
  var searchTest;

  before(function(){

    fixture.setBase('mock');
    spellCheckTest = fixture.load('spellCheckWithZeroResults.json');
    searchTest = fixture.load('searchTestResponse.json');
    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];
    
    //initialize search
    window.searchobj = new window.Unbxd.setSearch(window.config);

    //stub search ajax call with mock response
    this.stub = sinon.stub(jQuery, 'ajax').yieldsTo('success',searchTest);

    //First call should return spellcheck with zeroresuts
    this.stub.onFirstCall().yieldsTo('success',spellCheckTest);

    window.searchobj.callResults(window.searchobj.paintResultSet);
  });

  after(function(){
    this.stub.restore();
  });
  
  it('Should display didYouMean', function(){
    expect(jQuery(window.searchobj.options.spellCheck).text())
    .to.equal('Did you mean : '+ spellCheckTest.didYouMean[0].suggestion +' ?');
  });

  it('Should load results of didYouMean query',function(){
    expect(window.searchobj.params.query)
      .to.equal(spellCheckTest.didYouMean[0].suggestion);
  });
});
