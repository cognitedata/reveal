import { Report } from 'domain/reportManager/internal/types';

import { useState } from 'react';

import styled from 'styled-components/macro';

import {
  Modal,
  Input,
  Textarea,
  Select,
  OptionType,
  Flex,
} from '@cognite/cogs.js';

export type ReportFormValues = {
  dataSet: OptionType<string>;
  feedbackType: OptionType<Report['reason']>;
  description: string;
};

type CreateReportModalProps = {
  visible: boolean;
  sourceValue: string;
  sourceTitle: string;
  dataSetOptions: OptionType<string>[];
  feedbackTypeOptions: OptionType<string>[];
  onCreateReport: (reportFormValues: ReportFormValues) => void;
  onCancel: () => void;
};

export const StyledTextarea = styled(Textarea)`
  display: flex;
  flex-direction: column;
  & textarea {
    min-height: 150px;
  }
`;

export const CreateReportModal = ({
  visible,
  sourceValue,
  sourceTitle,
  dataSetOptions,
  feedbackTypeOptions,
  onCreateReport,
  onCancel,
}: CreateReportModalProps) => {
  const [formValues, setFormValues] = useState<Partial<ReportFormValues>>({});

  // eslint-disable-next-line
  // @ts-ignore state starts with unfilled values values
  const handleOk = () => onCreateReport(formValues);

  return (
    <Modal
      visible={visible}
      title="Report new issue"
      appElement={document.getElementById('root')!}
      okText="Report"
      onOk={handleOk}
      onCancel={onCancel}
      closable={false}
    >
      <Flex direction="column" gap={16}>
        <Input
          disabled
          value={sourceValue}
          title={sourceTitle}
          htmlSize={50}
          required
        />
        <Select
          required
          label="Data set"
          options={dataSetOptions}
          inputId="dataSet"
          value={formValues.dataSet}
          onChange={(value: ReportFormValues['dataSet']) => {
            setFormValues((state) => ({ ...state, dataSet: value }));
          }}
        />
        <Select
          required
          label="Issue"
          options={feedbackTypeOptions}
          inputId="feedbackType"
          value={formValues.feedbackType}
          onChange={(value: ReportFormValues['feedbackType']) => {
            setFormValues((state) => ({ ...state, feedbackType: value }));
          }}
        />
        <StyledTextarea
          title="Description"
          value={formValues.description}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setFormValues((state) => ({
              ...state,
              description: event.target.value,
            }));
          }}
        />
      </Flex>
    </Modal>
  );
};
