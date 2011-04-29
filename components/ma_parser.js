
// Parses the numerous results pages and translates the information we need into easy-to-use XML files.
//
// Abstracting the dirty details into a component keeps the Witchhammer extension much cleaner and
// allows me to make use of the native XML datasource binding available in most XUL components.
// Also, if the parsed website modifies its markup, it's just a matter of updating the appropriate
// data in this file.

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function MAParser() { this.wrappedJSObject = this; }

MAParser.prototype = {
  classDescription: "A component that parses search results from metal-archives.com and formats them into a traversible XML document. A poor-mans API.",
  classID:          Components.ID("{ae910a75-1f06-49cb-b853-cc0b9585ede6}"),
  contractID:       "@andrewbuntine.com/ma_parser;1",
  QueryInterface: XPCOMUtils.generateQI(),

  set_markup : function(html) {
    this.html = sanitize_response(html);
  },

  compile_band_data : function(filepath) {
    return this.generate_data("band", 0, filepath, function(element, band){
        element.setAttribute("url", extract_url(band[0]));
        element.setAttribute("name", extract_name(band[0]));
        element.setAttribute("alt", clean_alternate_name_data(band[0]));
        element.setAttribute("genre", band[1]);
        element.setAttribute("country", band[2]);
        return element;
      });
  },

  compile_album_data : function(filepath) {
    return this.generate_data("album", 1, filepath, function(element, album){
        element.setAttribute("url", extract_url(album[1]));
        element.setAttribute("band_name", extract_name(album[0]));
        element.setAttribute("album_name", extract_name(album[1]));
        element.setAttribute("type", album[2]);
        element.setAttribute("date", extract_date(album[3]));
        return element;
      });
  },

  compile_song_data : function(filepath) {
    return this.generate_data("song", 1, filepath, function(element, song){
        element.setAttribute("url", extract_url(song[1]));
        element.setAttribute("band_name", extract_name(song[0]));
        element.setAttribute("album_name", extract_name(song[1]));
        element.setAttribute("type", song[2]);
        element.setAttribute("song_name", song[3]);
        return element;
      });
  },

  // Generates XML data for a specific type of resource. A function is accepted, which
  // sets the attributes on each result.
  generate_data : function(type, on_error, filepath, fn) {
    try { var data = JSON.parse(this.html); } catch (e) { return false; }

    // Just return the URL for the first result if it is the only one.
    if (data["iTotalRecords"] === 1) {
      return extract_url(songs_data["aaData"][0][on_error]);
    } else {
      var plural = type + "s";
      var doc = initialise_dom("<" + plural + "></" + plural + ">");
      
      // Generate XML contents for each search result.
      for (var i=0; i<data["aaData"].length; i++) {
        var result = data["aaData"][i];
        var element = fn(this.create_element_by_type(doc, type), result);

        doc.getElementsByTagName(plural)[0].appendChild(element);
      }

      write_dom_to_output_stream(filepath, doc);

      return true;
    }
  },

  // Just a convenience method. The Mozilla validators prevent me from using
  // eval here.
  compile_data : function(type, filepath) {
    if (type === "band")
      return this.compile_band_data(filepath);
    else if (type === "album")
      return this.compile_album_data(filepath);
    else
      return this.compile_song_data(filepath);
  },

  // This function is required by the Mozilla validators. I cannot use a variable
  // when creating new elements. I must use literal values, unfortunately!
  create_element_by_type : function (doc, type) {
    if (type === "band")
      return doc.createElement("band");
    else if (type === "album")
      return doc.createElement("album");
    else
      return doc.createElement("song");
  },

};

var components = [MAParser];
function NSGetModule(compMgr, fileSpec) {
  return XPCOMUtils.generateModule(components);
}

function write_dom_to_output_stream(filepath, doc) {
  var serializer = Components.classes["@mozilla.org/xmlextras/xmlserializer;1"].createInstance(Components.interfaces.nsIDOMSerializer);
  var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
  var stream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);

  // Open local file for reading/writing.
  file.initWithPath(filepath);

  // Open output stream for writing(0x02), creating(0x08) and truncating(0x20).
  stream.init(file, 0x02 | 0x08 | 0x20, 0666, 0);

  // Serialize and write contents and close stream.
  serializer.serializeToStream(doc, stream, "");
  stream.close();
}

function initialise_dom(contents) {
  var parser = Components.classes["@mozilla.org/xmlextras/domparser;1"].createInstance(Components.interfaces.nsIDOMParser);
  return parser.parseFromString(contents, "text/xml");
}

// Cleans out the unnecessary data from the "altername names" markup chunk.
function clean_alternate_name_data(result) {
  var alt_names = /\(\<strong\>a\.k\.a\.\<\/strong\>\s?(.+)\)/.exec(result);

  if (alt_names) {
    return alt_names[1];
  } else {
    return "";
  }
}

// Extracts a URL out of an anchor element.
function extract_url(result) {
  return /^\<a\shref=\"(.+)\"/.exec(result)[1];
}

// Extracts a band name out of an anchor element.
// The additional logic is required in order to parse
// multiple band names out of split albums (know a better way?).
function extract_name(result) {
  var regex = /.*?\<a.+?\>(.+?)\<\/a\>/y;
  var bands = "";
  regex.lastIndex = 0;

  while ((band = regex.exec(result)) != null) {
    bands += ((bands.length === 0) ? band[1] : " / " + band[1])
  }

  return bands;
}

// Extracts a release date.
function extract_date(result) {
  return result.replace(/\s<!.+$/, "");
}

// At the time of writing, Metal-Archives.com was returning PHP errors at
// the top of their JSON response. I am filtering it out here.
function sanitize_response(html) {
  return html.replace(/^.*\{/, "{");
}
