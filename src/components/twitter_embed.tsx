import React from "react";
import { TwitterTimelineEmbed } from "react-twitter-embed";

/**
 * changelog implementation
 */
 function TwitterEmbedInner() {
    return <div className="sidebar-inner"><TwitterTimelineEmbed
        sourceType="profile"
        screenName="HewDrawRemix"
        theme='dark'
        noScrollbar
        transparent
        tweetLimit={10}
        borderColor='296d2f'
        options={{height: 500, innerWidth: 500}}
        placeholder={getPlaceholder()}
    /></div>
}

export const TwitterEmbed = React.memo(TwitterEmbedInner);

function getPlaceholder() {
    return <div>&nbsp;Loading twitter feed...</div>
}


