import * as React from 'react';
import * as Messages from "../messages";
import { Backend } from "../backend";
import { TwitterTimelineEmbed } from 'react-twitter-embed';
import { LogWindow } from './log_window';
import Changelog from './changelog';
import LatestChanges from './latest_changes';
import { TwitterEmbed } from './twitter_embed';
import {FocusButton} from './buttons/focus_button';


enum ContentType {
    Logs,
    Twitter,
    Changelogs,
}

/**
 * header implementation
 */
 export default class Sidebar extends React.PureComponent {

    state = {
        mode: ContentType.Changelogs
    };

    getContent() {
        switch(this.state.mode) {
            case ContentType.Logs:
                    return <div className='sidebar-content'>
                        
                            <LogWindow/>
                        
                    </div>;
            case ContentType.Changelogs:
                return <div className='sidebar-content'>
                        
                                <LatestChanges count={10}/>
                        
                        </div>;
            default:
                    return <div className='sidebar-content'>
                        
                                    <TwitterEmbed/>
                        
                            </div>
        }
    }

    render() {
        return <div className='full sidebar'>
            <div className='simple-buttons'>
                <FocusButton 
                        className="simple-button inline"
                        text='&nbsp;Latest Changes&nbsp;' 
                        onClick={() => this.setState({mode: ContentType.Changelogs})}/>
                <FocusButton 
                        className="simple-button inline"
                        text='&nbsp;Logs&nbsp;' 
                        onClick={() => this.setState({mode: ContentType.Logs})}/>
            </div>

                {this.getContent()} 
            
        </div>
    }
}