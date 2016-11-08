const test = require('tape')

const { equals, lt, lte, gt, gte, identity, head, init, last, tail, uniq, prop, compose, length, slice,
    comparator, keys, contains, concat, map, filter, flatten, sort, any, find, union, reduce, values,
    intersection, difference, chain, xprod, split, path, groupBy, replace, pick } = require('./lib/index')

const testObj = {
    name: 'jeff',
    animal: 'horse',
    location: { lat: 50, lng: 0 },
}

const testObjArr = [{ id:1, name: 'dog' }, {id:2, name: 'cat'}, {id:3, name: 'horse'}]

const getName = prop('name')
const byNameDesc = comparator((a, b) => getName(a) > getName(b))
const nameLenIsGreaterThan3 = compose(gt(3), length, getName)
const nameLenIs3 = compose(equals(3), length, getName)


test('gt', t => {
    t.is(gt(1)(2), true)
    t.end()
})

test('lt', t => {
    t.is(lt(2)(1), true)
    t.end()
})

test('identity', t => {
    t.is(identity(testObj.name), 'jeff')
    t.deepEquals(identity(testObj), testObj)
    t.end()
})

test('head', t => {
    t.is(head([1,2,3]), 1)
    t.is(head([]), undefined)
    t.is(head('cat'), 'c')
    t.end()
})

test('init', t => {
    t.deepEqual(init([1,2,3]), [1,2])
    t.end()
})

test('last', t => {
    t.deepEqual(last([1,2,3]), 3)
    t.end()
})

test('tail', t => {
    t.deepEqual(tail([1,2,3]), [2, 3])
    t.end()
})

test('slice', t => {
    t.deepEqual(slice(1, 2)([1,2,3]), [2])
    t.end()
})

test('values', t => {
    t.deepEqual(values(testObj), ['jeff', 'horse', testObj.location])
    t.end()
})

test('uniq', t => {
    t.deepEqual(uniq([1,1,1,2,3,'a','z','a',3,3]), [1,2,3,'a','z'])
    t.end()
})

test('prop', t => {
    t.is(prop('name')(testObj), 'jeff')
    t.deepEqual(prop('location')(testObj), testObj.location)
    t.end()
})

test('keys', t => {
    t.deepEqual(keys(testObj), ['name', 'animal', 'location'])
    t.deepEqual(keys(testObjArr), ['0', '1', '2'])
    t.end()
})

test('contains', t => {
    t.is(contains(3)([1,2,3,4]), true)
    t.is(contains(7)([1,2,3,4]), false)
    t.end()
})

test('concat', t => {
    t.deepEqual(concat([1],[2],[2,3,4]), [1,2,2,3,4])
    t.end()
})

test('map', t => {
    t.deepEqual(map(x => x*2)([1,2,3]), [2,4,6])
    t.end()
})

test('reduce', t => {
    t.deepEqual(
        reduce((m, o) => (m[o.id] = o.name) && m, {})(testObjArr),
        { 1: 'dog', 2: 'cat', 3: 'horse' })
    t.end()
})

test('filter', t => {
    t.deepEqual(filter(nameLenIsGreaterThan3)(testObjArr), [testObjArr[2]])
    t.end()
})

test('flatten', t => {
    t.deepEqual(flatten([[1,2,3],[4,[5,6]]]), [1,2,3,4,5,6])
    t.end()
})

test('sort', t => {
    t.deepEqual(sort(byNameDesc)(testObjArr), [testObjArr[1], testObjArr[0], testObjArr[2]])
    t.end()
})

test('any', t => {
    t.deepEqual(any(nameLenIsGreaterThan3)(testObjArr), true)
    t.end()
})

test('find', t => {
    t.deepEqual(find(nameLenIs3)(testObjArr), testObjArr[0])
    t.end()
})

test('union', t => {
    t.deepEqual(union([1,2,3,4],[3,4,5,6],[6,7,8]), [1,2,3,4,5,6,7,8])
    t.end()
})

test('intersection', t => {
    t.deepEqual(intersection([1,2,3,4],[3,4,5,6]), [3,4])
    t.end()
})

test('difference', t => {
    t.deepEqual(difference([1,2,3,4],[3,4,5,6]), [1,2])
    t.end()
})

test('chain', t => {
    t.deepEqual(chain(n => [n, n*2])([1,2,3]), [1,2,2,4,3,6])
    t.end()
})

test('xprod', t => {
    t.deepEqual(xprod([1,2])(['a','b']), [ [ 1, 'a' ], [ 2, 'a' ], [ 1, 'b' ], [ 2, 'b' ] ])
    t.end()
})

test('split', t => {
    t.deepEqual(split('.')('1.2.3.4'), ['1','2','3','4'])
    t.end()
})

test('path', t => {
    t.deepEqual(path(['location', 'lng'])(testObj), 0)
    t.deepEqual(path(['location', 'nothere'])(testObj), undefined)
    t.deepEqual(path(['location'])(testObj), testObj.location)
    t.deepEqual(path(['blah', 'bleh'])(testObj), undefined)
    t.end()
})

test('groupBy', t => {
    t.deepEqual(groupBy(nameLenIs3)(testObjArr), {
        'false': [testObjArr[2]],
        'true': [testObjArr[0], testObjArr[1]]
    })
    t.deepEqual(groupBy(v => v > 5 ? 'MoreThan5' : 'LessThan5')([6,2,3,7,9,3,9,0,11]), {
        LessThan5: [2,3,3,0],
        MoreThan5: [6,7,9,9,11]
    })
    t.end()
})

test('replace', t => {
    t.deepEqual(replace('cat', 'dog')('catdog'), 'dogdog')
    t.deepEqual(replace(/[0-9]+/img, 'N')('c1at2do4g'), 'cNatNdoNg')
    t.end()
})

test('pick', t => {
    t.deepEqual(pick(['name', 'animal'])(testObj), { animal: 'horse', name: 'jeff' })
    t.deepEqual(pick(['empt', 'nul', 'missing'])({ empt: undefined, nul: null }),
        { empt: undefined, nul: null })
    t.end()
})
