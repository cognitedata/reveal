import React from "react";
import { withStyles, Theme } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";

import getIcon from "@/UserInterface/utils/Icon";

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
  tooltip?: string;
  placement?: "bottom" | "right-start";
}) {
  const { type, name, src, tooltip, placement } = props;

  // Remove getIcon once Settings implementation complete
  const image = <img src={src ? src : type && name ? getIcon(type, name) : ""} />;

  return (
    <div className="icon">
      {tooltip ? (
        <CustomToolTip
          title={
            <div className="image-tooltip">
              {image}
              <span>{tooltip}</span>
            </div>
          }
          placement={placement}
        >
          {image}
        </CustomToolTip>
      ) : (
          image
        )}
    </div>
  );
}
