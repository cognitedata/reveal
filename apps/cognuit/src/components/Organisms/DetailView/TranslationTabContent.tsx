import React from 'react';
import { Col, Input, Row } from '@cognite/cogs.js';
import { format } from 'date-fns';
import { Section } from './elements';
import { UNIX_TIMESTAMP_FACTOR } from '../../../typings/interfaces';
import { getFormattedTimestampOrString } from '../../../pages/DataTransfers/utils';
import { TargetType } from './DetailView';
import Step from './Step';

const TranslationTabContent = ({ ...target }: TargetType) => (
  <Section>
    <>
      {target.revisionSteps && target.revisionSteps.length > 0 && (
        <Row className="all-steps-wrapper">
          <Col span={24}>
            <details open>
              <summary>Revision steps</summary>
              <div>
                {target.revisionSteps.map((step) => (
                  <Step {...step} />
                ))}
              </div>
            </details>
          </Col>
        </Row>
      )}
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
          <h3>CRS</h3>
          <Input
            type="text"
            value={target.crs || ''}
            readOnly
            variant="noBorder"
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
        <Col span={12}>
          <h3>Created time</h3>
          <Input
            type="text"
            value={
              target.createdTime
                ? format(
                    new Date(target.createdTime * UNIX_TIMESTAMP_FACTOR),
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
      {target.cdfMetadata && Object.keys(target.cdfMetadata).length > 0 && (
        <details>
          <summary>
            Metadata <span className="hide-on-open">(click to show)</span>
          </summary>
          <Row>
            {Object.keys(target.cdfMetadata).map((key) => (
              <Col span={12} key={`sourceMeta_${key}`}>
                <h3>{key}</h3>
                <Input
                  type="text"
                  value={target.cdfMetadata![key]}
                  variant="noBorder"
                  readOnly
                />
              </Col>
            ))}
          </Row>
        </details>
      )}
    </>
  </Section>
);

export default TranslationTabContent;
