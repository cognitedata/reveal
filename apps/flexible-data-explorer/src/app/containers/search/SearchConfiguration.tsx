import React, { useState } from 'react';

import styled from 'styled-components';

import { Body, Title } from '@cognite/cogs.js';

import { useDataModelParams } from '../../hooks/useDataModelParams';
import { useProjectConfig } from '../../hooks/useProjectConfig';
import { DataModelSelectorModal } from '../modals/DataModelSelectorModal';

interface Props {
  prefix?: string;
  header?: boolean;
}

// NOTE: This component is, with a lack of a better word, a mess!! Align it better with design
export const SearchConfiguration: React.FC<Props> = ({ prefix, header }) => {
  const config = useProjectConfig();

  const selectedDataModel = useDataModelParams();

  const [siteSelectionVisible, setSiteSelectionVisible] =
    useState<boolean>(false);

  const Wrapper: any = header ? Title : Body;

  return (
    <Container>
      <Wrapper level={header ? 3 : 6}>
        {prefix ? `${prefix} ` : ''}
        {config?.[0]?.site || 'all'} data in{' '}
        <StyledBody
          onClick={() => setSiteSelectionVisible(true)}
          header={header}
        >
          {selectedDataModel?.dataModel || '...'}
        </StyledBody>
      </Wrapper>
      <DataModelSelectorModal
        isVisible={siteSelectionVisible}
        onModalClose={() => setSiteSelectionVisible(false)}
        isClosable
      />
    </Container>
  );
};

const Container = styled.div`
  margin-bottom: 16px;
  padding-left: 8px;
`;

const StyledBody = styled(Body)<{ header?: boolean }>`
  display: inline-flex;
  align-items: center;
  color: rgba(51, 51, 51, 0.6);
  font-size: ${({ header }) => (header ? '24px' : '14px')};

  &:hover {
    cursor: pointer;
    color: rgba(51, 51, 51, 0.5);
  }
`;
