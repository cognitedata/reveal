import { useMemo, useRef } from 'react';

import styled from 'styled-components';

import take from 'lodash/take';

import { Body, Tooltip } from '@cognite/cogs.js';

import { Button } from '../../../components/buttons/Button';
import { Widget } from '../../../components/widget/Widget';
import { DASH } from '../../../constants/common';
import { useIsOverflow } from '../../../hooks/useIsOverflow';
import { useTranslation } from '../../../hooks/useTranslation';
import { flattenProperties } from '../../search/utils';

import { PropertiesProps } from './PropertiesWidget';

const MAX_PROPERTIES = 8;

export const PropertiesCollapsed: React.FC<PropertiesProps> = ({
  id,
  onExpandClick,
  state,
  data,
  rows,
  columns,
}) => {
  const { t } = useTranslation();

  const properties = useMemo(() => flattenProperties(data), [data]);

  const getAdaptiveGridRows = () => {
    if (state !== 'success') {
      return 4;
    }
    // Bit of magic values below; 4 is the number of items per row in the grid. If we have less than 4 items, we want
    // to show rows in the size of 2, otherwise in the size of 3.
    // TODO: Move the grid numbers to a more central place.
    return properties.length <= 4 ? 2 : 3;
  };

  return (
    <Widget rows={rows || getAdaptiveGridRows()} columns={columns} id={id}>
      <Widget.Header type="Properties" title={t('PROPERTIES_WIDGET_NAME')}>
        <Button.Fullscreen
          disabled={state === 'loading'}
          onClick={() => onExpandClick?.(id)}
        />
      </Widget.Header>

      <Widget.Body state={state}>
        <Container>
          {take(properties, MAX_PROPERTIES).map(({ key, value }) => {
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
      <Tooltip wrapped content={pair.value} disabled={!isOverflowing}>
        <>
          <KeyText>{pair.key}</KeyText>
          <ValueText ref={ref}>{pair.value || DASH}</ValueText>
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
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-column-gap: 24px;
  grid-row-gap: 24px;
`;

const KeyText = styled(Body).attrs({ level: 3 })`
  &:first-letter {
    text-transform: uppercase;
  }
`;

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
