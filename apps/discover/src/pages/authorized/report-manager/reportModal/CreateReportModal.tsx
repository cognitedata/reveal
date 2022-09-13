import { useState } from 'react';

import {
  Modal,
  Input,
  Textarea,
  Select,
  OptionType,
  Flex,
} from '@cognite/cogs.js';

type ReportFormValues = {
  dataSet?: OptionType<string>;
  issue?: OptionType<string>;
  description?: string;
};

type CreateReportModalProps = {
  source: string;
  sourceTitle: string;
  dataSetOptions: OptionType<string>[];
  issueOptions: OptionType<string>[];
  onCreateReport: (reportFormValues: ReportFormValues) => void;
  onCancel: () => void;
};

export const CreateReportModal = ({
  source,
  sourceTitle,
  dataSetOptions,
  issueOptions,
  onCreateReport,
  onCancel,
}: CreateReportModalProps) => {
  const [formValues, setFormValues] = useState<ReportFormValues>({});

  const handleOk = () => onCreateReport?.(formValues);
  const handleClose = () => onCancel?.();
  return (
    <Modal
      visible
      title="Report new issue"
      appElement={document.getElementById('root')!}
      okText="Report"
      onOk={handleOk}
      onCancel={handleClose}
      closable={false}
    >
      <Flex direction="column" gap={16}>
        <Input disabled value={source} title={sourceTitle} />
        <Select
          label="Data set"
          options={dataSetOptions}
          inputId="dataSet"
          value={formValues.dataSet}
          onChange={(value: OptionType<string>) => {
            setFormValues((state) => ({ ...state, dataSet: value }));
          }}
        />
        <Select
          label="Issue"
          options={issueOptions}
          inputId="issue"
          value={formValues.issue}
          onChange={(value: OptionType<string>) => {
            setFormValues((state) => ({ ...state, issue: value }));
          }}
        />
        <Textarea
          title="Description"
          value={formValues.description}
          onChange={(event) => {
            console.log(event.target.value);
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
