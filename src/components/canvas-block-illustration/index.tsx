import styled from 'styled-components';

import dataSetIllustration from 'assets/illustrations/data-set.svg';
import engineeringDiagramIllustration from 'assets/illustrations/engineering-diagram.svg';
import entityMatchingIllustration from 'assets/illustrations/entity-matching.svg';
import extractionPipelineIllustration from 'assets/illustrations/extraction-pipeline.svg';
import rawTableIllustration from 'assets/illustrations/raw-table.svg';
import transformationIllustration from 'assets/illustrations/transformation.svg';
import { CanvasBlockType } from 'components/canvas-block';

type CanvasBlockIllustrationProps = {
  type: CanvasBlockType;
};

const getCanvasBlockIllustration = (type: CanvasBlockType) => {
  switch (type) {
    case 'data-set':
      return dataSetIllustration;
    case 'engineering-diagram':
      return engineeringDiagramIllustration;
    case 'entity-matching':
      return entityMatchingIllustration;
    case 'extraction-pipeline':
      return extractionPipelineIllustration;
    case 'raw-table':
      return rawTableIllustration;
    case 'transformation':
      return transformationIllustration;
    default:
      return undefined;
  }
};

const CanvasBlockIllustration = ({
  type,
}: CanvasBlockIllustrationProps): JSX.Element => {
  return (
    <StyledCanvasBlockIllustration src={getCanvasBlockIllustration(type)} />
  );
};

const StyledCanvasBlockIllustration = styled.img`
  pointer-events: none;
`;

export default CanvasBlockIllustration;
