import React, { FunctionComponent, useEffect } from 'react';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import RawTable from 'components/integrations/cols/RawTable';
import InteractiveCopyWithText from 'components/InteractiveCopyWithText';
import { useParams } from 'react-router';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import Schedule from 'components/integrations/cols/Schedule';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import {
  DetailFieldNames,
  Integration,
  IntegrationRawTable,
} from 'model/Integration';
import { AbsoluteRelativeTime } from 'components/TimeDisplay/AbsoluteRelativeTime';
import { TwoColGrid } from 'styles/grid/StyledGrid';
import { RouterParams } from 'routing/RoutingConfig';
import { MetaData } from 'components/integration/MetaData';
import { DataSetView } from 'components/integration/DataSetView';
import { RunView } from 'components/integration/RunView';
import { trackUsage } from 'utils/Metrics';
import { SINGLE_INTEGRATION } from 'utils/constants';
import { bottomSpacing, mainContentSpaceSides } from 'styles/StyledVariables';

export const Wrapper = styled.div`
  overflow-y: auto;
  height: calc(100vh - 15rem);
  display: grid;
  padding: 0 ${mainContentSpaceSides};
`;
export const DetailWrapper = styled.section`
  margin: 0;
  padding: 0.75rem 0;
  border-bottom: 0.125rem solid ${Colors['greyscale-grey2'].hex()};
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
  .info-field {
    margin-bottom: ${bottomSpacing};
    width: fit-content;
    display: flex;
    flex-direction: column;
    > span:nth-child(2) {
      font-weight: bold;
    }
  }
`;

export const AdditionalInfo = styled.i`
  color: ${Colors['greyscale-grey6'].hex()};
  margin-bottom: ${bottomSpacing};
`;

const DestinationWrapper = styled(DetailWrapper)`
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
export const createNoIntegrationFoundMessage = (id: string): Readonly<string> =>
  `Found no integration with id: ${id}`;

interface IntegrationViewProps {}
const VIEW_ID_PREFIX: Readonly<string> = 'integration-view-';
export const IntegrationView: FunctionComponent<IntegrationViewProps> = () => {
  const { id } = useParams<RouterParams>();
  const { integration } = useSelectedIntegration();
  const integrationId = integration?.id;

  useEffect(() => {
    if (integrationId) {
      trackUsage(SINGLE_INTEGRATION, { id: integrationId });
    }
  }, [integrationId]);

  if (!integration) {
    return <p>{createNoIntegrationFoundMessage(id)}</p>;
  }

  const dataSetGovernanceStatus = (int: Integration) => {
    if (int?.dataSet?.metadata?.consoleGoverned === undefined) {
      return 'Not defined';
    }
    if (int?.dataSet?.metadata?.consoleGoverned === false) {
      return 'Ungoverned';
    }
    return 'Governed';
  };

  const dataSetRawTables = (
    int: Integration
  ): IntegrationRawTable[] | undefined => {
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
      <RunView integration={integration} />
      <DetailWrapper>
        <h2>{TableHeadings.LAST_SEEN}</h2>
        <AdditionalInfo>
          Time since last time integration signaled that it is alive
        </AdditionalInfo>
        <span className="info-field">
          <span className="info-label">
            Time since {TableHeadings.LAST_SEEN.toLowerCase()}:{' '}
          </span>
          <AbsoluteRelativeTime value={integration.lastSeen ?? 0} />
        </span>
      </DetailWrapper>
      <DetailWrapper>
        <h2>General info</h2>
        <AdditionalInfo />
        <span className="info-field">
          <span className="info-label">
            {DetailFieldNames.EXTERNAL_ID}
            {': '}
          </span>
          <InteractiveCopyWithText
            textToCopy={integration.externalId}
            copyType="externalId"
          >
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
      </DetailWrapper>
      <DestinationWrapper>
        <h2>Destination</h2>
        <AdditionalInfo>Location where data is stored in CDF</AdditionalInfo>
        <span className="info-field">
          <h3 className="info-label">{TableHeadings.DATA_SET}: </h3>
          <DataSetView
            dataSetId={integration.dataSetId}
            dataSet={integration.dataSet}
          />
          {integration.dataSet && (
            <>
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
          <h3 className="info-label">{DetailFieldNames.RAW_TABLE}: </h3>
          <RawTable rawTables={integration.rawTables} />
        </span>
      </DestinationWrapper>
      <DetailWrapper>
        <h2>{DetailFieldNames.META_DATA}</h2>
        <AdditionalInfo>**** Text about meta data****</AdditionalInfo>
        <span className="info-field">
          <span className="info-label">Meta data: </span>
          <TwoColGrid className="grid-2-col">
            <MetaData
              testId="integration-metadata-"
              metadata={integration.metadata}
            />
          </TwoColGrid>
        </span>
      </DetailWrapper>
    </Wrapper>
  );
};
