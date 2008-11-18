
// Holds environment-oriented methods.

var local_env = {

  // Returns users O/S.
  get_os: function() {
    return Components.classes["@mozilla.org/xre/app-info;1"]
             .getService(Components.interfaces.nsIXULRuntime).OS; 
  },

  // Returns the local path where this extension is installed.
  get_extension_path: function() {
    const id = "witchhammer@andrewbuntine.com";

    return Components.classes["@mozilla.org/extensions/manager;1"]
      .getService(Components.interfaces.nsIExtensionManager)
      .getInstallLocation(id)
      .getItemLocation(id); 
  },

  // Returns a filepath for the native O/S
  build_path : function(path) {
    var seperator = (this.get_os == "WINNT") ? "\\" : "/";
    return seperator + path.join(seperator);
  },

  // Smart URL encode.
  // From: http://kevin.vanzonneveld.net
  urlencode : function (str) {
    var histogram = {}, histogram_r = {}, code = 0, tmp_arr = [];
    var ret = str.toString();
    
    var replacer = function(search, replace, str) {
      var tmp_arr = [];
      tmp_arr = str.split(search);
      return tmp_arr.join(replace);
    };
    
    // The histogram is identical to the one in urldecode.
    histogram["!"]   = "%21";
    histogram["%20"] = "+";
    
    // Begin with encodeURIComponent, which most resembles PHP's encoding functions
    ret = encodeURIComponent(ret);
    
    for (search in histogram) {
      replace = histogram[search];
      ret = replacer(search, replace, ret) // Custom replace. No regexing
    }
    
    // Uppercase for full PHP compatibility
    return ret.replace(/(\%([a-z0-9]{2}))/g, function(full, m1, m2) {
      return "%"+m2.toUpperCase();
    });
    
    return ret;
  }

};
