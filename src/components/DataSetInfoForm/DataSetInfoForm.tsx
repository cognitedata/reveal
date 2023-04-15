import theme from 'styles/theme';
import {
  SectionTitle,
  TitleOrnament,
  InputField,
  OptionWrapper,
  OptionTitle,
  OptionDescription,
  FieldLabel,
  RequiredFieldLabel,
} from 'utils/styledComponents';
import { Group } from '@cognite/sdk';
import { getReadableCapabilities } from 'utils/shared';
import InfoTooltip from 'components/InfoTooltip';
import { useCdfGroups, useLabelSuggestions } from 'actions';
import Alert from 'antd/lib/alert';

import { NAME_MAX_LENGTH, DESC_MAX_LENGTH } from 'utils/constants';
import { useTranslation } from 'common/i18n';
import { Col } from 'utils';
import { Switch, Collapse, Chip } from '@cognite/cogs.js';
import CreatableSelect from 'react-select/creatable';
import Select, { components, OptionProps } from 'react-select';

const { Panel } = Collapse;

const OwnerOption = (props: OptionProps<Group, true>) => {
  return (
    <components.Option {...props}>
      <OptionWrapper>
        <OptionTitle>{props.data.name}</OptionTitle>
        <OptionDescription>
          {props.data.capabilities &&
            getReadableCapabilities(props.data.capabilities).map(
              (capability: string) => (
                <Chip
                  label={capability}
                  size="x-small"
                  css={{ margin: '5px' }}
                />
              )
            )}
        </OptionDescription>
      </OptionWrapper>
    </components.Option>
  );
};

interface DataSetInfoFormProps {
  dataSetName: string;
  externalId: string;
  setDataSetName(value: string): void;
  setExternalId(value: string): void;
  dataSetDescription: string;
  setDataSetDescription(value: string): void;
  selectedLabels?: string[];
  setSelectedLabels(value: string[]): void;
  setChangesSaved(value: boolean): void;
  setWriteProtected(value: boolean): void;
  writeProtected: boolean;
  owners: Group[];
  setOwners(value: Group[]): void;
}

const DataSetInfoForm = (props: DataSetInfoFormProps): JSX.Element => {
  const { t } = useTranslation();
  const { groups: groupsList, isLoading, error } = useCdfGroups();
  const { labels: labelSuggestions } = useLabelSuggestions();

  const nameTooLongError =
    (props.dataSetName?.length ?? 0) > NAME_MAX_LENGTH
      ? t('dataset-info-form-too-long-name', { maxLength: NAME_MAX_LENGTH })
      : false;
  const descTooLongError =
    (props.dataSetDescription?.length ?? 0) > DESC_MAX_LENGTH
      ? t('dataset-info-form-too-long-description', {
          maxLength: DESC_MAX_LENGTH,
        })
      : false;

  const onLabelsSelectChange = (selectedOptions: string[]) => {
    props.setSelectedLabels(selectedOptions);
    if (selectedOptions.length) {
      props.setChangesSaved(false);
    }
  };

  return (
    <Col span={24}>
      <SectionTitle>{t('basic-information')}</SectionTitle>
      <TitleOrnament />
      <RequiredFieldLabel>{t('name')}</RequiredFieldLabel>
      <InputField
        value={props.dataSetName}
        onChange={(e) => {
          props.setDataSetName(e.currentTarget.value);
          if (e.currentTarget.value) {
            props.setChangesSaved(false);
          }
        }}
        type="text"
        placeholder={t('name')}
        error={nameTooLongError}
      />

      <RequiredFieldLabel>{t('description')}</RequiredFieldLabel>
      <InputField
        style={{ height: ' 60px' }}
        value={props.dataSetDescription}
        onChange={(e: { currentTarget: { value: string } }) => {
          props.setDataSetDescription(e.currentTarget.value);
          if (e.currentTarget.value) {
            props.setChangesSaved(false);
          }
        }}
        placeholder={t('description')}
        size="large"
        error={descTooLongError}
      />

      <FieldLabel>{t('label_other')}</FieldLabel>
      <CreatableSelect
        isMulti
        css={{ width: '600px', background: theme.blandColor }}
        menuPlacement="auto"
        value={props.selectedLabels?.map((label) => ({ label, value: label }))}
        onChange={(selection: any) =>
          onLabelsSelectChange(selection.map((option: any) => option.label))
        }
        onCreateOption={(textFromInput: string) =>
          onLabelsSelectChange([...(props.selectedLabels || []), textFromInput])
        }
        placeholder={t('label_other')}
        isClearable
        closeMenuOnSelect
        noOptionsMessage={() => t('dataset-info-form-enter-labels')}
        options={(props.selectedLabels || [])
          ?.map((label) => ({
            label,
            value: label,
          }))
          .concat(
            labelSuggestions
              ?.filter(
                (label) =>
                  !(
                    Array.isArray(props.selectedLabels) &&
                    props.selectedLabels?.includes(label)
                  )
              )
              .map((label) => ({
                label,
                value: label,
              }))
          )}
      />
      <FieldLabel>
        <InfoTooltip
          title={t('write-protected')}
          tooltipText={t('dataset-info-form-permissions-tooltip')}
          showIcon
          url="https://docs.cognite.com/cdf/data_governance/concepts/datasets/#write-protection"
          urlTitle={t('learn-more-in-our-docs')}
        />
      </FieldLabel>
      <Switch
        checked={props.writeProtected}
        onChange={() => {
          props.setChangesSaved(false);
          props.setWriteProtected(!props.writeProtected);
        }}
      />

      {props.writeProtected && (
        <div>
          <FieldLabel>{t('dataset-info-form-owners')}</FieldLabel>
          {error ? (
            <Alert
              type="error"
              message={`${t('fetch-cdf-groups-failed')} ${t(
                'please-try-again'
              )}`}
            />
          ) : (
            <Select<Group, true>
              isMulti
              components={{ Option: OwnerOption }}
              getOptionLabel={(group) => group.name}
              getOptionValue={(group) => String(group.id)}
              options={groupsList || []}
              css={{ maxWidth: '600px', background: theme.blandColor }}
              isLoading={isLoading || !props.owners}
              onChange={(options) => {
                props.setChangesSaved(false);
                props.setOwners([...options]);
              }}
              value={props.owners}
              placeholder=""
              menuPosition="fixed"
            />
          )}
        </div>
      )}
      <Collapse
        ghost
        css={{
          marginTop: '20px',
        }}
      >
        <Panel
          style={{ border: '0px', padding: '0px' }}
          header={t('advanced-options')}
          key="1"
        >
          <FieldLabel>{t('external-id')}</FieldLabel>
          <InputField
            value={props.externalId}
            onChange={(e) => {
              props.setExternalId(e.currentTarget.value);
              if (e.currentTarget.value) {
                props.setChangesSaved(false);
              }
            }}
            type="text"
            placeholder={t('external-id')}
          />
        </Panel>
      </Collapse>
    </Col>
  );
};

export default DataSetInfoForm;
