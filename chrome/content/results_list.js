
window.addEventListener("load", function() { results_handler.init(); }, false);
window.addEventListener("dialogaccept", function() { results_handler.on_dialog_accept(); }, false);

var results_handler = {

  init : function() {
    this.results_tree = document.getElementById('witchhammer_results_tree');
  },

  on_dialog_accept : function() {
    var range_count = this.results_tree.view.selection.getRangeCount();
    var to_view = new Array();

    // Collect each selected treeitem into the array.
    for (var i=0; i<range_count; i++) {
      var start = {}; var end = {};
      this.results_tree.view.selection.getRangeAt(i, start, end);
  
      for(var c=start.value; c<=end.value; c++)
        to_view.push(this.results_tree.view.getItemAtIndex(c).className);
    }

    alert(to_view);
  }

};
