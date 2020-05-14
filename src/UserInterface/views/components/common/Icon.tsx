import React from 'react';
import getIcon from "../../../utils/Icon";

export default function Icon(props: { selected?: boolean, type: string, name: string })
{
  const { selected, type, name } = props;

  return (
    <div className="icon">
      <img src={getIcon(type, name)} />
    </div>
  );

}