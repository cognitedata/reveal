import React from "react";
import getIcon from "@/UserInterface/utils/Icon";

/**
 * Icon component
 */
export default function Icon(props: { type: string; name: string }) {
  const { type, name } = props;
  return (
    <div className="icon">
      <img src={getIcon(type, name)} />
    </div>
  );
}
