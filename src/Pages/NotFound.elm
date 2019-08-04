module Pages.NotFound exposing (view)

import Element exposing (..)


view : { title : String, body : Element msg }
view =
    { title = "rhg.dev"
    , body = text "Page not found..."
    }
