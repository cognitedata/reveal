import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import styled from 'styled-components';

import {
  EDITOR_TITLE_HEIGHT,
  LAYOUT_MINIMIZED_SECTION_SIZE,
  LAYOUT_MIN_SECTION_SIZE_HORIZONTAL,
  LAYOUT_MIN_SECTION_SIZE_VERTICAL,
  useTranslation,
} from '@transformations/common';
import EditorSection from '@transformations/components/editor-section';
import InspectSection from '@transformations/components/inspect-section';
import MinimizedLayoutSection from '@transformations/components/minimized-layout-section';
import ScheduleConfirmationModal from '@transformations/components/schedule-confirmation-modal';
import ScheduleModal from '@transformations/components/schedule-modal/ScheduleModal';
import { isMappingMode } from '@transformations/components/source-mapping/utils';
import TransformationBanner from '@transformations/components/transformation-banner/TransformationBanner';
import TransformationTopBar from '@transformations/components/transformation-details-topbar/TransformationDetailsTopBar';
import { useTransformationContext } from '@transformations/pages/transformation-details/TransformationContext';
import { TransformationRead } from '@transformations/types';
import {
  DETAILS_BANNER_HEIGHT,
  createInternalLink,
  shouldDisableUpdatesOnTransformation,
} from '@transformations/utils';
import { useCdfUserHistoryService } from '@user-history';
import { Allotment } from 'allotment';

import { Colors } from '@cognite/cogs.js';

type TransformationDetailsContentProps = {
  transformation: TransformationRead;
};

