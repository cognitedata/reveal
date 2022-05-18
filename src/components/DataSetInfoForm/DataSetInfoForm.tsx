import { ReactNode } from 'react';
import Select from 'antd/lib/select';
import Col from 'antd/lib/col';
import theme from 'styles/theme';
import Switch from 'antd/lib/switch';
import {
  SectionTitle,
  TitleOrnament,
  InputField,
  OptionWrapper,
  OptionTitle,
  OptionDescription,
  GroupLabel,
  FieldLabel,
  RequiredFieldLabel,
} from 'utils/styledComponents';
import { Group } from '@cognite/sdk';
import Tag from 'antd/lib/tag';
import { getReadableCapabilities, getContainer } from 'utils/shared';
import InfoTooltip from 'components/InfoTooltip';
import Collapse from 'antd/lib/collapse';
import { useCdfGroups, useLabelSuggestions } from 'actions';
import Alert from 'antd/lib/alert';

import { NAME_MAX_LENGTH, DESC_MAX_LENGTH } from 'utils/constants';
import { useTranslation } from 'common/i18n';

const { Panel } = Collapse;

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

const { Option } = Select;

declare module 'antd/lib/select' {
  export interface OptionProps {
    label?: ReactNode;
  }
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
      <Select
        mode="tags"
        style={{ width: '600px', background: theme.blandColor }}
        value={props.selectedLabels}
        onChange={(selection: any) => {
          props.setSelectedLabels(selection);
          if (selection) {
            props.setChangesSaved(false);
          }
        }}
        notFoundContent={t('dataset-info-form-enter-labels')}
        placeholder={t('label_other')}
        getPopupContainer={getContainer}
      >
        {Array.isArray(props.selectedLabels) &&
          props.selectedLabels?.length &&
          props.selectedLabels?.map((label: string) => (
            <Option key={label} value={label}>
              {label}
            </Option>
          ))}
        {labelSuggestions
          ?.filter(
            (label) =>
              !(
                Array.isArray(props.selectedLabels) &&
                props.selectedLabels?.includes(label)
              )
          )
          ?.map((suggestion: string) => (
            <Option key={suggestion} value={suggestion}>
              {suggestion}
            </Option>
          ))}
      </Select>
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
        onChange={(val) => {
          props.setChangesSaved(false);
          props.setWriteProtected(val);
        }}
      />

      {props.writeProtected && (
        <div>
          <FieldLabel>{t('dataset-info-form-owners')}</FieldLabel>
          {error ? (
            <Alert
              type="error"
              message={t('dataset-info-form-cdf-groups-fetch-failed')}
            />
          ) : (
            <Select<any>
              mode="multiple"
              style={{ width: '100%', background: theme.blandColor }}
              loading={isLoading || !props.owners}
              onChange={(selection: string[]) => {
                if (groupsList && groupsList.length) {
                  props.setChangesSaved(false);
                  props.setOwners(
                    groupsList.filter((group: any) =>
                      selection.includes(String(group.id))
                    )
                  );
                }
              }}
              value={props.owners.map((group) => String(group.id))}
              optionLabelProp="label"
              filterOption={(input: string, option: any) =>
                option.props.label.props.children &&
                !!option.props.label.props.children
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              getPopupContainer={getContainer}
            >
              {groupsList?.map((group: any) => (
                <Select.Option
                  value={String(group.id)}
                  label={<GroupLabel>{group.name}</GroupLabel>}
                  key={group.name}
                >
                  <OptionWrapper>
                    <OptionTitle>{group.name}</OptionTitle>
                    <OptionDescription>
                      {group.capabilities &&
                        getReadableCapabilities(group.capabilities).map(
                          (cap: string) => (
                            <Tag style={{ margin: '5px' }}>{cap}</Tag>
                          )
                        )}
                    </OptionDescription>
                  </OptionWrapper>
                </Select.Option>
              ))}
            </Select>
          )}
        </div>
      )}
      <Collapse
        bordered={false}
        style={{
          padding: '0px',
          marginLeft: '-16px',
          background: 'transparent',
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
