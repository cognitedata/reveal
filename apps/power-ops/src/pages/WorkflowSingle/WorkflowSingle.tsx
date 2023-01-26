import dayjs from 'dayjs';
import { CogniteEvent } from '@cognite/sdk';
import {
  Button,
  Collapse,
  Detail,
  Icon,
  Illustrations,
  Input,
  TableData,
} from '@cognite/cogs.js-v9';
import { Process } from '@cognite/power-ops-api-types';
import { CopyButton } from 'components/CopyButton/CopyButton';
import { CommonTable } from 'components/CommonTable';
import { useState } from 'react';

import { processColumns } from './utils';
import {
  Header,
  FlexContainer,
  Container,
  MetadataContainer,
  CollapseContainer,
  EmptyStateContainer,
  CollapseHeader,
} from './elements';

type Props = {
  workflowEvent: CogniteEvent | undefined;
  duration: string;
  workflowMetadata: TableData[] | undefined;
  processes: Process[] | undefined;
  handleBackButtonClick: () => void;
};

export const WorkflowSingle = ({
  workflowEvent,
  duration,
  workflowMetadata,
  processes,
  handleBackButtonClick,
}: Props) => {
  const [showMetadata, setShowMetadata] = useState<boolean>(false);

  return (
    <div>
      <Header>
        <Button
          icon="ArrowLeft"
          data-testid="back-button"
          aria-label="Back Button"
          onClick={handleBackButtonClick}
        />
        {workflowEvent?.externalId && (
          <>
            <div>
              <span className="cogs-title-5">Processes</span>
              <Detail strong>Workflow type: {workflowEvent?.type}</Detail>
            </div>
            {/* <StatusLabel size="large" status={workflow.status} /> */}
          </>
        )}
      </Header>
      <FlexContainer>
        {workflowEvent?.externalId && (
          <div className="external-id">
            <p className="cogs-body-2 strong">External ID</p>
            <Input
              value={workflowEvent.externalId}
              postfix={
                <CopyButton.SimpleText
                  value={workflowEvent.externalId}
                  className="cogs-button--size-small"
                  data-testid="copy-button"
                />
              }
              disabled
              size="small"
            />
          </div>
        )}
        <MetadataContainer>
          <span>
            <p className="cogs-body-2 strong">Workflow Type</p>
            <p className="cogs-body-2">{workflowEvent?.type}</p>
          </span>
          <span>
            <p className="cogs-body-2 strong">Finished/Failed</p>
            <p className="cogs-body-2">
              {workflowEvent?.endTime &&
                dayjs(workflowEvent?.endTime).format('DD MMM, YYYY HH:mm:ss')}
            </p>
          </span>
          <span>
            <p className="cogs-body-2 strong">Duration</p>
            <p className="cogs-body-2">{duration}</p>
          </span>
          <span>
            <p className="cogs-body-2 strong">Started</p>
            <p className="cogs-body-2">
              {workflowEvent?.startTime &&
                dayjs(workflowEvent?.startTime).format('DD MMM, YYYY HH:mm:ss')}
            </p>
          </span>
          <span>
            <p className="cogs-body-2 strong">Triggered</p>
            <p className="cogs-body-2">
              {workflowEvent?.createdTime &&
                dayjs(workflowEvent?.createdTime).format(
                  'DD MMM, YYYY HH:mm:ss'
                )}
            </p>
          </span>
        </MetadataContainer>
      </FlexContainer>
      <Container>
        <CollapseContainer onChange={() => setShowMetadata(!showMetadata)}>
          <Collapse.Panel
            showArrow={false}
            header={
              <CollapseHeader
                data-testid="metadata"
                theme={{
                  showMetadata,
                }}
              >
                <p className="cogs-body-2 strong">Metadata</p>
                <Icon type="ChevronDown" />
              </CollapseHeader>
            }
          >
            <MetadataContainer>
              {workflowMetadata &&
                workflowMetadata.map((data) => (
                  <span key={data.id}>
                    <p className="cogs-body-2 strong">{data.key}</p>
                    <p className="cogs-body-2">{data.value}</p>
                  </span>
                ))}
            </MetadataContainer>
          </Collapse.Panel>
        </CollapseContainer>
        {processes?.length ? (
          <CommonTable data={processes} columns={processColumns} />
        ) : (
          <EmptyStateContainer className="processes">
            <Illustrations.Solo type="Code" />
            <div className="cogs-title-5">No processes available</div>
            <div className="cogs-body-2">
              There are currently no processes in progress
            </div>
          </EmptyStateContainer>
        )}
      </Container>
    </div>
  );
};
