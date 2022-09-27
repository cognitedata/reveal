import React from 'react';
import { Body, SegmentedControl } from '@cognite/cogs.js';

export const BooleanFilter = ({
  title,
  value,
  setValue,
}: {
  title: string;
  value: boolean | undefined;
  setValue: (newValue: boolean | undefined) => void;
}) => {
  const currentChecked = (() => {
    if (value === undefined) {
      return 'unset';
    }
    if (value) {
      return 'true';
    }
    return 'false';
  })();

  const setUploaded = (newValue?: boolean) => {
    setValue(newValue);
  };

  return (
    <>
      <Body
        level={4}
        style={{ marginBottom: 5, marginTop: 10 }}
        className="title"
      >
        {title}
      </Body>
      <SegmentedControl
        fullWidth
        currentKey={currentChecked}
        onButtonClicked={key => {
          if (key === 'unset') {
            setUploaded(undefined);
          } else if (key === 'true') {
            setUploaded(true);
          } else {
            setUploaded(false);
          }
        }}
      >
        <SegmentedControl.Button key="unset" style={{ flex: 1 }}>
          All
        </SegmentedControl.Button>
        <SegmentedControl.Button key="true" style={{ flex: 1 }}>
          True
        </SegmentedControl.Button>
        <SegmentedControl.Button key="false" style={{ flex: 1 }}>
          False
        </SegmentedControl.Button>
      </SegmentedControl>
    </>
  );
};
