import { Progress } from "nx-request-api";
import { useEffect, useRef, useState } from "react";
import { Remark } from "react-remark";
import { useNavigate } from "react-router-dom";
import { Pages } from "renderer/constants";
import { Backend } from "renderer/operations/backend";
import { Github } from "renderer/operations/github_utils";
import { FocusButton } from "../components/buttons/focus_button";
import { ScrollFocusButton } from "../components/buttons/scroll_focus_button";
import { LogPopout } from "../components/logging/log_popout";
import { ProgressDisplay } from "../components/progress_bar";
import { PullRequestPreview } from "./menus/pull_request_preview";

export default function PullRequestMenu() {
    const [pullRequests, setPullRequests] = useState(null as null | any[]);
    const selfRef = useRef<HTMLButtonElement>(null);
    const [hoveredPull, setHoveredPull] = useState(null as null | any);
    const [progress, setProgress] = useState(null as null | Progress);
    const navigate = useNavigate();

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
                navigate(Pages.MAIN_MENU);
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
                        console.info("parsing hdr-pr comment body.")
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

                        //alert("downloading from url: " + url);
                        console.info("downloading hdr-pr")
                        await backend.downloadFile(url, root + "downloads/pr.zip", 
                            (p: Progress) => setProgress(p)
                        );
                        
                        // if an existing PR folder exists, remove it
                        console.info("removing existing hdr-pr");
                        setProgress(new Progress("Extracting PR", "Extracting", 0));
                        let exists = await backend.fileExists(root + "ultimate/mods/hdr-pr");
                        if (exists) {
                            await backend.removeDirAll(root + "ultimate/mods/hdr-pr")
                        }
                        console.info("extracting hdr-pr");
                        await backend.unzip(
                            root + "downloads/pr.zip", 
                            root, 
                            (p: Progress) => setProgress(p)
                        );

                        // check if it has 'includes assets', and if so, handle the assets zip
                        if (pr.labels.filter((label: any) => label.name.includes('includes assets')).length && pr.body.includes(".zip](https://")) {
                            console.info("beginning handling of hdr-assets-pr");
                            setProgress(new Progress("Installing PR Assets", "Getting PR assets", 0));

                            // parse the pr assets url
                            let startParse = pr.body.indexOf(".zip](https://");
                            let startUrl = pr.body.indexOf("https://", startParse);
                            let endUrl = pr.body.indexOf(')', startUrl);
                            let url = pr.body.substring(startUrl, endUrl);
                            if (url.length === 0) {
                                alert("Error: bad url of length 0 for parsing asset body:\n" + pr.body);
                                continue;
                            }

                            // if an existing pr assets folder exists, remove it
                            console.info("checking if hdr-assets-pr exists");
                            let exists = await backend.dirExists(root + "ultimate/mods/hdr-assets-pr");
                            if (exists) {
                                await backend.removeDirAll(root + "ultimate/mods/hdr-assets-pr")
                            }

                            // clone the existing hdr-assets into hdr-assets-pr
                            console.info("cloning hdr-assets dir");
                            await backend.cloneMod('hdr-assets', 'hdr-assets-pr', (p: Progress) => setProgress(p));

                            // download the pr assets
                            setProgress(new Progress("Downloading assets", "downloading assets", 0));
                            //alert("downloading pr assets from url: " + url);
                            // if an existing pr assets zip exists, remove it
                            console.info("checking if a pr-assets.zip already exists");
                            exists = await backend.dirExists(root + "downloads/pr-assets.zip");
                            if (exists) {
                                console.info("removing the existing pr-assets.zip");
                                await backend.deleteFile(root + "downloads/pr-assets.zip")
                            }
                            console.info("downloading pr assets zip");
                            await backend.downloadFile(url, root + "downloads/pr-assets.zip",
                                (p: Progress) => setProgress(p)
                            );

                            // unzip the pr assets
                            setProgress(new Progress("Extracting assets", "Extracting assets", 0));
                            console.info("extracting pr assets");
                            await backend.unzip(
                                root + "downloads/pr-assets.zip", 
                                root + 'ultimate/mods/hdr-assets-pr/',
                                (p: Progress) => setProgress(p)
                            );

                            alert("Pull request and assets downloaded! Please disable 'hdr' and 'HDR Assets' in Arcadia, and enable 'hdr-pr' and 'hdr-assets-pr' instead.")
                            backend.openModManager();
                            setProgress(null);
                            return;
                        } else {
                            alert("Pull request downloaded! Please disable 'hdr' in Arcadia, and enable 'hdr-pr' instead.")
                            backend.openModManager();
                            setProgress(null);
                            return;
                        }
                    }
                } catch (e) { alert("Error while downloading PR: " + e); setProgress(null); }}}/>)
            }
            </div>
            <div className="right-side-pr thick-border">
                {hoveredPull !== null ? 
                    <PullRequestPreview pullRequest={hoveredPull}/>
                 : <div/>}
            </div>
        </div> : <h1 style={{color: 'white'}}>Getting pull requests...</h1>
        }
         <LogPopout />
    </div>);
}