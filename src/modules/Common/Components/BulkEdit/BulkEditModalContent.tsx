import React, { useState } from 'react';
import { Body, Button, Select, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { BulkEditTempState } from 'src/modules/Explorer/store/explorerSlice';
import { BulkEditTable } from './BulkEditTable/BulkEditTable';
import { FileState } from '../../filesSlice';
import { bulkEditOptions, BulkEditOptionType } from './bulkEditOptions';

export type BulkEditModalContentProps = {
  selectedFiles: FileState[];
  bulkEditTemp: BulkEditTempState;
  onCancel: () => void;
  setBulkEditTemp: (value: BulkEditTempState) => void;
  onFinishBulkEdit: () => void;
};

export const BulkEditModalContent = ({
  selectedFiles,
  bulkEditTemp,
  onCancel,
  setBulkEditTemp,
  onFinishBulkEdit,
}: BulkEditModalContentProps) => {
  const [selectedBulkEditOption, setSelectedBulkEditOption] =
    useState<BulkEditOptionType>(bulkEditOptions[0]);

  return (
    <>
      <Title level={4} as="h1">
        Bulk edit files
      </Title>
      <BodyContainer>
        <EditType>
          <Body level={2}>Select data to edit</Body>
          <div style={{ width: '255px' }}>
            <Select
              value={selectedBulkEditOption}
              onChange={setSelectedBulkEditOption}
              options={bulkEditOptions}
            />
          </div>
        </EditType>
        {selectedBulkEditOption.editPanel({ bulkEditTemp, setBulkEditTemp })}
        <BulkEditTable
          data={selectedBulkEditOption.data(selectedFiles, bulkEditTemp)}
          columns={selectedBulkEditOption.columns}
        />
      </BodyContainer>
      <Footer>
        <RightFooter>
          <Button type="ghost-danger" icon="XLarge" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="primary" icon="Upload" onClick={onFinishBulkEdit}>
            Finish
          </Button>
        </RightFooter>
      </Footer>
    </>
  );
};

const BodyContainer = styled.div`
  display: grid;
  grid-gap: 18px;
  margin: 17px 0px;
`;

const EditType = styled.div`
  display: grid;
  grid-gap: 6px;
`;

const Footer = styled.div`
  display: grid;
  grid-auto-flow: column;
`;

const RightFooter = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-self: center;
  justify-self: end;
  grid-gap: 6px;
`;
