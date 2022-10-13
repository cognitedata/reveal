import styled from 'styled-components';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Card from 'antd/lib/card';
import { Title, Flex } from '@cognite/cogs.js';
import { ContentView, Divider, DataSetV3 } from 'utils';
import BasicInfoCard from 'components/BasicInfoCard';
import { useTranslation } from 'common/i18n';

type DatasetOverviewProps = {
  dataset: DataSetV3;
};
const DatasetOverview = ({ dataset }: DatasetOverviewProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Row style={{ padding: 12 }}>
      <Col span={15}>
        <Row>
          <Col span={24}>
            <StyledCard>
              <StyledCardTitle level={5}>{t('description')}</StyledCardTitle>
              <Divider />
              <ContentView>{dataset?.description}</ContentView>
            </StyledCard>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <StyledCard>
              <Flex justifyContent="space-between" alignItems="center">
                <StyledCardTitle level={5}>{t('tab-overview')}</StyledCardTitle>
                {/* TODO: <Button
                            type="link"
                            disabled
                            onClick={() => {}}
                          >
                            {t('view')}
                          </Button> */}
              </Flex>
              <Divider />
              {/* <>TODO: Overview content</> */}
            </StyledCard>
          </Col>
          <Col span={12}>
            <StyledCard>
              <StyledCardTitle level={5}>
                {t('tab-access-control')}
              </StyledCardTitle>
              <Divider />
              {/* <>TODO: Access control content</> */}
            </StyledCard>
          </Col>
        </Row>
      </Col>
      <Col span={9}>
        <StyledCard>
          <StyledCardTitle level={5}>{t('summary')}</StyledCardTitle>
          <Divider />
          <BasicInfoCard dataSet={dataset} />
        </StyledCard>
      </Col>
    </Row>
  );
};

const StyledCard = styled(Card)`
  margin: 12px;
  min-height: 300px;
`;

const StyledCardTitle = styled(Title)`
  padding: 16px 24px;
`;

export default DatasetOverview;
