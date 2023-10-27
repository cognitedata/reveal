import { useMemo } from 'react';

import styled from 'styled-components';

import { Typography } from '@fdx/components';
import { useTranslation } from '@fdx/shared/hooks/useTranslation';
import { flattenProperties } from '@fdx/shared/utils/properties';

import { Button, Flex } from '@cognite/cogs.js';

import { InstancePreviewHeader } from '../elements';
import { InstancePreviewProps } from '../types';

interface Props extends InstancePreviewProps {
  data?: Record<string, any>;
}

export const PropertiesView: React.FC<Props> = ({ data, onClick }) => {
  const { t } = useTranslation();

  const properties = useMemo(() => flattenProperties(data), [data]);

  return (
    <>
      <InstancePreviewHeader>
        <Flex alignItems="center" gap={4}>
          <Button icon="ArrowLeft" type="ghost" onClick={() => onClick?.()} />
          <Typography.Title size="small" capitalize>
            {t('PREVIEW_CARD_PROPERTIES_TITLE')}
          </Typography.Title>
        </Flex>
      </InstancePreviewHeader>

      <ListContainer>
        {properties.map(({ key, value }) => {
          return (
            <ListItem key={key}>
              <Typography.Body capitalize size="xsmall">
                {key}
              </Typography.Body>
              <Typography.Body strong size="medium">
                {value}
              </Typography.Body>
            </ListItem>
          );
        })}
      </ListContainer>
    </>
  );
};

export const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

// Design wants the border to go edge-to-edge in the container.
// Instance preview container has a global padding that I don't not want to touch.
export const ListItem = styled.div`
  margin: 0 -12px;
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  border-bottom: 1px solid
    var(--border-interactive-default, rgba(83, 88, 127, 0.16));

  &:last-child {
    border-bottom: none;
  }
`;
