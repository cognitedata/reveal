import { useRef } from 'react';
import { action } from '@storybook/addon-actions';

import { Ornate } from '../../react/ornate';
import { getMockClient } from '../../mocks/cognite-client';
import { CogniteOrnate } from '../../ornate';
import {
  FileURL,
  getFileFromCDF,
  getAnnotationsFromCDF,
} from '../../shapes/file-url';

export default {
  title: 'Ornate / 1. Shapes / File URL',
  component: FileURL,
};

const Template = () => {
  const ornate = useRef<CogniteOrnate>();
  const fileURLShape = new FileURL({
    x: 0,
    y: 0,
    fill: 'red',
    id: 'sample-pdf',
    fileReference: {
      externalId: 'sample-pdf',
    },
    getURLFunc: getFileFromCDF(getMockClient()),
    getAnnotationsFunc: getAnnotationsFromCDF(getMockClient()),
    onAnnotationClick: action('onAnnotationClick'),
    onLoadListeners: [
      (fileURLShape) => {
        ornate.current?.zoomToID(fileURLShape.shape.id());
      },
    ],
  });
  return (
    <div style={{ width: '100%', height: 500 }}>
      <Ornate
        shapes={[fileURLShape]}
        onReady={(instance) => {
          ornate.current = instance;
        }}
      />
    </div>
  );
};

export const Primary = Template.bind({});
