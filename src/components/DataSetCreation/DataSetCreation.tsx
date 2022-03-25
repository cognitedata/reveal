import React, { useState, useEffect } from 'react';
import Spin from 'antd/lib/spin';
import Card from 'antd/lib/card';
import Tooltip from 'antd/lib/tooltip';
import { Icon } from '@cognite/cogs.js';
import { CreationDataSet, DataSet } from 'utils/types';
import theme from 'styles/theme';
import {
  CreateButton,
  ChangesSavedWrapper,
  SaveButton,
} from 'utils/styledComponents';
import { Group } from '@cognite/sdk';
import { trackEvent } from '@cognite/cdf-route-tracker';
import jetfireIcon from 'assets/jetfireIcon.svg';
import getDataInIcon from 'assets/getDataInIcon.svg';
import documentationIcon from 'assets/documentationIcon.svg';
import dataConsumerIcon from 'assets/DataConsumer.svg';
import { getContainer, isNotNilOrWhitespace } from 'utils/shared';
import { useFlag } from '@cognite/react-feature-flags';
import { useUserInformation } from 'hooks/useUserInformation';
import { NAME_MAX_LENGTH, DESC_MAX_LENGTH } from 'utils/constants';
import GetDataInPage from '../GetDataInPage';
import TransformPage from '../TransformPage';
import DocumentationPage from '../DocumentationPage';
import StatusPane from '../StatusPane';
import DataSetInfoForm from '../DataSetInfoForm';
import DataSetInfo from '../DataSetInfo';
import CreationFlowSection from '../CreationFlowSection';
import ConsumerPage from '../ConsumerPage';
import { CONSUMER_KEY } from '../CreationFlowSection/CreationFlowSection';

interface DataSetCreationProps {
  loading: boolean;
  createDataSet(dataSet: CreationDataSet): void;
  updateDataSet(dataSet: DataSet): void;
  datasetCreated?: boolean;
  datasetCreatedError?: boolean;
  dataSet?: DataSet;
  changesSaved: boolean;
  setChangesSaved(value: boolean): void;
  sourceSuggestions?: string[];
  closeModal(): void;
  owners: Group[];
  setOwners(value: Group[]): void;
}

