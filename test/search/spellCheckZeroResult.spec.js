describe('SpellCheck - Zero results', function () {

  before(function(){

    this.spellCheckTest = fixture.load('mock/spellCheckWithZeroResults.json');
    this.searchTest = fixture.load('mock/searchTestResponse.json');
    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];
    //initialize search
    this.searchobj = new window.Unbxd.setSearch(window.config);

    //stub search ajax call with mock response
    this.stub = sinon.stub(jQuery, 'ajax').yieldsTo('success',this.searchTest);

    //First call should return spellcheck with zeroresuts
    this.stub.onFirstCall().yieldsTo('success',this.spellCheckTest);

    this.searchobj.callResults(this.searchobj.paintResultSet);
  });

  after(function(){
    this.stub.restore();
    fixture.cleanup();
  });
  
  it('Should display didYouMean', function(){
    expect(jQuery(this.searchobj.options.spellCheck).text())
    .to.equal('Did you mean : '+ this.spellCheckTest
      .didYouMean[0].suggestion +' ?');
  });

  it('Should load results of didYouMean query',function(){
    expect(this.searchobj.params.query)
      .to.equal(this.spellCheckTest.didYouMean[0].suggestion);
  });
});
