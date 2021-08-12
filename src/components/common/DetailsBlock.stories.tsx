import { Meta, Story } from '@storybook/react';
import { Col, List, Row } from 'antd';
import DetailsBlock, { DetailsBlockProps } from './DetailsBlock';

export default {
  component: DetailsBlock,
  title: 'Components/Common/DetailsBlock',
} as Meta;

const Template: Story<DetailsBlockProps> = (args) => <DetailsBlock {...args} />;

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
