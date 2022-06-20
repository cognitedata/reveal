import styled from 'styled-components';
import { Button, Checkbox, Colors, Icon } from '@cognite/cogs.js';
import Highlighter from 'react-highlight-words';
import { removeIllegalCharacters } from 'utils/text';
import Sparkline from 'components/PlotlyChart/Sparkline/Sparkline';
import { ComponentProps, MouseEventHandler } from 'react';
import { Skeleton } from 'antd';

type Props = {
  externalId: string;
  name: string;
  description: string | undefined;
  sparkline?: Pick<
    ComponentProps<typeof Sparkline>,
    'datapoints' | 'startDate' | 'endDate' | 'loading'
  >;
  highlight?: string;
  onCheckboxClick: MouseEventHandler<HTMLLabelElement>;
  checked: boolean;
  isExact?: boolean;
  exactMatchlabel: string;
  loading: boolean;
};

export default function TimeSeriesResultItem({
  externalId,
  name,
  description,
  sparkline,
  highlight = '',
  onCheckboxClick,
  checked,
  isExact = false,
  exactMatchlabel = 'Exact match on external id',
  loading,
}: Props) {
  return (
    <TSItem outline={isExact}>
      <Row>
        <div>
          <Checkbox
            onClick={(e) => {
              e.preventDefault();
              onCheckboxClick(e);
            }}
            name={externalId}
            checked={checked}
          />
        </div>
        <ContentContainer fullWidth={false}>
          <ResourceContainer>
            <InfoContainer>
              <ResourceNameWrapper>
                <Icon type="Timeseries" style={{ minWidth: 14 }} />
                {loading ? (
                  <Skeleton.Button active block style={{ height: 16 }} />
                ) : (
                  <>
                    {highlight ? (
                      <Highlighter
                        highlightStyle={{
                          backgroundColor: Colors['yellow-4'].alpha(0.4),
                        }}
                        searchWords={[removeIllegalCharacters(highlight)]}
                        textToHighlight={name}
                      />
                    ) : (
                      name
                    )}
                  </>
                )}
              </ResourceNameWrapper>
              <Description>
                {loading ? (
                  <Skeleton.Button active block style={{ height: 15 }} />
                ) : (
                  <>
                    {highlight && description ? (
                      <Highlighter
                        highlightStyle={{
                          backgroundColor: Colors['yellow-4'].alpha(0.4),
                        }}
                        searchWords={[removeIllegalCharacters(highlight)]}
                        textToHighlight={description}
                      />
                    ) : (
                      description
                    )}
                  </>
                )}
              </Description>
              {isExact && (
                <div>
                  <ExactMatchLabel>{exactMatchlabel}</ExactMatchLabel>
                </div>
              )}
            </InfoContainer>
          </ResourceContainer>
          {sparkline && <Sparkline height={56} width={160} {...sparkline} />}
        </ContentContainer>
      </Row>
    </TSItem>
  );
}

const TSItem = styled.li<{ outline: boolean }>`
  border-radius: 5px;
  padding: 0 5px;
  &&& {
    ${({ outline }) =>
      outline && `border: 2px dashed ${Colors['green-2'].alpha(0.6)};`}
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
