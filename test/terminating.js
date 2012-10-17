  module("Terminating iterator functions");
  
  test("terminating: chain", function() {
    var items, gen, itemCount;
    
    gen = itertool.chain('AB', [2], { "a" : "Test", "z" : "Unit" }); items = [];
    _(4).times(function(){ items.push(gen.next()); });
    equals(items.join(' '), 'A B 2 Test', 'chaining \'AB\', [2], and { "a" : "Test", "z" : "Unit" }');
    
    raises(
        function(){ 
            gen = itertool.chain('ZX', 12); 
            gen.next(); 
            gen.next(); 
            gen.next(); 
        }, 
        TypeError, 
        'number is not allowed in the argument');
    
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
  
  test("terminating: chain_from_iterable", function() {
    var items, gen, itemCount;
    
    gen = itertool.chain_from_iterable(['AB', [2], { "a" : "Test", "z" : "Unit" }]); items = [];
    _(4).times(function(){ items.push(gen.next()); });
    equals(items.join(' '), 'A B 2 Test', 'chaining [\'AB\', [2], { "a" : "Test", "z" : "Unit" }]');
    
    raises(function(){ 
        gen = itertool.chain_from_iterable(['ZX', 12]); 
        gen.next(); gen.next(); gen.next(); 
    }, TypeError, 'number is not allowed in the argument');
    
    gen = itertool.chain_from_iterable([[1, 2, 3, 4]]); items = []; itemCount = 0;
    _(4).times(function(){ gen.next(); itemCount++; });
    raises(
        function(){ gen.next(); itemCount++; }, 
        function(actual){ return actual === StopIteration; }, 
        'StopIteration should be raised');
        
    equals(
        itemCount, 4, 
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
  
  test("terminating: islice", function() {
    var items, gen, itemCount, i;
    
    gen = itertool.islice("ABCDEFGHIJK", 0); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
    } catch(err) {
        if (err === StopIteration) {
            equals(items.join(''), '', 'islice with 0 as a first argument generates an empty array');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    gen = itertool.islice("ABCDEFGHIJK", 4); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch(err) {
        if (err === StopIteration) {
            equals(items.join(' '), 'A B C D', 
                'islice with a single positive argument generates an array of items in iterable whose index is 0,1,2,...,n-1');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    gen = itertool.islice("ABCDEFGHIJK", 5, 8); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch(err) {
        if (err === StopIteration)
            equals(items.join(' '), 'F G H', 
                'islice with two arguments a & b, a < b generates an array of items in iterable whose index a,a+1,a+2,...,b-2,b-1');
    }
    
    gen = itertool.islice("ABCDEFGHIJK", 3, 10, 3); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration)
            equals(items.join(' '), 'D G J', 
                'range with three arguments a & b & c, c < b-a, a < b generates an array of items in iterable whose index a,a+c,a+2c,...,b - (multiplier of a) &lt; c');
    }
    
    gen = itertool.islice("ABCDEFGHIJK", 3, 10, 15); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration)
            equals(items.join(' '), 'D', 
                'islice with three arguments a & b & c, c > b-a, a < b generates an array with a single element, equal to a');
    }
    
    gen = itertool.islice("ABCDEFGHIJK", 3, 15, 2); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration)
            equals(items.join(' '), 'D F H J', 
                'islice with three arguments a &amp; b &amp; c, c &gt; b-a, a &lt; b generates an array with a single element, equal to a');
    }
    
    raises(
        function(){ gen.next(); }, 
        function(actual){ return actual === StopIteration; },
        'raises StopIteration');
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
        'raises StopIteration');
  });
  
  test("terminating: dropwhile", function() {
    var items, gen, itemCount;
    
    gen = itertool.dropwhile(function(item){ return item < 5; }, [1, 2, 4, 6, 1, 2]); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration)
            equals(
                items.join(' '), 
                '6 1 2', 
                'droping first items that do not meet requirement');
    }
    
    gen = itertool.dropwhile(function(item){ return item < 100; }, [1, 2, 4, 6, 1, 2]); items = [];
    raises(
        function(){ gen.next(); }, 
        function(actual){ return actual === StopIteration; },
        'raises StopIteration');
        
    raises(
        function(){ itertool.dropwhile({}, [1, 2, 4, 6, 1, 2]); }, 
        TypeError,
        'raises TypeError for predicate parameter other than function');
  });
  
  test("terminating: takewhile", function() {
    var items, gen, itemCount;
    
    gen = itertool.takewhile(function(item){ return item < 5; }, [1, 2, 4, 6, 1, 2]); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration)
            equals(
                items.join(' '), 
                '1 2 4', 
                'taking first items that do not meet requirement');
    }
    
    gen = itertool.takewhile(function(item){ return item < 5; }, [1, 6, 1]); items = [];
    gen.next();
    raises(
        function(){ gen.next(); }, 
        function(actual){ return actual === StopIteration; },
        'raises StopIteration on first non matching item');
    
    raises(
        function(){ gen.next(); }, 
        function(actual){ return actual === StopIteration; },
        'raises StopIteration for succeding items, even if it matches the predicate');
        
    gen = itertool.takewhile(function(item){ return item > 100; }, [1, 2, 4, 6, 1, 2]); items = [];
    raises(
        function(){ gen.next(); }, 
        function(actual){ return actual === StopIteration; },
        'raises StopIteration');
        
    raises(
        function(){ itertool.takewhile({}, [1, 2, 4, 6, 1, 2]); }, 
        TypeError,
        'raises TypeError for predicate parameter other than function');
    
  });
  
  test("terminating: ifilter", function() {
    var items, gen, itemCount;
    
    gen = itertool.ifilter(function(item){ return item % 2 == 0; }, [1, 2, 4, 6, 1, 2]); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                items.join(' '), 
                '2 4 6 2', 
                'returning even numbers');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    gen = itertool.ifilter([0, null, 1, "A"]); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                items.join(' '), 
                '1 A', 
                'returning entries that returns true when evaluated in boolean');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    gen = itertool.ifilter(function(item){ return item > 100; }, [1, 2, 4, 6, 1, 2]); items = [];
    raises(
        function(){ gen.next(); }, 
        function(actual){ return actual === StopIteration; },
        'raises StopIteration');
        
    raises(
        function(){ itertool.ifilter([1, 2, 4, 6, 1, 2], {}); }, 
        TypeError,
        'raises TypeError for predicate parameter other than function');
  });
  
  test("terminating: ifilterfalse", function() {
    var items, gen, itemCount;
    
    gen = itertool.ifilterfalse(function(item){ return item % 2 == 0; }, [1, 3, 2, 4, 7, 6]); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                items.join(' '), 
                '1 3 7', 
                'returning even numbers');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    gen = itertool.ifilterfalse([0, 0, 1, "A"]); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                items.join(' '), 
                '0 0', 
                'returning entries that returns true when evaluated in boolean');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    gen = itertool.ifilterfalse(function(item){ return item < 100; }, [1, 2, 4, 6, 1, 2]); items = [];
    raises(
        function(){ gen.next(); }, 
        function(actual){ return actual === StopIteration; },
        'raises StopIteration');
        
    raises(
        function(){ itertool.ifilterfalse([1, 2, 4, 6, 1, 2], {}); }, 
        TypeError,
        'raises TypeError for predicate parameter other than function');
  });
  
  test("terminating: starmap", function() {
    var items, gen, itemCount;
    
    gen = itertool.starmap(function(item){ return item * item; }, [[1], [2], [4], [7], [3], [9]]); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                items.join(' '), 
                '1 4 16 49 9 81', 
                'returning square of numbers');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    gen = itertool.starmap(Math.pow, [[1, 2], [3, 4], [2, 3], [2, 5]]); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                items.join(' '), 
                '1 81 8 32', 
                'returning Math.pow for each parameters in iterables');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    raises(
        function(){ itertool.starmap({}, [1, 2, 4, 6, 1, 2]); }, 
        TypeError,
        'raises TypeError for closure parameter other than function');
  });
  
  test("terminating: imap", function() {
    var items, gen, itemCount;
    
    gen = itertool.imap(function(item){ return item * item; }, [1, 2, 4, 7, 3, 9]); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                items.join(' '), 
                '1 4 16 49 9 81', 
                'returning square of numbers');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    gen = itertool.imap(Math.pow, [1, 2, 3, 4], [2, 3, 2, 5]); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                items.join(' '), 
                '1 8 9 1024', 
                'returning Math.pow(iter1, iter2)');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    raises(
        function(){ itertool.imap({}, [1, 2, 4, 6, 1, 2]); }, 
        TypeError,
        'raises TypeError for closure parameter other than function');
  });
  
  test("terminating: izip", function() {
    var items, gen, itemCount;
    
    gen = itertool.izip([1, 2, 4, 7, 3, 9], [1, 3, 5, 5, 7]); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                _.map(items, function(zippedItem){
                    return '[' + zippedItem.join(' ') + ']';
                }).join(', '),
                '[1 1], [2 3], [4 5], [7 5], [3 7]', 
                'zipped items, removing an item that do not have matching zip');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    raises(
        function(){ itertool.izip().next(); }, 
        function(actual){ return actual === StopIteration; },
        'raises StopIteration for empty arguments');
  });
  
  test("terminating: izip_longest", function() {
    var items, gen, itemCount;
    
    gen = itertool.izip_longest("-", [1, 2, 4, 7], [1, 3, 5, 5, 7, 4], "ABD"); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                _.map(items, function(zippedItem){
                    return '[' + zippedItem.join(' ') + ']';
                }).join(', '),
                '[1 1 A], [2 3 B], [4 5 D], [7 5 -], [- 7 -], [- 4 -]', 
                'zipped items, filling the empty slot with fillvalue');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    raises(
        function(){ itertool.izip_longest().next(); }, 
        function(actual){ return actual === StopIteration; },
        'raises StopIteration for empty arguments');
  });
  
  test("terminating: tee", function() {
    var items, gen, itemCount;
    
    iterators = itertool.tee([1, 2]); items = [];
    items.push(iterators[0].next());
    items.push(iterators[1].next());
    items.push(iterators[1].next());
    items.push(iterators[0].next());
    
    equals(iterators.length, 
            2, 
            'uses two tee iterators by default if number of iterator is not specified');
    
    iterators = itertool.tee([1, "A", 7, 4], 3); items = [];
    items.push(iterators[0].next());
    items.push(iterators[0].next());
    items.push(iterators[1].next());
    items.push(iterators[1].next());
    items.push(iterators[1].next());
    items.push(iterators[2].next());
    items.push(iterators[0].next());
    items.push(iterators[2].next());
    items.push(iterators[1].next());
    items.push(iterators[0].next());
    items.push(iterators[2].next());
    items.push(iterators[2].next());
    
    equals(items.join(' '), 
            '1 A 1 A 7 1 7 A 4 4 7 4', 
            'the three tee iterators are not exhuasted until they ended');
    
    raises(
        function(){ iterators[0].next(); }, 
        function(actual){ return actual === StopIteration; },
        'raises StopIteration for ended tee 0');
            
    raises(
        function(){ iterators[1].next(); }, 
        function(actual){ return actual === StopIteration; },
        'raises StopIteration for ended tee 1');
        
    raises(
        function(){ iterators[2].next(); }, 
        function(actual){ return actual === StopIteration; },
        'raises StopIteration for ended tee 2');
  });
  
      
  test("terminating: groupby", function() {
    var items, gen, itemCount, group;
    
    gen = itertool.groupby("AAAABBBCCAAAAADDE"); items = [];
    try {
        for(i = 0; i < 100; i++) {
            group = gen.next();
            items.push([group[0], itertool.toArray(group[1])]);
        }
    } catch (err) {
        if (err === StopIteration) {
            equals(
                _.map(items, function(group){
                    return '(' + group[0] + ')[' + group[1].join('') + ']';
                }).join(', '),
                '(A)[AAAA], (B)[BBB], (C)[CC], (A)[AAAAA], (D)[DD], (E)[E]', 
                'letters are grouped accordingly by uniqueness, default grouping');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    equals(items.length, 
            6, 
            '6 group iterators should be created');
    
    gen = itertool.groupby(itertool.irange(10), function(number){ return Math.floor(number / 3)}); items = [];
    try {
        for(i = 0; i < 100; i++) {
            group = gen.next();
            items.push([group[0], itertool.toArray(group[1])]);
        }
    } catch (err) {
        if (err === StopIteration) {
            equals(
                _.map(items, function(group){
                    return '(' + group[0] + ')[' + group[1].join(' ') + ']';
                }).join(', '),
                '(0)[0 1 2], (1)[3 4 5], (2)[6 7 8], (3)[9]', 
                'numbers are grouped accordingly by custom key');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    raises(
        function(){ gen.next(); }, 
        function(actual){ return actual === StopIteration; },
        'raises StopIteration for groupby iterator');
  });
  test("terminating: enumerate", function() {
    var items, gen, itemCount;
    
    gen = itertool.enumerate("ABCD"); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                _.map(items, function(zippedItem){
                    return '[' + zippedItem.join(' ') + ']';
                }).join(', '),
                '[0 A], [1 B], [2 C], [3 D]', 
                'enumerate iterable, starting from 0 as default');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    gen = itertool.enumerate("ABCD", 10); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                _.map(items, function(zippedItem){
                    return '[' + zippedItem.join(' ') + ']';
                }).join(', '),
                '[10 A], [11 B], [12 C], [13 D]', 
                'enumerate iterable, starting from 10 as default');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    raises(
        function(){ var g = itertool.enumerate("A"); g.next(); g.next(); }, 
        function(actual){ return actual === StopIteration; },
        'raises StopIteration when the end has been reached');
  });
