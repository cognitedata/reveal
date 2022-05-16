import { useState } from 'react';

import { ListTool, OrnateListToolItem } from '../../tools';
import { Ornate, OrnateMarkup } from '../../react';
import { mockShapeCollection } from '../../mocks/shape-collection';
import { CogniteOrnate } from '../../ornate';
import { Marker } from '../../react/components/marker';

export default {
  title: 'Ornate / 2. Tools / List',
  component: ListTool,
};

const Template = () => {
  const [listItems, setListItems] = useState<OrnateListToolItem[]>([
    {
      shapeId: 'circle',
      order: 1,
    },
  ]);

  const handleShapesReady = (instance: CogniteOrnate) => {
    instance.tools.LIST.setListUpdateFunc((next) => {
      setListItems([...next]);
    });
    instance.tools.LIST.setListItems([...listItems]);
  };

  return (
    <div style={{ width: '100%', height: 500 }}>
      <Ornate
        shapes={mockShapeCollection}
        activeTool="LIST"
        onShapesReady={handleShapesReady}
      >
        {listItems.map((item) => (
          <OrnateMarkup
            key={item.order}
            shapeId={item.shapeId}
            component={<Marker>{item.order}</Marker>}
          />
        ))}
      </Ornate>
    </div>
  );
};

export const Primary = Template.bind({});
