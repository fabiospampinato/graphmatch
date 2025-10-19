
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

  const isNodePartial = node.partial ?? partial;

  let source = '';

  if ( node.regex ) {

    source += isNodePartial ? '(?:$|' : '';
    source += node.regex.source;

  }

  if ( node.children?.length ) {

    const children = uniq ( node.children.map ( node => getNodeSourceWithCache ( node, partial, cache ) ).filter ( Boolean ) );

    if ( children?.length ) {

      const isSomeChildNonPartial = node.children.some ( child => !child.regex || !( child.partial ?? partial ) );
      const needsWrapperGroup = ( children.length > 1 ) || ( isNodePartial && ( !source.length || isSomeChildNonPartial ) );

      source += needsWrapperGroup ? isNodePartial ? '(?:$|' : '(?:' : '';
      source += children.join ( '|' );
      source += needsWrapperGroup ? ')' : '';

    }

  }

  if ( node.regex ) {

    source += isNodePartial ? ')' : '';

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

const uniq = <T> ( values: T[] ): T[] => {

  return Array.from ( new Set ( values ) );

};

/* EXPORT */

export {getNodeFlags, getNodeSource};
