import styled from 'styled-components';
import { Checkbox, Icon } from '@cognite/cogs.js';
import Sparkline from 'components/PlotlyChart/Sparkline/Sparkline';
import { Skeleton } from 'antd';

export default function LoadingTimeSeriesResultItem() {
  return (
    <TSItem>
      <Row>
        <div>
          <Checkbox name="loading" disabled />
        </div>
        <ContentContainer fullWidth={false}>
          <ResourceContainer>
            <InfoContainer>
              <ResourceNameWrapper>
                <Icon type="Timeseries" style={{ minWidth: 14 }} />
                <Skeleton.Button active block style={{ height: 16 }} />
              </ResourceNameWrapper>
              <Description>
                <Skeleton.Button active block style={{ height: 15 }} />
              </Description>
            </InfoContainer>
          </ResourceContainer>
          <Sparkline
            loading
            height={56}
            width={160}
            datapoints={[]}
            startDate={new Date()}
            endDate={new Date()}
          />
        </ContentContainer>
      </Row>
    </TSItem>
  );
}

const TSItem = styled.li`
  border-radius: 5px;
  padding: 0 5px;
  :nth-child(odd) {
    background-color: var(--cogs-greyscale-grey2);
  }
  :nth-child(even) {
    background-color: #fff;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  word-break: break-word;
`;

const ResourceNameWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: top;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
`;

const Description = styled.span`
  flex-grow: 1;
  margin-left: 16px;
  font-size: 10px;
`;

const ContentContainer = styled.div<{ fullWidth: boolean }>`
  flex-grow: 1;
  display: flex;
  justify-content: space-between;
  flex-wrap: ${(props) => (props.fullWidth ? 'wrap' : 'no-wrap')};
  padding-top: 5px;
  padding-bottom: 5px;
`;

const ResourceContainer = styled.div`
  display: flex;
  align-items: center;
`;
