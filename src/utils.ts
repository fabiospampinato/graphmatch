
/* IMPORT */

import type {Node} from './types';

/* MAIN */

const getNodes = ( node: Node ): Node[] => {

  const nodes = new Set<Node>();
  const queue = [node];

  for ( let i = 0; i < queue.length; i++ ) {

    const node = queue[i];

    if ( nodes.has ( node ) ) continue;

    nodes.add ( node );

    const {children} = node;

    if ( !children?.length ) continue;

    for ( let ci = 0, cl = children.length; ci < cl; ci++ ) {

      queue.push ( children[ci] );

    }

  }

  return Array.from ( nodes );

};

const getNodeFlags = ( node: Node ): string => {

  let flags = '';

  const nodes = getNodes ( node );

  for ( let i = 0, l = nodes.length; i < l; i++ ) { // From root to leaves

    const node = nodes[i];

    if ( !node.regex ) continue;

    const nodeFlags = node.regex.flags;

    flags ||= nodeFlags;

    if ( flags === nodeFlags ) continue;

    throw new Error ( `Inconsistent RegExp flags used: "${flags}" and "${nodeFlags}"` );

  }

  return flags;

};

const getNodeSourceWithCache = ( node: Node, partial: boolean, cache: Map<Node, string> ): string => {

  const cached = cache.get ( node );

  if ( cached !== undefined ) return cached;

  let source = '';

  if ( node.regex ) {

    source += partial ? '(?:$|' : '';
    source += node.regex.source;

  }

  if ( node.children?.length ) {

    const children = node.children.map ( node => getNodeSourceWithCache ( node, partial, cache ) ).filter ( Boolean );

    if ( children?.length ) {

      const needsWrapperGroup = ( children.length > 1 ) || ( partial && !source.length );

      source += needsWrapperGroup ? partial ? '(?:$|' : '(?:' : '';
      source += children.join ( '|' );
      source += needsWrapperGroup ? ')' : '';

    }

  }

  if ( node.regex ) {

    source += partial ? ')' : '';

  }

  cache.set ( node, source );

  return source;

};

const getNodeSource = ( node: Node, partial: boolean ): string => {

  const cache = new Map<Node, string>();
  const nodes = getNodes ( node );

  for ( let i = nodes.length - 1; i >= 0; i-- ) { // From leaves to root

    const source = getNodeSourceWithCache ( nodes[i], partial, cache );

    if ( i > 0 ) continue;

    return source;

  }

  return '';

};

/* EXPORT */

export {getNodeFlags, getNodeSource};
