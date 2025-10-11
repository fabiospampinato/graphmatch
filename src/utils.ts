
/* IMPORT */

import type {Node} from './types';

/* MAIN */

const getNodeFlags = ( node: Node ): string => {

  let flags = '';

  visitNode ( node, node => {

    if ( !node.regex ) return;

    const nodeFlags = node.regex.flags;

    flags ||= nodeFlags;

    if ( flags !== nodeFlags ) {

      throw new Error ( `Inconsistent RegExp flags used: "${flags}" and "${nodeFlags}"` );

    }

  });

  return flags;

};

const getNodeSource = ( node: Node, partial: boolean ): string => {

  let source = '';

  if ( node.regex ) {

    source += partial ? '(?:$|' : '';
    source += node.regex.source;

  }

  if ( node.children?.length ) {

    const children = node.children.map ( node => getNodeSource ( node, partial ) ).filter ( Boolean );

    if ( children.length ) {

      const needsWrapperGroup = ( children.length > 1 ) || ( partial && !source.length );

      source += needsWrapperGroup ? partial ? '(?:$|' : '(?:' : '';
      source += children.join ( '|' );
      source += needsWrapperGroup ? ')' : '';

    }

  }

  if ( node.regex ) {

    source += partial ? ')' : '';

  }

  return source;

};

const visitNode = ( node: Node, visitor: ( node: Node ) => void ): void => {

  visitor ( node );

  node.children?.forEach ( node => {

    visitNode ( node, visitor );

  });

};

/* EXPORT */

export {getNodeFlags, getNodeSource, visitNode};
