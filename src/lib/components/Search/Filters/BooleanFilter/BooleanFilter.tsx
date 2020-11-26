import React from 'react';
import { Title } from '@cognite/cogs.js';
import { ButtonGroup } from 'lib/components';

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
      <Title
        level={4}
        style={{ marginBottom: 5, marginTop: 10 }}
        className="title"
      >
        {title}
      </Title>
      <ButtonGroup
        style={{ width: '100%' }}
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
        <ButtonGroup.Button key="unset" style={{ flex: 1 }}>
          All
        </ButtonGroup.Button>
        <ButtonGroup.Button key="true" style={{ flex: 1 }}>
          True
        </ButtonGroup.Button>
        <ButtonGroup.Button key="false" style={{ flex: 1 }}>
          False
        </ButtonGroup.Button>
      </ButtonGroup>
    </>
  );
};
