$(document).ready(function() {

  module("Builder iterator functions");
  
  test("builder: ArrayIterator", function() {
    var items, gen;
    
    gen = itertool.ArrayIterator([1, 'Abc', -1, 'zyx']); items = [];
    _(4).times(function(){ items.push(gen.next()); });
    equals(items.join(' '), '1 Abc -1 zyx', 'iterate through assorted array');
    raises(
        function(){ gen.next(); }, 
        function(actual){ return actual === StopIteration; },
        'finished array iterator will raise StopIteration');
    
    raises(function(){ itertool.ArrayIterator(); }, TypeError, 'empty parameter will raise TypeError');
  });
  
  test("builder: StringIterator", function() {
  
    var items, gen;
    
    gen = itertool.StringIterator('AbCdEfG'); items = [];
    _(7).times(function(){ items.push(gen.next()); });
    equals(items.join(' '), 'A b C d E f G', 'iterate through one character in string');
    raises(
        function(){ gen.next(); }, 
        function(actual){ return actual === StopIteration; },
        'finished string iterator will raise StopIteration');

    gen = itertool.StringIterator('1-o-2-o-3-o-4-o-5', '-o-'); items = [];
    _(5).times(function(){ items.push(gen.next()); });
    equals(items.join(' '), '1 2 3 4 5', 'iterate through string separated by string\'-o-\'');
    raises(
        function(){ gen.next(); }, 
        function(actual){ return actual === StopIteration; }, 
        'finished string iterator using defined string separator will raise StopIteration');
    
    gen = itertool.StringIterator("1     2 3 45  67\t     8", /\W+/); items = [];
    _(6).times(function(){ items.push(gen.next()); });
    equals(items.join(' '), '1 2 3 45 67 8', 'iterate through string separated by matched whitespaces');
    raises(
        function(){ gen.next(); }, 
        function(actual){ return actual === StopIteration; }, 
        'finished string iterator using regexp will raise StopIteration');
    
    raises(function(){ itertool.StringIterator(); }, TypeError, 'empty parameter will raise TypeError');
  });  
  
  test("builder: ObjectIterator", function() {
    var items, gen, obj = {a: 1, b: "Test", c: "xyz"};
    
    gen = itertool.ObjectIterator(obj); items = [];
    _(3).times(function(){ items.push(gen.next()); });
    equals(items.join(' '), '1 Test xyz', 'iterate through values in object');
    raises(
        function(){ gen.next(); }, 
        function(actual){ return actual === StopIteration; },
        'finished object iterator will raise StopIteration');
        
    gen = itertool.ObjectIterator(obj, "values"); items = [];
    _(3).times(function(){ items.push(gen.next()); });
    equals(items.join(' '), '1 Test xyz', 'iterate through values in object');
    raises(
        function(){ gen.next(); }, 
        function(actual){ return actual === StopIteration; },
        'finished object iterator will raise StopIteration');
        
    gen = itertool.ObjectIterator(obj, "all"); items = [];
    _(3).times(function(){ items.push(gen.next()); });
    equals(
        _.map(items, function(item){
            return '[' + item[0] + ', ' + item[1] + ']';
        }).join(' '), 
        '[a, 1] [b, Test] [c, xyz]', 
        'iterate through object returning key-value pair');
    raises(
        function(){ gen.next(); }, 
        function(actual){ return actual === StopIteration; }, 
        'finished object iterator using defined string separator will raise StopIteration');

    gen = itertool.ObjectIterator(obj, "keys"); items = [];
    _(3).times(function(){ items.push(gen.next()); });
    equals(items.join(' '), 'a b c', 'iterate through keys in object');
    raises(
        function(){ gen.next(); }, 
        function(actual){ return actual === StopIteration; },
        'finished object iterator will raise StopIteration');
    
    raises(function(){ itertool.ObjectIterator(); }, TypeError, 'empty parameter will raise TypeError');
  });
  
  test("builder: toIterator", function() {
    var items, gen, obj = {a: 1, b: "Test", c: "xyz"};
    
    gen = itertool.toIterator("ABCDEF", /[BE]/); items = [];
    _(3).times(function(){ items.push(gen.next()); });
    equals(items.join(' '), 'A CD F', 'iterate through string');
    raises(
        function(){ gen.next(); }, 
        function(actual){ return actual === StopIteration; },
        'finished string iterator will raise StopIteration');
        
    gen = itertool.toIterator([1, 2, 4]); items = [];
    _(3).times(function(){ items.push(gen.next()); });
    equals(items.join(' '), '1 2 4', 'iterate through values in array');
    raises(
        function(){ gen.next(); }, 
        function(actual){ return actual === StopIteration; },
        'finished array iterator will raise StopIteration');
        
    gen = itertool.toIterator(obj, "all"); items = [];
    _(3).times(function(){ items.push(gen.next()); });
    equals(
        _.map(items, function(item){
            return '[' + item[0] + ', ' + item[1] + ']';
        }).join(' '), 
        '[a, 1] [b, Test] [c, xyz]', 
        'iterate through object returning key-value pair');
    raises(
        function(){ gen.next(); }, 
        function(actual){ return actual === StopIteration; }, 
        'finished object iterator using defined string separator will raise StopIteration');
        
    gen = itertool.toIterator(itertool.StringIterator('ABC')); items = [];
    _(3).times(function(){ items.push(gen.next()); });
    equals(items.join(' '), 'A B C', 'iterate through values in string iterator');
    raises(
        function(){ gen.next(); }, 
        function(actual){ return actual === StopIteration; },
        'finished array iterator will raise StopIteration');
        
    raises(function(){ itertool.toIterator(); }, TypeError, 'empty parameter will raise TypeError');
  });
  
  test("builder: toArray", function() {
    var gen, obj = {a: 1, b: "Test", c: "xyz"};
    
    gen = itertool.toIterator("ABCDEF", /[BE]/); 
    equals(itertool.toArray(gen).join(' '), 'A CD F', 'convert string iterator to array');
        
    gen = itertool.toIterator([1, 2, 4]); 
    equals(itertool.toArray(gen).join(' '), '1 2 4', 'convert numeric iterator to array');

    gen = itertool.toIterator(itertool.StringIterator('ABC'));
    equals(itertool.toArray(gen).join(' '), 'A B C', 'convert string iterator to array');
        
    raises(function(){ itertool.toArray(); }, TypeError, 'empty parameter will raise TypeError');
  });
});
