module Pages.PostLanding exposing (view)

import Components
import Content exposing (Content)
import Element exposing (..)
import Element.Font as Font
import Posts
import Time


view : Time.Zone -> Maybe String -> { title : String, body : Element msg }
view timezone tag =
    { title = "Posts"
    , body =
        column [ paddingXY 0 48, spacing 32 ]
            ([ el
                [ Font.size 32
                , Font.semiBold
                ]
                (text "Posts")
             ]
                ++ (Posts.posts
                        |> List.filter (byTag tag)
                        |> List.sortBy (.meta >> .date >> Time.posixToMillis >> negate)
                        |> List.map (Components.postListing timezone)
                   )
            )
    }


byTag : Maybe String -> Content -> Bool
byTag tag content =
    case tag of
        Just someTag ->
            List.member someTag content.meta.tags

        Nothing ->
            True
