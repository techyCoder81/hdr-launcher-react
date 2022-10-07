import * as React from 'react';
import * as Messages from "../messages";
import { Backend } from "../backend";
import { TwitterTimelineEmbed } from 'react-twitter-embed';
import { LogWindow } from './log_window';
import Changelog from './changelog';
import LatestChanges from './latest_changes';
import { TwitterSingleton } from './twitter_singleton';


enum ContentType {
    Logs,
    Twitter,
    Changelogs,
}

/**
 * header implementation
 */
 export default class Sidebar extends React.Component {

    state = {
        mode: ContentType.Twitter
    };

    getContent() {
        switch(this.state.mode) {
            case ContentType.Logs:
                    return <div className='sidebar-outer'>
                            <LogWindow/>
                    </div>;
            case ContentType.Changelogs:
                return <div className='sidebar-outer scrollable'>
                                <LatestChanges count={10} />
                        </div>;
            default:
                    return <div className='twitter'>
                                {TwitterSingleton.instance()}
                            </div>
        }
    }

    render() {
        return <div>
            <button className="simple-button inline" onClick={() => this.setState({mode: ContentType.Twitter})}>&nbsp;News&nbsp;</button>
            <button className="simple-button inline" onClick={() => this.setState({mode: ContentType.Changelogs})}>&nbsp;Latest Changes&nbsp;</button>
            <button className="simple-button inline" onClick={() => this.setState({mode: ContentType.Logs})}>&nbsp;Logs&nbsp;</button>
            {this.getContent()}
        </div>
    }
}