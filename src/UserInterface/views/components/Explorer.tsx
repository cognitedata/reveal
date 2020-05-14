import React from 'react';
import { useDispatch } from "react-redux";

import { change } from "../../store/actions/settings"

export default function Explorer()
{
  const dispatch = useDispatch();
  return (
    <div className="explorer-container left-panel-section">
      <button onClick={() => dispatch(change())}>Change Domain Node</button>
    </div>
  );

}