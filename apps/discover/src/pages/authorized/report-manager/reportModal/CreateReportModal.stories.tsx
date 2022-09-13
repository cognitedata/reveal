import { CreateReportModal } from './CreateReportModal';

const story = {
  title: 'Create Report Modal',
  component: CreateReportModal,
};

const dataSetOptions = [
  { value: 'Data_set_1', label: 'Data set 1' },
  { value: 'Data_set_2', label: 'Data set 2' },
  { value: 'Data_set_3', label: 'Data set 3' },
];

const issueOptions = [
  { value: 'Issue_1', label: 'Issue 1' },
  { value: 'Issue_2', label: 'Issue 2' },
  { value: 'Issue_3', label: 'Issue 3' },
];

export const basic = () => {
  return (
    <div style={{ height: '600px' }}>
      <CreateReportModal
        source="Well no1"
        sourceTitle="Wellbore"
        dataSetOptions={dataSetOptions}
        issueOptions={issueOptions}
        onCancel={() => console.log('cancelled')}
        onCreateReport={() => console.log('reported created')}
      />
    </div>
  );
};

export default story;
