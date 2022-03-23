import React, { ReactElement } from 'react';
import { FileInfo } from '@cognite/sdk';
import { Icon, Tooltip } from '@cognite/cogs.js';
import styled from 'styled-components';
import {
  AnnotationTableItem,
  AnnotationTableRowProps,
} from 'src/modules/Review/types';
import useAssetLinkWarning, {
  AssetWarnTypes,
} from 'src/store/hooks/useAssetLinkWarning';

export const AssetWarnMessages = {
  [AssetWarnTypes.NoWarning]: '',
  [AssetWarnTypes.ApprovedAnnotationAssetNotLinkedToFile]:
    'Asset tag verified but file is not linked to the asset. Select true again to restore link.',
  [AssetWarnTypes.RejectedAnnotationAssetLinkedToFile]:
    'Asset tag rejected but file is still linked to the asset. Select false again to remove link.',
};

export const AssetLinkWarning = ({
  file,
  annotation,
  allAnnotations,
  children,
}: {
  file: FileInfo;
  annotation: AnnotationTableItem;
  allAnnotations: AnnotationTableItem[];
  children: ReactElement<AnnotationTableRowProps>;
}) => {
  const warningStatus = useAssetLinkWarning(annotation, file, allAnnotations);

  const childrenWithProps = React.Children.map(children, (child) => {
    if (
      React.isValidElement(child) &&
      warningStatus !== AssetWarnTypes.NoWarning
    ) {
      return (
        <WarningContainer>
          <IconContainer>
            <Tooltip
              placement="top"
              content={<span>{AssetWarnMessages[warningStatus]}</span>}
            >
              <Icon type="WarningStroke" />
            </Tooltip>
          </IconContainer>
          {children}
        </WarningContainer>
      );
    }
    return child;
  });

  return <> {childrenWithProps} </>;
};

const WarningContainer = styled.div`
  display: flex;
  border: 2px solid red;
  border-radius: 4px;
  position: relative;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: red;
  background-color: inherit;
  margin-left: 5px;
  position: absolute;
  top: 35px;
`;
