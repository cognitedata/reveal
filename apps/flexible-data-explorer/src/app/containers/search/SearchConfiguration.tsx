import React from 'react';

import styled from 'styled-components';

import { Body, Title, Tooltip } from '@cognite/cogs.js';

import { ModalConfirm } from '../../components/confirm/ModalConfirm';
import { useSiteConfig } from '../../hooks/useConfig';
import { useDataModelsLocalStorage } from '../../hooks/useLocalStorage';
import { useAISearchParams } from '../../hooks/useParams';
import { useTranslation } from '../../hooks/useTranslation';
import { useSelectedDataModels } from '../../services/useSelectedDataModels';

interface Props {
  header?: boolean;
}

// NOTE: This component is, with a lack of a better word, a mess!! Align it better with design
export const SearchConfiguration: React.FC<Props> = ({ header }) => {
  const { t } = useTranslation();
  const siteConfig = useSiteConfig();

  const selectedDataModels = useSelectedDataModels();

  const [, setSelectedDataModels] = useDataModelsLocalStorage();

  const dataModels = selectedDataModels?.map((item) => item.externalId);

  const Wrapper: any = header ? Title : Body;

  const [isAIEnabled] = useAISearchParams();

  return (
    <Container>
      <Wrapper level={header ? 3 : 6}>
        {header
          ? t(isAIEnabled ? 'AI_HOMEPAGE_HEADER' : 'HOMEPAGE_HEADER', {
              site: siteConfig?.name,
            })
          : t('SEARCH_RESULTS_HEADER', { site: siteConfig?.name })}

        {!siteConfig?.dataModels && (
          <ModalConfirm
            title="Are you sure you want to change the data models?"
            content="By confirming, you will lose all your current selections!"
          >
            <StyledBody
              onClick={() => setSelectedDataModels(undefined)}
              $isHeader={header}
            >
              {dataModels?.splice(0, 2).join(', ') || '...'}
              <Tooltip wrapped content={dataModels?.join(', ')}>
                <>
                  {dataModels &&
                    dataModels.length > 0 &&
                    `, +${dataModels?.length}`}
                </>
              </Tooltip>
            </StyledBody>
          </ModalConfirm>
        )}
      </Wrapper>
    </Container>
  );
};

const Container = styled.div`
  margin-bottom: 16px;
  padding-left: 8px;
`;

const StyledBody = styled.p<{ $isHeader?: boolean }>`
  display: inline-flex;
  align-items: center;
  color: rgba(51, 51, 51, 0.6);
  font-size: ${({ $isHeader }) => ($isHeader ? '24px' : '14px')};
  margin-bottom: 0px;

  &:hover {
    cursor: pointer;
    color: rgba(51, 51, 51, 0.5);
  }
`;
