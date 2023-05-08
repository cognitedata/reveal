import styled from 'styled-components';
import { Button } from '../../../components/buttons/Button';
import { BaseWidgetProps, Widget } from '../../../components/widget/Widget';

export const PropertiesCollapsed: React.FC<BaseWidgetProps> = (
  props: BaseWidgetProps
) => {
  return (
    <>
      <Widget.Header
        title={`Properties ${props.id}`}
        subtitle="lorem ipsum ras pareru going to the moutain"
      >
        <Button.Fullscreen onClick={() => props.onExpandClick?.(props.id)} />
      </Widget.Header>

      <Widget.Body state={props.state}>
        <Container>
          <Content>
            <p>Metadata</p>
            <p>123</p>
          </Content>
          <Content>
            <p>Metadata</p>
            <p>123</p>
          </Content>
          <Content>
            <p>Metadata</p>
            <p>123</p>
          </Content>

          <Content>
            <p>Metadata</p>
            <p>123</p>
          </Content>
          <Content>
            <p>Metadata</p>
            <p>123</p>
          </Content>
        </Container>
      </Widget.Body>
    </>
  );
};

const Content = styled.div``;

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(max-content, 350px));
  grid-column-gap: 10px;
  grid-row-gap: 10px;
`;
