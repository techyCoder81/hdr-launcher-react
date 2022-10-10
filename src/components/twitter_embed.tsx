import React from "react";
import { TwitterTimelineEmbed } from "react-twitter-embed";

/**
 * changelog implementation
 */
 function TwitterEmbedInner() {
    return <TwitterTimelineEmbed
        sourceType="profile"
        screenName="HewDrawRemix"
        theme='dark'
        noScrollbar
        transparent
        tweetLimit={10}
        borderColor='296d2f'
        options={{height: 525}}
        placeholder={getPlaceholder()}
    />
}

export const TwitterEmbed = React.memo(TwitterEmbedInner);

function getPlaceholder() {
    return <div className="sidebar-inner">&nbsp;Loading twitter feed...</div>
}


