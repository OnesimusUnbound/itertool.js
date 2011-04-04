// itertool.js
// (c) 2011 OnesimusUnbound <marcelino dat deseo aet gmail dat com>
// itertools.js is freely distributable under the terms of the MIT license.
// Documentation: https://github.com/OnesimusUnbound/itertool.js

// Version 0.0.1

(function(){
    // ------------------------- Baseline setup ---------------------------------
    
    var ObjectProto = Object.prototype,
        ArrayProto = Array.prototype;
        
    var __owns = ObjectProto.hasOwnProperty,
    
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
                if (__owns.call(other, prop)) {
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
        
        __slice = ArrayProto.slice;
    
    var root = this; 
    var __previous_itertool = root.itertool;
    var itertool = {};
        
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
    
    itertool.ArrayIterator = ArrayIterator = function(array) {
        if(__type(array) === 'Undefined') throw new TypeError;
    
        var size = array.length,
            idx = 0;
        
        return extendIterator(function(){
            if (size > idx) {
                return array[idx++];
            }
            
            throw StopIteration;
        });
    };
    
    itertool.StringIterator = StringIterator = function(string, option){
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
    
    itertool.ObjectIterator = ObjectIterator = function(obj, option) {
        if(__type(obj) === 'Undefined') throw new TypeError;
    
        var items = [];
        for (var key in obj){
            if (__owns.call(obj, key)){
                switch(option){
                    case 'keys' : items.push(key); break;
                    case 'all'  : items.push([key, obj[key]]); break;
                    default     : items.push(obj[key]);
                }
            }
        }
        
        return ArrayIterator(items);
    };
    
    itertool.toIterator = toIterator = function(obj){
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
    
    // Infinite Iterators
    // ==================
    
    // counter
    itertool.counter = function(start, step){
        start = start || 0;
        step  = step  || 1;
        start -= step;
        
        return extendIterator(function(){
            return (start += step);
        });
    };
    
    // cycle
    itertool.cycle = function(obj){
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
                if (err === StopIteration) {
                    size = items.length; 
                    if (!size) throw err;
                    
                    idx = 0; 
                    gen.next = function(){
                        if (idx >= size) idx = 0;
                        return items[idx++];
                    };
                    
                    return gen.next();
                } else {
                    throw err;
                }
            }
        });
        
        return gen;
    };
    
    // repeat
    itertool.repeat = function(element, n){
        var count = 0;
            
        return extendIterator(n !== void 0 
            ? function(){
                if (count < n) {
                    count++;
                    return element;
                }
                throw StopIteration;
            } 
            : function() { 
                return element; 
            }
        );
    };
    
    // Terminating Iterators
    // =====================
    // chain
    itertool.chain = function(){
        var iterables = __slice.call(arguments),
            concatIters = [], 
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
                if (err === StopIteration) {
                    if (size > iterIdx) {
                        currentIter = iterables[iterIdx++];
                        return gen.next();
                    }
                    throw StopIteration;
                } else {
                    throw err;
                }
            }
        });
        
        return gen;
    };
    
    // irange
    itertool.irange = function(start, stop, step) {
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
    
    itertool.compress = function(data, selectors) {
        var iterData = toIterator(data),
            iterSelector = toIterator(selectors);
            
        return extendIterator(function(){
            while(!iterSelector.next()) {
                iterData.next();
            }
            return iterData.next();
        });
    };
    
    itertool.dropwhile = function(predicate, iterable) {
        if (typeof predicate !== 'function') throw new TypeError;
        
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
    
    itertool.takewhile = function(predicate, iterable) {
        if (typeof predicate !== 'function') throw new TypeError;
        
        iterable = toIterator(iterable);
        var takenItem,
            gen = extendIterator(function(){
                if (predicate(takenItem = iterable.next()))
                    return takenItem;
                
                throw StopIteration;
            });
        
        return gen;
    };
    
    itertool.ifilter = function() {
        var iterable, predicate;
        
        if (arguments.length === 2) {
            iterable = arguments[1];
            predicate = arguments[0];
            if (typeof predicate !== 'function') throw new TypeError;
            
        } else if (arguments.length === 1) {
            iterable = arguments[0];
            predicate = function(item){ return !!item; };
            
        }
        
        iterable = toIterator(iterable);
        var validItem;
        
        return extendIterator(function(){
            while(!predicate(validItem = iterable.next()));
            return validItem;
        });
    };
    
    itertool.ifilterfalse = function() {
        var iterable, predicate;
        
        if (arguments.length === 2) {
            iterable = arguments[1];
            predicate = arguments[0];
            if (typeof predicate !== 'function') throw new TypeError;
            
        } else if (arguments.length === 1) {
            iterable = arguments[0];
            predicate = function(item){ return !!item; };
            
        }
        
        iterable = toIterator(iterable);
        var validItem;
        
        return extendIterator(function(){
            while(predicate(validItem = iterable.next()));
            return validItem;
        });
    };
    
    itertool.imap = function() {
        var callback = arguments[0],
            iterables = __slice.call(arguments, 1),
            size = iterables.length;
        
        if (typeof callback !== 'function') throw new TypeError;
        
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
        
    itertool.islice = function(iterable, start, stop, step) {
        if (arguments.length <= 1) {
            stop = start || 0;
            start = 0;
        }
        step = step || 1;
        iterable = toIterator(iterable);
        var iterRange = itertool.irange(start, stop, step),
            validIdx = iterRange.next(),
            idx = 0;
            
        return extendIterator(function(){
            while (idx < validIdx) {
                iterable.next();
                idx++;
            }
            validIdx = iterRange.next();
            return iterable.next();
        });
    };
    
    itertool.izip = function() {
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
    
    itertool.izip_longest = function() {
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
                        if (err === StopIteration) {
                            if (numEndedIter < numIterables) {
                                numEndedIter++;
                                return fillvalue;
                            }
                        }
                    }
                });
                
            if (numEndedIter < numIterables)
                return result;
                
            throw StopIteration;
        });
    };
    
    itertool.noConflict = function() {
        root.itertool = __previous_itertool;
        return this;
    };
    
    // CommonJS module is defined
    if (typeof window === 'undefined' && typeof module !== 'undefined') {
        // Export module
        module.exports = itertool;

    } else {
        root.itertool = itertool;
    }
}());
