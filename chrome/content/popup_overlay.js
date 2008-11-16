
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
            var xml_data = ma_parser.parse_and_store(request.responseText, local_env.get_extension_path().path + "/chrome/tmp/bands.xml");

            // Display frame with results.
            if (xml_data.length > 0) {
alert(xml_data);
        //      event_handler.results_panel.openPopup(null, "before_end", x, y, false, false);	
 
var dom_parser = new DOMParser();
var dom = dom_parser.parseFromString(xml_data, "text/xml");

              var bands = dom.getElementsByTagName("band");
             
alert(bands.length);
              for (var i=0; i<bands.length; i++) {
                var li = event_handler.results_frame.contentDocument.createElement("li");
                var a = event_handler.results_frame.contentDocument.createElement("a");
                a.setAttribute("href", "#");
                a.textContent = i;
                li.appendChild(a);
                event_handler.results_frame.contentDocument.getElementById("witchhammer_bands").appendChild(li);
              }
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
