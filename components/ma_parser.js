Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function MAParser() { this.wrappedJSObject = this; }

MAParser.prototype = {
  classDescription: "A component that parses search results from metal-archives.com and formats them into a traversible XML document.",
  classID:          Components.ID("{ae910a75-1f06-49cb-b853-cc0b9585ede6}"),
  contractID:       "@andrewbuntine.com/ma_parser;1",
  QueryInterface: XPCOMUtils.generateQI(),
  parse_and_store: function(html, filepath) {

    var table = /\<table(.*)\>.+\<\/table\>/;
    var tables = table.exec(html);
    if ( !tables)
      return "";
    else {
      var band_extractor = /\<tr.*?\>+?\<td.*?\>+?(.+?)\<\/td\>\<td.*?\>+?\<a href\=\'band\.php\?id\=(\d+?)\'\>(.+?)\<\/a\>\<\/td\>\<td.*?\>+?(.*?)\<\/td\>\<\/tr\>/g;
      var parser = Components.classes["@mozilla.org/xmlextras/domparser;1"].createInstance(Components.interfaces.nsIDOMParser);
      var serializer = Components.classes["@mozilla.org/xmlextras/xmlserializer;1"].createInstance(Components.interfaces.nsIDOMSerializer);
      var doc = parser.parseFromString("<bands></bands>", "text/xml");
      
      // Generate XML contents for each search result.
      while ((band_data = band_extractor.exec(tables[0])) != null) {
        var band = doc.createElement("band");
        var id = doc.createElement("id");
        var name = doc.createElement("name");
        var alt_names = doc.createElement("alt");

        id.textContent = band_data[2];
        name.textContent = band_data[3];
        alt_names.textContent = band_data[4];

        band.appendChild(id);
        band.appendChild(name);
        band.appendChild(alt_names);

        doc.getElementsByTagName("bands")[0].appendChild(band);
      }

//      var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
//      var stream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);

      // Open local file for reading/writing.
//      file.initWithPath(filepath);

      // Open output stream for writing(0x02), creating(0x08) and truncating(0x20).
//      stream.init(file, 0x02 | 0x08 | 0x20, 0666, 0);

      // Serialize and write contents and close stream.
//      serializer.serializeToStream(doc, stream, "");
//      stream.close();

      return serializer.serializeToString(doc);
    }
  }
};

var components = [MAParser];
function NSGetModule(compMgr, fileSpec) {
  return XPCOMUtils.generateModule(components);
}
