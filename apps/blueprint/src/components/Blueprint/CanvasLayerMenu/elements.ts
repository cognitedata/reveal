import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';

const colors = {
  annotationAsset: 'rgba(74, 103, 251, 1)',
  annotationAssetFill: 'rgba(74, 103, 251, 0.25)',
  annotationAssetStroke: 'rgba(74, 103, 251, 0.75)',
};

export const AnnotationIcon = styled.div`
  background: ${colors.annotationAssetFill};
  border: 1px solid ${colors.annotationAssetStroke};
  width: 16px;
  height: 16px;
`;

export const DrawingIcon = styled.div`
  border: 2px solid var(--cogs-primary);
  width: 16px;
  height: 16px;
`;

export const MarkerIcon = styled.div`
  color: ${colors.annotationAssetStroke};
  border: 1px solid ${colors.annotationAssetStroke};
  width: 16px;
  height: 16px;
  &:before {
    content: '1';
    display: block;
    font-size: 11px;
    font-weight: bold;
  }
`;

export const CanvasToggleLayerDropdownWrapper = styled.div`
  &&& {
    span {
      left: 16px;
      bottom: 232px;
      position: absolute;
      background-color: white;

      button {
        padding: 10px;
      }
    }
  }
`;

export const CanvasToggleLayerButtonWrapper = styled(Button)`
  background: #ffffff;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.08),
    0px 1px 4px rgba(0, 0, 0, 0.06);
  border-radius: 4px;
`;
