port module Ports exposing (highlight)


port outgoing : String -> Cmd msg


highlight : Cmd msg
highlight =
    outgoing "HIGHLIGHT"
