import { Meta, Story } from '@storybook/react';
import { Col, List, Row } from 'antd';
import { ComponentProps } from 'react';
import DetailsBlock from './DetailsBlock';

export default {
  component: DetailsBlock,
  title: 'Components/Details Sidebar/DetailsBlock',
} as Meta;

const Template: Story<ComponentProps<typeof DetailsBlock>> = (args) => (
  <div style={{ maxWidth: '25rem' }}>
    <DetailsBlock {...args} />
  </div>
);

export const EmptyBlock = Template.bind({});

EmptyBlock.args = {
  title: 'Values',
};

export const WithList = Template.bind({});

WithList.args = {
  title: 'Values',
  children: (
    <List
      dataSource={[
        { label: 'Min', value: '1' },
        { label: 'Max', value: '2' },
        { label: 'Mean', value: '4' },
        { label: 'Avg', value: '3' },
        { label: 'Last', value: '3' },
      ]}
      size="small"
      renderItem={({ label, value }) => (
        <Row className="ant-list-item">
          <Col span={4}>{label}</Col>
          <Col span={20} style={{ textAlign: 'right' }}>
            {value}
          </Col>
        </Row>
      )}
    />
  ),
};
