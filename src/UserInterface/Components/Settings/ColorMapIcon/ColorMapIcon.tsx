import React from "react";
import styled from "styled-components";
import { ICommonSelectExtraOptionData } from "@/UserInterface/Components/Settings/Types";

export interface ColorMapIconProps {
  readonly colors: string[];
}

const ColorMapIconContainer = styled.div<ColorMapIconProps>`
  height: 100%;
  min-height: 1rem;
  min-width: 2rem;
  border-radius: 0.15rem;
  margin-inline-end: 0.5rem;
  background-image: linear-gradient(
    to right,
    ${(props) => (props.colors ? props.colors.join(",") : "")}
  );
`;

export function ColorMapIcon(props: { data?: ICommonSelectExtraOptionData }) {
  if (!props.data) {
    return null;
  }
  const { colorMapColors } = props.data;

  if (colorMapColors && colorMapColors.length) {
    return <ColorMapIconContainer colors={colorMapColors} />;
  }
  return null;
}
