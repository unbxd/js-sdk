describe('jQuery version', function() {

  it('jQuery version - check minimum jQuery version required', function() {
    var validVersions = ['1.7.0', '1.11.1'];
    var inValidVersions = ['1.4.0', '0.7.1'];
    validVersions.forEach(function(version) {
      expect(window.Unbxd.isJqueryRequiredVersion(version)).to.be.true;
    });

    inValidVersions.forEach(function(version) {
      expect(window.Unbxd.isJqueryRequiredVersion(version)).to.be.false;
    });
  });
});
