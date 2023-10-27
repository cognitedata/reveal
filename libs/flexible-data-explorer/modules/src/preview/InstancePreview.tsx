import React from 'react';

import { Popover, PopoverContent, PopoverTrigger } from './components/Popover';
import { FilePreview } from './FilePreview';
import { GenericInstancePreview } from './GenericInstancePreview';
import { TimeseriesPreview } from './TimeseriesPreview';
import { InstancePreviewProps } from './types';

const GenericPreview = ({
  children,
  disabled,
  ...rest
}: React.PropsWithChildren<InstancePreviewProps>) => {
  if (!children) {
    return <GenericInstancePreview {...rest} />;
  }

  if (disabled) {
    return <>{children}</>;
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
  disabled,
  ...rest
}: React.PropsWithChildren<{ id: string | number; disabled?: boolean }>) => {
  if (!children) {
    return <TimeseriesPreview {...rest} />;
  }

  if (disabled) {
    return <>{children}</>;
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
  disabled,
  ...rest
}: React.PropsWithChildren<{ id: number | string; disabled?: boolean }>) => {
  if (!children) {
    return <FilePreview {...rest} />;
  }

  if (disabled) {
    return <>{children}</>;
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
