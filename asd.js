
import graphmatch from './dist/index.js';


const GRAPH = {
  regex: /foo/,
  children: [
    {
      regex: /\//,
      children: [
        {
          regex: /bar/,
          children: [
            {
              regex: /\//,
              children: [
                {
                  regex: /qux/
                }
              ]
            }
          ]
        },
        {
          regex: /baz/,
          children: [
            {
              regex: /\//,
              children: [
                {
                  regex: /qux/
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// Let's now match against the graph, fully

console.log ('1.');

console.log ( graphmatch ( GRAPH, 'foo/bar/qux' ) ); // => true
console.log ( graphmatch ( GRAPH, 'foo/baz/qux' ) ); // => true

console.log ( graphmatch ( GRAPH, 'foo/bar/whoops' ) ); // => false
console.log ( graphmatch ( GRAPH, 'foo/baz' ) ); // => false

// Let's now match against the graph, partially
// A partial match happens when any matching node in the graph reaches the end of the string

console.log ('2.');

console.log ( graphmatch ( GRAPH, 'foo/bar/qux', { partial: true } ) ); // => true
console.log ( graphmatch ( GRAPH, 'foo/bar/', { partial: true } ) ); // => true
console.log ( graphmatch ( GRAPH, 'foo/bar', { partial: true } ) ); // => true
console.log ( graphmatch ( GRAPH, 'foo/', { partial: true } ) ); // => true
console.log ( graphmatch ( GRAPH, 'foo', { partial: true } ) ); // => true

console.log ( graphmatch ( GRAPH, 'foo/bar/whoops', { partial: true } ) ); // => false
console.log ( graphmatch ( GRAPH, 'foo/barsomething', { partial: true } ) ); // => false
console.log ( graphmatch ( GRAPH, 'bar', { partial: true } ) ); // => false

// Let's now compile the whole graph to a single regex
// This is useful if you expect to match against the graph multiple times
// It's faster to compile the graph once and match against it multiple times

console.log ('3.');

const fullRe = graphmatch.compile ( GRAPH ); // => RegExp

console.log ( fullRe.test ( 'foo/bar/qux' ) ); // => true
console.log ( fullRe.test ( 'foo/bar' ) ); // => false

const partialRe = graphmatch.compile ( GRAPH, { partial: true } ); // => RegExp

console.log ( partialRe.test ( 'foo/bar/qux' ) ); // => true
console.log ( partialRe.test ( 'foo/bar' ) ); // => true
