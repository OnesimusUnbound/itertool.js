$(document).ready(function() {

  module("Combinatronic iterator functions");
  
  test("combinatronic: product", function() {
    var items, gen, itemCount;
    
    gen = itertool.product(1, "AB", [1, 2]); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                JSON.stringify(items),
                '[["A",1],["A",2],["B",1],["B",2]]', 
                'matching generated result for {A, B} and {1, 2}, repeated once');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    gen = itertool.product(4, "A"); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                JSON.stringify(items),
                '[["A","A","A","A"]]', 
                'matching generated result for {A}, repeated four times');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    gen = itertool.product(4); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                JSON.stringify(items),
                '[[]]', 
                'generating none');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    gen = itertool.product(2, "12", "de"); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                JSON.stringify(items),
                '['
              + '["1","d","1","d"],["1","d","1","e"],["1","d","2","d"],["1","d","2","e"],' 
              + '["1","e","1","d"],["1","e","1","e"],["1","e","2","d"],["1","e","2","e"],'
              + '["2","d","1","d"],["2","d","1","e"],["2","d","2","d"],["2","d","2","e"],'
              + '["2","e","1","d"],["2","e","1","e"],["2","e","2","d"],["2","e","2","e"]'
              + ']', 
                'matching generated result for {1 2} and {d e} repeated two times');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
  });
  
  test("combinatronic: permutations", function() {
    var items, gen, itemCount;
    
    gen = itertool.permutations("ABC", 2); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                JSON.stringify(items),
                '[["A","B"],["A","C"],["B","A"],["B","C"],["C","A"],["C","B"]]', 
                'matching generated result for combination of {A, B, C} whose r = 2');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    gen = itertool.permutations("ABC"); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                JSON.stringify(items),
                '[["A","B","C"],["A","C","B"],["B","A","C"],["B","C","A"],["C","A","B"],["C","B","A"]]', 
                'matching generated result for {A}, repeated four times');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    raises(
        function(){ itertool.permutations(); }, 
        TypeError,
        'raises TypeError for missing iterable');
    
    gen = itertool.permutations("ABCD", 5); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                JSON.stringify(items),
                '[]', 
                'generating none');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    gen = itertool.permutations([1, 2, null]); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                JSON.stringify(items),
                '[[1,2,null],[1,null,2],[2,1,null],[2,null,1],[null,1,2],[null,2,1]]', 
                'matching generated result for {1 2} and {d e} repeated two times');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
  });
  
  test("combinatronic: combinations", function() {
    var items, gen, itemCount;
    
    gen = itertool.combinations("ABC", 2); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                JSON.stringify(items),
                '[["A","B"],["A","C"],["B","C"]]', 
                'matching generated result for combination of {A, B, C} whose r = 2');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    gen = itertool.combinations("ABC"); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                JSON.stringify(items),
                '[["A","B","C"]]', 
                'matching generated result for {A}, repeated four times');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    raises(
        function(){ itertool.combinations(); }, 
        TypeError,
        'raises TypeError for missing iterable');
    
    gen = itertool.combinations("ABCD", 5); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                JSON.stringify(items),
                '[]', 
                'generating none');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    gen = itertool.combinations([1, 2, null]); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                JSON.stringify(items),
                '[[1,2,null]]', 
                'matching generated result for {1 2} and {d e} repeated two times');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
  });
  
  test("combinatronic: combinations_with_replacement", function() {
    var items, gen, itemCount;
    
    gen = itertool.combinations_with_replacement("ABC", 2); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                JSON.stringify(items),
                '[["A","A"],["A","B"],["A","C"],["B","B"],["B","C"],["C","C"]]', 
                'matching generated result for combinations_with_replacement of {A, B, C} whose r = 2');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    gen = itertool.combinations_with_replacement("ABC"); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                JSON.stringify(items),
                '['
              + '["A","A","A"],["A","A","B"],["A","A","C"],["A","B","B"],["A","B","C"],["A","C","C"],'
              + '["B","B","B"],["B","B","C"],["B","C","C"],["C","C","C"]'
              + ']', 
                'matching generated result for combinations_with_replacement {A, B, C} taken as number of items in set');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    raises(
        function(){ itertool.combinations_with_replacement(); }, 
        TypeError,
        'raises TypeError for missing iterable');
    
    gen = itertool.combinations_with_replacement("AB", 3); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                JSON.stringify(items),
                '['
              + '["A","A","A"],["A","A","B"],["A","B","B"],["B","B","B"]'
              + ']',
                'generating combinations_with_replacement of {A, B} r = 3');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
    gen = itertool.combinations_with_replacement([1, null]); items = [];
    try {
        for(i = 0; i < 100; i++)
            items.push(gen.next());
            
    } catch (err) {
        if (err === StopIteration) {
            equals(
                JSON.stringify(items),
                '[[1,1],[1,null],[null,null]]', 
                'matching generated result for {1 2} and {d e} repeated two times');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
  });
});