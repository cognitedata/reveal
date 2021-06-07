import React from 'react';
import { Col, Input, Row } from '@cognite/cogs.js';
import { format } from 'date-fns';
import { UNIX_TIMESTAMP_FACTOR } from '../../../typings/interfaces';
import { getFormattedTimestampOrString } from '../../../pages/DataTransfers/utils';
import { Section } from './elements';
import { SourceType } from './DetailView';
import Step from './Step';

const SourceTabContent = ({ ...source }: SourceType) => (
  <>
    <Section>
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
          <Input
            type="text"
            value={source.crs || ''}
            readOnly
            variant="noBorder"
          />
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
                    new Date(source.createdTime * UNIX_TIMESTAMP_FACTOR),
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
      {source.cdfMetadata && Object.keys(source.cdfMetadata).length > 0 && (
        <details>
          <summary>
            Metadata <span className="hide-on-open">(click to show)</span>
          </summary>
          <Row>
            {Object.keys(source.cdfMetadata).map((key) => (
              <Col span={12} key={`sourceMeta_${key}`}>
                <h3>{key}</h3>
                <Input
                  type="text"
                  value={source.cdfMetadata![key]}
                  variant="noBorder"
                  readOnly
                />
              </Col>
            ))}
          </Row>
        </details>
      )}
    </Section>
    <Section>
      <details open>
        <summary>Upload to CDF</summary>
        {source.revisionSteps &&
          source.revisionSteps.length > 0 &&
          source.revisionSteps.map((step) => <Step {...step} />)}
      </details>
    </Section>
  </>
);

export default SourceTabContent;
