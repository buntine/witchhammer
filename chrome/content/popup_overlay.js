
// Handles the user interaction with Witchhammer.

// Setup my extensions namespace.
if(!com) var com={};
if(!com.andrewbuntine) com.andrewbuntine={};
if(!com.andrewbuntine.witchhammer) com.andrewbuntine.witchhammer={};

window.addEventListener("load", function() { com.andrewbuntine.witchhammer.event_handler.init(); }, false);

com.andrewbuntine.witchhammer.event_handler = function(){
  var pub = {};
  var local_env = com.andrewbuntine.witchhammer.local_env;

  pub.init = function() {
    this.root_url = "http://v2.metal-archives.com";
    this.menu_item = document.getElementById("witchhammer_menu");

    // Attach event handlers.
    document.getElementById("contentAreaContextMenu").addEventListener("popupshowing", function() { pub.on_menu_opening(); }, false);
    document.getElementById("witchhammer_submenu_bands").addEventListener("command", function() { pub.on_search_item_clicked("band", "name"); }, false);
    document.getElementById("witchhammer_submenu_albums").addEventListener("command", function() { pub.on_search_item_clicked("album", "title"); }, false);
    document.getElementById("witchhammer_submenu_songs").addEventListener("command", function() { pub.on_search_item_clicked("song", "title"); }, false);
  };

  pub.on_menu_opening = function() {
    this.menu_item.disabled = (getBrowserSelection().length == 0);
  };

  pub.on_search_item_clicked = function(type, field) {
    var selection = local_env.urlencode(getBrowserSelection());
    var url = this.root_url + "/search/ajax-" + type + "-search/?field=" + field +
              "&query=" + selection + "&sEcho=1&iDisplayStart=0&iDisplayLength=1000";

    var request = new XMLHttpRequest();
    request.open("GET", url, true);

    local_env.set_cursor("progress");

    // Setup event to handle AJAX response.
    request.onreadystatechange = function (event) {
      if (request.readyState == 4) {
        local_env.set_cursor("default");

        if(request.status == 200)
          pub.overlay_data(type, request.responseText)
        else
          local_env.display_alert("Error loading page! Make sure the site is up.");
      }
    }

    request.send(null);
  };

  pub.overlay_data = function(type, html) {
    var ma_parser = Components.classes["@andrewbuntine.com/ma_parser;1"].getService().wrappedJSObject;
    ma_parser.set_markup(html);

    var plural_type = type + "s";
    var filepath = "/" + plural_type + ".xml";
    var parse_status = ma_parser.compile_data(type, local_env.get_profile_path().path + filepath);

    // If only one result is found then it's full URL is returned.
    if (typeof parse_status == "string") {
        pub.display_new_tab_for(parse_status);

    // Display frame with multiple results.
    } else if (parse_status) {
      pub.display_results_list(type);

    // If nothing was found, just inform the user.
    } else {
      local_env.display_alert("No " + plural_type + " found, thrasher!");
    }
  };

  pub.display_results_list = function(type) {
    var file = "chrome://witchhammer/content/" + type + "_results.xul";
    var params = { out : null };
    window.openDialog(file, "", "centerscreen,chrome,dialog,modal", params).focus();

    // User selected one or more items and clicked "ok".
    if (params.out)
      pub.display_tab_group(params.out);
  };

  pub.display_tab_group = function(urls) {
    for (var i=0; i<urls.length; i++)
      pub.display_new_tab_for(urls[i]);
  };

  pub.display_new_tab_for = function(url) {
    getBrowser().addTab(url);
  };

  return pub;
}();
