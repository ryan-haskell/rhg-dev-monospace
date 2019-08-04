module.exports = (items) =>
`module Main exposing (main)

import Browser exposing (UrlRequest(..))
import Browser.Navigation as Nav
import Content exposing (Content)
import Components
${items.map(item => `import Content.Posts.${item.module}`).join('\n')}
import Html exposing (Html)
import Pages.Homepage
import Pages.NotFound
import Pages.PostDetail
import Pages.PostLanding
import Route exposing (Route)
import Url exposing (Url)
import Time
import Task
import Ports


type alias Flags =
    ()


main : Program Flags Model Msg
main =
    Browser.application
        { init = init
        , update = update
        , subscriptions = subscriptions
        , view = view
        , onUrlChange = UrlChanged
        , onUrlRequest = UrlRequested
        }


type alias Model =
    { url : Url
    , key : Nav.Key
    , timezone : Time.Zone
    , page : PageModel
    }


type PageModel
    = Homepage
    | PostLanding (Maybe String)
    | PostDetail Content
    | NotFound


type Msg
    = UrlChanged Url
    | UrlRequested UrlRequest
    | ZoneReceived Time.Zone



-- INIT


init : Flags -> Url -> Nav.Key -> ( Model, Cmd Msg )
init _ url key =
    ( Model url key Time.utc (initPage (Route.fromUrl url))
    , Cmd.batch
        [ Task.perform ZoneReceived Time.here
        , Ports.highlight
        ]
    )


initPage : Route -> PageModel
initPage route =
    case route of
        Route.Homepage ->
            Homepage

        Route.PostLanding tag ->
            PostLanding tag

        Route.PostDetail slug ->
            case slug of
${items.map(toCase).join('\n')}
                _ ->
                    NotFound

        Route.NotFound ->
            NotFound



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        ZoneReceived timezone ->
            ( { model | timezone = timezone }
            , Cmd.none
            )

        UrlChanged url ->
            ( { model | url = url, page = initPage (Route.fromUrl url) }
            , Ports.highlight
            )

        UrlRequested request ->
            case request of
                Internal url ->
                    ( model
                    , Nav.pushUrl model.key (Url.toString url)
                    )

                External url ->
                    ( model
                    , Nav.load url
                    )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none



-- VIEW


view : Model -> { title : String, body : List (Html msg) }
view { page, url, timezone } =
    let
        { title, body } =
            case page of
                Homepage ->
                    Pages.Homepage.view timezone

                PostLanding tag ->
                    Pages.PostLanding.view timezone tag

                PostDetail content ->
                    Pages.PostDetail.view timezone content

                NotFound ->
                    Pages.NotFound.view
    in
    { title = title
    , body = [ Components.layout (Route.fromUrl url) body ]
    }
`

const toCase = (item) =>
`                "${item.slug}" ->
                    PostDetail Content.Posts.${item.module}.content
`