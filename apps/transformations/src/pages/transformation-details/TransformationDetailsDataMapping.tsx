import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import DestinationSchema from '@transformations/components/target/DestinationSchema';
import TargetDescriptionDropDown from '@transformations/components/target/TargetDescriptionDropDown';
import { TransformationRead } from '@transformations/types';

import { Flex, Title } from '@cognite/cogs.js';

const TransformationDetailsDataMapping = ({
  transformation,
}: {
  transformation: TransformationRead;
}) => {
  const { t } = useTranslation();

  return (
    <StyledContainer direction="column" gap={12}>
      <Title level={5}>{t('target-title')}</Title>
      <TargetDescriptionDropDown transformation={transformation} />
      <DestinationSchema
        action={transformation.conflictMode}
        destination={transformation.destination}
        transformation={transformation}
      />
    </StyledContainer>
  );
};

const StyledContainer = styled(Flex)`
  flex-grow: 0;
  height: 100%;
  width: 332px;
  padding-right: 12px;
  margin-top: 10px;
`;

export default TransformationDetailsDataMapping;
