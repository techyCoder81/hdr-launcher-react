import * as React from 'react';
import * as Messages from "../messages";
import { Backend } from "../backend";
import { TwitterTimelineEmbed } from 'react-twitter-embed';
import { LogWindow } from './log_window';

enum ContentType {
    Logs,
    Feed
}

/**
 * header implementation
 */
 export default class Sidebar extends React.Component {

    state = {
        mode: ContentType.Feed
    };

    getContent() {
        switch(this.state.mode) {
            case ContentType.Logs:
                    return <div>
                        <button className="simple-button" onClick={() => this.setState({mode: ContentType.Feed})}>Close Logs</button>
                        <div className='sidebar-body'><LogWindow/></div>
                    </div>;
            default:
                    return <div>
                        <button className="simple-button" onClick={() => this.setState({mode: ContentType.Logs})}>Open Logs</button>
                        <div className='sidebar-body'><TwitterTimelineEmbed
                            sourceType="profile"
                            screenName="HewDrawRemix"
                            theme='dark'
                            noScrollbar
                            transparent
                            tweetLimit={10}
                            borderColor='296d2f'
                            options={{height: 550}}
                            placeholder={this.getPlaceholder()}
                        /></div>
                    </div>
        }
    }

    getPlaceholder() {
        return <div>Loading twitter feed...</div>
    }

    render() {
        return <div>
            {this.getContent()}
        </div>
    }
}