module Route exposing (Route(..), fromUrl, toPath)

import Url exposing (Url)
import Url.Parser as Parser exposing ((</>), (<?>), Parser)
import Url.Parser.Query as Query


type Route
    = Homepage
    | PostLanding (Maybe String)
    | PostDetail String
    | NotFound


router : Parser (Route -> a) a
router =
    Parser.oneOf
        [ Parser.map Homepage Parser.top
        , Parser.map PostLanding (Parser.s "posts" <?> Query.string "tag")
        , Parser.map PostDetail (Parser.s "posts" </> Parser.string)
        ]


fromUrl : Url -> Route
fromUrl =
    Parser.parse router >> Maybe.withDefault NotFound


toPath : Route -> String
toPath route =
    case route of
        Homepage ->
            "/"

        PostLanding tag ->
            case tag of
                Just someTag ->
                    "/posts?tag=" ++ someTag

                Nothing ->
                    "/posts"

        PostDetail slug ->
            "/posts/" ++ slug

        NotFound ->
            "/not-found"
