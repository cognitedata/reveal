import { Col, Input, Row } from '@cognite/cogs.js';
import { formatDate } from 'utils/date';

import { Section } from './elements';
import Step from './Step';
import { TargetType } from './types';

const TranslationTabContent = ({ ...target }: TargetType) => (
  <Section>
    <>
      {target.revisionSteps && target.revisionSteps.length > 0 && (
        <Row className="all-steps-wrapper">
          <Col span={24}>
            <details open>
              <summary>Steps: Cognuit to target system </summary>
              <div>
                {target.revisionSteps.map((step) => (
                  <Step key={`${step.created_time}+${step.status}`} {...step} />
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
          <h3>Data type</h3>
          <Input
            type="text"
            value={target.dataType || ''}
            variant="noBorder"
            readOnly
          />
        </Col>
        <Col span={12}>
          <h3>External ID</h3>
          <Input
            type="text"
            value={target.externalId || ''}
            variant="noBorder"
            readOnly
          />
        </Col>
      </Row>

      <Row>
        <Col span={12}>
          <h3>Project</h3>
          <Input
            type="text"
            value={target.project?.external_id || ''}
            variant="noBorder"
            readOnly
          />
        </Col>
        <Col span={12}>
          <h3>CRS</h3>
          <Input
            type="text"
            value={target.crs || ''}
            readOnly
            variant="noBorder"
          />
        </Col>
      </Row>

      <Row>
        <Col span={12}>
          <h3>Cognuit ID</h3>
          <Input
            type="text"
            value={target.id || ''}
            variant="noBorder"
            readOnly
          />
        </Col>
        <Col span={12}>
          <h3>Cognuit revision</h3>
          <Input
            type="text"
            value={target.revision || ''}
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
            value={target.createdTime ? formatDate(target.createdTime) : ''}
            variant="noBorder"
            readOnly
          />
        </Col>
        <Col span={12}>
          <h3>Last updated</h3>
          <Input
            type="text"
            value={target.lastUpdated ? formatDate(target.lastUpdated) : ''}
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
