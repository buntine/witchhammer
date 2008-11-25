
window.addEventListener("load", function() { event_handler.init(); }, false);

var event_handler = {

  init : function() {
    this.root_url = "http://www.metal-archives.com";
    this.menu_item = document.getElementById("witchhammer_menu");
    this.results_panel = document.getElementById("witchhammer_results_panel");
    this.results_frame = document.getElementById("witchhammer_results_frame");

    // Attach event handlers.
    document.getElementById("contentAreaContextMenu").addEventListener("popupshowing", function() { event_handler.on_menu_opening(); }, false);
    document.getElementById("witchhammer_search_item").addEventListener("command", function() { event_handler.on_search_item_clicked(); }, false);
  },

  on_menu_opening : function() {
    this.menu_item.disabled = (getBrowserSelection().length == 0);
  },

  on_search_item_clicked : function() {
    var selection = local_env.urlencode(getBrowserSelection());
    var url = this.root_url + "/search.php?string=" + selection + "&type=band";

    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

    var request = new XMLHttpRequest();

    request.open("GET", url, true);
    request.onreadystatechange = function (aEvt) {
      if (request.readyState == 4) {
        if(request.status == 200) {
          var ma_parser = Components.classes["@andrewbuntine.com/ma_parser;1"].getService().wrappedJSObject;
          var filepath = local_env.build_path(["chrome", "content", "tmp", "bands.xml"]);
          var success = ma_parser.parse_and_store(request.responseText, local_env.get_extension_path().path + filepath);

          // Display frame with results.
          if (success) {
            var params = { out : null };
            window.openDialog("chrome://witchhammer/content/results_list.xul", "Witchhammer Results", "centerscreen,chrome,dialog,modal", params).focus();

            // User selected one or more bands and clicked "ok".
            if (params.out)
              event_handler.display_bands(params.out);

          } else if (ma_parser.is_no_results_page(request.responseText)) {
            local_env.display_alert("No bands found!");

          // Finally, make sure the failure was not because only one band
          // was found (MA simply returns a JavaScript redirect in this case).
          } else {
            var band_id = ma_parser.find_band_in_single_result(request.responseText);

            if (band_id > 0)
              event_handler.display_band_in_tab(band_id);
            else
              local_env.display_alert("Could not parse Metal Archives results page!");
          }
        } else
          local_env.display_alert("Error loading page");
      }
    };

    request.send(null);
  },

  display_bands : function(bands) {
    for (var i=0; i<bands.length; i++)
      this.display_band_in_tab(bands[i]);
  },

  display_band_in_tab : function(band_id) {
    getBrowser().addTab(event_handler.root_url + "/band.php?id=" + band_id);
  }

};
