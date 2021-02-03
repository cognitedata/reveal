import StatusMarker from 'components/integrations/cols/StatusMarker';
import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import { DivFlex } from 'styles/flex/StyledFlex';
import RawTable from 'components/integrations/cols/RawTable';
import InteractiveCopyWithText from 'components/InteractiveCopyWithText';
import { useParams } from 'react-router';
import { useSelectedIntegration } from '../../hooks/useSelectedIntegration';
import { calculateStatus } from '../../utils/integrationUtils';
import Schedule from '../integrations/cols/Schedule';
import { Status } from '../../model/Status';
import { TableHeadings } from '../table/IntegrationTableCol';
import { DetailFieldNames, Integration, Raw } from '../../model/Integration';
import { AbsoluteRelativeTime } from '../TimeDisplay/AbsoluteRelativeTime';
import { TwoColGrid } from '../../styles/grid/StyledGrid';
import ContactsList from '../ContactInformation/ContactsList';
import { RouterParams } from '../../routing/RoutingConfig';
import { MetaData } from './MetaData';

const Wrapper = styled.div`
  overflow-y: auto;
  height: calc(100vh - 15rem);
  display: grid;
  grid-gap: 1rem;
  grid-template-areas:
    'run seen'
    'general contacts'
    'destination metadata';
`;
const DetailWrapper = styled.section`
  margin: 0;
  padding: 0.75rem;
  border: 0.125rem solid ${Colors['greyscale-grey2'].hex()};
  display: flex;
  flex-direction: column;
  h2 {
    display: flex;
    font-size: 1.3rem;
    margin-bottom: 0;
    span {
      display: flex;
      align-items: center;
      i[aria-label] {
        font-size: 1rem;
        color: ${Colors['greyscale-grey6'].hex()};
        margin-left: 1rem;
      }
    }
  }
  .additional-info {
    color: ${Colors['greyscale-grey6'].hex()};
    margin-bottom: 1rem;
  }
  .info-field {
    margin-bottom: 1rem;
    width: fit-content;
    display: flex;
    flex-direction: column;
    > span:nth-child(2) {
      font-weight: bold;
    }
  }
`;
const LastSeenWrapper = styled(DetailWrapper)`
  grid-area: seen;
`;
const ContactsWrapper = styled(DetailWrapper)`
  grid-area: contacts;
`;
const GeneralInfoWrapper = styled(DetailWrapper)`
  grid-area: general;
`;
const MetadataWrapper = styled(DetailWrapper)`
  grid-area: metadata;
`;
const DestinationWrapper = styled(DetailWrapper)`
  grid-area: destination;
  .info-field {
    span.text-normal {
      font-weight: normal;
      .text-bold {
        font-weight: bold;
      }
    }
  }
  .flex {
    display: flex;
    span[aria-expanded] {
      font-weight: bold;
    }
  }
`;
const LatestRunWrapper = styled((props) => (
  <DetailWrapper {...props}>{props.children}</DetailWrapper>
))`
  grid-area: run;
  display: flex;
  flex-direction: column;
  &.fail {
    border-top: 0.25rem solid ${Colors.danger.hex()};
  }
  .error-message {
    padding: 1rem;
    white-space: pre-wrap;
    border: 0.125rem solid ${Colors['greyscale-grey2'].hex()};
    width: 30rem;
  }
`;
export const createNoIntegrationFoundMessage = (id: string): Readonly<string> =>
  `Found no integration with id: ${id}`;

