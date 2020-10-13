import React, { useCallback, useContext, useMemo } from 'react';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { Title } from '@cognite/cogs.js';
import { ButtonGroup } from 'components/Common';

export const UploadedFilter = () => {
  const { fileFilter, setFileFilter } = useContext(ResourceSelectionContext);
  const currentChecked = useMemo(() => {
    if (fileFilter?.uploaded === undefined) {
      return 'unset';
    }
    if (fileFilter?.uploaded) {
      return 'true';
    }
    return 'false';
  }, [fileFilter]);

  const setUploaded = useCallback(
    (value?: boolean) => {
      setFileFilter(currentFilter => ({
        ...currentFilter,
        uploaded: value,
      }));
    },
    [setFileFilter]
  );

  return (
    <>
      <Title level={4} style={{ marginBottom: 12 }} className="title">
        Uploaded
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
        <ButtonGroup.Button key="unset">All</ButtonGroup.Button>
        <ButtonGroup.Button key="true">True</ButtonGroup.Button>
        <ButtonGroup.Button key="false">False</ButtonGroup.Button>
      </ButtonGroup>
    </>
  );
};
