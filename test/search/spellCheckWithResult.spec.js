describe('SpellCheck - with results', function () {
  var expect = window.expect;
  var spellCheckTest;

  before(function(){

    fixture.setBase('mock');
    spellCheckTest = fixture.load('spellCheckWithResults.json');
    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];
    
    //initialize search
    window.searchobj = new window.Unbxd.setSearch(window.config);
    
    //stub search ajax call with mock response
    this.stub = sinon.stub(jQuery, 'ajax').yieldsTo('success', spellCheckTest);
    window.searchobj.callResults(window.searchobj.paintResultSet);
  });

  after(function(){
    this.stub.restore();
  });
  
  it('Should display didYouMean', function(){
    expect(jQuery(window.searchobj.options.spellCheck).text())
    .to.equal('Did you mean : '+ spellCheckTest.didYouMean[0].suggestion +' ?');
  });
  
  it('Should load actual query results',function(){
    expect(window.searchobj.params.query)
    .to.equal(spellCheckTest.searchMetaData.queryParams.q);
  });
});
