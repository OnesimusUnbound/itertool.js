// itertools.js
// (c) 2011 OnesimusUnbound <marcelino dat deseo aet gmail dat com>
// itertools.js is freely distributable under the terms of the MIT license.
// Documentation: https://github.com/OnesimusUnbound/itertools.js

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
        
        if (type === 'Number' || type === 'RegExp' 
            || (obj.length && obj.length === 0))
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
            size, concatIdx = 0, currentIter;
            
        for (var idx = 0; idx < iterables.length; idx++){
            var iterable, type = __type(iterables[idx]);
            
            if (type === 'Number' || type === 'RegExp') 
                throw new TypeError;
                
            concatIters.push(toIterator(iterables[idx]))
        }
            
        size = concatIters.length;
        currentIter = concatIters[concatIdx++];
        
        gen = extendIterator(function(){
            try {
                return currentIter.next();
            } catch (err) {
                if (err === StopIteration) {
                    if (size > concatIdx) {
                        currentIter = concatIters[concatIdx++];
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
