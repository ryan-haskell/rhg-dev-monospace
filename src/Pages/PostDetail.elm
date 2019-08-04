module Pages.PostDetail exposing (view)

import Components
import Content exposing (Content)
import DateFormat as D
import Element exposing (..)
import Element.Background as Background
import Element.Border as Border
import Element.Font as Font
import Html exposing (Html)
import Html.Attributes as Attr
import Markdown exposing (defaultOptions)
import Time


options : Markdown.Options
options =
    { defaultOptions | sanitize = False }


view : Time.Zone -> Content -> { title : String, body : Element msg }
view timezone { meta, markdown } =
    { title = meta.title
    , body =
        column
            [ width fill
            , paddingXY 0 48
            , spacing 32
            ]
            [ column [ width fill, spacing 16 ]
                [ textColumn [ width fill, spacing 12 ]
                    [ paragraph
                        [ Font.size 32
                        , Font.semiBold
                        ]
                        [ text meta.title ]
                    , paragraph [] [ text (Components.formatDate timezone meta.date) ]
                    ]
                , viewTags meta.tags
                ]
            , el [ width fill ] <|
                Element.html (Markdown.toHtmlWith options [ Attr.class "markdown" ] markdown)
            ]
    }


viewTags : List String -> Element msg
viewTags tags =
    row [ spacing 8 ] (List.map viewTag tags)


viewTag tag =
    link
        [ paddingXY 16 6
        , Border.width 1
        , Font.color (rgb255 225 115 65)
        , Border.color (rgb255 225 115 65)
        , Background.color (rgb 1 1 1)
        , Font.size 12
        ]
        { label = text tag
        , url = "/posts?tag=" ++ tag
        }
