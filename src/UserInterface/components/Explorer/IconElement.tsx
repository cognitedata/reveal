import React from "react";

export default function IconElement(props: {
  src?: string;
  alt?: string;
  size?: string;
}) {
  return (
    <div className="tree-icon center">
      <img
        className="tree-img"
        src={props.src}
        alt={props.alt}
        height={props.size}
        width={props.size}
      />
    </div>
  );
}
