
// Transforms tree selections into something Witchhammer can easily parse.

// Setup my extensions namespace.
if(!com) var com={};
if(!com.andrewbuntine) com.andrewbuntine={};
if(!com.andrewbuntine.witchhammer) com.andrewbuntine.witchhammer={};

window.addEventListener("load", function() { com.andrewbuntine.witchhammer.results_handler.init(); }, false);
window.addEventListener("dialogaccept", function() { com.andrewbuntine.witchhammer.results_handler.on_dialog_accept(); }, false);

com.andrewbuntine.witchhammer.results_handler = function(){
  var pub = {};
  var local_env = com.andrewbuntine.witchhammer.local_env;

  pub.init = function() {
    this.results_tree = document.getElementById("witchhammer_results_tree");

    document.getElementsByTagName("treechildren")[0].datasources = local_env.make_file_uri("bands.xml");
  };

  pub.on_dialog_accept = function() {
    var to_view = pub.find_selection_ranges();
    window.arguments[0].out = to_view;
  };

  pub.find_selection_ranges = function() {
    var selected = new Array();
    var range_count = this.results_tree.view.selection.getRangeCount();

    // Collect each selected treeitem into the array.
    for (var i=0; i<range_count; i++) {
      var start = {}; var end = {};
      this.results_tree.view.selection.getRangeAt(i, start, end);
  
      for(var c=start.value; c<=end.value; c++) {
        selected.push(this.results_tree.view.getItemAtIndex(c)
          .firstElementChild.firstElementChild.attributes["value"].value);
      }
    }

    return selected;
  };

  return pub;
}();
