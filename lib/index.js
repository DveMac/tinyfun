'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _isArray = Array.isArray,
    _Array$prototype = Array.prototype,
    _slice = _Array$prototype.slice,
    _includes = _Array$prototype.includes,
    _concat = _Array$prototype.concat,
    _sort = _Array$prototype.sort,
    _filter = _Array$prototype.filter,
    _reduce = _Array$prototype.reduce,
    _map = _Array$prototype.map,
    _String$prototype = String.prototype,
    _split = _String$prototype.split,
    _replace = _String$prototype.replace;

var
// equals: is a equal to b
// a → b → Boolean
equals = function equals(a) {
    return function (b) {
        return a === b;
    };
},


// gt: is a2 greater than a1
// Ord a => a → a → Boolean
gt = function gt(a1) {
    return function (a2) {
        return a1 < a2;
    };
},


// gte: is a2 greater than or equal to a1
// Ord a => a → a → Boolean
gte = function gte(a1) {
    return function (a2) {
        return a1 <= a2;
    };
},


// less than: is a2 less than a1
// Ord a => a → a → Boolean
lt = function lt(a1) {
    return function (a2) {
        return a1 > a2;
    };
},


// Ord a => a → a → Boolean
lte = function lte(a1) {
    return function (a2) {
        return a1 >= a2;
    };
},


// a → a
identity = function identity(a) {
    return a;
},


// s => {s: a} → a | Undefined
prop = function prop(s) {
    return function (o) {
        return o[s];
    };
},


// [a] → Number
length = function length(as) {
    return as.length;
},


// ((y → z), (x → y), …, (o → p), ((a, b, …, n) → o)) → ((a, b, …, n) → z)  WTF!
compose = function compose(f) {
    for (var _len = arguments.length, fs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        fs[_key - 1] = arguments[_key];
    }

    return fs.length ? function () {
        return f(compose.apply(undefined, fs).apply(undefined, arguments));
    } : f;
},


// Number → Number → [a] → [a]
slice = function slice(s, e) {
    return function (as) {
        return _slice.call(as, s, e);
    };
},


// [a] → a | Undefined
// String → String
head = function head(as) {
    return as[0];
},


// [a] → [a]
init = slice(0, -1),


// [a] → a | Undefined
last = compose(head, slice(-1)),


// [a] → [a]
tail = slice(1),


// {k: v} → [k]
keys = Object.keys,


// a → [a] → Boolean
contains = function contains(a) {
    return function (as) {
        return _includes.call(as, a);
    };
},


// [a] → [a] → [a]
concat = function concat() {
    for (var _len2 = arguments.length, as = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        as[_key2] = arguments[_key2];
    }

    return _concat.apply([], as);
},


// (a,a → Number) → [a] → [a]
sort = function sort(f) {
    return function (as) {
        return _sort.call(concat([], as), f);
    };
},


// Functor f => (a → b) → f a → f b
map = function map(f) {
    return function (as) {
        var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        return _map.call(as, f, context);
    };
},


// Filterable f => (a → Boolean) → f a → f a
filter = function filter(f) {
    return function (as) {
        return _filter.call(as, f);
    };
},


// (a, b → Boolean) → (a, b → Number)
comparator = function comparator(f) {
    return function (a, b) {
        return f(a, b) ? 1 : f(b, a) ? -1 : 0;
    };
},


// ((a, b) → a) → a → [b] → a
reduce = function reduce(f, initial) {
    return function (as) {
        return _reduce.call(as, f, initial);
    };
},


// {k: v} → [v]
values = function values(o) {
    return map(function (k) {
        return o[k];
    })(keys(o));
},


// [a] → [b]
flatten = reduce(function (a, b) {
    return concat(a, _isArray(b) ? flatten(b) : b);
}, []),


// (a → Boolean) → [a] → Boolean
any = function any(f) {
    return compose(Boolean, length, filter(f));
},


// (a → Boolean) → [a] → a | undefined
find = function find(f) {
    return reduce(function (m, v) {
        return m || (f(v) ? v : m);
    });
},


// [a] → [a]
uniq = function uniq(as) {
    return [].concat(_toConsumableArray(new Set(as)));
},


// [*] → [*] → [*]
union = compose(uniq, concat),


// [*] → [*] → [*]
intersection = function intersection(xs, ys, zs) {
    return (zs = new Set(ys)) && filter(function (x) {
        return zs.has(x);
    })(uniq(xs));
},


// [*] → [*] → [*]
difference = function difference(xs, ys, zs) {
    return (zs = new Set(ys)) && filter(function (x) {
        return !zs.has(x);
    })(uniq(xs));
},


// Chain m => (a → m b) → m a → m b // also known as flatMap
chain = function chain(f) {
    return compose(flatten, map(f));
},


// [a] → [b] → [[a,b]]
xprod = function xprod(as) {
    return reduce(function (m, b) {
        return concat(m, map(function (a) {
            return [a, b];
        })(as));
    }, []);
},


// (String | RegExp) → String → [String]
split = function split(a) {
    return function (b) {
        return _split.call(b, a);
    };
},


// [String] → {k: v} → v | Undefined
path = function path(ss) {
    return function (o) {
        return reduce(function (m, s) {
            return m && s in m ? m[s] : undefined;
        }, o)(ss);
    };
},


// (a → String) → [a] → {String: [a]}
groupBy = function groupBy(f, _k) {
    return reduce(function (m, a) {
        return (_k = '' + f(a)) && (m[_k] = concat(m[_k] || [], [a])) && m;
    }, {});
},


// RegExp|String → String → String → String
replace = function replace(p, r) {
    return function (s) {
        return _replace.call(s, p, r);
    };
},


// [k] → {k: v} → {k: v}
pick = function pick(ks) {
    return function (o) {
        return reduce(function (m, k) {
            return k in o ? ~(m[k] = o[k]) && m : m;
        }, {})(ks);
    };
};

module.exports = { equals: equals, lt: lt, lte: lte, gt: gt, gte: gte, identity: identity, head: head, init: init, last: last, tail: tail, uniq: uniq, length: length, slice: slice,
    comparator: comparator, prop: prop, keys: keys, contains: contains, concat: concat, map: map, filter: filter, flatten: flatten, sort: sort, any: any, find: find, union: union, values: values,
    reduce: reduce, intersection: intersection, difference: difference, chain: chain, xprod: xprod, compose: compose, split: split, path: path, groupBy: groupBy, replace: replace, pick: pick };

