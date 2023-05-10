import { Body } from '@cognite/cogs.js';
import styled from 'styled-components';
import { Button } from '../../../components/buttons/Button';
import { Widget } from '../../../components/widget/Widget';
import { PropertiesProps } from './PropertiesWidget';

export const PropertiesCollapsed: React.FC<PropertiesProps> = ({
  id,
  onExpandClick,
  state,
  data,
  rows,
  columns,
}) => {
  return (
    <Widget rows={rows} columns={columns} id={id}>
      <Widget.Header
        title={`${id}`}
        subtitle="lorem ipsum ras pareru going to the moutain"
      >
        <Button.Fullscreen onClick={() => onExpandClick?.(id)} />
      </Widget.Header>

      <Widget.Body state={state}>
        <Container>
          {Object.keys(data || {}).map((key) => {
            const value = data?.[key];

            return (
              <Content>
                <Body level={3}>{key}</Body>
                <Body strong>{value}</Body>
              </Content>
            );
          })}
        </Container>
      </Widget.Body>
    </Widget>
  );
};

const Content = styled.div`
  width: 100%;
  overflow: hidden;
  word-break: break-word;
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(max-content, 350px));
  grid-column-gap: 10px;
  grid-row-gap: 10px;
`;
