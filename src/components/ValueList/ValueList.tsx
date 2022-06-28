import { Flex } from '@cognite/cogs.js';
import { Col, List, Row, Skeleton } from 'antd';
import CopyButton from 'components/CopyButton/CopyButton';
import { ComponentProps } from 'react';

type Props = {
  list: {
    label: string;
    value: number | string | undefined;
    link?: string;
    copyable?: boolean;
  }[];
  loading: boolean;
  copyButtonStyles?: ComponentProps<typeof CopyButton>['style'];
  emptyLabel?: string;
};

const ValueList = ({
  list,
  loading,
  copyButtonStyles = {
    padding: '0 10px',
    margin: 0,
    height: 18,
  },
  emptyLabel = '-',
}: Props) => {
  return (
    <List
      dataSource={list}
      size="small"
      renderItem={({ label, value, link, copyable }) => {
        const display = value || emptyLabel;
        return (
          <Row className="ant-list-item">
            <Col span={10}>{label}</Col>
            <Col span={14} style={{ textAlign: 'right' }}>
              {loading ? (
                <Skeleton.Button
                  active
                  block
                  size="small"
                  style={{ height: 22 }}
                />
              ) : (
                <Flex>
                  <div
                    title={String(display)}
                    style={{
                      flexGrow: 1,
                      overflow: 'clip',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      minWidth: 0,
                    }}
                  >
                    {link ? <a href={link}>{display}</a> : display}
                  </div>
                  {copyable && display !== emptyLabel && (
                    <CopyButton
                      value={String(value)}
                      style={copyButtonStyles}
                    />
                  )}
                </Flex>
              )}
            </Col>
          </Row>
        );
      }}
    />
  );
};

export default ValueList;
