import { useEffect, useRef } from 'react';
import { Logs } from '../../operations/log_singleton';

function buildList() {
  const list = Logs.instance().getAll();
  const out = [];
  let i = 0;
  let node = list.head;
  // iterate across the logs, but only show the most recent 500 logs.
  while (node !== null && i < 500) {
    out.push(
      <div key={i}>
        {`${node.entry.level.toString()} (${node.entry.time.toLocaleTimeString()}): ${
          node.entry.data
        }`}
      </div>
    );
    ++i;
    node = node.next;
  }
  return out;
}

export const LogList = () => {
  return (
    <div className="log-box" id="log-box">
      {buildList()}
    </div>
  );
};
