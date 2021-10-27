import React from 'react';
import Input from 'antd/lib/input';
import Col from 'antd/lib/col';
import Row from 'antd/lib/row';

interface CreateProps {
  name: string;
  setName(value: string): void;
  createTable(): void;
}
const CreateTable = (props: CreateProps) => {
  return (
    <Row>
      <Col span={6}> Unique name </Col>
      <Col span={18}>
        <Input
          aria-label="Table name"
          autoFocus
          value={props.name}
          onChange={(e) => props.setName(e.currentTarget.value)}
          placeholder="Please enter table name"
          onPressEnter={() => props.createTable()}
        />
      </Col>
    </Row>
  );
};

export default CreateTable;
