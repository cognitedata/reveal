import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useSelector, useDispatch } from "react-redux";

export default function Explorer()
{
  const fetching = useSelector(({ nodes }) => nodes.fetching);
  const data = useSelector(({ nodes }) => nodes.data);
  console.log(data);
  return <div className="explorer-container left-panel-section">
    {fetching ? <CircularProgress></CircularProgress> : <ul>
      {Object.entries(data).map(([key, val]) => <li style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start"
      }} key={key}>
        <input type="checkbox"></input>
        <span style={{ fontSize: "0.8rem" }} className="test-root-span">{`${key.substring(0, 8)}- #${val.type}`}</span>
      </li>)}
    </ul>}
  </div>
}