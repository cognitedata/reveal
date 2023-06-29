import { useRef } from 'react';
import { useParams } from 'react-router-dom';

import styled from 'styled-components';

import { Body, Tooltip } from '@cognite/cogs.js';

import { Button } from '../../../components/buttons/Button';
import { BaseWidgetProps, Widget } from '../../../components/widget/Widget';
import { useIsOverflow } from '../../../hooks/useIsOverflow';
import { useNavigation } from '../../../hooks/useNavigation';
import { useTranslation } from '../../../hooks/useTranslation';
import { useInstanceRelationshipQuery } from '../../../services/instances/generic/queries/useInstanceDirectRelationshipQuery';

interface Props extends BaseWidgetProps {
  type: {
    type: string;
    field: string;
  };
}

export const RelationshipDirectWidget: React.FC<Props> = ({
  id,
  rows,
  columns,
  type,
}) => {
  const { t } = useTranslation();
  const { instanceSpace } = useParams();
  const { data, status, isLoading } = useInstanceRelationshipQuery(type);

  const navigate = useNavigation();

  return (
    <Widget id={id} rows={rows || 3} columns={columns}>
      <Widget.Header
        title={t('RELATIONSHIP_DIRECT_WIDGET_TITLE', { type: type.field })}
      >
        <Button.InternalRedirect
          onClick={() => {
            navigate.toInstancePage(type.type, instanceSpace, data.externalId);
          }}
          loading={isLoading}
        />
      </Widget.Header>

      <Widget.Body state={status}>
        <Container>
          {Object.entries(data || {}).map(([key, value], index) => {
            // THIS IS SOO BAD
            if (key === 'externalId' || index > 4) {
              return null;
            }

            return (
              <PropertiesItem
                key={`properties-collapsed-${key}`}
                pair={{ key, value }}
              />
            );
          })}
        </Container>
      </Widget.Body>
    </Widget>
  );
};

const PropertiesItem = ({ pair }: { pair: Record<string, any> }) => {
  const ref = useRef<HTMLParagraphElement>(null);

  const isOverflowing = useIsOverflow(ref);

  return (
    <Content>
      <Tooltip content={pair.value} disabled={!isOverflowing}>
        <>
          <KeyText>{pair.key}</KeyText>
          <ValueText ref={ref}>{pair.value || '-'}</ValueText>
        </>
      </Tooltip>
    </Content>
  );
};

const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  overflow: hidden;
  word-break: break-word;
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-column-gap: 24px;
  grid-row-gap: 24px;
`;

const KeyText = styled(Body).attrs({ level: 3 })``;

// 'Cogs' does not have the option to pass in 'ref', use 'p' until it's fixed
const ValueText = styled.p.attrs({ strong: true })`
  white-space: nowrap;
  overflow: hidden;
  display: block;
  text-overflow: ellipsis;
  color: var(--cogs-b1-color);
  font-size: var(--cogs-b1-font-size);
  letter-spacing: var(--cogs-b1-letter-spacing);
  line-height: var(--cogs-b1-line-height);
  font-weight: 500;
  margin-bottom: 0;
`;
