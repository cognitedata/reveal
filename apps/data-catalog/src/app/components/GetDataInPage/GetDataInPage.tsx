import { useEffect, useState } from 'react';

import CreatableSelect from 'react-select/creatable';

import { trackEvent } from '@cognite/cdf-route-tracker';

import { getDataInIcon as GetDataInIcon } from '../../assets';
import { useTranslation } from '../../common/i18n';
import theme from '../../styles/theme';
import { Col, DataSet, FieldLabel, IconWrapper, RawTable } from '../../utils';
import Drawer from '../Drawer';
import { OidcCheck } from '../OidcCheck/OidcCheck';

import { RawSection } from './raw/RawSection';

interface SelectOption {
  value: string;
  label: string;
}

interface GetDataInProps {
  dataSet?: DataSet;
  updateDataSet(dataSet: DataSet): void;
  closeModal(): void;
  changesSaved: boolean;
  setChangesSaved(value: boolean): void;
  sourceSuggestions?: string[];
  visible: boolean;
  saveSection: boolean;
}
const GetDataInPage = (props: GetDataInProps): JSX.Element => {
  const { t } = useTranslation();
  const [selectedDb, setSelectedDb] = useState<string>('');
  const [selectedTables, setSelectedTables] = useState<RawTable[]>([]);
  const [selectedExtractors, setSelectedExtractors] = useState<SelectOption[]>(
    []
  );
  const [selectedSources, setSelectedSources] = useState<SelectOption[]>([]);

  useEffect(() => {
    if (props.saveSection) {
      handleSaveChanges();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.saveSection]);

  const handleSaveChanges = () => {
    if (props.dataSet) {
      const newDataSet: DataSet = props.dataSet;
      // check & set source name
      if (selectedSources.length) {
        const sourceNames = selectedSources.map(({ label }) => label);
        trackEvent(`DataSets.CreationFlow.Used source names`, {
          sources: sourceNames,
          numberOfSources: selectedSources.length,
        });
        newDataSet.metadata.consoleSource = { names: sourceNames };
      }
      // check & set extractors
      if (selectedExtractors) {
        trackEvent(`DataSets.CreationFlow.Used extractors`, {
          numberOfExtractors: selectedExtractors.length,
        });
        newDataSet.metadata.consoleExtractors = {
          accounts: selectedExtractors.map(({ label }) => label),
        };
      }
      // check & set raw tables
      if (selectedTables) {
        trackEvent(`DataSets.CreationFlow.Used RAW tables`, {
          numberOfRawTables: selectedTables.length,
        });
        newDataSet.metadata.rawTables = selectedTables;
      }
      props.updateDataSet(newDataSet);
      props.setChangesSaved(true);
      props.closeModal();
    }
  };

  // Set all fields
  useEffect(() => {
    if (props.dataSet) {
      // source names
      if (
        props.dataSet.metadata.consoleSource &&
        props.dataSet.metadata.consoleSource.names
      ) {
        setSelectedSources(
          props.dataSet.metadata.consoleSource.names.map((name) => ({
            value: name,
            label: name,
          }))
        );
      }
      // raw tables
      if (props.dataSet.metadata.rawTables) {
        setSelectedTables(props.dataSet.metadata.rawTables);
      }
      // extraction details
      if (props.dataSet.metadata.consoleExtractors) {
        if (props.dataSet.metadata.consoleExtractors.accounts) {
          setSelectedExtractors(
            props.dataSet.metadata.consoleExtractors.accounts.map(
              (account) => ({
                value: account,
                label: account,
              })
            )
          );
        }
      }
    }
  }, [props.dataSet]);

  const sourcesOptions = [
    {
      label: t('suggested-options'),
      options: (props.sourceSuggestions || []).map((suggestion) => ({
        value: suggestion,
        label: suggestion,
      })),
    },
  ];

  return (
    <Drawer
      title={t('document-data-extraction')}
      width="50%"
      onClose={() => props.closeModal()}
      onCancel={() => props.closeModal()}
      visible={props.visible}
      okText={props.changesSaved ? t('done') : t('save')}
      onOk={props.changesSaved ? props.closeModal : handleSaveChanges}
      cancelHidden
    >
      <div id="getDataInPageContainer">
        <Col span={24}>
          <Col span={18}>
            <FieldLabel>{t('source_other')}</FieldLabel>
            <CreatableSelect
              isMulti
              css={{ maxWidth: '600px', background: theme.blandColor }}
              menuPlacement="bottom"
              value={selectedSources as any}
              onChange={(options: any) => {
                setSelectedSources([...options]);
                props.setChangesSaved(false);
              }}
              placeholder={t('source_other')}
              isClearable
              closeMenuOnSelect
              noOptionsMessage={() => t('enter-sources-to-your-data-set')}
              options={sourcesOptions}
            />
            <OidcCheck>
              <FieldLabel>{t('service-accounts')}</FieldLabel>
              <CreatableSelect
                isMulti
                css={{ maxWidth: '600px', background: theme.blandColor }}
                menuPlacement="bottom"
                value={selectedExtractors}
                onChange={(options: any) => {
                  setSelectedExtractors([...options]);
                  props.setChangesSaved(false);
                }}
                placeholder={t('please-select-the-service-accounts')}
                isClearable
                closeMenuOnSelect
                options={[]}
              />
            </OidcCheck>
          </Col>
          <Col span={6}>
            <IconWrapper>
              <GetDataInIcon />
            </IconWrapper>
          </Col>
        </Col>
        <Col style={{ marginTop: '20px' }} span={24}>
          <RawSection
            selectedTables={selectedTables}
            setSelectedTables={setSelectedTables}
            selectedDb={selectedDb}
            setSelectedDb={setSelectedDb}
            setChangesSaved={props.setChangesSaved}
          />
        </Col>
      </div>
    </Drawer>
  );
};

export default GetDataInPage;
