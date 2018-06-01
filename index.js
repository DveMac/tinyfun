const _isArray = Array.isArray,
    { slice: _sl, includes: _inc, concat: _cc, sort: _st, filter: _flt, reduce: _rd, map: _map } = Array.prototype,
    { split: _s, replace: _rep } = String.prototype

function autocurry(f, scope) {
    return function () {
        const args = _sl.call(arguments)
        return args.length < f.length
            ? autocurry(args.reduce(function (g, arg) {return g.bind(null, arg)}, f))
            : f.apply(scope, args)
    }
}

const curryCache = {}

const handler = {
    get(target, propKey, receiver) {
        return propKey in curryCache
            ? curryCache[propKey]
            : (curryCache[propKey] = autocurry(target[propKey], receiver))
    },
}

const core = new Proxy({
    // [a] → a | Undefined
    // String → String
    // head: <A: Array<*> | string>(as: Array<A>): A => as[0],
    head: (as) => as[0],

    // Number → Number → [a] → [a]
    // slice: <A: any>(s: number, e: number, as: Array<A>): Array<A> => _sl.call(as, s, e),
    slice: (s, e, as) => _sl.call(as, s, e),

    // ((a, b) → a) → a → [b] → a
    // reduce: <A: any, B: any>(f: (B, A) => B, initial: any | A, as: Array<A>): B => _rd.call(as, f, initial),
    reduce: (f, initial, as) => _rd.call(as, f, initial),

    // ((y → z), (x → y), …, (o → p), ((a, b, …, n) → o)) → ((a, b, …, n) → z)  WTF!
    // compose: (f: Function, ...fs: Array<Function>) => fs.length ? (...args: Array<*>) => f(core.compose(...fs)(...args)) : f,
    compose: (f, ...fs) => fs.length ? (...args) => f(core.compose(...fs)(...args)) : f,

    // [a] → [a]
    uniq: as => [...new Set(as)],

    // [a] → [a] → [a]
    // concat: (as1: Array<any>, as2?: Array<any>): Array<any> => _cc.apply([], [as1, as2]),
    concat: (as1, as2) => _cc.apply([], [as1, as2]),

    // Filterable f => (a → Boolean) → f a → f a
    // filter: <A: any>(f: (A) => boolean, as: Array<A>): Array<A> => _flt.call(as, f),
    filter: (f, as) => _flt.call(as, f),

    // [a] → Number
    length: as => as ? as.length : 0,

    eq: (a, b) => a === b,

    // Ord a => a → a → Boolean
    gt: (a1, a2) => a1 < a2,

    // Ord a => a → a → Boolean
    gte: (a1, a2) => a1 <= a2,

    // Ord a => a → a → Boolean
    lt: (a1, a2) => a1 > a2,

    // Ord a => a → a → Boolean
    lte: (a1, a2) => a1 >= a2,

    // a → a
    identity: a => a,

    // s => {s: a} → a | Undefined
    prop: (s, o) => o[s],

    // Functor f => (a → b) → f a → f b
    map: (f, as, context = null) => _map.call(as, f, context),
}, handler)

const TF = {
    keys: Object.keys,

    // [a] → [b]
    flatten: core.reduce((a, b) => core.concat(a, _isArray(b) ? TF.flatten(b) : b), []),

    // Chain m => (a → m b) → m a → m b
    chain: f => core.compose(TF.flatten, core.map(f)),

    // [a] → [a]
    init: core.slice(0, -1),

    // [a] → a | Undefined
    last: as => _sl.call(as, -1)[0],

    // [a] → [a]
    tail: core.slice(1, Infinity),

    // a → [a] → Boolean
    contains: (a, as) => _inc.call(as, a),

    // (a,a → Number) → [a] → [a]
    sort: (f, as) => _st.call(_sl.call(as), f),

    // (a, b → Boolean) → (a, b → Number)
    comparator: (f, a, b) => {
        const v = f(a, b)
        return (v ? 1 : (v ? -1 : 0))
    },

    // {k: v} → [v]
    values: Object.values || (o => core.map(k => o[k])(Object.keys(o))),

    // [*] → [*] → [*]
    intersection: (xs, ys) => {
        const zs = new Set(ys)
        return core.filter(x => zs.has(x))(core.uniq(xs))
    },

    // (a → Boolean) → [a] → a | undefined
    find: (f, as) => core.reduce((m, v) => m || (f(v) ? v : m), undefined, as),

    // [*] → [*] → [*]
    union: core.compose(core.uniq, core.concat),

    // [*] → [*] → [*]
    difference: (xs, ys) => {
        const zs = new Set(ys)
        return core.filter(x => !!zs && !zs.has(x))(core.uniq(xs))
    },

    // [a] → [b] → [[a,b]]
    xprod: as => core.reduce((m, b) => core.concat(m, core.map(a => [a,b])(as)), []),

    // (String | RegExp) → String → [String]
    split: (a, b) => _s.call(b, a),

    // [String] → {k: v} → v | Undefined
    path: (ss, o) => core.reduce((m, s) => m && (s in m) ? m[s] : undefined, o, ss),

    // RegExp|String → String → String → String
    replace: (p, r, s) => _rep.call(s, p, r),

    // (a → String) → [a] → {String: [a]}
    groupBy: f => core.reduce((m, a) => {
        const _k = (String(f(a)))
        m[_k] = core.concat(m[_k] || [], [a])
        return m
    }, {}),

    // [k] → {k: v} → {k: v}
    pick: (ks, o) => core.reduce((m, k) => {
        if (k in o) m[k] = o[k]
        return m
    }, {}, ks),

    // String → a → {k: v} → {k: v}
    assoc: (s, a, o) => Object.assign({ [s]: a }, o),
}

const lib = Object.assign({ curry: autocurry }, core, new Proxy(TF, handler))

module.exports = lib;
