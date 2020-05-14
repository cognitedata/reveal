import React from 'react';
import Icon from "../Common/Icon";
import Tooltip from '@material-ui/core/Tooltip';

function generateToolBar(nodeId, toolBar)
{
  if (!toolBar || !toolBar.length) return null;
  return toolBar.map(({ icon }, idx) => <div
    key={`${nodeId}-toolBar-${idx}`}
    className="tool-bar-icon">
    <Icon type={icon.type} name={icon.name}></Icon>
  </div>)
}

export default function TitleBar(props: {
  sectionId: string,
  className?: string,
  name: string,
  icon,
  toolBar,
})
{
  const { className, name, icon, toolBar, nodeId } = props;
  return <div className={`title-bar ${className ? className : ""}`}>
    {icon ? <Icon type={icon.type} name={icon.name}></Icon> : null}
    <h1>{name}</h1>
    {generateToolBar(nodeId, toolBar)}
  </div>
}