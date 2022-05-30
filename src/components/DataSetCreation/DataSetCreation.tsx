import { useState, useEffect } from 'react';
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
import { useTranslation } from 'common/i18n';

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
  const { t } = useTranslation();
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
  const { isEnabled: isFlagExtpipeConsumers } = useFlag(
    'EXTPIPES_CONSUMERS_allowlist',
    {
      fallback: false,
      forceRerender: true,
    }
  );

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
  ) =>
    docs?.length
      ? docs.filter((item) => isNotNilOrWhitespace(String(item.id))).length
      : 0;

  const keyToStatusFilledDataSet = (key: string, dataSet: DataSet) => {
    switch (key) {
      case 'source':
        if (dataSet?.metadata?.consoleSource?.names?.length)
          return (
            <StatusPane color="green" message={t('source-specified_other')} />
          );
        return keyToStatus(key);
      case 'raw': {
        const rawTablesQuantity = dataSet.metadata.rawTables?.length ?? 0;
        if (rawTablesQuantity)
          return (
            <StatusPane
              color="green"
              message={
                rawTablesQuantity > 1
                  ? t('dataset-creation-raw-table-quantity_other', {
                      rawTablesQuantity,
                    })
                  : t('dataset-creation-raw-table-quantity_one', {
                      rawTablesQuantity,
                    })
              }
            />
          );
        return keyToStatus(key);
      }
      case 'transform': {
        const transformationsQuantity =
          dataSet?.metadata?.transformations?.length ?? 0;
        if (transformationsQuantity)
          return (
            <StatusPane
              color="green"
              message={
                transformationsQuantity > 1
                  ? t(
                      'dataset-creation-transformations-applied-quantity_other',
                      { transformationsQuantity }
                    )
                  : t('dataset-creation-transformations-applied-quantity_one', {
                      transformationsQuantity,
                    })
              }
            />
          );
        return keyToStatus(key);
      }
      case 'owners':
        if (
          Array.isArray(dataSet.metadata.consoleOwners) &&
          dataSet.metadata.consoleOwners.length > 0
        )
          return (
            <StatusPane
              color="green"
              message={t('owner-with-name', {
                ownerName: dataSet.metadata.consoleOwners[0].name,
              })}
            />
          );
        return keyToStatus(key);
      case 'docs': {
        const additionalDocs = dataSet.metadata.consoleAdditionalDocs;
        const docsQuantity = getDocumentationLength(additionalDocs);
        if (Array.isArray(additionalDocs) && docsQuantity)
          return (
            <StatusPane
              color="green"
              message={
                docsQuantity > 1
                  ? t('dataset-creation-documents-attached-quantity_other', {
                      docsQuantity,
                    })
                  : t('dataset-creation-documents-attached-quantity_one', {
                      docsQuantity,
                    })
              }
            />
          );
        return keyToStatus(key);
      }
      case 'quality':
        if (dataSet.metadata.consoleGoverned !== undefined)
          return (
            <StatusPane
              color={dataSet.metadata.consoleGoverned ? 'green' : 'red'}
              message={
                dataSet.metadata.consoleGoverned
                  ? t('dataset-creation-dataset-governed')
                  : t('dataset-creation-dataset-ungoverned')
              }
            />
          );
        return keyToStatus(key);
      case CONSUMER_KEY: {
        const consumersQuantity = dataSet.metadata.consumers?.length ?? 0;
        if (consumersQuantity > 0) {
          return (
            <StatusPane
              color={consumersQuantity > 0 ? 'green' : 'red'}
              message={
                consumersQuantity > 1
                  ? t('dataset-creation-consumers-quantity_other', {
                      consumersQuantity,
                    })
                  : t('dataset-creation-consumers-quantity_one', {
                      consumersQuantity,
                    })
              }
            />
          );
        }
        return keyToStatus(key);
      }
      default:
        return (
          <StatusPane color={theme.noStatusColor} message={t('not-defined')} />
        );
    }
  };

  const keyToStatus = (key: string) => {
    switch (key) {
      case 'source':
        return (
          <StatusPane
            color={theme.noStatusColor}
            message={t('no-source-specified')}
          />
        );
      case 'raw':
        return (
          <StatusPane
            color={theme.noStatusColor}
            message={t('no-rawtable-specified')}
          />
        );
      case 'transform':
        return (
          <StatusPane
            color={theme.noStatusColor}
            message={t('no-transformation-applied')}
          />
        );
      case 'owners':
        return (
          <StatusPane
            color={theme.noStatusColor}
            message={t('no-owner-specified')}
          />
        );
      case 'docs':
        return (
          <StatusPane
            color={theme.noStatusColor}
            message={t('no-documents-attached')}
          />
        );
      case 'quality':
        return (
          <StatusPane
            color={theme.noStatusColor}
            message={t('governance-status-not-defined')}
          />
        );
      case CONSUMER_KEY:
        return (
          <StatusPane
            color={theme.noStatusColor}
            message={t('no-consumer-registered')}
          />
        );
      default:
        return (
          <StatusPane
            color={theme.noStatusColor}
            message={t('not-applicable')}
          />
        );
    }
  };

  const StatusColumns = [
    {
      title: t('status'),
      key: 'key',
      render: (row: { key: string }) => getFieldStatus(row.key),
      width: '250px',
    },
    { title: t('what-you-need-to-do'), dataIndex: 'field', key: 'field' },
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
            {t('save')}
          </CreateButton>
        )}
        {!props.dataSet && isEditing && (
          <span style={{ float: 'right' }}>
            <Tooltip
              style={{ float: 'right' }}
              title={
                dataSetName === '' || dataSetDescription === ''
                  ? t('dataset-creation-please-fill-in')
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
                {t('create')}
              </CreateButton>
            </Tooltip>
          </span>
        )}
        {!isEditing && (
          <CreateButton onClick={() => setIsEditing(true)} type="primary">
            {t('edit')}
          </CreateButton>
        )}
      </Card>
      {props.dataSet && (
        <>
          <CreationFlowSection
            title={t('section-creation-flow-title-1')}
            setSelection={() => setSelectedSection('Document data extraction')}
            icon={getDataInIcon}
            columns={StatusColumns}
            name="GetDataIn"
          />
          <CreationFlowSection
            title={t('section-creation-flow-title-2')}
            setSelection={() => setSelectedSection('Transformations')}
            icon={jetfireIcon}
            columns={StatusColumns}
            name="Transformations"
          />
          <CreationFlowSection
            title={t('section-creation-flow-title-3')}
            setSelection={() => setSelectedSection('Documentation')}
            icon={documentationIcon}
            columns={StatusColumns}
            name="Documentation"
          />
          {isFlagExtpipeConsumers && (
            <CreationFlowSection
              title={t('section-creation-flow-title-4')}
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
          <Spin /> {t('saving')}
        </ChangesSavedWrapper>
      )}
      {!props.changesSaved && !props.loading && (
        <ChangesSavedWrapper style={{ background: theme.noStatusColor }}>
          <Icon type="WarningFilled" /> {t('unsaved-changes')}
        </ChangesSavedWrapper>
      )}
      {!props.changesSaved && props.dataSet && (
        <SaveButton
          disabled={didRemoveNameOrDescription || nameOrDescTooLong}
          type="primary"
          onClick={() => updateDataSetFields()}
        >
          {t('save-all')}
        </SaveButton>
      )}
      {props.changesSaved && props.dataSet && (
        <SaveButton
          type="primary"
          onClick={() => {
            props.closeModal();
          }}
        >
          {t('done')}
        </SaveButton>
      )}
    </div>
  );
};

export default DataSetCreation;
