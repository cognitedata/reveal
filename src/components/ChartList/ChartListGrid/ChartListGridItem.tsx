import styled from 'styled-components';
import {
  A,
  Detail,
  Flex,
  formatDate,
  formatDateTime,
  Title,
  Tooltip,
} from '@cognite/cogs.js';
import { MouseEvent, useContext } from 'react';
import { Skeleton } from 'antd';
import { Chart } from 'models/chart/types';
import { RenderWhenOnScreen } from 'components/RenderWhenOnScreen/RenderWhenOnScreen';
import ChartListDropdown from '../ChartListDropdown/ChartListDropdown';
import formatOwner from '../formatOwner';
import { ChartListContext } from '../context';

interface Props {
  chart: Chart;
  name: string;
  updatedAt: string;
  owner: string;
  onClick: (e: MouseEvent<HTMLAnchorElement>) => void;
  readOnly?: boolean;
  onDuplicateClick: () => void;
  onDeleteClick: () => void;
  translations?: typeof ChartListDropdown.defaultTranslations;
}

const ChartListGridItem = ({
  name,
  chart,
  updatedAt,
  owner,
  onClick,
  onDuplicateClick,
  onDeleteClick,
  readOnly,
  translations,
}: Props) => {
  /**
   * Use context to enable dependency injection / mocking (containers, hooks, etc..)
   */
  const { PreviewPlotContainer } = useContext(ChartListContext);

  return (
    <Wrapper className="z-4">
      <A onClick={onClick}>
        <ImageWrapper>
          <ImageContent>
            <RenderWhenOnScreen
              containerStyles={{
                height: 200,
                border: '1px solid var(--cogs-greyscale-grey2)',
              }}
              loaderComponent={
                <Skeleton.Image style={{ height: 200, width: 286 }} />
              }
            >
              <PreviewPlotContainer chart={chart} />
            </RenderWhenOnScreen>
          </ImageContent>
        </ImageWrapper>
      </A>
      <Flex style={{ marginTop: 16 }}>
        <div style={{ flexGrow: 1 }}>
          <A onClick={onClick}>
            <Detail
              strong
              style={{
                textTransform: 'uppercase',
                width: 248,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              <Tooltip content={formatDateTime(new Date(updatedAt).getTime())}>
                <>{formatDate(new Date(updatedAt).getTime(), true)}</>
              </Tooltip>{' '}
              &middot; {formatOwner(owner)}
            </Detail>
            <Tooltip content={name}>
              <Title
                level={4}
                style={{
                  width: 248,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
              >
                {name}
              </Title>
            </Tooltip>
          </A>
        </div>
        <ChartListDropdown
          name={name}
          readOnly={readOnly}
          onDuplicateClick={onDuplicateClick}
          onDeleteClick={onDeleteClick}
          translations={translations}
        />
      </Flex>
    </Wrapper>
  );
};

ChartListGridItem.Loading = () => (
  <Wrapper className="z-4">
    <ImageWrapper>
      <Skeleton.Image style={{ width: 286, height: 200 }} />
    </ImageWrapper>
    <Skeleton.Button block active style={{ height: 46, marginTop: 16 }} />
  </Wrapper>
);

const Wrapper = styled.div`
  width: 320px;
  margin: 0;
  padding: 16px;
  border: none;
  border-radius: 4px;
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  flex-grow: 0;
  border: 1px solid #dedede;
`;

const ImageContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export default ChartListGridItem;
