import { useState } from 'react';

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
  feedbackType: OptionType<string>;
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
        <Input disabled value={sourceValue} title={sourceTitle} htmlSize={50} />
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
          options={feedbackTypeOptions}
          inputId="feedbackType"
          value={formValues.feedbackType}
          onChange={(value: OptionType<string>) => {
            setFormValues((state) => ({ ...state, feedbackType: value }));
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