interface IntegrationViewProps {}
const VIEW_ID_PREFIX: Readonly<string> = 'integration-view-';
export const IntegrationView: FunctionComponent<IntegrationViewProps> = () => {
  const { id } = useParams<RouterParams>();
  const { integration } = useSelectedIntegration();
  if (!integration) {
    return <p>{createNoIntegrationFoundMessage(id)}</p>;
  }
  const lastRun = calculateStatus({
    lastSuccess: integration.lastSuccess,
    lastFailure: integration.lastFailure,
  });

  const renderErrorMessage = (status: Status, message?: string) => {
    if (status !== Status.FAIL) {
      return <></>;
    }
    return (
      <DivFlex direction="column" align="flex-start">
        <span className="info-label">Error message:</span>
        {message ? (
          <pre className="error-message">{integration.lastMessage}</pre>
        ) : (
          <i>No error message received</i>
        )}
      </DivFlex>
    );
  };

  const dataSetGovernanceStatus = (int: Integration) => {
    if (int?.dataSet?.metadata?.consoleGoverned === undefined) {
      return 'Not defined';
    }
    if (int?.dataSet?.metadata?.consoleGoverned === false) {
      return 'Ungoverned';
    }
    return 'Governed';
  };

  const dataSetRawTables = (int: Integration): Raw[] | undefined => {
    return int?.dataSet?.metadata?.rawTables?.map(
      ({ databaseName, tableName }) => {
        return {
          tableName,
          dbName: databaseName,
        };
      }
    );
  };
  return (
    <Wrapper>
      <LatestRunWrapper className={`${lastRun.status.toLowerCase()}`}>
        <h2>
          {TableHeadings.LATEST_RUN} <StatusMarker status={lastRun.status} />
        </h2>
        <i className="additional-info">
          Status information from the last time the integration executed
        </i>
        <span className="info-field">
          <span className="info-label">Time since last run: </span>
          <AbsoluteRelativeTime value={lastRun.time} />
        </span>
        {renderErrorMessage(lastRun.status, integration.lastMessage)}
      </LatestRunWrapper>
      <LastSeenWrapper>
        <h2>{TableHeadings.LAST_SEEN}</h2>
        <i className="additional-info">
          Time since last time integration signaled that it is alive
        </i>
        <span className="info-field">
          <span className="info-label">
            Time since {TableHeadings.LAST_SEEN.toLowerCase()}:{' '}
          </span>
          <AbsoluteRelativeTime value={integration.lastSeen ?? 0} />
        </span>
      </LastSeenWrapper>
      <ContactsWrapper>
        <h2>{TableHeadings.CONTACTS}</h2>
        <i className="additional-info">
          People listed as contacts for this integration
        </i>
        <span className="info-field">
          <span className="info-label" />
          <ContactsList
            title={TableHeadings.CONTACTS}
            contacts={integration.contacts}
          />
        </span>
      </ContactsWrapper>

      <GeneralInfoWrapper>
        <h2>General info</h2>
        <i className="additional-info">****</i>
        <span className="info-field">
          <span className="info-label">
            {DetailFieldNames.EXTERNAL_ID}
            {': '}
          </span>
          <InteractiveCopyWithText textToCopy={integration.externalId}>
            <>{integration?.externalId}</>
          </InteractiveCopyWithText>
        </span>
        <span className="info-field">
          <span className="info-label">
            {TableHeadings.SCHEDULE}
            {': '}
          </span>
          <Schedule
            id={`${VIEW_ID_PREFIX}-schedule`}
            schedule={integration.schedule}
          />
        </span>
        <span className="info-field">
          <span className="info-label">
            {DetailFieldNames.DESCRIPTION}
            {': '}
          </span>
          <span>{integration.description}</span>
        </span>
        <span className="info-field">
          <span className="info-label">
            {DetailFieldNames.CREATED_TIME}
            {': '}
          </span>
          <AbsoluteRelativeTime value={integration.createdTime ?? 0} />
        </span>
      </GeneralInfoWrapper>
      <DestinationWrapper>
        <h2>Destination</h2>
        <i className="additional-info">Location where data is stored in CDF</i>
        <span className="info-field">
          <span className="info-label">{TableHeadings.DATA_SET}: </span>
          <span className="flex text-normal">
            Id:{' '}
            <InteractiveCopyWithText textToCopy={integration.dataSetId}>
              {integration.dataSetId}
            </InteractiveCopyWithText>
          </span>
          {integration.dataSet && (
            <>
              <span className="text-normal">
                Name:{' '}
                <span className="text-bold">{integration.dataSet.name}</span>
              </span>
              <span className="text-normal">
                Created by:{' '}
                <span className="text-bold">
                  {integration.dataSet.metadata?.consoleCreatedBy?.username}
                </span>
              </span>
              <span className="text-normal">
                Owners:{' '}
                <span className="text-bold">
                  {integration?.dataSet?.metadata?.consoleOwners?.map(
                    ({ name, email }) => {
                      return (
                        <span key={`dataset-owner-${email}`}>
                          {name} {email}
                        </span>
                      );
                    }
                  )}
                </span>
              </span>
              <span className="text-normal">
                Labels:{' '}
                <span className="text-bold">
                  {integration?.dataSet?.metadata?.consoleLabels?.map(
                    (label) => {
                      return (
                        <span key={`dataset-label-${label}`}>{label} </span>
                      );
                    }
                  )}
                </span>
              </span>
              <span className="text-normal">
                Source names:{' '}
                <span className="text-bold">
                  {integration?.dataSet?.metadata?.consoleSource?.names?.map(
                    (name) => {
                      return (
                        <span key={`dataset-source-name-${name}`}>{name} </span>
                      );
                    }
                  )}
                </span>
              </span>
              <span className="text-normal">
                Extractor accounts:{' '}
                <span className="text-bold">
                  {integration?.dataSet?.metadata?.consoleExtractors?.accounts?.map(
                    (account) => {
                      return (
                        <span key={`dataset-extractor-account-${account}`}>
                          {account}{' '}
                        </span>
                      );
                    }
                  )}
                </span>
              </span>
              <span className="text-normal">
                Governance status:{' '}
                <span className="text-bold">
                  {dataSetGovernanceStatus(integration)}
                </span>
              </span>
              <span className="text-normal">
                Raw tables:{' '}
                <RawTable rawTables={dataSetRawTables(integration)} />
              </span>
              <span className="text-normal">
                Transformations:{' '}
                {integration?.dataSet?.metadata?.transformations?.map(
                  ({ name, type, details }) => {
                    return (
                      <React.Fragment key={name}>
                        <div>Name: {name}</div>
                        <div>Type: {type}</div>
                        <div>Details: {details}</div>
                      </React.Fragment>
                    );
                  }
                )}
              </span>
            </>
          )}
        </span>
        <span className="info-field">
          <span className="info-label">{DetailFieldNames.RAW_TABLE}: </span>
          <RawTable rawTables={integration.rawTables} />
        </span>
      </DestinationWrapper>
      <MetadataWrapper>
        <h2>{DetailFieldNames.META_DATA}</h2>
        <i className="additional-info">**** Text about meta data****</i>
        <span className="info-field">
          <span className="info-label">Meta data: </span>
          <TwoColGrid className="grid-2-col">
            <MetaData
              testId="integration-metadata-"
              metadata={integration.metadata}
            />
          </TwoColGrid>
        </span>
      </MetadataWrapper>
    </Wrapper>
  );
};
