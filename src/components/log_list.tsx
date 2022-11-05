import { useEffect, useRef } from "react";
import { Logs } from "../operations/log_singleton";

function buildList() {
    let list = Logs.instance().getAll();
    let out = [];
    let i = 0;
    for (const entry of list) {
        out.push(<div key={i}>{entry.level.toString() + " (" + entry.time.toLocaleTimeString() + "): " + entry.data}</div>);
        ++i;
    }
    return out;
}

export const LogList = () => {
    
    return <div className="log-box" id="log-box">
    {
        buildList()
    }
    </div>
}

