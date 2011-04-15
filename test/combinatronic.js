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
                _.map(items, function(item){
                    return '[' + item.join(' ') + ']';
                }).join(', '),
                '[A 1], [A 2], [B 1], [B 2]', 
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
                _.map(items, function(item){
                    return '[' + item.join(' ') + ']';
                }).join(', '),
                '[A A A A]', 
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
                _.map(items, function(item){
                    return '[' + item.join(' ') + ']';
                }).join(', '),
                '[]', 
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
                _.map(items, function(item){
                    return '[' + item.join(' ') + ']';
                }).join(', '),
                '[1 d 1 d], [1 d 1 e], [1 d 2 d], [1 d 2 e], ' 
              + '[1 e 1 d], [1 e 1 e], [1 e 2 d], [1 e 2 e], '
              + '[2 d 1 d], [2 d 1 e], [2 d 2 d], [2 d 2 e], '
              + '[2 e 1 d], [2 e 1 e], [2 e 2 d], [2 e 2 e]', 
                'matching generated result for {1 2} and {d e} repeated two times');
        } else {
            ok(false, "Only StopIteration should be raised. Raised " + err);
        }
    }
    
  });
});