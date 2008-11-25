
window.addEventListener("load", function() { event_handler.init(); }, false);

var event_handler = {

  init : function() {
    this.root_url = "http://www.metal-archives.com";
    this.menu_item = document.getElementById("witchhammer_menu");
    this.results_panel = document.getElementById("witchhammer_results_panel");
    this.results_frame = document.getElementById("witchhammer_results_frame");

    // Attach event handlers.
    document.getElementById("contentAreaContextMenu").addEventListener("popupshowing", function() { event_handler.on_menu_opening(); }, false);
    document.getElementById("witchhammer_submenu_bands").addEventListener("command", function() { event_handler.on_search_item_clicked("band"); }, false);
    document.getElementById("witchhammer_submenu_albums").addEventListener("command", function() { event_handler.on_search_item_clicked("album"); }, false);
  },

  on_menu_opening : function() {
    this.menu_item.disabled = (getBrowserSelection().length == 0);
  },

  on_search_item_clicked : function(type) {
    var selection = local_env.urlencode(getBrowserSelection());
    var url = this.root_url + "/search.php?string=" + selection + "&type=" + type;

    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

    var request = new XMLHttpRequest();
    request.open("GET", url, true);

    request.onreadystatechange = function (event) {
      if (request.readyState == 4) {
        if(request.status == 200) {
          var ma_parser = Components.classes["@andrewbuntine.com/ma_parser;1"].getService().wrappedJSObject;
          ma_parser.set_markup(request.responseText);

          switch ( type ) {
            case "band":
              event_handler.overlay_band_data(ma_parser);
              break;
            case "album":
              event_handler.overlay_album_data(ma_parser);
              break;
          }
        } else
          local_env.display_alert("Error loading page");
      }
    }

    request.send(null);
  },

  overlay_band_data : function(ma_parser) {
    var filepath = local_env.build_path(["chrome", "content", "tmp", "bands.xml"]);
    var success = ma_parser.parse_and_store(local_env.get_extension_path().path + filepath);

    // Display frame with results.
    if (success) {
      var params = { out : null };
      window.openDialog("chrome://witchhammer/content/results_list.xul", "Witchhammer Results", "centerscreen,chrome,dialog,modal", params).focus();

      // User selected one or more bands and clicked "ok".
      if (params.out)
        this.display_tab_group("band", params.out);

    } else if (ma_parser.is_no_results_page()) {
      local_env.display_alert("No bands found!");

    // Finally, make sure the failure was not because only one band
    // was found (MA simply returns a JavaScript redirect in this case).
    } else {
      var band_id = ma_parser.find_band_in_single_result();

      if (band_id > 0)
        this.display_new_tab_for("band", band_id);
      else
        local_env.display_alert("Could not parse Metal Archives results page!");
    }
  },

  overlay_album_data : function(ma_parser) {
    var filepath = local_env.build_path(["chrome", "content", "tmp", "albums.xml"]);
    var success = ma_parser.parse_and_store(local_env.get_extension_path().path + filepath);

    // Display frame with results.
    if (success) {
      var params = { out : null };
      window.openDialog("chrome://witchhammer/content/results_list.xul", "Witchhammer Results", "centerscreen,chrome,dialog,modal", params).focus();

      // User selected one or more bands and clicked "ok".
      if (params.out)
        this.display_tab_group("album", params.out);

    } else if (ma_parser.is_no_results_page()) {
      local_env.display_alert("No albums found!");

    // Finally, make sure the failure was not because only one band
    // was found (MA simply returns a JavaScript redirect in this case).
    } else {
      var album_id = ma_parser.find_album_in_single_result();

      if (album_id > 0)
        this.display_new_tab_for("album", album_id);
      else
        local_env.display_alert("Could not parse Metal Archives results page!");
    }
  },

  display_tab_group : function(page, ids) {
    for (var i=0; i<ids.length; i++)
      this.display_new_tab_for(page, ids[i]);
  },

  display_new_tab_for : function(page, id) {
    // Just to conform with metal-archives.com file structure.
    if ( page == "album" ) { page = "release"; }

    getBrowser().addTab(event_handler.root_url + "/" + page + ".php?id=" + id);
  }

};
