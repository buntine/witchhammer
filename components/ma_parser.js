Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function MAParser() { this.wrappedJSObject = this; }

MAParser.prototype = {
  classDescription: "A component that parses search results from metal-archives.com and formats them into a traversible XML document.",
  classID:          Components.ID("{ae910a75-1f06-49cb-b853-cc0b9585ede6}"),
  contractID:       "@andrewbuntine.com/ma_parser;1",
  QueryInterface: XPCOMUtils.generateQI(),

  // Parses the results page and translates the information we need into a easy-to-use XML file.
  // Abstracting the dirty details into a component keeps the Witchhammer extension much cleaner
  // If the parsed website modifies its markup, it's just a matter of updating the appropriate data
  // in this file.
  parse_and_store: function(html, filepath) {

    var table = /\<table(.*)\>.+\<\/table\>/;
    var tables = table.exec(html);

    if ( !tables)
      return false;
    else {
      var band_extractor = /\<tr.*?\>+?\<td.*?\>+?(.+?)\<\/td\>\<td.*?\>+?\<a href\=\'band\.php\?id\=(\d+?)\'\>(.+?)\<\/a\>\<\/td\>\<td.*?\>+?(.*?)\<\/td\>\<\/tr\>/g;
      var parser = Components.classes["@mozilla.org/xmlextras/domparser;1"].createInstance(Components.interfaces.nsIDOMParser);
      var serializer = Components.classes["@mozilla.org/xmlextras/xmlserializer;1"].createInstance(Components.interfaces.nsIDOMSerializer);
      var doc = parser.parseFromString("<bands></bands>", "text/xml");
      
      // Generate XML contents for each search result.
      while ((band_data = band_extractor.exec(tables[0])) != null) {
        var band = doc.createElement("band");

        band.setAttribute("id", band_data[2]);
        band.setAttribute("name", band_data[3]);
        band.setAttribute("alt", band_data[4]);

        doc.getElementsByTagName("bands")[0].appendChild(band);
      }

      var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
      var stream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);

      // Open local file for reading/writing.
      file.initWithPath(filepath);

      // Open output stream for writing(0x02), creating(0x08) and truncating(0x20).
      stream.init(file, 0x02 | 0x08 | 0x20, 0666, 0);

      // Serialize and write contents and close stream.
      serializer.serializeToStream(doc, stream, "");
      stream.close();

      return true;
    }
  },

  // Returns true if the supplied markup represents a "No Results" page.
  is_no_results_page : function(html) {
    return true;
  },

  // For whatever reason, the devs at metal-archives simply render a Javascript redirect on the
  // client-side in the case of only one result being found. This method will parse the returned
  // markup and extract the band ID that we need.
  find_band_in_single_result : function(html) {
    var id_extractor = /\<script\slanguage\=\'JavaScript\'\>\s?location.href\s?=\s?\'band\.php\?id\=(\d+)\'\;\<\/script\>/;
    var id = id_extractor.exec(html);

    return (id) ? parseInt(id[1]) : 0;
  }
};

var components = [MAParser];
function NSGetModule(compMgr, fileSpec) {
  return XPCOMUtils.generateModule(components);
}
