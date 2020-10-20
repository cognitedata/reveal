import React from 'react';
import { Button } from '@cognite/cogs.js';
import { TimeseriesDetailsAbstract } from 'lib';
import { assets } from 'stubs/assets';
import { files } from 'stubs/files';
import { timeseries } from 'stubs/timeseries';
import { AssetDetailsAbstract } from './AssetDetailsAbstract';

export default {
  title: 'Assets/Base/AssetDetailsAbstract',
  component: AssetDetailsAbstract,
};

export const Example = () => {
  return (
    <AssetDetailsAbstract
      asset={assets[0]}
      files={files}
      timeseries={timeseries}
    />
  );
};

export const WithActions = () => {
  return (
    <AssetDetailsAbstract
      asset={assets[0]}
      files={[files[0]]}
      timeseries={timeseries}
      actions={[
        <Button key="1" type="primary">
          Click me
        </Button>,
        <Button key="2">Click me too</Button>,
      ]}
      timeseriesPreview={ts => (
        <TimeseriesDetailsAbstract
          timeSeries={ts}
          actions={[
            <Button key="view" type="primary" icon="ArrowRight">
              View details
            </Button>,
          ]}
        />
      )}
    >
      <Button>Hover me!</Button>
    </AssetDetailsAbstract>
  );
};
export const WithExtras = () => {
  return (
    <AssetDetailsAbstract
      asset={assets[0]}
      files={[files[0]]}
      timeseries={timeseries}
      extras={
        <Button
          type="primary"
          variant="ghost"
          shape="round"
          icon="VerticalEllipsis"
        />
      }
      timeseriesPreview={ts => (
        <TimeseriesDetailsAbstract
          timeSeries={ts}
          actions={[
            <Button key="view" type="primary" icon="ArrowRight">
              View details
            </Button>,
          ]}
        />
      )}
    >
      <Button>Hover me!</Button>
    </AssetDetailsAbstract>
  );
};
