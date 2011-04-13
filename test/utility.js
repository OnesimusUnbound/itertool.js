$(document).ready(function() {

  module("Utility functions");
  
  test("utility: noConflict", function() {
    window.it = itertool.noConflict();
    window.itertool = {"some_unique_member" : 12};
    
    equals(window.itertool.some_unique_member, 12, 'the newly defined itertool is not affected');
    equals(typeof window.it.iter, 'function', 'the itertool is using a new namespace');
    
    window.itertool = it.noConflict();
  });
  
  test("builder: toArray", function() {
    var gen, obj = {a: 1, b: "Test", c: "xyz"};
    
    gen = itertool.iter("ABCDEF", /[BE]/); 
    equals(itertool.toArray(gen).join(' '), 'A CD F', 'convert string iterator to array');
        
    gen = itertool.iter([1, 2, 4]); 
    equals(itertool.toArray(gen).join(' '), '1 2 4', 'convert numeric iterator to array');

    gen = itertool.iter(itertool.StringIterator('ABC'));
    equals(itertool.toArray(gen).join(' '), 'A B C', 'convert string iterator to array');
        
    raises(function(){ itertool.toArray(); }, TypeError, 'empty parameter will raise TypeError');
  });
  
});
