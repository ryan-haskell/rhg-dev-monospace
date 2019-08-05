module Pages.Homepage exposing (view)

import Components
import Content exposing (Content)
import Element exposing (..)
import Element.Font as Font
import Posts
import Time


view : Time.Zone -> { title : String, body : Element msg }
view timezone =
    { title = "rhg.dev"
    , body =
        column [ spacing 48, paddingXY 0 16, width fill ]
            [ column [ spacing 16, paddingXY 0 32 ]
                [ el [ Font.size 32, Font.semiBold ] (text "rhg.dev")
                , paragraph [] [ text "i have absolutely no idea what I'm doing." ]
                ]
            , Components.section "Latest posts"
                (Posts.posts
                    |> List.sortBy (.meta >> .date >> Time.posixToMillis >> negate)
                    |> List.take 5
                    |> List.map (Components.postListing timezone)
                )
            ]
    }
