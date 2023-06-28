import React from 'react';

import styled from 'styled-components';

import { Button, Colors, Dropdown, Flex, Title } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';

import { LoadingSkeleton } from '../../../components/Common';
import { MenuSingle } from '../../../containers';
import { useSteps } from '../../../hooks';
import { WorkflowStep } from '../../../modules/workflows';

import { EditFileButton } from './EditFileButton';

type Props = {
  file: FileInfo | undefined;
  step: WorkflowStep;
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
};

export default function TitleBar(props: Props) {
  const { file, step, editMode, setEditMode } = props;
  const { goToPrevStep } = useSteps(step);

  return (
    <TitleRowWrapper>
      <Button
        icon="ArrowLeft"
        aria-label="Button-Back"
        onClick={() => goToPrevStep()}
      >
        Back
      </Button>
      <Title level={3} style={{ flex: 1, marginLeft: '16px' }}>
        <LoadingSkeleton loading={!file} width="200px">
          {file?.name ?? '-'}
        </LoadingSkeleton>
      </Title>
      <LoadingSkeleton loading={!file} width="100px">
        {file && (
          <Flex gap={4}>
            <EditFileButton
              item={{ type: 'file', id: file.id }}
              isActive={editMode}
              onClick={() => setEditMode(!editMode)}
            />
            <Dropdown content={<MenuSingle file={file!} />}>
              <Button
                icon="EllipsisHorizontal"
                aria-label="Button-More-All"
                type="secondary"
              />
            </Dropdown>
          </Flex>
        )}
      </LoadingSkeleton>
    </TitleRowWrapper>
  );
}

const TitleRowWrapper = styled.div`
  h1 {
    margin: 0;
  }
  padding: 16px 8px;
  border-bottom: 1px solid ${Colors['decorative--grayscale--400']};
  display: flex;
  align-items: center;
  flex-grow: 0;
`;
