// itertool.js
// ===========
// 
// (c) 2011 OnesimusUnbound <marcelino dat deseo aet gmail dat com>
// itertools.js is freely distributable under the terms of the MIT license.
// Documentation: https://github.com/OnesimusUnbound/itertool.js
// Version 0.0.*
//
// The itertool.js is a port from Python's `itertools` to JavaScript,
// without using Mozilla's `Iterator` and `yield`, relying instead 
// on using `next` and `try ... catch` of the `StopIteration`.
//

(function(){
    var // To quickly access the methods associated with the prototypes
        ObjectProto = Object.prototype,
        ArrayProto = Array.prototype,
        
        // Checks if the the property is part of the object, not of it's prottype's
        __hasOwns = ObjectProto.hasOwnProperty,
        
        // Determines the type of the object. Relevant to this library detect of 
        // the type of the passed parameter for validation
        __type = function(obj){
            if (typeof obj === 'undefined') {
                return "Undefined";
            } else if (obj === null) {
                return "Null";
            } else if (typeof obj.next === 'function') {
                return "Iterator";
            } else {
                return ObjectProto.toString.call(obj).match(/^\[object (.*)\]$/)[1]; 
            }
        },
        
        // Appends the properties of `other` to `obj`.
        __extend = function(obj, other){
            for (var prop in other){
                if (__hasOwns.call(other, prop)) {
                    obj[prop] = other[prop];
                }
            }
            return obj;
        },
        
        // The functional `map` that calls the `callback` for each item in the `array`
        __map = function(array, callback){
            var result = [];
            
            for (var i = 0; i < array.length; i++){
                result[i] = callback(array[i]);
            }
            
            return result;
        },
        
        // To select portion of array or to create a new copy
        __slice = ArrayProto.slice,
        
        // Test the truthiness of the object
        __truthy = function(item){ return !!item; },
        
        // returns the object as it is. 
        __identity = function(x){ return x; },
        
        // to get the global object, for browser's `window` or `global` in other js engines
        root = this, 
        
        // stores the content of previously defined `itertool` in the global scope to avoid overriding it
        __previous_itertool = root.itertool, 
        
        // set up the namespace of the itertool
        itertool = {},
        
        // `StopIteration` is an exception thrown whenever the generator is completed
        StopIteration;
    
    // To use either the global `StopIteration` (Mozilla's JS engines) or implement one.
    if (!root.StopIteration) {
        StopIteration = root.StopIteration = Error('StopIteration');
    } else {
        StopIteration = root.StopIteration;
    }
    itertool.StopIteration = StopIteration;
    
    // `Iterator` the basic iterator from which derived iterators will reference. 
    // This is will not use Mozilla's `Iterator`, instead it will be made compatible
    // with Mozilla's implementation.
    var Iterator = itertool.Iterator = function(){};
    Iterator.prototype.next = function(){ throw StopIteration; };
    Iterator.prototype.__iterator__ = function(){ return this; };
    
    // A helper function to instantiate Iterator and implement the 
    // instance's `next` function in `nextImpl`
    var extendIterator = function(nextImpl) {
        return __extend(new Iterator, {next: nextImpl});
    };
    
    // Creates an iterator for array
    var ArrayIterator = itertool.ArrayIterator = function(array) {
        if(__type(array) === 'Undefined') throw new TypeError;
    
        var size = array.length,
            idx = 0;
        
        return extendIterator(function(){
            if (size > idx) return array[idx++];
            throw StopIteration;
        });
    };
    
    // creates is an iterator for string.
    var StringIterator = itertool.StringIterator = function(string, option){
        if(__type(string) === 'Undefined') throw new TypeError;
        
        var items = [];
        option = option || "";
        
        switch(__type(option)){
            case 'String':
            case 'RegExp':
                items = string.split(option);
                break;
        }
        
        return ArrayIterator(items);
    }
    
    // iterates through the objects property, excluding that of its prototype ("parent class").
    // `option` determines how the object is iterated
    var ObjectIterator = itertool.ObjectIterator = function(obj, option) {
        if(__type(obj) === 'Undefined') throw new TypeError;
    
        var items = [];
        for (var key in obj){
            if (__hasOwns.call(obj, key)){
                switch(option){
                    case 'keys'     : items.push(key); break;
                    case 'all'      : items.push([key, obj[key]]); break;
                    case 'values'   :
                    default         : items.push(obj[key]);
                }
            }
        }
        
        return ArrayIterator(items);
    };
    
    // Accepts string, array, objects and creates the equivalent 
    // iterator by delegating to appropriate iterator builder.
    var toIterator = itertool.toIterator = function(obj){
        switch(__type(obj)){
            case 'String':      return StringIterator.apply(root, arguments);
            case 'Array':       return ArrayIterator.apply(root, arguments);
            case 'Iterator':    return obj;
            default:            return ObjectIterator.apply(root, arguments);
        }
    };
    
    // Converts the iterator to array. Do not use this 
    // function for infinite iterators!
    var toArray = itertool.toArray = function(iterable){
        var array = [];
        
        try {
            while (true) array.push(iterable.next());
            
        } catch(err) {
            if (err !== StopIteration) throw err;
            return array;
        }
    };
    
    
    // Utility Functions
    // -----------------
    
    itertool.noConflict = function() {
        root.itertool = __previous_itertool;
        return this;
    };
    
    var ieach = itertool.ieach = function(iterable, callback) {
        try {
            while(true) callback(iterable.next());
        } catch(err) {
            if (err !== StopIteration) throw err;
        }
    };
    
    // Infinite Iterator
    // -----------------
    //
    // Infinite Iterators creates iterators that usually does not terminate
    // This is useful for generating infinite series of numbers.
    
    // This creates iterator that returns numbers starting from `start`, 
    // incrementing (or decrementing) by `step`. The iterator does not end.
    //
    // `cycle(start = 0, step = 1)`
    var counter = itertool.counter = function(start, step){
        start = start || 0;
        step  = step  || 1;
        start -= step;
        
        return extendIterator(function(){
            return (start += step);
        });
    };
    
    // This creates a iterator that repeats the content of the `iterable`.
    //
    // `cycle(iterable)`
    var cycle = itertool.cycle = function(iterable){
        var type = __type(iterable);
        
        if (type === 'Number' || type === 'RegExp' || type === 'Null')
            throw new TypeError;
    
        iterable = toIterator(iterable);
        
        var gen, size, idx, items = [];
        gen = extendIterator(function(){
            try {
                var item = iterable.next();
                items.push(item);
                return item;
            } catch (err) {
                if (err !== StopIteration) throw err;
                
                size = items.length; 
                if (!size) throw err;
                
                idx = 0; 
                gen.next = function(){
                    if (idx >= size) idx = 0;
                    return items[idx++];
                };
                
                return gen.next();
            }
        });
        
        return gen;
    };
    
    // This creates iterator that repeats the `element` by 
    // `n`th times, or infinitely if `n` is not provided.
    //
    // `repeat(element, [n])`
    var repeat = itertool.repeat = function(element, n){
        var count = 0;
        
        if (__type(n) === 'Undefined') {
            return extendIterator(function() { return element; });
        } else {
            return extendIterator(function(){
                if (count < n) {
                    count++;
                    return element;
                }
                throw StopIteration;
            });
        }
    };
    
    // Terminating Iterators
    // ---------------------
    // 
    // Terminating iterators creates itrators that will surely terminate (unless you passed an infinite iterable!)
    
    // This will create iterator that "concatenate" all iterables passed, creating one iterable
    // 
    // `chain(iterables...)`
    var chain = itertool.chain = function(){
        var iterables = __slice.call(arguments), 
            size, iterIdx = 0, currentIter;
            
        iterables = __map(iterables, function(iterable){
            var type = __type(iterable);
            if (type === 'Number' || type === 'RegExp') 
                throw new TypeError;
                
            return toIterator(iterable)
        });
            
        size = iterables.length;
        currentIter = iterables[iterIdx++];
        
        gen = extendIterator(function(){
            try {
                return currentIter.next();
            } catch (err) {
                if (err !== StopIteration) throw err;
                if (size > iterIdx) {
                    currentIter = iterables[iterIdx++];
                    return gen.next();
                }
                throw StopIteration;
            }
        });
        
        return gen;
    };
    
    // This is equivalent to python's  `xrange`, that is, generating returning 
    // iterator that generates numbers from `start` to `end` by `step`
    //
    // `irange(stop) or irange(start, stop) or irange(start, stop, step)`
    var irange = itertool.irange = function(start, stop, step) {
        if (arguments.length <= 1) {
            stop = start || 0;
            start = 0;
        }
        step = step || 1;

        var len = Math.max(Math.ceil((stop - start) / step), 0);
        var idx = 0;
        
        start -= step;
        return extendIterator(function(){
            if (idx < len) {
                idx++;
                return (start += step);
            }
            throw StopIteration;
        });
    };
    
    // This returns iterator where the item in `data` whose corresponding item in `selectors` 
    // will evaluate true in truthiness
    // 
    // `compress(data, selectors)` 
    var compress = itertool.compress = function(data, selectors) {
        var iterData = toIterator(data),
            iterSelector = toIterator(selectors);
            
        return extendIterator(function(){
            while(!iterSelector.next()) {
                iterData.next();
            }
            return iterData.next();
        });
    };
    
    
    // This returns an iterator that drops the first items in the `iterable` that does not 
    // return `true` as defined in the `predicate`, When an item does not return `true` in 
    // the `predicate`, that item and those that succeed it in the predicate are returned, 
    // even if an item returns `true` in the predicate.
    // 
    // `dropwhile(predicate, iterable)`
    var dropwhile = itertool.dropwhile = function(predicate, iterable) {
        if (__type(predicate) !== 'Function') throw new TypeError;
        
        iterable = toIterator(iterable);
        var firstValid,
            gen = extendIterator(function(){
                while(predicate(firstValid = iterable.next()));
                gen.next = function(){
                    return iterable.next();
                };
                return firstValid;
            });
        
        return gen;
    };
    
    // This returns an iterator that takes the first items in the `iterable` that returns 
    // `true` as defined in the `predicate`, When an item does not return `true` in the 
    // `predicate`, that item and those that succeed it in the predicate are discarded, 
    // even if an item returns `true` in the predicate.
    // 
    // takewhile(predicate, iterable)
    var takewhile = itertool.takewhile = function(predicate, iterable) {
        if (__type(predicate) !== 'Function') throw new TypeError;
        
        iterable = toIterator(iterable);
        var takenItem,
            gen = extendIterator(function(){
                if (predicate(takenItem = iterable.next()))
                    return takenItem;
                    
                gen.next = function(){
                    throw StopIteration;
                };
                
                gen.next();
            });
        
        return gen;
    };
    
    // Returns an iterator that returns items in the iterable` 
    // that evaluates `true` when passed in the `predicate`.
    // 
    // `ifilter(predicate, iterable)`
    var ifilter = itertool.ifilter = function(predicate, iterable) {
        iterable = toIterator(iterable || predicate);
        predicate = arguments.length === 2 ? predicate : __truthy;
        if (typeof predicate !== 'function') throw new TypeError;

        var validItem;        
        return extendIterator(function(){
            while(!predicate(validItem = iterable.next()));
            return validItem;
        });
    };
    
    // Returns an iterator that returns items in the `iterable` 
    // that evaluates `false` when passed in the `predicate`.
    // 
    // `ifilterfalse(predicate, iterable)`
    var ifilterfalse = itertool.ifilterfalse = function(predicate, iterable) {
        iterable = toIterator(iterable || predicate);
        predicate = arguments.length === 2 ? predicate : __truthy;
        if (typeof predicate !== 'function') throw new TypeError;

        var validItem;        
        return extendIterator(function(){
            while(predicate(validItem = iterable.next()));
            return validItem;
        });
    };
    
    // Returns an iterator that returns the result of an item from each `iterable` 
    // in `iterables` passed in the `predicate`.
    // 
    // imap(predicate, iterators...)
    var imap = itertool.imap = function(callback) {
        var iterables = __slice.call(arguments, 1);
        
        if (__type(callback) !== 'Function') throw new TypeError;
        
        var iterable = izip.apply(root, iterables);
            
        return extendIterator(function(){
            return callback.apply(root, iterable.next());
        });
    };
    
    // Returns an iterator that returns item in `iterable` whose order matches the 
    // series generated by `irange(start, stop, step)`
    // 
    // islice(iterable, stop) or islice(iterable, start, stop) or islice(iterable, start, stop, step) 
    var islice = itertool.islice = function(iterable) {
        iterable = toIterator(iterable);
        var iterRange = irange.apply(root, __slice.call(arguments, 1)),
            validIdx,
            idx = -1;
            
        return extendIterator(function(){
            var item;
            
            validIdx = iterRange.next();
            while (true) {
                item = iterable.next();
                idx++;
                if (idx === validIdx) return item;
            }
        });
    };
    
    // Returns iterator that returns combined all items of the same order for each iterables
    // The the maximum number of items returned by the generated iterator will depend on the 
    // the `iterable` that has the fewest number of item returned.
    // 
    // `izip(iterables...)`
    var izip = itertool.izip = function() {
        var iterables = __slice.call(arguments),
            size = iterables.length;
            
        iterables = __map(iterables, function(iterable){
            var type = __type(iterable);
            
            if (type === 'Number' || type === 'RegExp') 
                throw new TypeError;
                
            return toIterator(iterable);
        });
            
        return extendIterator(function(){
            if (size > 0)
                return __map(iterables, function(iterable){
                    return iterable.next();
                });
                    
            throw StopIteration;
        });
    };
    
    // Returns iterator that returns combined all items of the same order for each iterables
    // When one of the iterable ends while there are some that did not end, the `fillvalue` 
    // will be used. when no fillvalue was passed, an empty string is used.
    // 
    // `izip_longest(fillvalue = "", iterables...)`
    var izip_longest = itertool.izip_longest = function() {
        var iterables = __slice.call(arguments, 1),
            fillvalue = arguments[0] || "";
            numIterables = iterables.length;
            
        iterables = __map(iterables, function(iterable){
            var type = __type(iterable);
            
            if (type === 'Number' || type === 'RegExp') 
                throw new TypeError;
                
            return toIterator(iterable);
        });
            
        return extendIterator(function(){
            var numEndedIter = 0;
            if (numIterables > 0)
                result = __map(iterables, function(iterable){
                    try {
                        return iterable.next();
                    } catch(err) {
                        if (err !== StopIteration) throw err;
                        if (numEndedIter < numIterables) {
                            numEndedIter++;
                            return fillvalue;
                        }
                    }
                });
                
            if (numEndedIter < numIterables)
                return result;
                
            throw StopIteration;
        });
    };
    
    // Returns an iterator that passes each argument in array within `argList` 
    // (which is an array) to the callback, returning the result for each invocation
    // of the iterator.
    // 
    // `starmap(callback, argList)`
    var starmap = itertool.starmap = function(callback, argList) {
        if (__type(callback) !== 'Function') throw new TypeError;
        
        var iterable = toIterator(argList);
            
        return extendIterator(function(){
            return callback.apply(root, iterable.next());
        });
    };
    
    // Returns `n` number of iterators based on `iterable`. Note that the `iterable`
    // cannot be used once it's copied
    //
    // `tee(iterable, n = 2)`
    var tee = itertool.tee = function(iterable, n) {
        n = n || 2;
        iterable = toIterator(iterable);
        
        var queue = [],
            teeItrables = [], 
            gen = function(idx){
                return extendIterator(function(){
                    if (idx >= queue.length) 
                        queue.push(iterable.next());
                    
                    return queue[idx++];
                });
            };
            
        for(var i = 0; i < n; i++) {
            teeItrables.push(gen(0));
        }
        
        return teeItrables;
    };
    
    // Returns an iterator that groups the item returned by `iterable` by the 
    // `key` function, defaulting to `__identity` function. Note that grouping 
    // occurs for the same succeding items of `iterable`, for all items that 
    // will be returned by the iterator.
    // 
    // `groupby(iterable, key = __identity)`
    // `__identity = function(item) { return item; }`
    var groupby = itertool.groupby = function(iterable, key) {
        var keyfunc = key || __identity,
            tgtkey, currkey, currvalue, grouper;
        
        iterable = toIterator(iterable);
        tgtkey = currkey = currvalue = {};
        
        grouper = function(ptgtkey, continueIter){
            return extendIterator(function(){
                var retvalue; 
                if (currkey === ptgtkey && continueIter) {
                    retvalue = currvalue;
                    try { 
                        currvalue = iterable.next();
                    } catch (err) {
                        if (err !== StopIteration) throw err;
                        continueIter = false;
                    }
                    currkey = keyfunc(currvalue);
                    return retvalue;
                } 
                
                throw StopIteration;
            });
        };
        
        return extendIterator(function(){
            if (currkey == tgtkey) {
                currvalue = iterable.next();
                currkey = keyfunc(currvalue);
            }
            tgtkey = currkey;
            return [currkey, grouper(tgtkey, true)];
        });
    };
    
    // Library version (Major.Minor.Build)
    itertool.VERSION = '0.0.8';
    
    // CommonJS `module` is defined
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = itertool;

    // Default to standalone `exports` variable.
    } else if (typeof exports !== 'undefined') {
        exports = itertool;
        
    // Default to global scope
    } else {
        root.itertool = itertool;
    }
}());
