/* eslint-disable no-console */
import { useRef, useState } from 'react';
import styled from 'styled-components';
import { Button, Icon } from '@cognite/cogs.js';

import { CogniteOrnate } from '../ornate';
import { Ornate } from '../react/ornate';
import { mockShapeCollection } from '../mocks/shape-collection';
import {
  Toolbar,
  StampToolPopup,
  ListToolPopup,
  ListStatus,
  NodeStyle,
  StyleSelector,
} from '../react/components';
import { ToolNodeStyle, ToolType, OrnateListToolItem } from '../tools';
import {
  FileURL,
  getAnnotationsFromCDF,
  getFileFromCDF,
  OrnateShapeConfig,
  Shape,
  OrnateFileAnnotation,
} from '../shapes';
import { getMockClient } from '../mocks/cognite-client';
import { OrnateMarkup } from '../react/ornate-markup';
import { STAMP_GROUPS } from '../mocks/stamp-groups';
import { Marker } from '../react/components/marker';
import { LIST_STATUSES } from '../mocks/list-statuses';
import { defaultColor } from '../utils/colors';

const Wrapper = styled.div`
  height: 100vh;
  .ornate-toolbar,
  nav {
    position: absolute;
  }
  nav {
    top: 0;
    right: 0;
    display: flex;
    gap: 8px;
    padding: 8px;
  }
`;

export default {
  title: 'Ornate / Kitchen Sink',
};

const DEFAULT_STYLE: NodeStyle = {
  fill: defaultColor.rgb().string(),
  stroke: defaultColor.alpha(1).rgb().string(),
  strokeWidth: 12,
  fontSize: '18',
};

const Template = () => {
  const ornate = useRef<CogniteOrnate>();
  const [activeStyle, setActiveStyle] = useState(DEFAULT_STYLE);
  const [activeTool, setActiveTool] = useState<ToolType>('HAND');
  const [shapes, setShapes] =
    useState<Shape<OrnateShapeConfig>[]>(mockShapeCollection);
  const [annotationLabels, setAnnotationLabels] =
    useState<OrnateFileAnnotation[]>();
  const [listItems, setListItems] = useState<OrnateListToolItem[]>([]);
  const addFile = () => {
    const fileURLShape = new FileURL({
      x: 500,
      y: 0,
      fill: 'red',
      id: 'sample-pdf',
      fileReference: {
        externalId: 'sample-pdf',
      },
      fileName: 'Sample PDF.pdf',
      getURLFunc: getFileFromCDF(getMockClient()),
      onLoadListeners: [
        (fileURLShape) => {
          ornate.current?.zoomToID(fileURLShape.shape.id());
        },
      ],

      getAnnotationsFunc: getAnnotationsFromCDF(getMockClient()),
      onAnnotationClick: (annotation) => {
        console.log(JSON.stringify(annotation));
      },
      onAnnotationsLoad: (nextAnnotations) => {
        setAnnotationLabels(nextAnnotations);
      },
    });

    setShapes([...shapes, fileURLShape]);
  };

  const handleSetActiveTool = (tool: ToolType) => {
    if (!ornate.current) return;
    if (tool === 'STAMP') {
      ornate.current.tools.STAMP.setImageURL(STAMP_GROUPS[0].stamps[0].url);
    }
    setActiveTool(tool);
    if (ornate.current.activeTool) {
      ornate.current.style = activeStyle;
    }
  };

  const handleListItemStatusChange = (
    item: OrnateListToolItem,
    nextStatus?: ListStatus
  ) => {
    if (!ornate.current) return;
    const node = ornate.current.stage.findOne(`#${item.shapeId}`);
    if (nextStatus) {
      node.setAttrs({
        ...node.attrs,
        ...nextStatus?.styleOverrides,
      });
    }
  };

  const handleStyleChange = (nextStyle: ToolNodeStyle) => {
    if (ornate.current) {
      ornate.current.style = nextStyle;
    }
    setActiveStyle({ ...activeStyle, ...nextStyle });
  };

  const getSecondaryToolbar = () => {
    if (activeTool === 'STAMP') {
      return (
        <StampToolPopup
          activeStampUrl="1"
          onSelectStamp={(next) => {
            ornate.current?.tools.STAMP.setImageURL(next);
          }}
          stampGroups={STAMP_GROUPS}
        />
      );
    }
    if (activeTool === 'LIST') {
      return (
        <ListToolPopup
          client={getMockClient()}
          ornateInstance={ornate.current}
          listItems={listItems}
          listStatuses={LIST_STATUSES}
          onItemChange={setListItems}
          onStatusChange={handleListItemStatusChange}
        />
      );
    }
    if (['CIRCLE', 'LINE', 'RECT', 'TEXT'].includes(activeTool)) {
      const style = { ...activeStyle };
      if (['CIRCLE', 'RECT'].includes(activeTool)) {
        delete style.fontSize;
      }
      if (activeTool === 'LINE') {
        delete style.fill;
        delete style.fontSize;
      }
      if (activeTool === 'TEXT') {
        delete style.stroke;
        delete style.strokeWidth;
      }
      return <StyleSelector style={style} onChange={handleStyleChange} />;
    }
    return null;
  };

  return (
    <Wrapper>
      <Ornate
        shapes={shapes}
        activeTool={activeTool}
        onReady={(instance) => {
          ornate.current = instance;

          instance.tools.LIST.setListUpdateFunc((next) => {
            setListItems([...next]);
          });
          instance.tools.LIST.setListItems([...listItems]);
        }}
      >
        <>
          {annotationLabels?.map((label) => (
            <OrnateMarkup
              key={label.id}
              shapeId={label.id}
              component={
                <Marker>
                  <Icon type="WorkOrders" /> <span>8</span>
                </Marker>
              }
            />
          ))}
          {listItems?.map((item) => (
            <OrnateMarkup
              key={item.shapeId}
              shapeId={item.shapeId}
              placement="BOTTOM-LEFT"
              component={<Marker bottom>{item.order}</Marker>}
            />
          ))}
        </>
      </Ornate>
      <Toolbar
        activeTool={activeTool}
        setActiveTool={handleSetActiveTool}
        tools={[
          'HAND',
          'SELECT',
          'DIVIDER',
          'RECT',
          'CIRCLE',
          'LINE',
          'TEXT',
          'DIVIDER',
          'STAMP',
          'LIST',
        ]}
        secondaryToolbar={getSecondaryToolbar()}
      />

      <nav>
        <Button
          size="small"
          onClick={() => {
            const exportData = ornate.current?.export();
            // eslint-disable-next-line no-console
            console.log(exportData, JSON.stringify(exportData));
          }}
        >
          Save
        </Button>

        <Button
          size="small"
          onClick={() => {
            // eslint-disable-next-line no-alert
            const data = prompt('Import string');
            if (data) {
              ornate.current?.import(JSON.parse(data), {
                fileUrl: {
                  getURLFunc: getFileFromCDF(getMockClient()),
                  getAnnotationsFunc: getAnnotationsFromCDF(getMockClient()),
                  onAnnotationClick: (annotation) => {
                    console.log(JSON.stringify(annotation));
                  },
                },
              });
            }
          }}
        >
          Import
        </Button>

        <Button size="small" onClick={addFile}>
          Add file
        </Button>
      </nav>
    </Wrapper>
  );
};

export const Primary = Template.bind({});
