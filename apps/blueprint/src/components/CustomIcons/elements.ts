import { PRESET_COLORS } from 'consts';
import styled from 'styled-components';
import { Theme } from 'utils/theme';

export const AnnotationIcon = styled.div`
  background: ${Theme.annotationAssetFill};
  border: 1px solid ${Theme.annotationAssetStroke};
  width: 16px;
  height: 16px;
`;

export const DrawingIcon = styled.div`
  border: 2px solid ${PRESET_COLORS[0].string()};
  width: 16px;
  height: 16px;
`;

export const MarkerIcon = styled.div`
  color: ${Theme.annotationAssetStroke};
  border: 1px solid ${Theme.annotationAssetStroke};
  width: 16px;
  height: 16px;
  &:before {
    content: '1';
    display: block;
    font-size: 11px;
    font-weight: bold;
  }
`;
