
/* IMPORT */

import benchmark from 'benchloop';
import graphmatch from '../dist/index.js';
import {NODE} from '../test/fixtures.js';

/* HELPERS */

const OPTIONS_PARTIAL = { partial: true };
const RE = graphmatch.compile ( NODE );
const RE_PARTIAL = graphmatch.compile ( NODE, OPTIONS_PARTIAL );

/* MAIN */

benchmark.config ({
  iterations: 100_000
});

benchmark.group ( 'compile', () => {

  benchmark ({
    name: 'full',
    fn: () => {
      graphmatch.compile ( NODE );
    }
  });

  benchmark ({
    name: 'partial',
    fn: () => {
      graphmatch.compile ( NODE, OPTIONS_PARTIAL );
    }
  });

});

benchmark.group ( 'match', () => {

  benchmark ({
    name: 'full',
    fn: () => {
      RE.test ( 'foo/bar/baz/file.js' );
      RE.test ( 'foo/bar/baz/file.js_' );
    }
  });

  benchmark ({
    name: 'partial',
    fn: () => {
      RE_PARTIAL.test ( 'foo/bar/baz' );
      RE_PARTIAL.test ( 'foo/bar/baz_' );
    }
  });

});

benchmark.summary ();
