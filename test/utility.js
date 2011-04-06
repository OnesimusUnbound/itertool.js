$(document).ready(function() {

  module("Utility functions");
  
  test("utility: noConflict", function() {
    window.it = itertool.noConflict();
    window.itertool = {"some_unique_member" : 12};
    
    
  });
  
});
