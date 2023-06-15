import styled from 'styled-components';

import {
  CONFLICT_MODE,
  RESOURCE_TYPE_MAPPING,
  TransformationRead,
} from '@transformations/types';
import { capitalizeEveryWord } from '@transformations/utils';

import { Icon } from '@cognite/cogs.js';

type TransformationTypeProps = {
  conflictMode: TransformationRead['conflictMode'];
  destination: TransformationRead['destination'];
};

const TransformationType = ({
  conflictMode,
  destination,
}: TransformationTypeProps): JSX.Element => {
  if (!conflictMode || !destination) {
    return <Icon type="Remove" />;
  }

  return (
    <StyledTransformationTypeContainer>
      {capitalizeEveryWord(CONFLICT_MODE[conflictMode], ['or'])}
      <StyledArrowIcon />
      {capitalizeEveryWord(RESOURCE_TYPE_MAPPING[destination.type])}
    </StyledTransformationTypeContainer>
  );
};

const StyledTransformationTypeContainer = styled.div`
  align-items: center;
  display: flex;
`;

const StyledArrowIcon = styled(Icon).attrs({ size: 12, type: 'ArrowRight' })`
  margin: 1px 4px 0;
`;

export default TransformationType;
