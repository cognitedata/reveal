import React from 'react';

import styled from 'styled-components';

import { Body, Icon, IconType, Switch } from '@cognite/cogs.js';

import { FileTypes, FileTypeVisibility } from '@data-exploration-lib/core';

const CustomChip = ({
  label,
  icon,
  checked,
  onChange,
}: {
  label: string;
  icon: IconType;
  checked: boolean;
  onChange: (nextState: boolean) => void;
}) => (
  <ChipContainer>
    <ChipContent>
      <ChipIcon type={icon} />
      <Lable level={2}>{label}</Lable>
      <Switch
        checked={checked}
        onChange={(_e: any, nextState: boolean) => onChange(nextState)}
      />
    </ChipContent>
  </ChipContainer>
);

export const FileTypeToggle = (
  fileTypeVisibility: FileTypeVisibility,
  setFileTypeVisibility: React.Dispatch<
    React.SetStateAction<FileTypeVisibility>
  >
) => {
  return (
    <>
      <CustomChip
        label="CAD models"
        icon="Cube"
        checked={fileTypeVisibility.CADModels}
        onChange={(nextState: boolean) => {
          setFileTypeVisibility({
            ...fileTypeVisibility,
            [FileTypes.CAD_MODELS]: nextState,
          });
        }}
      />
      <CustomChip
        label="Point clouds"
        icon="PonitCloud"
        checked={fileTypeVisibility.PointClouds}
        onChange={(nextState: boolean) => {
          setFileTypeVisibility({
            ...fileTypeVisibility,
            [FileTypes.POINT_CLOUDS]: nextState,
          });
        }}
      />
      <CustomChip
        label="360 images"
        icon="View360"
        checked={fileTypeVisibility.Images360}
        onChange={(nextState: boolean) => {
          setFileTypeVisibility({
            ...fileTypeVisibility,
            [FileTypes.IMAGES_360]: nextState,
          });
        }}
      />
    </>
  );
};

const ChipContainer = styled.div`
  max-height: 36px;
  display: inline-flex;
  align-items: center;
  min-width: 36px;
  padding: 8px 12px;
  border-radius: 6px;
  line-height: 20px;
  background-color: var(--cogs-surface--status-undefined--muted--default);
  color: var(--cogs-text-icon--status-undefined);
  box-sizing: border-box;
  width: max-content;
`;

const ChipContent = styled.div`
  display: flex;
  max-width: 100%;
  justify-content: center;
  overflow: auto;
  gap: 6px;
`;

const ChipIcon = styled(Icon)`
  align-self: center;
`;

const Lable = styled(Body)`
  align-self: center;
`;