const DataSetCreation = (props: DataSetCreationProps): JSX.Element => {
  const { datasetCreated, datasetCreatedError, setChangesSaved } = props;
  const { data: userData } = useUserInformation();

  const [selectedSection, setSelectedSection] = useState<string>('');
  const [dataSetName, setDataSetName] = useState<string>('');
  const [externalId, setExternalId] = useState<string>('');
  const [dataSetDescription, setDataSetDescription] = useState<string>('');
  const [selectedLabels, setSelectedLabels] = useState<any>([]);
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [saveSections, setSaveSections] = useState<boolean>(false);
  const [writeProtected, setWriteProtected] = useState<boolean>(false);
  const isFlagExtpipeConsumers = useFlag('EXTPIPES_CONSUMERS_allowlist', {
    fallback: false,
    forceRerender: true,
  });

  const didRemoveNameOrDescription =
    (props.dataSet?.name !== '' && dataSetName === '') ||
    (props.dataSet?.description !== '' && dataSetDescription === '');

  const nameOrDescTooLong =
    (dataSetName?.length ?? 0) > NAME_MAX_LENGTH ||
    (dataSetDescription?.length ?? 0) > DESC_MAX_LENGTH;

  useEffect(() => {
    if (saveSections) {
      updateDataSetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveSections]);

  const closeSectionModal = () => {
    setSelectedSection('');
  };

  const getFieldStatus = (key: string) => {
    if (props.dataSet) {
      return keyToStatusFilledDataSet(key, props.dataSet);
    }
    return keyToStatus(key);
  };

  const getDocumentationLength = (
    docs: DataSet['metadata']['consoleAdditionalDocs']
  ) => {
    return docs.filter(
      (item) => item.type !== 'file' && isNotNilOrWhitespace(String(item.id))
    ).length;
  };

  const keyToStatusFilledDataSet = (key: string, dataSet: DataSet) => {
    switch (key) {
      case 'source':
        if (dataSet?.metadata?.consoleSource?.names?.length)
          return <StatusPane color="green" message="Source(s) specified" />;
        return keyToStatus(key);
      case 'raw':
        if (dataSet.metadata.rawTables && dataSet.metadata.rawTables.length)
          return (
            <StatusPane
              color="green"
              message={`${dataSet.metadata.rawTables.length} RAW table${
                dataSet.metadata.rawTables.length > 1 ? 's' : ''
              }`}
            />
          );
        return keyToStatus(key);
      case 'transform':
        if (dataSet?.metadata?.transformations?.length)
          return (
            <StatusPane
              color="green"
              message={`${
                dataSet.metadata.transformations.length
              } transformation${
                dataSet.metadata.transformations.length > 1 ? 's' : ''
              } applied`}
            />
          );
        return keyToStatus(key);
      case 'owners':
        if (
          Array.isArray(dataSet.metadata.consoleOwners) &&
          dataSet.metadata.consoleOwners.length > 0
        )
          return (
            <StatusPane
              color="green"
              message={`Owner ${dataSet.metadata.consoleOwners[0].name}`}
            />
          );
        return keyToStatus(key);
      case 'docs':
        if (
          Array.isArray(dataSet.metadata.consoleAdditionalDocs) &&
          getDocumentationLength(dataSet.metadata.consoleAdditionalDocs)
        )
          return (
            <StatusPane
              color="green"
              message={`${getDocumentationLength(
                dataSet.metadata.consoleAdditionalDocs
              )}
            document${
              getDocumentationLength(dataSet.metadata.consoleAdditionalDocs) > 1
                ? 's'
                : ''
            } attached`}
            />
          );
        return keyToStatus(key);
      case 'quality':
        if (dataSet.metadata.consoleGoverned !== undefined)
          return (
            <StatusPane
              color={dataSet.metadata.consoleGoverned ? 'green' : 'red'}
              message={`This data set is ${
                dataSet.metadata.consoleGoverned ? 'governed' : 'ungoverned'
              }`}
            />
          );
        return keyToStatus(key);
      case CONSUMER_KEY:
        if (
          dataSet.metadata.consumers &&
          dataSet.metadata.consumers.length > 0
        ) {
          return (
            <StatusPane
              color={dataSet.metadata.consumers.length > 0 ? 'green' : 'red'}
              message={`${dataSet.metadata.consumers.length} ${
                dataSet.metadata.consumers.length > 1 ? 'consumers' : 'consumer'
              }`}
            />
          );
        }
        return keyToStatus(key);
      default:
        return <StatusPane color={theme.noStatusColor} message="Not defined" />;
    }
  };

  const keyToStatus = (key: string) => {
    switch (key) {
      case 'source':
        return (
          <StatusPane
            color={theme.noStatusColor}
            message="No source specified"
          />
        );
      case 'raw':
        return (
          <StatusPane
            color={theme.noStatusColor}
            message="No RAW table specified"
          />
        );
      case 'transform':
        return (
          <StatusPane
            color={theme.noStatusColor}
            message="No transformation applied"
          />
        );
      case 'owners':
        return (
          <StatusPane
            color={theme.noStatusColor}
            message="No owner specified"
          />
        );
      case 'docs':
        return (
          <StatusPane
            color={theme.noStatusColor}
            message="No documents attached"
          />
        );
      case 'quality':
        return (
          <StatusPane
            color={theme.noStatusColor}
            message="Governance status not defined not defined"
          />
        );
      case CONSUMER_KEY:
        return (
          <StatusPane
            color={theme.noStatusColor}
            message="No consumer registered"
          />
        );
      default:
        return <StatusPane color={theme.noStatusColor} message="N/A" />;
    }
  };

  const StatusColumns = [
    {
      title: 'Status',
      key: 'key',
      render: (row: { key: string }) => getFieldStatus(row.key),
      width: '250px',
    },
    { title: 'What you need to do', dataIndex: 'field', key: 'field' },
  ];

  useEffect(() => {
    if (props.dataSet) {
      if (
        dataSetName !== props.dataSet.name ||
        dataSetDescription !== props.dataSet.description ||
        selectedLabels !== props.dataSet.metadata.consoleLabels ||
        writeProtected !== props.dataSet.writeProtected
      ) {
        setChangesSaved(false);
      } else {
        setChangesSaved(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSetName, dataSetDescription, selectedLabels, writeProtected]);

  useEffect(() => {
    if (props.dataSet) {
      setDataSetName(props.dataSet.name);
      setDataSetDescription(props.dataSet.description);
      setWriteProtected(props.dataSet.writeProtected);
      setExternalId(props.dataSet.externalId || '');
      if (props.dataSet.metadata.consoleLabels) {
        setSelectedLabels(props.dataSet.metadata.consoleLabels);
      }
    }
  }, [props.dataSet]);

  const updateDataSetFields = () => {
    trackEvent('DataSets.EditingFlow.Saved the edited data set');
    if (props.dataSet) {
      const newDataSet: DataSet = props.dataSet;
      newDataSet.name = dataSetName;
      newDataSet.description = dataSetDescription;
      newDataSet.writeProtected = writeProtected;
      if (externalId !== '') {
        newDataSet.externalId = externalId;
      }
      if (selectedLabels) {
        newDataSet.metadata.consoleLabels = selectedLabels;
      }
      props.updateDataSet(newDataSet);
      setChangesSaved(true);
      setSaveSections(false);
      setIsEditing(false);
      closeSectionModal();
    }
  };

  const createSet = () => {
    if (dataSetDescription !== '' && dataSetName !== '') {
      trackEvent('DataSets.CreationFlow.Created the data set');
      trackEvent(`DataSets.CreationFlow.Set write protection`, {
        writeProtected,
      });
      const newDs: CreationDataSet = {
        name: dataSetName,
        description: dataSetDescription,
        writeProtected,
        metadata: {
          consoleCreatedBy: {
            username: userData?.displayName ?? userData?.email ?? 'Unknown',
          },
          consoleMetaDataVersion: 3,
        },
      };
      if (externalId !== '') {
        newDs.externalId = externalId;
      }
      if (selectedLabels) {
        trackEvent(`DataSets.CreationFlow.Used labels`, {
          labels: selectedLabels,
          numberOfLabels: selectedLabels.length,
        });
        newDs.metadata.consoleLabels = selectedLabels;
      }
      props.createDataSet(newDs);
    }
  };

  useEffect(() => {
    if (datasetCreated && !datasetCreatedError) {
      setChangesSaved(true);
      setIsEditing(false);
    }
  }, [datasetCreated, datasetCreatedError, setChangesSaved]);

  useEffect(() => {
    setIsEditing(true);
  }, []);

  return (
    <div>
      <Card style={{ marginBottom: '10px' }}>
        {props.dataSet && !isEditing ? (
          <DataSetInfo
            id={props.dataSet?.id}
            name={props.dataSet.name}
            description={props.dataSet.description}
            labels={
              Array.isArray(props.dataSet.metadata.consoleLabels)
                ? props.dataSet.metadata.consoleLabels
                : []
            }
          />
        ) : (
          <DataSetInfoForm
            externalId={externalId}
            setExternalId={setExternalId}
            dataSetName={dataSetName}
            setDataSetName={setDataSetName}
            dataSetDescription={dataSetDescription}
            setDataSetDescription={setDataSetDescription}
            selectedLabels={selectedLabels}
            setSelectedLabels={setSelectedLabels}
            setChangesSaved={setChangesSaved}
            writeProtected={writeProtected}
            setWriteProtected={setWriteProtected}
            owners={props.owners}
            setOwners={props.setOwners}
          />
        )}
        {props.dataSet && isEditing && (
          <CreateButton
            onClick={() => updateDataSetFields()}
            disabled={
              props.changesSaved ||
              didRemoveNameOrDescription ||
              nameOrDescTooLong
            }
            type="primary"
          >
            Save
          </CreateButton>
        )}
        {!props.dataSet && isEditing && (
          <span style={{ float: 'right' }}>
            <Tooltip
              style={{ float: 'right' }}
              title={
                dataSetName === '' || dataSetDescription === ''
                  ? 'Please fill in data set name & description to create'
                  : ''
              }
              getPopupContainer={getContainer}
            >
              <CreateButton
                onClick={() => createSet()}
                disabled={
                  dataSetName === '' ||
                  dataSetDescription === '' ||
                  nameOrDescTooLong
                }
                type="primary"
              >
                Create
              </CreateButton>
            </Tooltip>
          </span>
        )}
        {!isEditing && (
          <CreateButton onClick={() => setIsEditing(true)} type="primary">
            Edit
          </CreateButton>
        )}
      </Card>
      {props.dataSet && (
        <>
          <CreationFlowSection
            title="1. Document data extraction"
            setSelection={() => setSelectedSection('Document data extraction')}
            icon={getDataInIcon}
            columns={StatusColumns}
            name="GetDataIn"
          />
          <CreationFlowSection
            title="2. Document data transformations"
            setSelection={() => setSelectedSection('Transformations')}
            icon={jetfireIcon}
            columns={StatusColumns}
            name="Transformations"
          />
          <CreationFlowSection
            title="3. Add documentation"
            setSelection={() => setSelectedSection('Documentation')}
            icon={documentationIcon}
            columns={StatusColumns}
            name="Documentation"
          />
          {isFlagExtpipeConsumers && (
            <CreationFlowSection
              title="4. Document consumer(s)"
              setSelection={() => setSelectedSection('Consumers')}
              icon={dataConsumerIcon}
              columns={StatusColumns}
              name="Consumers"
            />
          )}
        </>
      )}
      <div>
        <GetDataInPage
          dataSet={props.dataSet}
          updateDataSet={(updatedDataSet) =>
            props.updateDataSet(updatedDataSet)
          }
          closeModal={() => setSelectedSection('')}
          changesSaved={props.changesSaved}
          setChangesSaved={setChangesSaved}
          sourceSuggestions={props.sourceSuggestions}
          visible={selectedSection === 'Document data extraction'}
          saveSection={saveSections}
        />

        <TransformPage
          dataSet={props.dataSet}
          updateDataSet={(updatedDataSet) =>
            props.updateDataSet(updatedDataSet)
          }
          closeModal={() => setSelectedSection('')}
          changesSaved={props.changesSaved}
          setChangesSaved={setChangesSaved}
          visible={selectedSection === 'Transformations'}
          saveSection={saveSections}
        />

        <DocumentationPage
          dataSet={props.dataSet}
          updateDataSet={(updatedDataSet) =>
            props.updateDataSet(updatedDataSet)
          }
          closeModal={() => setSelectedSection('')}
          changesSaved={props.changesSaved}
          setChangesSaved={setChangesSaved}
          visible={selectedSection === 'Documentation'}
          saveSection={saveSections}
        />
        {isFlagExtpipeConsumers && (
          <ConsumerPage
            dataSet={props.dataSet}
            updateDataSet={(updatedDataSet) =>
              props.updateDataSet(updatedDataSet)
            }
            closeModal={() => setSelectedSection('')}
            changesSaved={props.changesSaved}
            setChangesSaved={setChangesSaved}
            visible={selectedSection === 'Consumers'}
            saveSection={saveSections}
          />
        )}
      </div>
      {props.loading && (
        <ChangesSavedWrapper style={{ background: theme.pillBackground }}>
          <Spin /> Saving
        </ChangesSavedWrapper>
      )}
      {!props.changesSaved && !props.loading && (
        <ChangesSavedWrapper style={{ background: theme.noStatusColor }}>
          <Icon type="WarningFilled" /> Unsaved changes
        </ChangesSavedWrapper>
      )}
      {!props.changesSaved && props.dataSet && (
        <SaveButton
          disabled={didRemoveNameOrDescription || nameOrDescTooLong}
          type="primary"
          onClick={() => updateDataSetFields()}
        >
          Save All
        </SaveButton>
      )}
      {props.changesSaved && props.dataSet && (
        <SaveButton
          type="primary"
          onClick={() => {
            props.closeModal();
          }}
        >
          Done
        </SaveButton>
      )}
    </div>
  );
};

export default DataSetCreation;
