module.exports = (items) =>
`module Posts exposing (posts)

import Content exposing (Content)
${items.map(item => `import Content.Posts.${item.module}`).join('\n')}


posts : List Content
posts =
    [ ${items.map(item => `Content.Posts.${item.module}.content`).join('\n    , ')}
    ]
`