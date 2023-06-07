/**
 * MonitoringFolderSelect story
 */
import { Meta, Story } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import MonitoringFolderSelect from './MonitoringFolderSelect';

type Props = React.ComponentProps<typeof MonitoringFolderSelect>;
const queryClient = new QueryClient();

export default {
  component: MonitoringFolderSelect,
  title: 'Components/MonitoringFolderSelect/MonitoringFolderSelect',
  decorators: [
    (story) => (
      <QueryClientProvider client={queryClient}>{story()}</QueryClientProvider>
    ),
  ],
} as Meta;

const Template: Story<Props> = (args) => {
  const { control } = useForm({
    mode: 'all',
    defaultValues: {
      name: '',
    },
  });
  return (
    <div style={{ width: '400px' }}>
      <MonitoringFolderSelect
        control={control}
        inputName={args.inputName}
        setValue={args.setValue}
      />
    </div>
  );
};

export const Basic = Template.bind({});

Basic.args = {
  inputName: 'name',
  setValue: () => {},
};
