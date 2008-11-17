
window.addEventListener("load", function() { event_handler.init(); }, false);

// Hardcoding this is totally shit: style.width returns null?!
const PANEL_WIDTH = 400;
const PANEL_HEIGHT = 340;

var event_handler = {

  init : function() {
    this.menu_item = document.getElementById('witchhammer_search_item');
    this.results_panel = document.getElementById('witchhammer_results_panel');
    this.results_frame = document.getElementById('witchhammer_results_frame');

    // Attach event handlers.
    document.getElementById("contentAreaContextMenu").addEventListener("popupshowing", function() { event_handler.on_menu_opening(); }, false);
    document.getElementById("witchhammer_search_item").addEventListener("command", function() { event_handler.on_search_item_clicked(); }, false);
  },

  on_menu_opening : function() {
    this.menu_item.disabled = (getBrowserSelection().length == 0);
  },

  // TODO: Write better encodeURIComponent method so spaces are replaced with + instead of %20
  on_search_item_clicked : function() {
    var x = parseInt((window.innerWidth / 2) - (PANEL_WIDTH / 2));
    var y = parseInt((window.innerHeight / 2) - (PANEL_HEIGHT / 2));
    var selection = encodeURIComponent(getBrowserSelection());
    var url = "http://www.metal-archives.com/search.php?string=" + selection + "&type=band";

    try {
      netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

      var ma_parser = Components.classes['@andrewbuntine.com/ma_parser;1'].getService().wrappedJSObject;
      var request = new XMLHttpRequest();

      request.open('GET', url, true);
      request.onreadystatechange = function (aEvt) {
        if (request.readyState == 4) {
          if(request.status == 200) {
            var success = ma_parser.parse_and_store(request.responseText, local_env.get_extension_path().path + "/chrome/content/tmp/bands.xml");

            // Display frame with results.
            if ( success ) {
              window.openDialog("chrome://witchhammer/content/results_list.xul", "Witchhammer Results", "centerscreen,chrome,dialog,modal").focus();
            }
          } else
            alert("Error loading page\n");
        }
      };

      request.send(null);

    } catch (anError) {
      alert("ERROR: " + anError);
    }
  }

};
