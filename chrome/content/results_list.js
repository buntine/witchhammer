
window.addEventListener("load", function() { results_handler.init(); }, false);
window.addEventListener("dialogaccept", function() { results_handler.on_dialog_accept(); }, false);

var results_handler = {

  init : function() {
    this.results_tree = document.getElementById("witchhammer_results_tree");
  },

  on_dialog_accept : function() {
    var to_view = this.find_selection_ranges();

    alert(to_view);
  },

  find_selection_ranges : function() {
    var selected = new Array();
    var range_count = this.results_tree.view.selection.getRangeCount();

    // Collect each selected treeitem into the array.
    for (var i=0; i<range_count; i++) {
      var start = {}; var end = {};
      this.results_tree.view.selection.getRangeAt(i, start, end);
  
      for(var c=start.value; c<=end.value; c++)
        selected.push(this.results_tree.view.getItemAtIndex(c).className);
    }

    return selected;
  }

};
