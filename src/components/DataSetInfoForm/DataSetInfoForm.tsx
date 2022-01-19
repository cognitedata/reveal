import React, { ReactNode } from 'react';
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
import { getReadableCapabilities, getContainer } from 'utils/utils';
import InfoTooltip from 'components/InfoTooltip';
import Collapse from 'antd/lib/collapse';
import { useCdfGroups, useLabelSuggestions } from 'actions';
import Alert from 'antd/lib/alert';

import { NAME_MAX_LENGTH, DESC_MAX_LENGTH } from 'utils/constants';

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
  const { groups: groupsList, isLoading, error } = useCdfGroups();
  const { labels: labelSuggestions } = useLabelSuggestions();

  const nameTooLongError =
    (props.dataSetName?.length ?? 0) > NAME_MAX_LENGTH
      ? `Name cannot exceed ${NAME_MAX_LENGTH} characters`
      : false;
  const descTooLongError =
    (props.dataSetDescription?.length ?? 0) > DESC_MAX_LENGTH
      ? `Description cannot exceed ${DESC_MAX_LENGTH} characters`
      : false;

  return (
    <Col span={24}>
      <SectionTitle>Basic information</SectionTitle>
      <TitleOrnament />
      <RequiredFieldLabel>Name</RequiredFieldLabel>
      <InputField
        value={props.dataSetName}
        onChange={(e) => {
          props.setDataSetName(e.currentTarget.value);
          if (e.currentTarget.value) {
            props.setChangesSaved(false);
          }
        }}
        type="text"
        placeholder="Name"
        error={nameTooLongError}
      />

      <RequiredFieldLabel>Description</RequiredFieldLabel>
      <InputField
        style={{ height: ' 60px' }}
        value={props.dataSetDescription}
        onChange={(e: { currentTarget: { value: string } }) => {
          props.setDataSetDescription(e.currentTarget.value);
          if (e.currentTarget.value) {
            props.setChangesSaved(false);
          }
        }}
        placeholder="Description"
        size="large"
        error={descTooLongError}
      />

      <FieldLabel>Labels</FieldLabel>
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
        notFoundContent="Enter labels to add to your data set"
        placeholder="Labels"
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
          title="Write-protected"
          tooltipText="Only members of groups that you explicitly grant access, can write
      data to a write-protected data set."
          showIcon
          url="https://docs.cognite.com/cdf/data_governance/concepts/datasets/#write-protection"
          urlTitle="Learn more in our docs."
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
          <FieldLabel>
            Owners (only owners can write data to a write-protected data set)
          </FieldLabel>
          {error ? (
            <Alert
              type="error"
              message="Failed to fetch CDF groups. Please try again"
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
          header="Advanced options"
          key="1"
        >
          <FieldLabel>External ID</FieldLabel>
          <InputField
            value={props.externalId}
            onChange={(e) => {
              props.setExternalId(e.currentTarget.value);
              if (e.currentTarget.value) {
                props.setChangesSaved(false);
              }
            }}
            type="text"
            placeholder="External ID"
          />
        </Panel>
      </Collapse>
    </Col>
  );
};

export default DataSetInfoForm;
