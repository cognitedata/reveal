import React, { useEffect } from 'react';
import { Icon, Input, Colors, Modal, Row, Col } from '@cognite/cogs.js';
import { format } from 'date-fns';
import { UNIX_TIMESTAMP_FACTOR } from 'typings/interfaces';
import { getFormattedTimestampOrString } from '../../../pages/DataTransfers/utils';
import {
  Header,
  CloseIcon,
  Section,
  Content,
  TextArea,
  StepIconCircle,
  StepItem,
  StepText,
  StepTime,
} from './elements';

type Props = {
  onClose: () => void;
  data: DetailDataProps;
};

type StepType = {
  status: string;
  // eslint-disable-next-line camelcase
  error_message: string | null;
  // eslint-disable-next-line camelcase
  created_time: number;
};

export type DetailDataProps = {
  id: string | number;
  isLoading?: boolean;
  source: {
    name?: string;
    externalId?: string;
    crs?: string;
    dataType?: string;
    createdTime?: number;
    repository?: string;
    businessTag?: string;
    revision?: string | number | null;
    revisionSteps?: StepType[];
    interpreter?: string;
  };
  target: {
    name?: string;
    owId?: string;
    crs?: string;
    dataType?: string;
    openWorksId?: string;
    createdTime?: number;
    repository?: string;
    configTag?: string;
    revision?: string | number | null;
    revisionSteps?: StepType[];
  };
} | null;

const DetailView = ({ onClose, data }: Props) => {
  function upHandler(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.code === 'Escape') {
      onClose();
    }
  }

  useEffect(() => {
    window.addEventListener('keyup', upHandler);
    return () => {
      window.removeEventListener('keyup', upHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { isLoading, source, target } = data || {};

  const renderStep = (step: StepType) => {
    return (
      <StepItem key={`${step.status}-${step.created_time}`}>
        <StepIconCircle
          bgColor={
            step.error_message ? Colors.danger.hex() : Colors.success.hex()
          }
          txtColor={
            step.error_message ? Colors.danger.hex() : Colors.white.hex()
          }
        >
          <Icon
            type={step.error_message ? 'WarningFilled' : 'Check'}
            style={{ width: !step.error_message ? '65%' : 'auto' }}
          />
        </StepIconCircle>
        <StepText>
          {step.error_message ? (
            <span>
              {step.error_message}{' '}
              <StepTime>
                {format(
                  new Date(step.created_time * UNIX_TIMESTAMP_FACTOR),
                  'Pp'
                )}
              </StepTime>
            </span>
          ) : (
            <span>{step.status}</span>
          )}
        </StepText>
      </StepItem>
    );
  };

  return (
    <Modal
      visible={data !== null}
      okText="Close"
      cancelText=""
      onOk={onClose}
      width={768}
      closeIcon={<CloseIcon type="LargeClose" onClick={onClose} />}
    >
      <Header>
        <h2>Detail View</h2>
      </Header>
      {isLoading && <p>LOADING!</p>}
      {source && target && (
        <Content>
          <Section>
            <details open>
              <summary>Source</summary>
              <div>
                <Row>
                  <Col span={24}>
                    <h3>Name</h3>
                    <Input
                      type="text"
                      value={source.name || ''}
                      variant="noBorder"
                      readOnly
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <h3>External Id</h3>
                    <Input
                      type="text"
                      value={source.externalId || ''}
                      variant="noBorder"
                      readOnly
                    />
                  </Col>
                  <Col span={12}>
                    <h3>Data type</h3>
                    <Input
                      type="text"
                      value={source.dataType || ''}
                      variant="noBorder"
                      readOnly
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <h3>CRS</h3>
                    <TextArea value={source.crs || ''} readOnly rows={3} />
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <h3>Created time</h3>
                    <Input
                      type="text"
                      value={
                        source.createdTime
                          ? format(
                              new Date(
                                source.createdTime * UNIX_TIMESTAMP_FACTOR
                              ),
                              'Pp'
                            )
                          : ''
                      }
                      variant="noBorder"
                      readOnly
                    />
                  </Col>
                  <Col span={12}>
                    <h3>Repository / Project</h3>
                    <Input
                      type="text"
                      value={source.repository || ''}
                      variant="noBorder"
                      readOnly
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <h3>Business project tag</h3>
                    <Input
                      type="text"
                      value={source.businessTag || ''}
                      variant="noBorder"
                      readOnly
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <h3>Revision</h3>
                    <Input
                      type="text"
                      value={
                        source.revision
                          ? getFormattedTimestampOrString(source.revision)
                          : ''
                      }
                      variant="noBorder"
                      readOnly
                    />
                  </Col>
                  <Col span={12}>
                    <h3>Interpreter</h3>
                    <Input
                      type="text"
                      value={source.interpreter || ''}
                      variant="noBorder"
                      readOnly
                    />
                  </Col>
                </Row>
              </div>
              <hr />
            </details>
          </Section>
          <Section>
            <details open>
              <summary>Upload to CDF</summary>
              {source.revisionSteps &&
                source.revisionSteps.length > 0 &&
                source.revisionSteps.map((step) => renderStep(step))}
              <hr />
            </details>
          </Section>
          <Section>
            {target && (
              <details open key={`${target.name}-${target.createdTime}`}>
                <summary>Translation</summary>
                {target.revisionSteps &&
                  target.revisionSteps.length > 0 &&
                  target.revisionSteps.map((step) => renderStep(step))}
                <div>
                  <Row>
                    <Col span={24}>
                      <h3>Name</h3>
                      <Input
                        type="text"
                        value={target.name || ''}
                        variant="noBorder"
                        readOnly
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12}>
                      <h3>Openworks Id</h3>
                      <Input
                        type="text"
                        value={target.openWorksId || ''}
                        variant="noBorder"
                        readOnly
                      />
                    </Col>
                    <Col span={12}>
                      <h3>Data type</h3>
                      <Input
                        type="text"
                        value={target.dataType || ''}
                        variant="noBorder"
                        readOnly
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col span={24}>
                      <h3>CRS</h3>
                      <TextArea value={target.crs || ''} readOnly rows={3} />
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12}>
                      <h3>Created time</h3>
                      <Input
                        type="text"
                        value={
                          target.createdTime
                            ? format(
                                new Date(
                                  target.createdTime * UNIX_TIMESTAMP_FACTOR
                                ),
                                'Pp'
                              )
                            : ''
                        }
                        variant="noBorder"
                        readOnly
                      />
                    </Col>
                    <Col span={12}>
                      <h3>Repository / Project</h3>
                      <Input
                        type="text"
                        value={target.repository || ''}
                        variant="noBorder"
                        readOnly
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12}>
                      <h3>Configuration Tag</h3>
                      <Input
                        type="text"
                        value={target.configTag || ''}
                        variant="noBorder"
                        readOnly
                      />
                    </Col>
                    <Col span={12}>
                      <h3>Revision</h3>
                      <Input
                        type="text"
                        value={
                          target.revision
                            ? getFormattedTimestampOrString(target.revision)
                            : ''
                        }
                        variant="noBorder"
                        readOnly
                      />
                    </Col>
                  </Row>
                </div>
              </details>
            )}
          </Section>
        </Content>
      )}
    </Modal>
  );
};

export default DetailView;
