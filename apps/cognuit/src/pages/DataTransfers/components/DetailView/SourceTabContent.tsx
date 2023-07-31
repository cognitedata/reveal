import { Col, Input, Row } from '@cognite/cogs.js';
import { formatDate } from 'utils/date';

import { Section } from './elements';
import Step from './Step';
import { SourceType } from './types';

const SourceTabContent = ({ ...source }: SourceType) => (
  <>
    <Section>
      <Row className="all-steps-wrapper">
        <Col span={24}>
          <details open>
            <summary>Steps: Source system to Cognuit </summary>
            <div>
              {source.revisionSteps &&
                source.revisionSteps.length > 0 &&
                source.revisionSteps.map((step) => (
                  <Step key={`${step.status}-${step.created_time}`} {...step} />
                ))}
            </div>
          </details>
        </Col>
      </Row>
    </Section>
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
          <h3>Data type</h3>
          <Input
            type="text"
            value={source.dataType || ''}
            variant="noBorder"
            readOnly
          />
        </Col>
        <Col span={12}>
          <h3>External Id</h3>
          <Input
            type="text"
            value={source.externalId || ''}
            variant="noBorder"
            readOnly
          />
        </Col>
      </Row>

      <Row>
        <Col span={12}>
          <h3>Repository</h3>
          <Input
            type="text"
            value={source.project?.external_id || ''}
            variant="noBorder"
            readOnly
          />
        </Col>
        <Col span={12}>
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
          <h3>Grouping</h3>
          <Input
            type="text"
            value={source.grouping || ''}
            variant="noBorder"
            readOnly
          />
        </Col>
        <Col span={12}>
          <h3>Author</h3>
          <Input
            type="text"
            value={source.author || ''}
            variant="noBorder"
            readOnly
          />
        </Col>
      </Row>

      <Row>
        <Col span={12}>
          <h3>Business project tag</h3>
          <Input
            type="text"
            value={source.businessTags || ''}
            variant="noBorder"
            readOnly
          />
        </Col>
        <Col span={12}>
          <h3>Data status tag</h3>
          <Input
            type="text"
            value={source.statusTags || ''}
            variant="noBorder"
            readOnly
          />
        </Col>
      </Row>

      <Row>
        <Col span={12}>
          <h3>Cognuit ID</h3>
          <Input
            type="text"
            value={source.id || ''}
            variant="noBorder"
            readOnly
          />
        </Col>
        <Col span={12}>
          <h3>Cognuit revision</h3>
          <Input
            type="text"
            value={source.revision || ''}
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
            value={source.createdTime ? formatDate(source.createdTime) : ''}
            variant="noBorder"
            readOnly
          />
        </Col>
        <Col span={12}>
          <h3>Last updated</h3>
          <Input
            type="text"
            value={source.lastUpdated ? formatDate(source.lastUpdated) : ''}
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
  </>
);

export default SourceTabContent;
