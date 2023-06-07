/**
 * Data Profiling Metrics
 */
import { FunctionComponent } from 'react';
import styled from 'styled-components/macro';
import DetailsBlock from 'components/DetailsBlock/DetailsBlock';
import { Tooltip } from '@cognite/cogs.js';
import { List, Row, Col } from 'antd';

type Source = {
  label: string;
  value: string | number;
  tooltip: string;
};

type Props = {
  dataSource: Source[];
};

const PointerCursor = styled.span`
  cursor: pointer;
`;

const Metrics: FunctionComponent<Props> = ({ dataSource }: Props) => {
  return (
    <DetailsBlock title="">
      <List
        dataSource={dataSource}
        size="small"
        renderItem={({ label, value, tooltip }) => (
          <Row className="ant-list-item">
            <Col span={14}>
              <Tooltip content={tooltip}>
                <PointerCursor>{label}</PointerCursor>
              </Tooltip>
            </Col>
            <Col span={10} style={{ textAlign: 'right' }}>
              {value}
            </Col>
          </Row>
        )}
      />
    </DetailsBlock>
  );
};

export default Metrics;
