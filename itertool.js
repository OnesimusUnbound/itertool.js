// itertool.js
// ===========
// 
// (c) 2011 OnesimusUnbound <marcelino dat deseo aet gmail dat com>
// itertools.js is freely distributable under the terms of the MIT license.
// Documentation: https://github.com/OnesimusUnbound/itertool.js
// Version 0.1.*
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

        // gets the falsy result of the `predicate(item)`
        __negator = function(predicate){
            if (typeof predicate !== 'function') throw new TypeError;
            return function(item){
                return !predicate(item);
            };
        },
        
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
    
    // Creates an iterator for array
    var ArrayIterator = itertool.ArrayIterator = function(array) {
        if(__type(array) === 'Undefined') throw new TypeError;
    
        var size = array.length,
            idx = 0;
        
        return createIter(function(){
            if (size > idx) return array[idx++];
            iter.stop();
        });
    };
    
    // creates is an iterator for string.
    var StringIterator = itertool.StringIterator = function(string, option){
        var items, size, idx;
        
        if(__type(string) === 'Undefined') throw new TypeError;
        option = option || "";
        items = [];
        
        if (option === "") {
            size = string.length;
            idx = 0;
            return createIter(function(){
                if (size > idx) return string.charAt(idx++);
                iter.stop();
            });
        }
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
        var items;
        
        if(__type(obj) === 'Undefined') throw new TypeError;
        items = [];
        option = option || 'values';
        
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
    var iter = itertool.iter = function(obj){
        switch(__type(obj)){
            case 'Number':
            case 'RegExp':
            case 'Null':        throw new TypeError;
            case 'String':      return StringIterator.apply(root, arguments);
            case 'Array':       return ArrayIterator.apply(root, arguments);
            case 'Iterator':    return obj;
            default:            return ObjectIterator.apply(root, arguments);
        }
    };
    
    // raises StopIteration
    iter.stop = function(){
        throw StopIteration;
    };
    
    // Sets the `next` function of `iterator` with `nextCallback`.
    var setNext = iter.setNext = function(iterator, nextCallabck) {
        iterator.next = nextCallabck;
    };
    
    // Sets the `next` function of `gen` with `nextCallback` 
    // and then execute the newly assigned `next`.
    var setAndRunNext = iter.setAndRunNext = function(iterator, nextCallback) {
        setNext(iterator, nextCallback);
        return iterator.next();
    };

    // A helper function to instantiate Iterator and implement the 
    // instance's `next` function in `nextImpl`
    var createIter = iter.createIter = function(nextImpl) {
        var iter = new Iterator;
        setNext(iter, nextImpl);
        return iter;
    };
    
    var iterClone = function(iterable) {
        this.queue = []; 
        this.iterableConv = null;
        this.cloneIter = function() {
            var idx = 0, iterCloneThis = this;
            return createIter(function(){
                if (!iterCloneThis.iterableConv) 
                    iterCloneThis.iterableConv = iter(iterable);
                
                return setAndRunNext(this, function(){
                    if (idx >= iterCloneThis.queue.length) 
                        iterCloneThis.queue.push(
                            iterCloneThis.iterableConv.next());
                    
                    return iterCloneThis.queue[idx++];
                });
            });
        };
    };
    
    var iterCloner = iter.iterCloner = function(iterable) {
        return new iterClone(iterable);
    };

    // Utility Functions
    // -----------------
    
    itertool.noConflict = function() {
        root.itertool = __previous_itertool;
        return this;
    };
    
    // Converts the iterator to array. Do not use this 
    // function for infinite iterators!
    var toArray = itertool.toArray = function(iterable){
        var array = [];
        
        try {
            while (true) array.push(iterable.next());
            
        } catch(err) {
            if (err !== StopIteration) throw err;
        }
        
        return array;
    };

    
    // Infinite Iterator
    // -----------------
    //
    // Infinite Iterators creates iterators that usually does not terminate
    // This is useful for generating infinite series of numbers.
    
    // This creates iterator that returns numbers starting from `start`, 
    // incrementing (or decrementing) by `step`. The iterator does not end.
    //
    // `counter(start = 0, step = 1)`
    var counter = itertool.counter = function(start, step){
        start = start || 0;
        step  = step  || 1;
        start -= step;
        
        return createIter(function(){
            return (start += step);
        });
    };
    
    // This creates a iterator that repeats the content of the `iterable`.
    //
    // `cycle(iterable)`
    var cycle = itertool.cycle = function(iterable){
        var size, idx, items,
            init, storeIter, main;
        
        init = function(){
            items = [];
            iterable = iter(iterable);
            return setAndRunNext(this, storeIter);
        };
        storeIter = function(){
            try {
                var item = iterable.next();
                items.push(item);
                return item;
            } catch (err) {
                if (err !== StopIteration) {
                    setNext(this, iter.stop);
                    throw err;
                }
                 
                if (!(size = items.length)){
                    return setAndRunNext(this, iter.stop);
                }
                
                idx = 0; 
                return setAndRunNext(this, main);
            }
        };
        main = function(){
            if (idx >= size) idx = 0;
            return items[idx++];
        };
        
        return createIter(init);
    };
    
    // This creates iterator that repeats the `element` by 
    // `n`th times, or infinitely if `n` is not provided.
    //
    // `repeat(element, [n])`
    var repeat = itertool.repeat = function(element, n){
        var count = 0;
        
        if (!n) {
            return createIter(function() { return element; });
        } else {
            return createIter(function(){
                if (count < n) {
                    count++;
                    return element;
                }
                iter.stop();
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
        var iterables, size, iterIdx, currentIter,
            init, main;
        
        iterables = __slice.call(arguments)
        size = iterables.length;
        iterIdx = 0
        
        init = function(){
            currentIter = iter(iterables[iterIdx++]);
            return setAndRunNext(this, main);
        };
        main = function(){
            try {
                return currentIter.next();
            } catch (err) {
                if (err !== StopIteration) {
                    setNext(iter.stop);
                    throw err;
                }
                if (size > iterIdx) {
                    return setAndRunNext(this, init);
                }
                iter.stop();
            }
        };
        
        return createIter(init);
    }; 
    
    // This will create iterator that "concatenate" all iterable in `iterables` passed, 
    // creating one iterable
    // 
    // `chain_from_iterable(iterables)`
    var chain_from_iterable = itertool.chain_from_iterable = function(iterables){
        return chain.apply(itertool, iterables);
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
        return createIter(function(){
            if (idx < len) {
                idx++;
                return (start += step);
            }
            iter.stop();
        });
    };
    
    // This returns iterator where the item in `data` whose corresponding item in `selectors` 
    // will evaluate true in truthiness
    // 
    // `compress(data, selectors)` 
    var compress = itertool.compress = function(data, selectors) {
        var iterData, iterSelector, 
            init, main; 
            
        init = function(){
            iterData = iter(data);
            iterSelector = iter(selectors);
            return setAndRunNext(this, main);
        };
        main = function(){
            while(!iterSelector.next()) {
                iterData.next();
            }
            return iterData.next();
        };
            
        return createIter(init);
    };
    
    
    // This returns an iterator that drops the first items in the `iterable` that does not 
    // return `true` as defined in the `predicate`, When an item does not return `true` in 
    // the `predicate`, that item and those that succeed it in the predicate are returned, 
    // even if an item returns `true` in the predicate.
    // 
    // `dropwhile(predicate, iterable)`
    var dropwhile = itertool.dropwhile = function(predicate, iterable) {
        var firstValid, 
            init, dropFirstItems, main;
        
        if (__type(predicate) !== 'Function') throw new TypeError;
        
        init = function(){
            iterable = iter(iterable);
            return setAndRunNext(this, dropFirstItems);
        };
        dropFirstItems = function(){
            while(predicate(firstValid = iterable.next()))
                ; // drop the first invalid items
            setNext(this, main);
            return firstValid;
        };
        main = function(){
            return iterable.next();
        };
        
        return createIter(init);
    };
    
    // This returns an iterator that takes the first items in the `iterable` that returns 
    // `true` as defined in the `predicate`, When an item does not return `true` in the 
    // `predicate`, that item and those that succeed it in the predicate are discarded, 
    // even if an item returns `true` in the predicate.
    // 
    // takewhile(predicate, iterable)
    var takewhile = itertool.takewhile = function(predicate, iterable) {
        var takenItem, 
            init, main;
        
        if (__type(predicate) !== 'Function') throw new TypeError;
        
        init = function(){
            iterable = iter(iterable);
            return setAndRunNext(this, main);
        };
        main = function(){
            if (predicate(takenItem = iterable.next()))
                return takenItem;
            return setAndRunNext(this, iter.stop);
        };
        
        return createIter(init);
    };
    
    // Returns an iterator that returns items in the iterable` 
    // that evaluates `true` when passed in the `predicate`.
    // 
    // `ifilter(predicate, iterable)`
    var ifilter = itertool.ifilter = function(predicate, iterable) {
        var validItem,
            init, main;
        iterable = iterable || predicate;
        predicate = arguments.length === 2 ? predicate : __truthy;
        if (typeof predicate !== 'function') throw new TypeError;

        init = function(){
            iterable = iter(iterable);
            return setAndRunNext(this, main);
        };
        main = function(){
            while(!predicate(validItem = iterable.next()));
            return validItem;
        };
        
        return createIter(init);
    };
    
    // Returns an iterator that returns items in the `iterable` 
    // that evaluates `false` when passed in the `predicate`.
    // 
    // `ifilterfalse(predicate, iterable)`
    var ifilterfalse = itertool.ifilterfalse = function(predicate, iterable) {
        iterable = iterable || predicate;
        predicate = arguments.length === 2 ? predicate : __truthy;
        
        return ifilter(__negator(predicate), iterable);
    };
    
    // Returns an iterator that returns the result of an item from each `iterable` 
    // in `iterables` passed in the `predicate`.
    // 
    // imap(predicate, iterators...)
    var imap = itertool.imap = function(callback) {
        var iterables, zippedIter,
            init, main;
        if (__type(callback) !== 'Function') throw new TypeError;
        iterables = __slice.call(arguments, 1);
        
        init = function(){
            zippedIter = izip.apply(itertool, iterables);
            return setAndRunNext(this, main);
        };
        main = function(){
            return callback.apply(itertool, zippedIter.next());
        };
        
        return createIter(init);
    };
    
    // Returns an iterator that returns item in `iterable` whose order matches the 
    // series generated by `irange(start, stop, step)`
    // 
    // islice(iterable, stop) or islice(iterable, start, stop) or islice(iterable, start, stop, step) 
    var islice = itertool.islice = function(iterable) {
        var iterRange, validIdx,
            init, main;
            
        iterRange = __slice.call(arguments, 1);
        init = function(){
            iterable = enumerate(iterable);
            iterRange = irange.apply(itertool, iterRange);
            return setAndRunNext(this, main);
        };
        main = function(){
            var item;
            validIdx = iterRange.next();
            while (true) {
                item = iterable.next();
                if (item[0] === validIdx) return item[1];
            }
        };
        return createIter(init);
    };
    
    // Returns iterator that returns combined all items of the same order for each iterables
    // The the maximum number of items returned by the generated iterator will depend on the 
    // the `iterable` that has the fewest number of item returned.
    // 
    // `izip(iterables...)`
    var izip = itertool.izip = function() {
        var size,
            init, main;
            
        iterables = __slice.call(arguments);
        size = iterables.length;
        
        init = function(){
            iterables = __map(iterables, function(iterable){
                return iter(iterable);
            });
            
            return setAndRunNext(this, main);
        };    
        main = function(){
            if (size > 0)
                return __map(iterables, function(iterable){
                    return iterable.next();
                });
                    
            iter.stop();
        };
        return createIter(init);
    };
    
    // Returns iterator that returns combined all items of the same order for each iterables
    // When one of the iterable ends while there are some that did not end, the `fillvalue` 
    // will be used. when no fillvalue was passed, an empty string is used.
    // 
    // `izip_longest(fillvalue = "", iterables...)`
    var izip_longest = itertool.izip_longest = function() {
        var iterables, fillvalue, numIterables,
            init, main;
            
        iterables = __slice.call(arguments, 1),
        fillvalue = arguments[0] || "";
        numIterables = iterables.length;
        
        init = function(){
            iterables = __map(iterables, function(iterable){       
                return iter(iterable);
            });
            return setAndRunNext(this, main);
        };
        main = function(){
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
                
            iter.stop();
        };
        
        return createIter(init);
    };
    
    // Returns an iterator that passes each argument in array within `argList` 
    // (which is an array) to the callback, returning the result for each invocation
    // of the iterator.
    // 
    // `starmap(callback, argList)`
    var starmap = itertool.starmap = function(callback, argList) {
        var iterable, 
            init, main;
        if (__type(callback) !== 'Function') throw new TypeError;
        
        init = function(){
            iterable = iter(argList);
            return setAndRunNext(this, main);
        };
        main = function(){
            return callback.apply(root, iterable.next());
        };
        return createIter(init);
    };
    
    // Returns `n` number of iterators based on `iterable`. Note that the `iterable`
    // cannot be used once it's copied
    //
    // `tee(iterable, n = 2)`
    var tee = itertool.tee = function(iterable, n) {
        var cloner, teeItrables;
            
        n = n || 2;
        cloner = iterCloner(iterable);
        teeItrables = [];
            
        for(var i = 0; i < n; i++) {
            teeItrables.push(cloner.cloneIter());
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
            tgtkey, currkey, currvalue, grouper,
            init, main;
        tgtkey = currkey = currvalue = {};
        init = function(){
            iterable = iter(iterable);
            return setAndRunNext(this, main);
        };
        main = function(){
            if (currkey == tgtkey) {
                currvalue = iterable.next();
                currkey = keyfunc(currvalue);
            }
            tgtkey = currkey;
            return [currkey, grouper(tgtkey, true)];
        }
        grouper = function(ptgtkey, continueIter){
            return createIter(function(){
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
                
                iter.stop();
            });
        };
        return createIter(init);
    };
    
    // Returns an iterator that returns an array containing the order 
    // of the item in `iterable`, starting from `start`, defaulting to 0.
    var enumerate = itertool.enumerate = function(iterable, start) {
        var idx,
            init, main;
        
        start = start || 0;
        idx = start;
        init = function(){
            iterable = iter(iterable);
            return setAndRunNext(this, main);
        };
        main = function(){
            return [idx++, iterable.next()];
        };
        
        return createIter(init);
    };
    
    var product_object = function(iterable){
        this.cloner = iterCloner(iterable);
        this.iterator = this.cloner.cloneIter()
        this.value = null;
    };
    
    // Library version (Major.Minor.Build)
    itertool.VERSION = '0.1.1';
    
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
