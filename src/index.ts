
/* IMPORT */

import {getNodeFlags, getNodeSource} from './utils';
import type {Node, Options} from './types';

/* MAIN */

const graphmatch = ( node: Node, input: string, options?: Options ): boolean => {

  return graphmatch.compile ( node, options ).test ( input );

};

/* UTILITIES */

graphmatch.compile = ( node: Node, options?: Options ): RegExp => {

  const partial = options?.partial ?? false;
  const source = getNodeSource ( node, partial );
  const flags = getNodeFlags ( node );

  return new RegExp ( `^(?:${source})$`, flags );

};

/* EXPORT */

export type {Node, Options};
export default graphmatch;
