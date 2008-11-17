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

};
