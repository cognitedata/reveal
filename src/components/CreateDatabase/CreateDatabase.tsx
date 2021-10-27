import React from 'react';

import { Col, Input, Row } from 'antd';

interface CreateDbProps {
  name: string;
  setName(value: string): void;
  createDatabase(): void;
}
const CreateDatabase = (props: CreateDbProps) => {
  return (
    <div>
      <Row>
        <Col span={6}> Unique name </Col>
        <Col span={16}>
          <Input
            aria-label="Searched database name"
            value={props.name}
            autoFocus
            onChange={(e) => props.setName(e.currentTarget.value)}
            placeholder="Please enter database name"
            onPressEnter={() => props.createDatabase()}
          />
        </Col>
      </Row>
    </div>
  );
};

export default CreateDatabase;
