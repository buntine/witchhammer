Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function HelloWorld() { this.wrappedJSObject = this; }

HelloWorld.prototype = {
  classDescription: "My Hello World Javascript XPCOM Component",
  classID:          Components.ID("{c863a81f-4dae-4d25-8aaf-088911ecaf51}"),
  contractID:       "@andrewbuntine.com/helloworld;1",
  QueryInterface: XPCOMUtils.generateQI(),
  hello: function(html) {

    var table = /\<table(.*)\>.+\<\/table\>/g;
    var tables = table.exec(html);
    if ( !tables )
      return "";
    else {
      var bands = tables[1];

      return bands.substr(0, 100);
    }
  }
};
var components = [HelloWorld];
function NSGetModule(compMgr, fileSpec) {
  return XPCOMUtils.generateModule(components);
}

