
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
    try {
      var bands_data = JSON.parse(this.html);
    } catch (err) {
      return false;
    }

    // Just return the URL for the first result if it is the only one.
    if (bands_data["iTotalRecords"] == 1) {
      return extract_url(bands_data["aaData"][0]);
    } else {
      var doc = initialise_dom("<bands></bands>");
      
      // Generate XML contents for each search result.
      for (var i=0; i<bands_data["aaData"].length; i++) {
        var band_data = bands_data["aaData"][i];
        var band = doc.createElement("band");

        band.setAttribute("url", extract_url(band_data[0]));
        band.setAttribute("name", extract_name(band_data[0]));
        band.setAttribute("alt", clean_alternate_name_data(band_data[0]));
        band.setAttribute("genre", band_data[1]);
        band.setAttribute("country", band_data[2]);

        doc.getElementsByTagName("bands")[0].appendChild(band);
      }

      write_dom_to_output_stream(filepath, doc);

      return true;
    }
  },

  compile_album_data : function(filepath) {
    var tables = this.fetch_tables();

    if ( !tables)
      return false;
    else {
      var album_extractor = /\<tr.*?\>+?\<td.*?\>+?(.+?)\<\/td\>\<td.*?\>+?\<a.*?\>(.*?)\<\/a\>\<\/td\>\<td.*?\>+?\<a href=\'release\.php\?id\=(\d+?)\'\>(.+?)\<\/a\>\<\/td\>\<\/tr\>/g;
      var doc = initialise_dom("<albums></albums>");
      
      // Generate XML contents for each search result.
      while ((album_data = album_extractor.exec(tables[0])) != null) {
        var album = doc.createElement("album");

        album.setAttribute("id", album_data[3]);
        album.setAttribute("band_name", album_data[2]);
        album.setAttribute("album_name", filter_strong_elements(album_data[4]));

        doc.getElementsByTagName("albums")[0].appendChild(album);
      }

      write_dom_to_output_stream(filepath, doc);

      return true;
    }
  },

  compile_song_data : function(filepath) {
    var tables = this.fetch_tables();

    if ( !tables)
      return false;
    else {
      var song_extractor = /\<tr.*?\>+?\<td.*?\>+?(.+?)\<\/td\>\<td.*?\>+?\<a.*?\>(.*?)\<\/a\>\<\/td\>\<td.*?\>+?\<a href=\'release\.php\?id\=(\d+?)\'\>(.+?)\<\/a\>\<\/td\>\<td.*?\>(.*?)\<\/td\>\<\/tr\>/g;
      var doc = initialise_dom("<songs></songs>");
      
      // Generate XML contents for each search result.
      while ((song_data = song_extractor.exec(tables[0])) != null) {
        var song = doc.createElement("song");

        song.setAttribute("id", song_data[3]);
        song.setAttribute("band_name", song_data[2]);
        song.setAttribute("album_name", filter_strong_elements(song_data[4]));
        song.setAttribute("song_name", filter_strong_elements(song_data[5]));

        doc.getElementsByTagName("songs")[0].appendChild(song);
      }

      write_dom_to_output_stream(filepath, doc);

      return true;
    }
  },

  // Just a convenience method so I don't need evals or case statements anywhere else.
  compile_data : function(type, filepath) {
    var valid_types = /^(band|album|song)$/;
    if ( valid_types.test(type) ) 
      return eval("this.compile_" + type + "_data(filepath)");
  },

  // Returns true if the supplied markup represents a "No Results" page.
  // ** MARKED FOR DELETION **
  is_no_results_page : function() {
    var no_results_matcher = /\<.*?\>(\n)?no\sresults\sfound\.\<\/.*?\>/im;
    return no_results_matcher.test(this.html);
  },

  // Returns an array of matching tables in the HTML.
  // ** MARKED FOR DELETION **
  fetch_tables : function() {
    var table = /\<table(.*)\>.+\<\/table\>/;
    return table.exec(this.html);
  },

  // For whatever reason, the devs at metal-archives simply render a Javascript redirect on the
  // client-side in the case of only one result being found (2x200 instead of 1x301). This method
  // will parse the returned markup and extract the ID that we need.
  // ** MARKED FOR DELETION **
  find_id_in_single_result : function() {
    var id_extractor = /\<script\slanguage\=\'JavaScript\'\>\s?location.href\s?=\s?\'(band|release)\.php\?id\=(\d+)\'\;\<\/script\>/;
    var id = id_extractor.exec(this.html);

    return (id) ? parseInt(id[2]) : 0;
  }
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

// Cleans out strong elements from the passed in markup.
  // ** MARKED FOR DELETION **
function filter_strong_elements(html) {
  if (html)
    return html.replace(/\<[\/]?strong\>/g, '');
  else
    return "";
}

// Extracts a URL out of an anchor element.
function extract_url(result) {
  var url = /^\<a\shref=\"(.+)\"/.exec(result);
  return url[1];
}

// Extracts a band name out of an anchor element.
function extract_name(result) {
  var name = /^\<a.+\>(.+)\<\/a\>/.exec(result);
  return name[1];
}

// At the time of writing, Metal-Archives.com was returning PHP errors at
// the top of their JSON response. I am filtering it out here.
function sanitize_response(html) {
  return html.replace(/^.*\{/, "{");
}
