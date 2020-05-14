import React from 'react';


export default function Icon(props: { selected: boolean, type: string, iconName: string })
{
  const { selected, type, iconName } = props;
  return (
    <div className="icon">
      <img src={require("../../resources/Icons/Actions/Close.png")} />
    </div>
  );

}