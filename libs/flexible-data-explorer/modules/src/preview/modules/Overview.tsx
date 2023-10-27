import styled from 'styled-components';

import { Typography } from '@fdx/components';
import { useTranslation } from '@fdx/shared/hooks/useTranslation';
import { useFDM } from '@fdx/shared/providers/FDMProvider';
import { isEmpty } from 'lodash';

import { Button } from '@cognite/cogs.js';

import { InstancePreviewHeader, HeaderText } from '../elements';
import { InstancePreviewProps } from '../types';

import { DirectionRelationshipItem } from './RelationshipDirectView';
import { RelationshipEdgeItem } from './RelationshipEdgeView/RelationshipEdgeView';

interface Props extends InstancePreviewProps {
  type?: string;
  title?: string;
  description?: string;
}

export const Overview: React.FC<Props> = ({
  type,
  title,
  description,
  onClick,
  instance,
  dataModel,
}) => {
  const { t } = useTranslation();
  const client = useFDM();

  const directRelationships = client.getDirectRelationships(
    instance?.dataType,
    dataModel ? { ...dataModel, dataModel: dataModel.externalId } : {}
  );

  const edgeRelationships = client.listEdgeRelationships(
    instance?.dataType,
    dataModel ? { ...dataModel, dataModel: dataModel.externalId } : {}
  );

  return (
    <>
      <InstancePreviewHeader>
        <HeaderText>{type}</HeaderText>
        <Typography.Title capitalize size="small">
          {title}
        </Typography.Title>
        <Typography.Body size="xsmall">{description}</Typography.Body>
      </InstancePreviewHeader>

      <PropertiesButton onClick={() => onClick?.('properties')}>
        {t('PREVIEW_CARD_SHOW_ALL_PROPERTIES')}
      </PropertiesButton>

      {!isEmpty(directRelationships) && (
        <Container>
          {directRelationships?.map((item) => {
            if (item.type.name === 'Sequence') {
              return null;
            }

            if (item.isThreeD) {
              return null;
            }

            return (
              <DirectionRelationshipItem
                key={item.name}
                type={{ field: item.name, type: item.type.name }}
                dataModel={dataModel}
                instance={instance}
              />
            );
          })}
        </Container>
      )}

      {!isEmpty(edgeRelationships) && (
        <Container>
          {edgeRelationships?.map((item) => {
            if (item.isThreeD) {
              return null;
            }

            return (
              <RelationshipEdgeItem
                key={item.id}
                type={{ field: item.name, type: item.type.name }}
                dataModel={dataModel}
                instance={instance}
                onClick={(i) => onClick?.(i)}
              />
            );
          })}
        </Container>
      )}
    </>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  grid-gap: 8px;
  justify-content: center;
  align-items: flex-start;
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
`;

const PropertiesButton = styled(Button).attrs({
  type: 'ghost-accent',
  iconPlacement: 'right',
  icon: 'ArrowRight',
})`
  padding-left: 0px !important;
  &:hover {
    background-color: unset !important;
  }
`;
