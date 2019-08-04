module Meta exposing (Meta)

import Time


type alias Meta =
    { title : String
    , slug : String
    , description : String
    , image : String
    , date : Time.Posix
    , tags : List String
    }
