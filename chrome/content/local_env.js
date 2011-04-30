
// Defines (mostly) environment-oriented methods.

// Setup my extensions namespace.
if(!com) var com={};
if(!com.andrewbuntine) com.andrewbuntine={};
if(!com.andrewbuntine.witchhammer) com.andrewbuntine.witchhammer={};

com.andrewbuntine.witchhammer.local_env = function(){
  var pub = {};

  // Returns users O/S.
  pub.get_os = function() {
    return Components.classes["@mozilla.org/xre/app-info;1"]
             .getService(Components.interfaces.nsIXULRuntime).OS; 
  };

  // Returns the local path of the users Firefox profile.
  pub.get_profile_path = function() {
    return Components.classes["@mozilla.org/file/directory_service;1"]
      .getService(Components.interfaces.nsIProperties)
      .get("ProfD", Components.interfaces.nsIFile);
  };

  // Returns a file URI from the users profile path. E.g file:///path/to/profile/file
  pub.make_file_uri = function(file) {
    var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                      .getService(Components.interfaces.nsIIOService);
    return ioService.newFileURI(pub.get_profile_path()).spec + file;
  };

  // Returns a filepath for the native O/S
  pub.build_path = function(path) {
    var seperator = (pub.get_os() == "WINNT") ? "\\" : "/";
    return seperator + path.join(seperator);
  };

  // Displays a personalised alert.
  pub.display_alert = function(message) {
    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                    .getService(Components.interfaces.nsIPromptService);

    prompts.alert(null, "Witchhammer", message);
  };

  // Changes the documents cursor.
  pub.set_cursor = function(type) {
    window.content.document.getElementsByTagName("html")[0].style.cursor = type;
  };

  // Smart URL encode.
  // From: http://kevin.vanzonneveld.net
  pub.urlencode = function (str) {
    var histogram = {}, histogram_r = {}, code = 0, tmp_arr = [];
    var ret = str.toString();
    var replace, ret;
    
    var replacer = function(search, replace, str) {
      var tmp_arr = [];
      tmp_arr = str.split(search);
      return tmp_arr.join(replace);
    };
    
    // The histogram is identical to the one in urldecode.
    histogram["!"]   = "%21";
    histogram["%20"] = "+";

    // Umlauts.
    histogram["%C3%B6"] = "%F6";
    histogram["%C3%A4"] = "%E4";
    histogram["%C3%BC"] = "%FC";
    
    // Begin with encodeURIComponent, which most resembles PHP's encoding functions
    ret = encodeURIComponent(ret);
    
    for (var search in histogram) {
      replace = histogram[search];
      ret = replacer(search, replace, ret) // Custom replace. No regexing
    }
    
    // Uppercase for full PHP compatibility
    return ret.replace(/(\%([a-z0-9]{2}))/g, function(full, m1, m2) {
      return "%"+m2.toUpperCase();
    });

    return ret;
  };

  return pub;
}();
