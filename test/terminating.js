$(document).ready(function() {

  module("Terminating iterator functions");
  
  test("terminating: chain", function() {
    var items, gen, itemCount;
    
    gen = itertool.chain('AB', [2], { "a" : "Test", "z" : "Unit" }); items = [];
    _(4).times(function(){ items.push(gen.next()); });
    equals(items.join(' '), 'A B 2 Test', 'chaining \'AB\', [2], and { "a" : "Test", "z" : "Unit" } 4 times');
    
    raises(function(){ gen = itertool.chain('ZYX', 12); }, TypeError, 'number is not allowed in the argument');
    
    gen = itertool.chain([1, 2, 3, 4]); items = []; itemCount = 0;
    _(4).times(function(){ gen.next(); itemCount++; });
    raises(
        function(){ gen.next(); itemCount++; }, 
        function(actual){ return actual === StopIteration; }, 
        'StopIteration should be raised');
        
    equals(
        itemCount, 
        4, 
        'The number of iteration should match the total number of items in chained iters');
  });
  
  test("terminating: irange", function() {
    var items, gen, itemCount, i;
    
    gen = itertool.irange(0); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch(err) {
        if (err === StopIteration)
            equals(items.join(''), '', 'range with 0 as a first argument generates an empty array');
    }
    
    gen = itertool.irange(4); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch(err) {
        if (err === StopIteration)
            equals(items.join(' '), '0 1 2 3', 'range with a single positive argument generates an array of elements 0,1,2,...,n-1');
    }
    
    gen = itertool.irange(5, 8); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch(err) {
        if (err === StopIteration)
            equals(items.join(' '), '5 6 7', 'range with two arguments a & b, a<b generates an array of elements a,a+1,a+2,...,b-2,b-1');
    }
    
    gen = itertool.irange(8, 5); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration)
            equals(items.join(''), '', 'range with two arguments a &amp; b, b&lt;a generates an empty array');
    }
    
    gen = itertool.irange(3, 10, 3); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration)
            equals(items.join(' '), '3 6 9', 'range with three arguments a &amp; b &amp; c, c &lt; b-a, a &lt; b generates an array of elements a,a+c,a+2c,...,b - (multiplier of a) &lt; c');
    }
    
    gen = itertool.irange(3, 10, 15); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration)
            equals(items.join(' '), '3', 'range with three arguments a &amp; b &amp; c, c &gt; b-a, a &lt; b generates an array with a single element, equal to a');
    }
    
    gen = itertool.irange(12, 7, -2); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration)
            equals(items.join(' '), '12 10 8', 'range with three arguments a &amp; b &amp; c, a &gt; b, c &lt; 0 generates an array of elements a,a-c,a-2c and ends with the number not less than b');
    }
    
    gen = itertool.irange(0, -10, -1); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration)
            equals(items.join(' '), '0 -1 -2 -3 -4 -5 -6 -7 -8 -9', 'final example in the Python docs');
    }
    
    raises(
        function(){ gen.next(); }, 
        function(actual){ return actual === StopIteration; },
        'raises StopIteration')
  });
  
  test("terminating: compress", function() {
    var items, gen, itemCount;
    
    gen = itertool.compress('ABCDEFG', [1, 0, 0, 1, 1, 0, 1]); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration)
            equals(
                items.join(' '), 
                'A D E G', 
                'properly selecting array');
    }
    
    gen = itertool.compress([5, 3, 7, 10], [true, false, false, true]); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration)
            equals(
                items.join(' '), 
                '5 10', 
                'compress test for array');
    }
    
    gen = itertool.compress({"a": 12, "p": "Testing", "o": -54, "g": "@" }, ["", null, "A", new Object()]); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration)
            equals(
                items.join(' '), 
                '-54 @', 
                'compress test for object');
    }
    
    gen = itertool.compress("ABCDE", [1, 0, 1]); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration)
            equals(
                items.join(' '), 
                'A C', 
                'length of data > length of selector');
    }
    
    
    gen = itertool.compress("ZYX", [1, 0, 1, 1, 0]); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration)
            equals(
                items.join(' '), 
                'Z X', 
                'length of data < length of selector');
    }
    
    raises(
        function(){ gen.next(); }, 
        function(actual){ return actual === StopIteration; },
        'raises StopIteration')
  });
});
