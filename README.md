# tinyfun

Experimental ES6 based functional library.

Related blog post: https://medium.com/@DveMac/using-es6-to-create-a-tiny-functional-library-fe8e4667045c

### Installation

```bash
npm install --save tinyfun
# OR
yarn add tinyfun
```

### Building & testing

```bash
npm test
npm run build
```

### Usage Example

```
import { compose, filter, prop, sort, comparator, equals, length } from 'tinyfun'

const getName = prop('name')
const byNameDesc = comparator((a, b) => getName(a) > getName(b))
const nameLenIs3 = compose(equals(3), length, getName)

const name = getName({ name: 'dog' })
const sorted = sort(byNameDesc)([ /* some things */ ])
```

### API

```js
// a → b → Boolean
equals = a => b => a === b,

// Ord a => a → a → Boolean
gt = a1 => a2 => a1 < a2,

// Ord a => a → a → Boolean
gte = a1 => a2 => a1 <= a2,

// Ord a => a → a → Boolean
lt = a1 => a2 => a1 < a2,

// Ord a => a → a → Boolean
lte = a1 => a2 => a1 <= a2,

// a → a
identity = a => a,

// s => {s: a} → a | Undefined
prop = s => o => o[s],

// [a] → Number
length = as => as.length,

// ((y → z), (x → y), …, (o → p), ((a, b, …, n) → o)) → ((a, b, …, n) → z)  WTF!
compose  = (f, ...fs) => fs.length ? (...args) => f(compose(...fs)(...args)) : f,

// Number → Number → [a] → [a]
slice = (s, e) => as => _slice.call(as, s, e),

// [a] → a | Undefined
// String → String
head = as => as[0],

// [a] → [a]
init = slice(0, -1),

// [a] → a | Undefined
last = compose(head, slice(-1)),

// [a] → [a]
tail = slice(1),

// {k: v} → [k]
keys = Object.keys,

// a → [a] → Boolean
contains = a => as => _includes.call(as, a),

// [a] → [a] → [a]
concat = (...as) => _concat.apply([], as),

// (a,a → Number) → [a] → [a]
sort = f => as => _sort.call(concat([], as), f),

// Functor f => (a → b) → f a → f b
map = f => (as, context = null) => _map.call(as, f, context),

// Filterable f => (a → Boolean) → f a → f a
filter = f => as => _filter.call(as, f),

// (a, b → Boolean) → (a, b → Number)
comparator = f => (a,b) => f(a, b) ? 1 : (f(b, a) ? -1 : 0),

// ((a, b) → a) → a → [b] → a
reduce = (f, initial) => as => _reduce.call(as, f, initial),

// {k: v} → [v]
values = o => map(k => o[k])(keys(o)),

// [a] → [b]
flatten = reduce((a, b) => concat(a, _isArray(b) ? flatten(b) : b), []),

// (a → Boolean) → [a] → Boolean
any = f => compose(Boolean, length, filter(f)),

// (a → Boolean) → [a] → a | undefined
find = f => reduce((m, v) => m || (f(v) ? v : m)),

// [a] → [a]
uniq = as => [...new Set(as)],

// [*] → [*] → [*]
union = compose(uniq, concat),

// [*] → [*] → [*]
intersection = (xs, ys, zs) => (zs = new Set(ys)) && filter(x => zs.has(x))(uniq(xs)),

// [*] → [*] → [*]
difference = (xs, ys, zs) => (zs = new Set(ys)) && filter(x => !zs.has(x))(uniq(xs)),

// Chain m => (a → m b) → m a → m b // also known as flatMap
chain = f => compose(flatten, map(f)),

// [a] → [b] → [[a,b]]
xprod = as => reduce((m, b) => concat(m, map(a => [a,b])(as)), [])

// (String | RegExp) → String → [String]
split = a => b => _split.call(b, a),

// [String] → {k: v} → v | Undefined
path = ss => o => reduce((m, s) => m && (s in m) ? m[s] : undefined, o)(ss),

// (a → String) → [a] → {String: [a]}
groupBy = (f, _k) => reduce((m, a) => (_k = ('' + f(a))) && (m[_k] = concat(m[_k] || [], [a])) && m ,{})
```
