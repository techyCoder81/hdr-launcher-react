import React from "react";
import { Remark } from "react-remark";
import { Backend } from "../backend";
import { Github } from "../operations/github_utils";

type Props = {
    count: number;
};

/**
 * gets the latest changes in the repo
 */
 export default class LatestChanges extends React.PureComponent<Props> {

    state = {
        text: ["Getting Updates..."],
    };

    constructor(props: Props) {
        super(props);
        var check = async () => {
            let prData = await Github.pullRequests();
            let logs = [];
            var count = 0;
            // check the entries for merged PRs
            for (var entry of prData) {
                console.info("entry: " + JSON.stringify(entry))
                // ignore PRs which were not merged
                if (entry.merged_at == null) {
                    continue;
                }
                let type = "";
                let labels: string[] = [];
                entry.labels.forEach((label: any) => {
                    if (label.name.includes("semver")) {
                        type = label.name.split(':')[1];
                        return "";
                    } else {
                        labels.push(label.name);
                    }
                });
                logs.push((<div>
                    <h3 className="border-top">{entry.title}</h3>
                    <p>{"Contributor: " + entry.user.login}</p>
                    <p>{"Type: " + type}</p>
                    <p>{"Labels: " + labels.join(", ")}</p>
                    <p>{"Merged: " + entry.merged_at}</p>
                </div>));

                ++count;
                if (count > props.count) {
                    break;
                }
            }
            this.setState({text: logs});
            console.info(count);
        }
        check();
    }

    getElement(str: string) {
        return <p>{str}</p>
    }

    render() {
        return (
            <div className="sidebar-inner">
                <h2>Latest Changes:</h2>
                {this.state.text.map(str => str)}
            </div>
        );
    }
} 