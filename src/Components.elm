module Components exposing (formatDate, layout, postListing, section)

import Content exposing (Content)
import DateFormat as D
import Element exposing (..)
import Element.Font as Font
import Html exposing (Html)
import Route exposing (Route)
import Time


formatDate : Time.Zone -> Time.Posix -> String
formatDate zone posix =
    "written on a "
        ++ D.format
            [ D.dayOfWeekNameFull
            , D.text " ("
            , D.monthNameFull
            , D.text " "
            , D.dayOfMonthSuffix
            , D.text ", "
            , D.yearNumber
            , D.text " around "
            , D.hourNumber
            , D.amPmLowercase
            , D.text ")"
            ]
            zone
            posix


layout : Route -> Element msg -> Html msg
layout route body =
    Element.layout
        [ Font.size 16
        , Font.family
            [ Font.typeface "Fira Code"
            ]
        ]
        (column
            [ width (fill |> maximum 640)
            , centerX
            , paddingXY 20 0
            ]
            [ navbar route
            , el [ height fill, width fill ] body
            ]
        )


navbar : Route -> Element msg
navbar route =
    row
        [ width fill
        , paddingXY 0 32
        ]
        [ link [ Font.semiBold, Font.size 24 ]
            { label = text "rhg.dev"
            , url = "/"
            }
        , row [ alignRight, spacing 24 ]
            (List.map (viewLink route)
                [ ( Internal, "posts", "/posts" )
                , ( External, "github", "https://www.github.com/ryannhg" )
                ]
            )
        ]


type LinkType
    = Internal
    | External


viewLink :
    Route
    -> ( LinkType, String, String )
    -> Element msg
viewLink route ( linkType, label, url ) =
    let
        linkFn =
            case linkType of
                Internal ->
                    link

                External ->
                    newTabLink

        styles =
            if String.contains url (Route.toPath route) then
                [ Font.underline ]

            else
                []
    in
    linkFn styles
        { label = text label
        , url = url
        }


section : String -> List (Element msg) -> Element msg
section title content =
    column [ spacing 24 ]
        [ el [ Font.size 32, Font.semiBold ] (text title)
        , column [ spacing 24 ] content
        ]


postListing : Time.Zone -> Content -> Element msg
postListing timezone { meta } =
    column [ spacing 12 ]
        [ link
            [ Font.semiBold
            , Font.size 20
            , Font.underline
            , Font.color (rgb255 225 115 65)
            ]
            { url = "/posts/" ++ meta.slug, label = text meta.title }
        , el
            [ Font.size 14
            , Font.color (rgb255 100 100 100)
            ]
            (text <| formatDate timezone meta.date)
        , text meta.description
        ]
