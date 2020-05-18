import React, { useEffect } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useSelector, useDispatch } from "react-redux";

import {
  toggleNodeVisibility,
  toggleNodeSelection
} from "../../redux/actions/explorer";
import { updateRootNode } from "../../data/generateNodes";

export default function Explorer() {
  const fetching = useSelector(({ explorer }) => explorer.fetching);
  const data = useSelector(({ explorer }) => explorer.data);
  const dispatch = useDispatch();

  useEffect(() => {
    updateRootNode();
  }, [data]);

  return <div className="explorer-container left-panel-section">
    {fetching ? <CircularProgress></CircularProgress> : <ul>
      {Object.entries(data).map(([key, val]) => <li style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start"
      }} key={key}>
        <input type="checkbox" checked={val.isVisible} onChange={() => dispatch(toggleNodeVisibility({ id: key }))}></input>
        <span
          onClick={() => dispatch(toggleNodeSelection({ id: key }))}
          style={{ fontSize: "0.8rem", cursor: "pointer", fontWeight: val.isSelected ? 700 : 400 }}
          className="test-root-span">
          {`${key.substring(0, 8)}- #${val.type}`}
        </span>
      </li>
      )}
    </ul>}
  </div>
}