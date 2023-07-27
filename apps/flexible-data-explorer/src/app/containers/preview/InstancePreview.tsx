import React from 'react';

import { Popover, PopoverContent, PopoverTrigger } from './components/Popover';
import { FilePreview } from './FilePreview';
import { GenericInstancePreview } from './GenericInstancePreview';
import { TimeseriesPreview } from './TimeseriesPreview';
import { InstancePreviewProps } from './types';

const GenericPreview = ({
  children,
  ...rest
}: React.PropsWithChildren<InstancePreviewProps>) => {
  if (!children) {
    return <GenericInstancePreview {...rest} />;
  }

  return (
    <Popover>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent className="Tooltip">
        <GenericInstancePreview {...rest} />
      </PopoverContent>
    </Popover>
  );
};

const TimeseriesInstancePreview = ({
  children,
  ...rest
}: React.PropsWithChildren<{ id: string | number }>) => {
  if (!children) {
    return <TimeseriesPreview {...rest} />;
  }

  return (
    <Popover>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent className="Tooltip">
        <TimeseriesPreview {...rest} />
      </PopoverContent>
    </Popover>
  );
};

const FileInstancePreview = ({
  children,
  ...rest
}: React.PropsWithChildren<{ id: number }>) => {
  if (!children) {
    return <FilePreview {...rest} />;
  }

  return (
    <Popover>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent className="Tooltip">
        <FilePreview {...rest} />
      </PopoverContent>
    </Popover>
  );
};

export const InstancePreview = () => null;

InstancePreview.Generic = GenericPreview;
InstancePreview.File = FileInstancePreview;
InstancePreview.Timeseries = TimeseriesInstancePreview;
