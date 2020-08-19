import React from "react";
import "./ToolbarToolTip.module.scss";
import { Theme, withStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import getIcon from "@/UserInterface/Components/Icon/IconSelector";

// Custom tooltip with white background
const CustomToolTip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: theme.shadows[1],
    fontSize: theme.typography.fontSize,
  },
}))(Tooltip);

export default function ToolbarToolTip(props: {
  type?: string;
  name?: string;
  src?: string;
  tooltip?: {
    text: string;
    placement?: "bottom" | "right-start";
  };
  iconSize?: { width: number; height: number };
  children: any;
}) {
  const { type, name, src, tooltip, iconSize } = props;

  // TODO - Remove getIcon once Settings implementation complete
  const imgSrc = src || (type && name ? getIcon(type, name) : "");
  const style = iconSize
    ? { width: iconSize.width, height: iconSize.height }
    : {};

  const image = imgSrc ? <img src={imgSrc} style={style} alt={name} /> : null;

  return (
    <div className="icon">
      {tooltip ? (
        <CustomToolTip
          title={
            <div className="image-tooltip">
              {image}
              <div className="tooltip">
                {tooltip.text.split("\n").map((line, index) => {
                  if (index === 0) {
                    return (
                      <span key={`Tip-line-${line}`} className="head">
                        {line}
                      </span>
                    );
                  }
                  return <span key={`Tip-line-${line}`}>{line}</span>;
                })}
              </div>
            </div>
          }
          placement={tooltip.placement}
        >
          {props.children}
        </CustomToolTip>
      ) : (
        props.children
      )}
    </div>
  );
}
