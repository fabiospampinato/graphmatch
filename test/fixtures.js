
/* MAIN */

const toTree = node => {
  const regex = node[0];
  const children = node[1]?.map ( toTree );
  return { regex, children };
};

const NODE = { // foo/**/{bar/baz,qux}/*.js
  regex: /foo/,
  children: [
    {
      regex: /[\\\/]+/,
      children: [
        {
          regex: /(?:[^\\\/]+[\\\/]+)*?/,
          children: [
            {
              regex: /bar/,
              children: [
                {
                  regex: /[\\\/]+/,
                  children: [
                    {
                      regex: /baz/,
                      children: [
                        {
                          regex: /[\\\/]+/,
                          children: [
                            {
                              regex: /[^\\\/]+\.js/,
                              children: [],
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              regex: /qux/,
              children: [
                {
                  regex: /[\\\/]+/,
                  children: [
                    {
                      regex: /[^\\\/]+\.js/,
                      children: [],
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

const NODE_ALT = toTree ( // foo/**/{bar/baz,qux}/*.js (same)
  [/foo/, [
    [/[\\\/]+/, [
      [/(?:[^\\\/]+[\\\/]+)*?/, [
        [/bar/, [
          [/[\\\/]+/, [
            [/baz/, [
              [/[\\\/]+/, [
                [/[^\\\/]+\.js/, []]
              ]]
            ]]
          ]]
        ]],
        [/qux/, [
          [/[\\\/]+/, [
            [/[^\\\/]+\.js/, []]
          ]]
        ]]
      ]]
    ]]
  ]]
);

/* EXPORT */

export {toTree};
export {NODE, NODE_ALT};
