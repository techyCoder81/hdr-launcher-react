import { Progress } from "nx-request-api";
import { useEffect, useRef, useState } from "react";
import { Remark } from "react-remark";
import { Backend } from "renderer/operations/backend";
import { Github } from "renderer/operations/github_utils";
import { FocusButton } from "../buttons/focus_button";
import { ScrollFocusButton } from "../buttons/scroll_focus_button";
import { ExpandSidebar } from "../expand_sidebar";
import { ProgressDisplay } from "../progress_bar";

export default function PullRequestMenu(props: { onComplete: () => void }) {
    const [pullRequests, setPullRequests] = useState(null as null | any[]);
    const selfRef = useRef<HTMLButtonElement>(null);
    const [hoveredPull, setHoveredPull] = useState(null as null | any);
    const [progress, setProgress] = useState(null as null | Progress);

    useEffect(() => {
        Github.pullRequests()
            .then(json => {
                // TODO: filter out PRs missing attached build artifacts
                let filtered = (json as any[]).filter(pr => !pr.draft);
                setPullRequests(filtered);
            })
            .catch(e => alert("Error while getting pull requests: " + e))
    }, []);

    return (
    <div className={'overlay-progress scroll-hidden'}>
        {progress !== null ?
            <ProgressDisplay
                progress={progress}
                animate={Backend.isNode()}
            />
            : <div/>}
        <div className="border-bottom">
            <FocusButton
            ref={selfRef}
            autofocus={true}
            className="simple-button-bigger"
            onClick={async () => {
                
                props.onComplete();
            }}
            text={'Exit'}
            />
            <p id="title" className="header-item">Pull Request Installation Menu</p>
        </div>
        {pullRequests !== null ? 
        <div className="stage-config-body border-bottom">
            <div className="scrolling-fit-nobar left-side">
            {pullRequests.map(pr => <ScrollFocusButton 
                className={'longer-main-button' + (Backend.isSwitch() ? ' no-transition' : '')} 
                onFocus={() => {
                    setHoveredPull(pr);
                }}
                text={((pr.title.length < 27) ? pr.title : (pr.title.substring(0,24) + '...')) + ' | #' + pr.number + '\u00A0'} 
                onClick={async () => {try {
                    setProgress(new Progress("Installing PR", "Installing a PR", 0));
                    let backend = Backend.instance();
                    let root = await backend.getSdRoot();
                    // get all the comments
                    let comments = await backend.getJson(pr.comments_url,
                        (p: Progress) => setProgress(p));
                    for (const comment of (comments as any[])) {
                        // if its not a github-actions bot comment, ignore it
                        if (!comment.user.login.includes('github-actions')) {
                            continue;
                        }

                        // parse the download link out of the comment body
                        let body = comment.body as string;
                        if (!body.includes("[hdr-switch](https://")) {
                            // this isnt a comment we care about (PR artifacts)
                            continue;
                        }
                        let startParse = body.indexOf("[hdr-switch](https://");
                        let startUrl = body.indexOf("https://", startParse);
                        let endUrl = body.indexOf(')', startUrl);
                        let url = body.substring(startUrl, endUrl);
                        if (url.length === 0) {
                            alert("Error: bad url of length 0 for PR comment body:\n" + body);
                            continue;
                        }

                        // TODO: need to report progress in progress menu
                        // TODO: need to improve performance
                        // TODO: need to show current version based on enabled
                        //alert("downloading from url: " + url);
                        await backend.downloadFile(url, root + "downloads/pr.zip", 
                            (p: Progress) => setProgress(p)
                        );
                        
                        // if an existing PR folder exists, remove it
                        let exists = await backend.fileExists(root + "ultimate/mods/hdr-pr");
                        if (exists) {
                            await backend.deleteFile(root + "ultimate/mods/hdr-pr")
                        }
                        await backend.unzip(
                            root + "downloads/pr.zip", 
                            root, 
                            (p: Progress) => setProgress(p)
                        );
                        
                        alert("Pull Request downloaded! Please disable 'hdr' in Arcadia, and enable 'hdr-pr' instead.")
                        backend.openModManager();
                        setProgress(null);
                    }
                } catch (e) { alert("Error while downloading PR: " + e); setProgress(null); }}}/>)
            }
            </div>
            <div className="right-side-pr thick-border">
                {hoveredPull !== null ? 
                    <div className="full">
                        <h1 style={{color: "white"}} className="border-bottom">{hoveredPull.title}</h1>
                        <div className="scrolling-fit">
                            <p style={{color: "white", paddingTop: "10px", paddingLeft: "18px"}}><Remark>{hoveredPull.body}</Remark></p>
                        </div>
                    </div>
                 : <div/>}
            </div>
        </div> : <h1>Getting pull requests...</h1>
        }
         <ExpandSidebar />
    </div>);
}