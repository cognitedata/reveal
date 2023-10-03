import { ComponentProps } from 'react';
import Highlighter from 'react-highlight-words';

import styled from 'styled-components';

import { Skeleton } from 'antd';

import { Button, Checkbox, Colors, Icon, Tooltip } from '@cognite/cogs.js';

import { removeIllegalCharacters } from '../../utils/text';
import Sparkline from '../PlotlyChart/Sparkline/Sparkline';

type Props = {
  externalId: string;
  name: string;
  description: string | undefined;
  sparkline?: Pick<
    ComponentProps<typeof Sparkline>,
    'datapoints' | 'startDate' | 'endDate' | 'loading'
  >;
  highlight?: string;
  onCheckboxClick: () => void;
  checked: boolean;
  disabled?: boolean;
  checkboxTooltip?: string;
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
  disabled = false,
  checkboxTooltip = '',
  isExact = false,
  exactMatchlabel = 'Exact match on external id',
  loading,
}: Props) {
  return (
    <TSItem outline={isExact}>
      <Row>
        <div>
          <Tooltip content={checkboxTooltip} disabled={!checkboxTooltip}>
            <Checkbox
              onChange={(e) => {
                e.preventDefault();
                onCheckboxClick();
              }}
              name={externalId}
              checked={checked}
              disabled={disabled}
            />
          </Tooltip>
        </div>
        <ContentContainer fullWidth={false}>
          <ResourceContainer>
            <InfoContainer>
              <ResourceNameWrapper>
                <Icon type="Timeseries" css={{ minWidth: 14 }} />
                {loading ? (
                  <Skeleton.Button active block style={{ height: 16 }} />
                ) : (
                  <>
                    {highlight ? (
                      <Highlighter
                        highlightStyle={{
                          backgroundColor: Colors['decorative--yellow--400'],
                        }}
                        searchWords={removeIllegalCharacters(highlight).split(
                          ' '
                        )}
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
                          backgroundColor: Colors['decorative--yellow--400'],
                        }}
                        searchWords={removeIllegalCharacters(highlight).split(
                          ' '
                        )}
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
  && {
    ${({ outline }) =>
      outline && `border: 2px dashed ${Colors['decorative--green--200']};`};
  }
  :nth-child(odd) {
    background-color: var(--cogs-greyscale-grey2);
  }
  :nth-child(even) {
    background-color: #fff;
  }
`;

const ExactMatchLabel = styled(Button)`
  && {
    background-color: ${Colors['decorative--green--200']};
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
