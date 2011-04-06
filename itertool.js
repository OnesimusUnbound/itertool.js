// itertool.js
// (c) 2011 OnesimusUnbound <marcelino dat deseo aet gmail dat com>
// itertools.js is freely distributable under the terms of the MIT license.
// Documentation: https://github.com/OnesimusUnbound/itertool.js

// Version 0.0.1

(function(){
    // ------------------------- Baseline setup ---------------------------------
    
    var ObjectProto = Object.prototype,
        ArrayProto = Array.prototype;
        
    var __hasOwns = ObjectProto.hasOwnProperty,
    
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
        
        __extend = function(obj, other){
            for (var prop in other){
                if (__hasOwns.call(other, prop)) {
                    obj[prop] = other[prop];
                }
            }
            return obj;
        },
        
        __map = function(items, callback){
            var result = [];
            
            for (var i = 0; i < items.length; i++){
                result[i] = callback(items[i]);
            }
            
            return result;
        },
        
        __slice = ArrayProto.slice,
        
        __truthy = function(item){ return !!item; },
        
        __identity = function(x){ return x; };
    
    var root = this, 
        __previous_itertool = root.itertool, 
        itertool = {};
        
    var StopIteration;
    if (!root.StopIteration) {
        StopIteration = root.StopIteration = Error('StopIteration');
    } else {
        StopIteration = root.StopIteration;
    }
    itertool.StopIteration = StopIteration;
    var Iterator = itertool.Iterator = function(){};
    
    Iterator.prototype.next = function(){ throw StopIteration; };
    Iterator.prototype.__iterator__ = function(){ return this; };
    
    var extendIterator = function(nextImpl) {
        return __extend(new Iterator, {next: nextImpl});
    };
    
    var ArrayIterator = itertool.ArrayIterator = function(array) {
        if(__type(array) === 'Undefined') throw new TypeError;
    
        var size = array.length,
            idx = 0;
        
        return extendIterator(function(){
            if (size > idx) return array[idx++];
            throw StopIteration;
        });
    };
    
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
    
    var ObjectIterator = itertool.ObjectIterator = function(obj, option) {
        if(__type(obj) === 'Undefined') throw new TypeError;
    
        var items = [];
        for (var key in obj){
            if (__hasOwns.call(obj, key)){
                switch(option){
                    case 'keys' : items.push(key); break;
                    case 'all'  : items.push([key, obj[key]]); break;
                    default     : items.push(obj[key]);
                }
            }
        }
        
        return ArrayIterator(items);
    };
    
    var toIterator = itertool.toIterator = function(obj){
        switch(__type(obj)){
            case 'String':
                return StringIterator.apply(root, arguments);
        
            case 'Array':
                return ArrayIterator.apply(root, arguments);
                
            case 'Iterator':
                return obj;
                
            default:
                return ObjectIterator.apply(root, arguments);
        }
    };
    
    var toArray = itertool.toArray = function(iterable){
        var array = [];
        
        try {
            while (true) {
                array.push(iterable.next());
            }
        } catch(err) {
            if (err !== StopIteration) throw err;
            return array;
        }
    };
    
    
    // Utility functions
    // =================
    
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
    
    // Infinite Iterators
    // ==================
    
    // counter
    var counter = itertool.counter = function(start, step){
        start = start || 0;
        step  = step  || 1;
        start -= step;
        
        return extendIterator(function(){
            return (start += step);
        });
    };
    
    // cycle
    var cycle = itertool.cycle = function(obj){
        var type = __type(obj);
        
        if (type === 'Number' || type === 'RegExp' || type === 'Null')
            throw new TypeError;
    
        var iter = toIterator(obj),
            gen, size, idx, items = [];
        
        gen = extendIterator(function(){
            try {
                var item = iter.next();
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
    
    // repeat
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
    // =====================
    // chain
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
    
    // irange
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
    
    var takewhile = itertool.takewhile = function(predicate, iterable) {
        if (__type(predicate) !== 'Function') throw new TypeError;
        
        iterable = toIterator(iterable);
        var takenItem,
            gen = extendIterator(function(){
                if (predicate(takenItem = iterable.next()))
                    return takenItem;
                
                throw StopIteration;
            });
        
        return gen;
    };
    
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
    
    var imap = itertool.imap = function(callback) {
        var iterables = __slice.call(arguments, 1),
            size = iterables.length;
        
        if (__type(callback) !== 'Function') throw new TypeError;
        
        iterables = __map(iterables, function(iterable){
            var type = __type(iterable);
            if (type === 'Number' || type === 'RegExp') 
                throw new TypeError;
                
            return toIterator(iterable);
        });
            
        return extendIterator(function(){
            var args = __map(iterables, function(iterable){ 
                return iterable.next(); 
            });
            
            return callback.apply(root, args);
        });
    };
        
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
    
    var starmap = itertool.starmap = function(callback, argList) {
        if (__type(callback) !== 'Function') throw new TypeError;
        
        var iterable = toIterator(argList);
            
        return extendIterator(function(){
            return callback.apply(root, iterable.next());
        });
    };
    
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
    
    // CommonJS module is defined
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = itertool;

    } else if (typeof exports !== 'undefined') {
        exports = itertool;
        
    } else {
        root.itertool = itertool;
    }
}());
