
/* IMPORT */

import {describe} from 'fava';
import graphmatch from '../dist/index.js';
import {toTree, NODE, NODE_ALT} from './fixtures.js';

/* MAIN */

describe ( 'Graphmatch', it => {

  it ( 'can compile to a full regex', t => {

    const node = toTree ([/foo/, [[/bar/]]]);
    const re = graphmatch.compile ( node );

    t.true ( re instanceof RegExp );
    t.true ( re.test ( 'foobar' ) );

    t.false ( re.test ( '' ) );
    t.false ( re.test ( ' foobar' ) );
    t.false ( re.test ( 'foobar ' ) );
    t.false ( re.test ( 'FOOBAR ' ) );
    t.false ( re.test ( 'foo' ) );
    t.false ( re.test ( 'bar' ) );

    t.is ( re.source, '^(?:foobar)$' );
    t.is ( re.flags, '' );

  });

  it ( 'can compile to a partial regex', t => {

    const node = toTree ([/foo/, [[/bar/]]]);
    const re = graphmatch.compile ( node, { partial: true } );

    t.true ( re instanceof RegExp );
    t.true ( re.test ( '' ) );
    t.true ( re.test ( 'foo' ) );
    t.true ( re.test ( 'foobar' ) );

    t.false ( re.test ( ' foobar/foo' ) );
    t.false ( re.test ( ' foobar_' ) );
    t.false ( re.test ( ' fooba' ) );
    t.false ( re.test ( ' foo_' ) );
    t.false ( re.test ( ' fo' ) );
    t.false ( re.test ( ' _' ) );

    t.is ( re.source, '^(?:(?:$|foo(?:$|bar)))$' );
    t.is ( re.flags, '' );

  });

  it ( 'can detect inconsistent regex flags', t => {

    const node = toTree ([/foo/gym, [[/bar/i]]]);

    try {

      graphmatch.compile ( node );

    } catch ( error ) {

      t.is ( error.message, 'Inconsistent RegExp flags used: "gmy" and "i"' );

    }

  });

  it ( 'can preserve consistent regex flags', t => {

    const node = toTree ([/foo/gym, [[/bar/myg]]]);
    const re = graphmatch.compile ( node );

    t.is ( re.flags, 'gmy' );

  });

  it ( 'can match fully', t => {

    t.true ( graphmatch ( NODE, 'foo/bar/baz/file.js' ) );
    t.true ( graphmatch ( NODE, 'foo/qux/file.js' ) );

    t.false ( graphmatch ( NODE, 'foo/bar/baz/file.js_' ) );
    t.false ( graphmatch ( NODE, 'foo/qux/file.js_' ) );

  });

  it ( 'can match partially', t => {

    t.true ( graphmatch ( NODE, '', { partial: true } ) );
    t.true ( graphmatch ( NODE, 'foo', { partial: true } ) );
    t.true ( graphmatch ( NODE, 'foo/', { partial: true } ) );

    t.true ( graphmatch ( NODE, 'foo/bar', { partial: true } ) );
    t.true ( graphmatch ( NODE, 'foo/bar/', { partial: true } ) );
    t.true ( graphmatch ( NODE, 'foo/qux', { partial: true } ) );
    t.true ( graphmatch ( NODE, 'foo/qux/', { partial: true } ) );

    t.false ( graphmatch ( NODE, 'foo/bar_', { partial: true } ) );
    t.false ( graphmatch ( NODE, 'foo/bar/_', { partial: true } ) );
    t.false ( graphmatch ( NODE, 'foo/qux_', { partial: true } ) );
    t.false ( graphmatch ( NODE, 'foo/qux/_', { partial: true } ) );

  });

  it ( 'supports arbitrary horizontal size without blowing up the call stack', t => {

    const chars = new Array ( 1_000_000 ).fill ( '' ).map ( ( _, i ) => String.fromCodePoint ( 50_000 + i ) );
    const node = { children: chars.map ( char => ({ regex: new RegExp ( char ) }) ) };
    const re = graphmatch.compile ( node );

    t.true ( re instanceof RegExp );
    t.is ( re.source, `^(?:(?:${chars.join ( '|' )}))$` );
    t.is ( re.flags, '' );

  });

  it ( 'supports arbitrary vertical size without blowing up the call stack', t => {

    let node = { children: [] };
    for ( let i = 0; i < 100_000; i++ ) {
      node = { regex: /a/, children: [node] };
    }

    const re = graphmatch.compile ( node );

    t.true ( re instanceof RegExp );
    t.is ( re.source, `^(?:${'a'.repeat ( 100_000 )})$` );
    t.is ( re.flags, '' );

  });

  it ( 'supports deduplicating identical alternations', t => {

    const node = {
      children: [
        { regex: /a/ },
        { regex: /a/ },
        { regex: /a/ }
      ]
    };

    const re = graphmatch.compile ( node );

    t.true ( re instanceof RegExp );
    t.is ( re.source, '^(?:a)$' );
    t.is ( re.flags, '' );

  });

  it ( 'supports nodes with multiple parents', t => {

    const Z = {
      regex: /z/
    };
    const NODE = {
      children: [
        {
          regex: /a/,
          children: [Z]
        },
        {
          regex: /b/,
          children: [Z]
        }
      ]
    };

    t.true ( graphmatch ( NODE, 'az' ) );
    t.true ( graphmatch ( NODE, 'bz' ) );

  });

  it ( 'supports regex-less nodes and children-less nodes', t => {

    const node = {
      children: [
        {
          regex: /foo/
        },
        {
          regex: /bar/
        }
      ]
    };

    t.true ( graphmatch ( node, 'foo' ) );
    t.true ( graphmatch ( node, 'bar' ) );

    t.false ( graphmatch ( node, '' ) );
    t.false ( graphmatch ( node, 'baz' ) );
    t.false ( graphmatch ( node, 'foobar' ) );

  });

});

describe ( 'toTree', it => {

  it ( 'can generate a tree out of an S-expressions-like structure', t => {

    t.deepEqual ( NODE, NODE_ALT );

  });

});
