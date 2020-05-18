import React, { useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux";

import { fetchDomainNodes } from "../../redux/actions/explorer";
import {
  appendChildren,
} from "../../data/generateNodes";

export default function RightPanel() {
  const dispatch = useDispatch();
  const root = useSelector(({ explorer }) => explorer.root);
  useEffect(() => {
    appendChildren();
    dispatch(fetchDomainNodes());
  }, [root]);

  return (
    <div id="right-panel" className="right-panel">
    </div>
  );

}