import React, { useState } from 'react';

import styled from 'styled-components';

import { Body, Title } from '@cognite/cogs.js';

import { useDataModelParams } from '../../hooks/useDataModelParams';
import { useProjectConfig } from '../../hooks/useProjectConfig';
import { useTranslation } from '../../hooks/useTranslation';
import { DataModelSelectorModal } from '../modals/DataModelSelectorModal';

interface Props {
  header?: boolean;
}

// NOTE: This component is, with a lack of a better word, a mess!! Align it better with design
export const SearchConfiguration: React.FC<Props> = ({ header }) => {
  const { t } = useTranslation();
  const config = useProjectConfig();

  const selectedDataModel = useDataModelParams();

  const [siteSelectionVisible, setSiteSelectionVisible] =
    useState<boolean>(false);

  const Wrapper: any = header ? Title : Body;

  return (
    <Container>
      <Wrapper level={header ? 3 : 6}>
        {header
          ? t('HOMEPAGE_HEADER', { site: config?.[0].site, model: '' })
          : t('SEARCH_RESULTS_HEADER', { site: config?.[0].site, model: '' })}

        <StyledBody
          onClick={() => setSiteSelectionVisible(true)}
          isHeader={header}
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

const StyledBody = styled(Body)<{ isHeader?: boolean }>`
  display: inline-flex;
  align-items: center;
  color: rgba(51, 51, 51, 0.6);
  font-size: ${({ isHeader }) => (isHeader ? '24px' : '14px')};

  &:hover {
    cursor: pointer;
    color: rgba(51, 51, 51, 0.5);
  }
`;
