import React from "react";
import { ChromaIcon } from "@/UserInterface/Components/ChromaIcon/ChromaIcon";
import { Box } from "@material-ui/core";
import { ICommonSelectExtraOptionData } from "@/UserInterface/Components/Settings/Types";

export function ColorTypeIcon(props: { data?: ICommonSelectExtraOptionData }) {
  if (!props.data) {
    return null;
  }
  const { colorTypeIconData } = props.data;

  if (colorTypeIconData && colorTypeIconData.icon) {
    return (
      <Box paddingLeft={1}>
        <ChromaIcon
          src={colorTypeIconData.icon}
          color={colorTypeIconData.color}
          alt="color type icon"
          size={16}
        />
      </Box>
    );
  }
  return null;
}
