module Content exposing (Content)

import Meta exposing (Meta)


type alias Content =
    { meta : Meta
    , markdown : String
    }
