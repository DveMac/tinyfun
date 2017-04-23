/* @flow */
const _isArray = Array.isArray,
    { slice: _sl, includes: _inc, concat: _cc, sort: _st, filter: _flt, reduce: _rd, map: _map } = Array.prototype,
    { split: _s, replace: _rep } = String.prototype

type NestedArray<T> = Array<T | NestedArray<T>>
type Comparable<F> = (a1: F) => (a2: F) => boolean
type Identity<A> = (a: A) => A
type Slice<A> = (s: number, e?: number) => (as: Array<A>) => Array<A>
type Sort<A> = (f: (a: A, b: A) => number) => (as: Array<A>) => Array<A>
type Map<A, B> = (f: (A) => B) => (as: Array<A>, context?: any) => Array<B>
type Filter<T> = (f: (value: T, index: number, array: Array<T>) => boolean) => (as: Array<T>) => Array<T>
type Comparator<A,B> = (f: (a: A, a: B) => boolean) => (a: A, b: B) => number
type Reduce<M, P> = (f: (accum: M, val: P, idx: ?number, source: ?Array<P>) => M, initial?: M) => <P>(as: Array<P>) => M
type Diff<T> = (xs: Array<T>, ys: Array<T>) => Array<T>
type Any<A> = (f: (A) => boolean) => (as: Array<A>) => boolean
type Find<A> = <A>(f: (A) => boolean) => (as: Array<A>) => ?A
type Compose = (f: Function, ...fs: Array<Function> ) => Function

declare type Tinyfun = {
    eq: Comparable<*>,
    gt: Comparable<*>,
    gte: Comparable<*>,
    lt: Comparable<*>,
    lte: Comparable<*>,
    identity: Identity<*>,
    prop: (s: string) => (o: Object) => any,
    length: (as: Array<*>) => number,
    slice: Slice<*>,
    compose: Compose,
    head: <A>(as: Array<A>) => A,
    head: (as: string) => string,
    contains: <T>(a: T) => (as: Array<T>) => boolean,
    concat: (...as: Array<*>) => Array<*>,
    sort: Sort<*>,
    map: Map<*, *>,
    filter: Filter<*>,
    comparator: Comparator<*, *>,
    reduce: Reduce<*, *>,
    values: (o: Object) => Array<*>,
    flatten: (a: Array<*>) => Array<number | string | Object>,
    intersection: Diff<*>,
    uniq: (as: Array<*>) => Array<*>,
    any: Any<*>,
    find: Find<*>,
    difference: Diff<*>,
    chain: (f: (a: any) => any) => (as: Array<any>) => Array<number | string | Object>,
    xprod: <A, B>(as: Array<A>) => (bs: Array<B>) => Array<[A, B]>,
    split: (a: string | RegExp) => (b: string) => Array<string>,
    path: (ss: Array<string>) => (o: Object) => any,
    replace: (p: string | RegExp, r: string) => (s: string) => string,
    groupBy: <A>(f: (A) => string) => (as: Array<A>) => $ObjMap<string, A>,
    pick: (ks: Array<string>) => (o: Object) => Object,
}

const head = as => as[0]
const slice = (s, e) => as => _sl.call(as, s, e)
const length = as => as.length
const compose: Compose = (f, ...fs) => fs.length ? (...args) => f(compose(...fs)(...args)) : f
const concat = (...as) => _cc.apply([], as)
const map = f => (as, context = null) => _map.call(as, f, context)
const reduce = (f, initial) => (as) => _rd.call(as, f, initial)
const flatten = reduce((a, b) => concat(a, _isArray(b) ? flatten(b) : b), [])
const uniq = as => [...new Set(as)]
const filter = f => as => _flt.call(as, f)
const chain = f => compose(flatten, map(f))

const tf: Tinyfun = {

    eq: a => b => a === b,

    // gt: is a2 greater than a1
    // Ord a => a → a → Boolean
    gt: a1 => a2 => a1 < a2,

    // gte: is a2 greater than or equal to a1
    // Ord a => a → a → Boolean
    gte: a1 => a2 => a1 <= a2,

    // less than: is a2 less than a1
    // Ord a => a → a → Boolean
    lt: a1 => a2 => a1 > a2,

    // Ord a => a → a → Boolean
    lte: a1 => a2 => a1 >= a2,

    // a → a
    identity: a => a,

    // s => {s: a} → a | Undefined
    prop: s => o => o[s],

    // [a] → Number
    length: length,

    // Number → Number → [a] → [a]
    slice: slice,

    // [a] → a | Undefined
    // String → String
    head: head,

    // [a] → [a]
    init: slice(0, -1),

    // [a] → a | Undefined
    last: compose(head, slice(-1)),

    // [a] → [a]
    tail: slice(1),

    // {k: v} → [k]
    keys: Object.keys,

    // [a] → [a] → [a]
    concat: concat,

    // a → [a] → Boolean
    contains: a => as => _inc.call(as, a),

    // (a,a → Number) → [a] → [a]
    sort: (f) => (as) => _st.call(concat([], as), f),

    // Functor f => (a → b) → f a → f b
    map: map,

    // Filterable f => (a → Boolean) → f a → f a
    filter: filter,

    // (a, b → Boolean) → (a, b → Number)
    comparator: f => (a, b) => { const v = f(a, b); return (v ? 1 : (v ? -1 : 0)) },

    // ((a, b) → a) → a → [b] → a
    reduce: reduce,

    // {k: v} → [v]
    values: o => map(k => o[k])(Object.keys(o)),

    // [a] → [b]
    flatten: flatten,

    // [a] → [a]
    uniq: uniq,

    // [*] → [*] → [*]
    intersection: (xs, ys) => {
        const zs = new Set(ys)
        return filter(x => zs.has(x))(uniq(xs))
    },

    // ((y → z), (x → y), …, (o → p), ((a, b, …, n) → o)) → ((a, b, …, n) → z)  WTF!
    compose: compose,

    // (a → Boolean) → [a] → Boolean
    any: f => compose(tf.gt(0), length, filter(f)),

    // (a → Boolean) → [a] → a | undefined
    find: f => reduce((m, v) => m || (f(v) ? v : m)),

    // [*] → [*] → [*]
    union: compose(uniq, concat),

    // [*] → [*] → [*]
    difference: (xs, ys) => {
        const zs = new Set(ys)
        return filter(x => !!zs && !zs.has(x))(uniq(xs))
    },

    // Chain m => (a → m b) → m a → m b
    chain: chain,
    flatMap: chain,

    // [a] → [b] → [[a,b]]
    xprod: as => reduce((m, b) => concat(m, map(a => [a,b])(as)), []),

    // (String | RegExp) → String → [String]
    split: a => b => _s.call(b, a),

    // [String] → {k: v} → v | Undefined
    path: ss => o => reduce((m, s) => m && (s in m) ? m[s] : undefined, o)(ss),

    // RegExp|String → String → String → String
    replace: (p, r) => s => _rep.call(s, p, r),

    // (a → String) → [a] → {String: [a]}
    groupBy: f => reduce((m, a) => {
        const _k = (String(f(a)))
        m[_k] = concat(m[_k] || [], [a])
        return m
    }, {}),

    // [k] → {k: v} → {k: v}
    pick: ks => o => reduce((m, k) => {
        if (k in o) m[k] = o[k]
        return m
    }, {})(ks),

}

module.exports = tf