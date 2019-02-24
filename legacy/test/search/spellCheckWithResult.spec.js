describe('SpellCheck - with results', function () {

  before(function(done){
    this.spellCheckTest = fixture.load('mock/spellCheckWithResults.json');
    //setup document to hold search results
    document.body.innerHTML = __html__['index.html'];
    //initialize search
    this.searchobj = new window.Unbxd.setSearch(window.config);
    
    //stub search ajax call with mock response
    this.stub = sinon.stub(jQuery, 'ajax')
      .yieldsTo('success', this.spellCheckTest);
    this.searchobj.callResults(this.searchobj.paintResultSet);
    done();
  });

  after(function(){
    this.stub.restore();
    fixture.cleanup();
  });
  
  it('Should display didYouMean', function(){
    expect(jQuery(this.searchobj.options.spellCheck).text()).to
      .equal('Did you mean : '+ this.spellCheckTest
        .didYouMean[0].suggestion +' ?');
  });
  
  it('Should load actual query results',function(){
    expect(this.searchobj.params.query)
    .to.equal(this.spellCheckTest.searchMetaData.queryParams.q);
  });
});