const TransformationDetailsContent = ({
  transformation,
}: TransformationDetailsContentProps): JSX.Element => {
  const { t } = useTranslation();

  const { subAppPath } = useParams<{ subAppPath?: string }>();
  const userHistoryService = useCdfUserHistoryService();

  const { pageDirection, pageLayout, setPageLayout } =
    useTransformationContext();

  const mappingEnabled = isMappingMode(transformation?.query);

  const sectionMinSize =
    pageDirection === 'horizontal'
      ? LAYOUT_MIN_SECTION_SIZE_HORIZONTAL
      : LAYOUT_MIN_SECTION_SIZE_VERTICAL;

  const handleChange = (sizes: number[]): void => {
    if (sizes[0] === 0) {
      setPageLayout('inspect-only');
    } else if (sizes[1] === 0) {
      setPageLayout('editor-only');
    } else if (
      (sizes[0] > 0 && pageLayout === 'inspect-only') ||
      (sizes[1] > 0 && pageLayout === 'editor-only')
    ) {
      setPageLayout('both');
    }
  };

  const handleExpandSection = (): void => {
    setPageLayout('both');
  };

  useEffect(() => {
    if (subAppPath && transformation?.id && transformation?.name)
      userHistoryService.logNewResourceView({
        application: subAppPath,
        name: transformation.name,
        path: createInternalLink(transformation.id),
      });
  }, [subAppPath, transformation, userHistoryService]);

  return (
    <StyledContainer>
      <Allotment vertical proportionalLayout={false}>
        <Allotment.Pane key="topbar" minSize={56} maxSize={56}>
          <TransformationTopBar transformation={transformation} />
        </Allotment.Pane>
        <Allotment.Pane key="details">
          <Allotment vertical separator={false}>
            <Allotment.Pane
              key="banner"
              minSize={DETAILS_BANNER_HEIGHT}
              maxSize={DETAILS_BANNER_HEIGHT}
              visible={
                shouldDisableUpdatesOnTransformation(transformation) ||
                !!transformation.blocked
              }
            >
              <TransformationBanner transformation={transformation} />
            </Allotment.Pane>
            <Allotment.Pane>
              <Allotment
                key={`${pageLayout}-${pageDirection}-outer-wrapper`}
                separator={false}
                vertical={pageDirection === 'vertical'}
              >
                <Allotment.Pane
                  minSize={LAYOUT_MINIMIZED_SECTION_SIZE}
                  maxSize={LAYOUT_MINIMIZED_SECTION_SIZE}
                  visible={pageLayout === 'inspect-only'}
                >
                  <MinimizedLayoutSection
                    isLeftAligned
                    onClick={handleExpandSection}
                    title={
                      mappingEnabled
                        ? t('details-editor-mapping-title')
                        : t('details-editor-title')
                    }
                  />
                </Allotment.Pane>
                <Allotment.Pane>
                  <Allotment
                    key={`${pageLayout}-${pageDirection}-inner-wrapper`}
                    separator={false}
                    vertical={pageDirection === 'vertical'}
                  >
                    <Allotment.Pane>
                      <StyledAllotment
                        key={`${pageLayout}-${pageDirection}-actual-content`}
                        onChange={handleChange}
                        vertical={pageDirection === 'vertical'}
                      >
                        <Allotment.Pane
                          key="editor"
                          minSize={sectionMinSize}
                          snap
                          visible={pageLayout !== 'inspect-only'}
                        >
                          <EditorSection transformation={transformation} />
                        </Allotment.Pane>
                        <Allotment.Pane
                          key="inspect"
                          minSize={sectionMinSize}
                          snap
                          visible={pageLayout !== 'editor-only'}
                        >
                          <InspectSection transformation={transformation} />
                        </Allotment.Pane>
                      </StyledAllotment>
                    </Allotment.Pane>
                    <Allotment.Pane
                      minSize={LAYOUT_MINIMIZED_SECTION_SIZE}
                      maxSize={LAYOUT_MINIMIZED_SECTION_SIZE}
                      visible={pageLayout === 'editor-only'}
                    >
                      <MinimizedLayoutSection
                        onClick={handleExpandSection}
                        title={t('inspect')}
                      />
                    </Allotment.Pane>
                  </Allotment>
                </Allotment.Pane>
              </Allotment>
            </Allotment.Pane>
          </Allotment>
        </Allotment.Pane>
      </Allotment>
      <ScheduleModal transformation={transformation} />
      <ScheduleConfirmationModal />
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  height: 100%;
  width: 100%;
  background-color: ${Colors['surface--strong']};
  min-width: ${LAYOUT_MIN_SECTION_SIZE_HORIZONTAL * 2}px;
  overflow-x: auto;

  --focus-border: ${Colors['border--interactive--hover']};
  --separator-border: ${Colors['border--muted']};
  --sash-size: 8px;
  --sash-hover-size: 2px;
`;

const StyledAllotment = styled(Allotment)`
  &.split-view-horizontal {
    .split-view-view-visible:not(:first-child)::before {
      height: 72px !important;
      margin: calc(50vh - 92px) 0;
      border-radius: 2px;
      width: 2px !important;
    }
  }
  .sash-vertical {
    height: 72px;
    margin: calc(50vh - 92px) 0;
    user-select: none;
  }

  &.split-view-vertical {
    .split-view-view-visible:not(:first-child)::before {
      width: 72px !important;
      margin: 0 calc(50vw - 36px);
      border-radius: 2px;
      height: 2px !important;
    }
  }
  .sash-horizontal {
    width: 72px;
    margin: 0 calc(50vw - 36px);
  }

  .sash-vertical,
  .sash-horizontal {
    ::before {
      border-radius: 3px;
      background-color: ${Colors['border--interactive--default']};
      transition: background-color 0.3s ease-in;
    }
  }

  .sash-vertical:hover,
  .sash-horizontal:hover {
    ::before {
      background-color: ${Colors['border--interactive--hover']};
    }
  }
`;

export const StyledSectionHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${Colors['border--status-undefined--muted']};
  display: flex;
  height: ${EDITOR_TITLE_HEIGHT}px;
  gap: 16px;
  justify-content: space-between;
  padding: 8px 12px;
`;

export default TransformationDetailsContent;
