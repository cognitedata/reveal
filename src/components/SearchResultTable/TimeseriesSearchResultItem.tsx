import { ReactNode, useMemo } from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { Button, Colors, Icon } from '@cognite/cogs.js';
import { TimeseriesChart } from '@cognite/data-exploration';
import { Timeseries } from '@cognite/sdk';
import Highlighter from 'react-highlight-words';
import { removeIllegalCharacters } from 'utils/text';
import { useContainerQuery } from 'react-container-query';
import { makeDefaultTranslations } from 'utils/translations';
import { useTranslations } from 'hooks/translations';

const defaultTranslation = makeDefaultTranslations(
  'Exact match on external id'
);

export default function TimeseriesSearchResultItem({
  timeseries,
  query = '',
  renderCheckbox,
  dateRange,
  isExact,
}: {
  timeseries: Timeseries;
  query?: string;
  renderCheckbox: (timeseries: Timeseries) => ReactNode;
  dateRange?: [Date, Date];
  isExact?: boolean;
}) {
  const selectedDateRange = useMemo(
    () =>
      dateRange ?? [
        dayjs().subtract(1, 'years').startOf('day').toDate(),
        dayjs().endOf('day').toDate(),
      ],
    [dateRange]
  );

  const sizeQuery = useMemo(
    () => ({
      shouldBreakIntoRows: {
        maxWidth: 370,
      },
    }),
    []
  );

  const [params, containerRef] = useContainerQuery(sizeQuery, {
    height: 200,
    width: 300,
  });

  const { shouldBreakIntoRows } = params;
  const t = {
    ...defaultTranslation,
    ...useTranslations(Object.keys(defaultTranslation), 'SearchResults').t,
  };
  return (
    <TSItem ref={containerRef} outline={isExact}>
      <Row>
        <CheckboxContainer>{renderCheckbox(timeseries)}</CheckboxContainer>
        <ContentContainer fullWidth={shouldBreakIntoRows}>
          <ResourceContainer>
            <InfoContainer>
              <ResourceNameWrapper>
                <Icon type="Timeseries" style={{ minWidth: 14 }} />
                <Highlighter
                  highlightStyle={{
                    backgroundColor: Colors['yellow-4'].alpha(0.4),
                    marginLeft: 5,
                  }}
                  searchWords={[removeIllegalCharacters(query)]}
                  textToHighlight={timeseries.name ?? ''}
                />
              </ResourceNameWrapper>
              <Description>
                <Highlighter
                  highlightStyle={{
                    backgroundColor: Colors['yellow-4'].alpha(0.4),
                  }}
                  searchWords={[removeIllegalCharacters(query)]}
                  textToHighlight={timeseries.description ?? ''}
                />
              </Description>
              <div>
                {isExact && (
                  <ExactMatchLabel>
                    {t['Exact match on external id']}
                  </ExactMatchLabel>
                )}
              </div>
            </InfoContainer>
          </ResourceContainer>
          <SparklineContainer fullWidth={shouldBreakIntoRows}>
            <TimeseriesChart
              height={70}
              showSmallerTicks
              timeseriesId={timeseries.id}
              numberOfPoints={25}
              showAxis="horizontal"
              timeOptions={[]}
              showContextGraph={false}
              showPoints={false}
              enableTooltip={false}
              showGridLine="none"
              minRowTicks={2}
              dateRange={selectedDateRange}
            />
          </SparklineContainer>
        </ContentContainer>
      </Row>
    </TSItem>
  );
}

const TSItem = styled.li<{ outline?: boolean }>`
  border-radius: 5px;
  padding: 0 5px;
  &&& {
    ${(props) =>
      props.outline && `border: 2px dashed ${Colors['green-2'].alpha(0.6)};`}
  }
  :nth-child(odd) {
    background-color: var(--cogs-greyscale-grey2);
  }
  :nth-child(even) {
    background-color: #fff;
  }
`;

const ExactMatchLabel = styled(Button)`
  &&& {
    background-color: ${Colors['green-2'].alpha(0.3)};
    font-size: 10px;
    height: 20px;
    padding: 10px;
    margin-left: 12px;
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

const CheckboxContainer = styled.div``;

const ContentContainer = styled.div<{ fullWidth: boolean }>`
  flex-grow: 1;
  display: flex;
  justify-content: space-between;
  flex-wrap: ${(props) => (props.fullWidth ? 'wrap' : 'no-wrap')};
  padding-top: 5px;
  padding-bottom: 5px;
`;

const SparklineContainer = styled.div<{ fullWidth: boolean }>`
  ${(props) => (props.fullWidth ? 'flex-basis: 100%' : '')};
  ${(props) => (props.fullWidth ? 'flex-grow: 1' : '')};
  width: 170px;
  min-width: 170px;
  height: 56px;
  overflow: hidden;
`;

const ResourceContainer = styled.div`
  display: flex;
  align-items: center;
`;
