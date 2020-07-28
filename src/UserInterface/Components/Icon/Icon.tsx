import React from "react";
import { withStyles, Theme } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";

import getIcon from "@/UserInterface/Components/Icon/IconSelector";

// Custom tooltip with white background
const CustomToolTip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: theme.shadows[1],
    fontSize: "0.7rem"
  }
}))(Tooltip);

/**
 * Icon component
 */
export default function Icon(props: {
  type?: string;
  name?: string;
  src?: string;
  tooltip?: {
    text: string;
    placement?: "bottom" | "right-start";
  };
  iconSize?: { width: number; height: number };
}) {
  const { type, name, src, tooltip, iconSize } = props;
  // TODO - Remove getIcon once Settings implementation complete
  const imgSrc = src ? src : type && name ? getIcon(type, name) : "";
  const style = iconSize ? { width: iconSize.width, height: iconSize.height } : {};

  const image = <img src={imgSrc} style={style} />;

  return (
    <div className="icon">
      {tooltip ? (
        <CustomToolTip
          title={
            <div className="image-tooltip">
              {image}
              <span>{tooltip.text}</span>
            </div>
          }
          placement={tooltip.placement}
        >
          {image}
        </CustomToolTip>
      ) : (
        image
      )}
    </div>
  );
}
