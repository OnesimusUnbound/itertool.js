  module("Infinite iterator functions");
  
  test("infinite: counter", function() {
    var items, gen;
    
    gen = itertool.counter(); items = [];
    _(10).times(function(){ items.push(gen.next()); });
    equals(items.join(' '), '0 1 2 3 4 5 6 7 8 9', 'from 0 by 1, calling 10 times');
    
    gen = itertool.counter(10); items = [];
    _(7).times(function(){ items.push(gen.next()); });
    equals(items.join(' '), '10 11 12 13 14 15 16', 'from 10 by 1, calling 7 times');
    
    gen = itertool.counter(100, 2); items = [];
    _(5).times(function(){ items.push(gen.next()); });
    equals(items.join(' '), '100 102 104 106 108', 'from 100 by 2, calling 5 times');
    
    gen = itertool.counter(-1, -3); items = [];
    _(8).times(function(){ items.push(gen.next()); });
    equals(items.join(' '), '-1 -4 -7 -10 -13 -16 -19 -22', 'from -1 by -3, calling 8 times');
    
    gen = itertool.counter(20, -3); items = [];
    _(10).times(function(){ items.push(gen.next()); });
    equals(items.join(' '), '20 17 14 11 8 5 2 -1 -4 -7', 'from 20 by -3, calling 10 times');
    
  });
  
  test("infinite: cycle", function() {
    var items, gen;
    
    gen = itertool.cycle(_.range(5)); items = [];
    _(10).times(function(){ items.push(gen.next()); });
    equals(items.join(' '), '0 1 2 3 4 0 1 2 3 4', 'cycling [0, 1, 2, 3, 4], calling 10 times');
    
    gen = itertool.cycle("ABC"); items = [];
    _(10).times(function(){ items.push(gen.next()); });
    equals(items.join(' '), 'A B C A B C A B C A', 'cycling \'ABC\', calling 10 times');
    
    gen = itertool.cycle({ "a": 1, "b": "test", "c": "#" }); items = [];
    _(7).times(function(){ items.push(gen.next()); });
    equals(items.join(' '), '1 test # 1 test # 1', 'cycling object, calling 7 times');
    
    gen = itertool.cycle([1, "A", 12, "Run"]); items = [];
    _(7).times(function(){ items.push(gen.next()); });
    equals(items.join(' '), '1 A 12 Run 1 A 12', 'cycling assorted list, calling 7 times');
    
    raises(function(){ itertool.cycle(1).next(); }, TypeError, 'Number is not allowed');
    raises(function(){ itertool.cycle(/abc/).next(); }, TypeError, 'Regex is not allowed');
    raises(function(){ itertool.cycle(null).next(); }, TypeError, 'null is not allowed');

    raises(
        function(){ itertool.cycle("").next(); }, 
        function(actual){ return actual === StopIteration; }, 
        'empty string will raise StopIteration');
        
    raises(
        function(){ itertool.cycle([]).next(); }, 
        function(actual){ return actual === StopIteration; }, 
        'empty array will raise StopIteration'); 
    
    raises(
        function(){ itertool.cycle({}).next(); }, 
        function(actual){ return actual === StopIteration; }, 
        'empty object will raise StopIteration');
    
  });
  
    
  test("infinite: repeat", function() {
    var nums, genRepeat; numCall = 0;
    
    genRepeat = itertool.repeat(1); nums = [];
    _(1000).times(function(){ nums.push(genRepeat.next()); });
    equals(_.uniq(nums).join(' '), '1', 'call repeat generates \'1\' 1000 times');
    
    genRepeat = itertool.repeat('A', 101); nums = [];
    _(100).times(function(){ nums.push(genRepeat.next()); });
    equals(_.uniq(nums).join(' '), 'A', 'calling \'A\' repeatedly for 100 times.');
    
    numCall += nums.length;
    
    genRepeat.next(); numCall += 1;
    raises(
        function(){ genRepeat.next(); numCall += 1; }, 
        function(actual){ return actual === StopIteration; }, 
        'calling next will cause StopIteration to be raised');
    equals(numCall, 101, 'the repeater should only be called for 101 times');
  });
