import React from 'react';

import styled from 'styled-components';

import { Body, Icon, IconType, Switch } from '@cognite/cogs.js';

import {
  FileTypes,
  FileTypeVisibility,
  useTranslation,
} from '@data-exploration-lib/core';

const CustomChip = ({
  label,
  icon,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  icon: IconType;
  checked: boolean;
  onChange: (nextState: boolean) => void;
  disabled?: boolean;
}) => (
  <ChipContainer>
    <ChipContent>
      <ChipIcon type={icon} />
      <Lable level={2}>{label}</Lable>
      <Switch
        checked={checked}
        onChange={(_e, nextState) => onChange(!!nextState)}
        disabled={disabled}
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
  const { t } = useTranslation();
  return (
    <>
      <CustomChip
        label={t('360_IMAGE', '360 Images', { count: 2 })}
        icon="View360"
        checked={fileTypeVisibility.Images360}
        onChange={(nextState: boolean) => {
          setFileTypeVisibility({
            ...fileTypeVisibility,
            [FileTypes.IMAGES_360]: nextState,
          });
        }}
      />
      <CustomChip
        label={t('THREED', '3D models', { count: 2 })}
        icon="Cube"
        checked={fileTypeVisibility.Models3D}
        onChange={(nextState: boolean) => {
          setFileTypeVisibility({
            ...fileTypeVisibility,
            [FileTypes.MODELS_3D]: nextState,
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
