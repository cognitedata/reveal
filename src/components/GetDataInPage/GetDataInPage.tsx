import Col from 'antd/lib/col';
import Select from 'antd/lib/select';
import { useEffect, useState } from 'react';
import theme from 'styles/theme';
import { DataSet, RawTable } from 'utils/types';
import Drawer from 'components/Drawer';
import { StyledSelect, IconWrapper, FieldLabel } from 'utils/styledComponents';
import { trackEvent } from '@cognite/cdf-route-tracker';
import getDataInIcon from 'assets/getDataInIcon.svg';
import { getContainer } from 'utils/shared';
import { OidcCheck } from 'components/OidcCheck/OidcCheck';
import { RawSection } from 'components/GetDataInPage/raw/RawSection';
import { useTranslation } from 'common/i18n';

const { Option } = Select;

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
  const [selectedExtractors, setSelectedExtractors] = useState<string[]>([]);
  const [sourceNames, setSourceNames] = useState<string[]>([]);

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
      if (sourceNames.length) {
        trackEvent(`DataSets.CreationFlow.Used source names`, {
          sources: sourceNames,
          numberOfSources: sourceNames.length,
        });
        newDataSet.metadata.consoleSource = { names: sourceNames };
      }
      // check & set extractors
      if (selectedExtractors) {
        trackEvent(`DataSets.CreationFlow.Used extractors`, {
          numberOfExtractors: selectedExtractors.length,
        });
        newDataSet.metadata.consoleExtractors = {
          accounts: selectedExtractors,
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
        setSourceNames(props.dataSet.metadata.consoleSource.names);
      }
      // raw tables
      if (props.dataSet.metadata.rawTables) {
        setSelectedTables(props.dataSet.metadata.rawTables);
      }
      // extraction details
      if (props.dataSet.metadata.consoleExtractors) {
        if (props.dataSet.metadata.consoleExtractors.accounts) {
          setSelectedExtractors(
            props.dataSet.metadata.consoleExtractors.accounts
          );
        }
      }
    }
  }, [props.dataSet]);

  return (
    <Drawer
      title={<div>{t('document-data-extraction')}</div>}
      width="50%"
      onClose={() => props.closeModal()}
      visible={props.visible}
      okText={props.changesSaved ? t('done') : t('save')}
      onOk={props.changesSaved ? props.closeModal : handleSaveChanges}
      cancelHidden
    >
      <div>
        <Col span={24}>
          <Col span={18}>
            <FieldLabel>{t('source_other')}</FieldLabel>
            <Select
              mode="tags"
              style={{ width: '100%', background: theme.blandColor }}
              onChange={(selection: any) => {
                setSourceNames(selection);
                if (selection) {
                  props.setChangesSaved(false);
                }
              }}
              value={sourceNames}
              notFoundContent={t('enter-sources-to-your-data-set')}
              placeholder={t('source_other')}
              getPopupContainer={getContainer}
            >
              {props.sourceSuggestions && props.sourceSuggestions.length && (
                <Option disabled value="Suggestions">
                  {t('suggested-options')}
                </Option>
              )}
              {sourceNames?.length &&
                sourceNames?.map((label: string) => (
                  <Option key={label} value={label}>
                    {label}
                  </Option>
                ))}
              {props?.sourceSuggestions
                ?.filter((name) => !sourceNames.includes(name))
                .map((label: string) => (
                  <Option key={label} value={label}>
                    {label}
                  </Option>
                ))}
            </Select>
            <OidcCheck>
              <FieldLabel>{t('service-accounts')}</FieldLabel>
              <StyledSelect
                value={selectedExtractors}
                mode="tags"
                optionFilterProp="children"
                placeholder={t('please-select-the-service-accounts')}
                onChange={(val: any) => {
                  setSelectedExtractors(val);
                  props.setChangesSaved(false);
                }}
                filterOption={(input, option) =>
                  option && option.props && option.props.children
                    ? String(option.props.children)
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    : false
                }
                getPopupContainer={getContainer}
              >
                {selectedExtractors.map((ext) => (
                  <Option key={ext} value={ext}>
                    {ext}
                  </Option>
                ))}
              </StyledSelect>
            </OidcCheck>
          </Col>
          <Col span={6}>
            <IconWrapper>
              <img src={getDataInIcon} alt={t('add-data')} />
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
