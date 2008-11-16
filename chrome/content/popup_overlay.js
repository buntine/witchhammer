
window.addEventListener("load", function() { event_handler.init(); }, false);

// Hardcoding this is totally shit: style.width returns null?!
const PANEL_WIDTH = 400;
const PANEL_HEIGHT = 340;

var event_handler = {

  init : function() {
    this.menu_item = document.getElementById('witchhammer_search_item');
    this.results_panel = document.getElementById('witchhammer_results_panel');

    // Attach event handlers.
    document.getElementById("contentAreaContextMenu").addEventListener("popupshowing", function() { event_handler.on_menu_opening(); }, false);
    document.getElementById("witchhammer_search_item").addEventListener("command", function() { event_handler.on_search_item_clicked(); }, false);
  },

  on_menu_opening : function() {
    this.menu_item.disabled = (getBrowserSelection().length == 0);
  },

  on_search_item_clicked : function() {
    var x = parseInt((window.innerWidth / 2) - (PANEL_WIDTH / 2));
    var y = parseInt((window.innerHeight / 2) - (PANEL_HEIGHT / 2));

    try {
      netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

      var ma_parser = Components.classes['@andrewbuntine.com/ma_parser;1'].getService().wrappedJSObject;
      var request = new XMLHttpRequest();

      request.open('GET', 'http://www.metal-archives.com/search.php?string=diamond&type=band', true);
      request.onreadystatechange = function (aEvt) {
        if (request.readyState == 4) {
          if(request.status == 200) {
            alert(ma_parser.parse(request.responseText, local_env.get_extension_path().path + "/tmp/bands.xml"));

            // Display frame with results.
       //   event_handler.results_panel.openPopup(null, "before_end", x, y, false, false);	
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
