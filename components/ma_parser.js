Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function MAParser() { this.wrappedJSObject = this; }

MAParser.prototype = {
  classDescription: "A component that parses search results from metal-archives.com and formats them into a traversible XML document.",
  classID:          Components.ID("{ae910a75-1f06-49cb-b853-cc0b9585ede6}"),
  contractID:       "@andrewbuntine.com/ma_parser;1",
  QueryInterface: XPCOMUtils.generateQI(),
  parse: function(html) {

    var table = /\<table(.*)\>.+\<\/table\>/;
    var tables = table.exec(html);
    if ( !tables)
      return "";
    else {
      var bands = tables[0];
      var band_data = /\<tr.*?\>+?\<td.*?\>+?(.+?)\<\/td\>\<td.*?\>+?\<a href\=\'band\.php\?id\=(\d+?)\'\>(.+?)\<\/a\>\<\/td\>\<td.*?\>+?(.*?)\<\/td\>\<\/tr\>/g;
var ret = new Array();
while ((myArray = band_data.exec(bands)) != null)
{
  var msg = "ID: " + myArray[2] + ", NAME: " + myArray[3] + ", ALSO: " + myArray[4] + "\n";
  ret.push(msg);
}

      return ret;
    }
  }
};

var components = [MAParser];
function NSGetModule(compMgr, fileSpec) {
  return XPCOMUtils.generateModule(components);
}
