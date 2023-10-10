import styled from 'styled-components';

import { FLOATING_ELEMENT_MARGIN } from '../../../../pages/ContextualizeEditor/constants';

import { useCadContextualizeStore } from './useCadContextualizeStore';

export const CadAnnotationsCard = () => {
  const { contextualizedNodes } = useCadContextualizeStore((state) => ({
    contextualizedNodes: state.contextualizedNodes,
  }));

  return (
    <StyledCard> Asset Mappings: {contextualizedNodes?.length ?? 0}</StyledCard>
  );
};

const StyledCard = styled.div`
  position: absolute;
  top: ${FLOATING_ELEMENT_MARGIN}px;
  right: ${FLOATING_ELEMENT_MARGIN}px;
  background: white;
  padding: 8px;
  border-radius: 4px;
`;
