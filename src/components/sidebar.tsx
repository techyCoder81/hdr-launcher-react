import * as React from 'react';
import * as Messages from "../messages";
import { Backend } from "../backend";
import { TwitterTimelineEmbed } from 'react-twitter-embed';
import { LogWindow } from './log_window';
import Changelog from './changelog';
import LatestChanges from './latest_changes';
import { TwitterSingleton } from './twitter_singleton';
import {FocusButton} from './focus_button';


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
        mode: Backend.isNode() ? ContentType.Twitter : ContentType.Changelogs
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
            { 
            Backend.isNode() ?
                <FocusButton 
                    className="simple-button inline"
                    text='&nbsp;News&nbsp;' 
                    onClick={() => this.setState({mode: ContentType.Twitter})}/>
                : <div></div>
            }
            <FocusButton 
                    className="simple-button inline"
                    text='&nbsp;Latest Changes&nbsp;' 
                    onClick={() => this.setState({mode: ContentType.Changelogs})}/>
            <FocusButton 
                    className="simple-button inline"
                    text='&nbsp;Logs&nbsp;' 
                    onClick={() => this.setState({mode: ContentType.Logs})}/>
            {this.getContent()} 
        </div>
    }
}