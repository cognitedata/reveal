import React from 'react';
import Layers from 'utils/zindex';
import { Row } from 'antd';

type Justify =
  | 'space-between'
  | 'space-around'
  | 'center'
  | 'end'
  | 'start'
  | undefined;

export default function StickyBottomRow(props: {
  justify?: Justify;
  children: React.ReactNode;
}) {
  const justify = props.justify || 'space-between';
  return (
    <Row
      justify={justify}
      type="flex"
      align="middle"
      style={{
        background: 'white',
        position: 'fixed',
        zIndex: Layers.BOTTOM_ROW,
        width: '100%',
        bottom: 0,
        left: 0,
        padding: '12px 16px',
        borderTop: '2px solid rgba(0, 0, 0, 0.1)',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px -5px 10px 0px',
      }}
    >
      {props.children}
    </Row>
  );
}
