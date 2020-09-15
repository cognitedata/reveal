import React, { useEffect } from 'react';
import { Icon, Input, Colors } from '@cognite/cogs.js';
import { format } from 'date-fns';
import { getRevisionDateOrString } from '../../../pages/DataTransfers/utils';
import {
  Container,
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
    revision?: number;
    revisionSteps?: StepType[];
  };
  targets: {
    name?: string;
    owId?: string;
    crs?: string;
    dataType?: string;
    openWorksId?: string;
    createdTime?: number;
    repository?: string;
    configTag?: string;
    revision?: number;
    revisionSteps?: StepType[];
    interpreter?: string;
  }[];
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

  const { isLoading, source, targets } = data || {};

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
                {format(new Date(step.created_time * 1000), 'Pp')}
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
    <Container expanded={data !== null}>
      <Header>
        <h2>Detail View</h2>
        <CloseIcon type="LargeClose" onClick={onClose} />
      </Header>
      {isLoading && <p>LOADING!</p>}
      {source && targets && (
        <Content>
          <Section>
            <details open>
              <summary>Source</summary>
              <div>
                <h3>Name</h3>
                <Input
                  type="text"
                  value={source.name || ''}
                  variant="noBorder"
                  readOnly
                />
                <h3>External Id</h3>
                <Input
                  type="text"
                  value={source.externalId || ''}
                  variant="noBorder"
                  readOnly
                />
                <h3>CRS</h3>
                <TextArea value={source.crs || ''} readOnly rows={5} />
                <h3>Data type</h3>
                <Input
                  type="text"
                  value={source.dataType || ''}
                  variant="noBorder"
                  readOnly
                />
                <h3>Created time</h3>
                <Input
                  type="text"
                  value={
                    source.createdTime
                      ? format(new Date(source.createdTime * 1000), 'Pp')
                      : ''
                  }
                  variant="noBorder"
                  readOnly
                />
                <h3>Repository / Project</h3>
                <Input
                  type="text"
                  value={source.repository || ''}
                  variant="noBorder"
                  readOnly
                />
                <h3>Business project tag</h3>
                <Input
                  type="text"
                  value={source.businessTag || ''}
                  variant="noBorder"
                  readOnly
                />
                <h3>Revision</h3>
                <Input
                  type="text"
                  value={
                    source.revision
                      ? getRevisionDateOrString(source.revision)
                      : ''
                  }
                  variant="noBorder"
                  readOnly
                />
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
            {targets &&
              targets.length > 0 &&
              targets.map((item, index) => (
                <details open key={`${item.name}-${item.createdTime}`}>
                  <summary>
                    Translation{targets.length > 1 && ` – ${index + 1}`}
                  </summary>
                  {item.revisionSteps &&
                    item.revisionSteps.length > 0 &&
                    item.revisionSteps.map((step) => renderStep(step))}
                  <div>
                    <h3>Name</h3>
                    <Input
                      type="text"
                      value={item.name || ''}
                      variant="noBorder"
                      readOnly
                    />
                    <h3>Openworks Id</h3>
                    <Input
                      type="text"
                      value={item.openWorksId || ''}
                      variant="noBorder"
                      readOnly
                    />
                    <h3>CRS</h3>
                    <TextArea value={item.crs || ''} readOnly rows={5} />
                    <h3>Data type</h3>
                    <Input
                      type="text"
                      value={item.dataType || ''}
                      variant="noBorder"
                      readOnly
                    />
                    <h3>Created time</h3>
                    <Input
                      type="text"
                      value={
                        item.createdTime
                          ? format(new Date(item.createdTime * 1000), 'Pp')
                          : ''
                      }
                      variant="noBorder"
                      readOnly
                    />
                    <h3>Repository / Project</h3>
                    <Input
                      type="text"
                      value={item.repository || ''}
                      variant="noBorder"
                      readOnly
                    />
                    <h3>Configuration Tag</h3>
                    <Input
                      type="text"
                      value={item.configTag || ''}
                      variant="noBorder"
                      readOnly
                    />
                    <h3>Revision</h3>
                    <Input
                      type="text"
                      value={
                        item.revision
                          ? format(new Date(item.revision * 1000), 'Pp')
                          : ''
                      }
                      variant="noBorder"
                      readOnly
                    />
                    <h3>Interpreter</h3>
                    <Input
                      type="text"
                      value={item.interpreter || ''}
                      variant="noBorder"
                      readOnly
                    />
                  </div>
                </details>
              ))}
          </Section>
        </Content>
      )}
    </Container>
  );
};

export default DetailView;
