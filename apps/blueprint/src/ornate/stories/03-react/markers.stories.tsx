import { Ornate, OrnateMarkup } from '../../react';
import { Rect } from '../../shapes';

export default {
  title: 'Ornate / 3. React / Markup',
  component: Rect,
};

const markUpContent = (text: string) => (
  <div
    style={{
      padding: 8,
      background: 'blue',
      fontWeight: 'bold',
      color: 'white',
      transform: 'translate(-50%, -50%)',
    }}
  >
    {text}
  </div>
);

const Template = () => {
  const rectShape = new Rect({
    id: '123',
    x: 100,
    y: 100,
    width: 250,
    height: 250,
    fill: 'red',
  });

  return (
    <div style={{ width: '100%', height: 500 }}>
      <Ornate shapes={[rectShape]} activeTool="SELECT">
        <OrnateMarkup
          shapeId="123"
          component={markUpContent('TOP')}
          placement="TOP"
        />
        <OrnateMarkup
          shapeId="123"
          component={markUpContent('TOP-LEFT')}
          placement="TOP-LEFT"
        />
        <OrnateMarkup
          shapeId="123"
          component={markUpContent('TOP-RIGHT')}
          placement="TOP-RIGHT"
        />
        <OrnateMarkup
          shapeId="123"
          component={markUpContent('BOTTOM')}
          placement="BOTTOM"
        />
        <OrnateMarkup
          shapeId="123"
          component={markUpContent('BOTTOM-LEFT')}
          placement="BOTTOM-LEFT"
        />
        <OrnateMarkup
          shapeId="123"
          component={markUpContent('BOTTOM-RIGHT')}
          placement="BOTTOM-RIGHT"
        />

        <OrnateMarkup
          shapeId="123"
          component={markUpContent('LEFT')}
          placement="LEFT"
        />

        <OrnateMarkup
          shapeId="123"
          component={markUpContent('RIGHT')}
          placement="RIGHT"
        />

        <OrnateMarkup
          shapeId="123"
          component={markUpContent('CENTER')}
          placement="CENTER"
        />
      </Ornate>
    </div>
  );
};

export const Primary = Template.bind({});
