import { Remark } from "react-remark"

export function PullRequestPreview(props: {
    pullRequest: any
  }) {
    return <div className="full">
        <h1 style={{color: "white"}} className="border-bottom">{props.pullRequest.title}</h1>
        <h4 style={{color: "white", paddingTop: "5px", paddingBottom: "5px"}} className="border-bottom">Labels: {props.pullRequest.labels.map((label: any) => 
            <span style={{padding: '3px'}}>
                [<span style={{color: 'lightgreen'}}>{String(label.name)}</span>]
            </span>
        )}</h4>
        {props.pullRequest.labels.filter((label: any) => String(label.name).includes("includes assets")).length != 0 ? 
            <h4 style={{color: "yellow", paddingTop: "5px", paddingBottom: "5px"}} className="border-bottom">Warning: Pull Requests including assets typically take ~10 minutes to clone existing assets and install the PR changes.</h4> :
            <div/>
        }
        <div className="scrolling-fit">
            <p style={{color: "white", paddingTop: "10px", paddingLeft: "18px"}}><Remark>{props.pullRequest.body}</Remark></p>
        </div>
    </div>
}