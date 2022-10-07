import React from "react";
import { TwitterTimelineEmbed } from "react-twitter-embed";

/**
 * changelog implementation
 */
 export class TwitterSingleton {

    private static element: any;

    state = {
        embed: TwitterSingleton.element,
    };

    public static instance() {
        if (!TwitterSingleton.element) {
            TwitterSingleton.element = <TwitterTimelineEmbed
                sourceType="profile"
                screenName="HewDrawRemix"
                theme='dark'
                noScrollbar
                transparent
                tweetLimit={10}
                borderColor='296d2f'
                options={{height: 525}}
                placeholder={this.getPlaceholder()}
            />
        } 
        return TwitterSingleton.element;
    }

    static getPlaceholder() {
        return <div>&nbsp;Loading twitter feed...</div>
    }
}


