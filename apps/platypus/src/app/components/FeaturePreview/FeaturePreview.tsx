import React, { useMemo, useState } from 'react';

import styled from 'styled-components';

import {
  useFilterBuilderFeatureFlag,
  useUpdateFilterBuilderFeatureFlag,
  useColumnSelectionFeatureFlag,
  useUpdateColumnSelectionFeatureFlag,
  useManualPopulationFeatureFlag,
  useUpdateManualPopulationFeatureFlag,
  useSuggestionsFeatureFlag,
  useUpdateSuggestionsFeatureFlag,
  useGraphViewerFeatureFlag,
  useUpdateGraphViewerFeatureFlag,
  useGPTSearch,
  useUpdateGPTSearch,
  useGPTSearchForProject,
} from '@platypus-app/flags';
import { useMixpanel } from '@platypus-app/hooks/useMixpanel';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { Body, Flex, Icon, Modal, Switch } from '@cognite/cogs.js';

import COLUMNS_IMG from '../../../assets/images/columns.gif';
import FILTER_BUILDER_IMG from '../../../assets/images/filter_builder.gif';
import GPT_SEARCH_IMG from '../../../assets/images/gpt_search.gif';
import GRAPH_IMG from '../../../assets/images/graph.gif';
import MANUAL_POP_IMG from '../../../assets/images/manual_population.gif';
import SUGGESTIONS_IMG from '../../../assets/images/suggestions.gif';

type FeatureKey =
  | 'population'
  | 'suggestions'
  | 'columns'
  | 'filters'
  | 'graph'
  | 'gpt_search';

export const FeaturePreview = ({
  onRequestClose,
}: {
  onRequestClose: (hasChanged: boolean) => void;
}) => {
  const { track } = useMixpanel();
  const { t } = useTranslation('FeaturePreview');
  const [hasChanged, setHasChanged] = useState(false);
  const [selectedFeature, setFeature] = useState<FeatureKey>('population');

  const [featureStatus, setFeatureStatus] = useState<{
    [key in FeatureKey]: boolean;
  }>({
    population: useManualPopulationFeatureFlag().isEnabled,
    suggestions: useSuggestionsFeatureFlag().isEnabled,
    columns: useColumnSelectionFeatureFlag().isEnabled,
    filters: useFilterBuilderFeatureFlag().isEnabled,
    graph: useGraphViewerFeatureFlag().isEnabled,
    gpt_search: useGPTSearch().isEnabled,
  });

  const setManualPopulation = useUpdateManualPopulationFeatureFlag();
  const setSuggestions = useUpdateSuggestionsFeatureFlag();
  const setColumnSelection = useUpdateColumnSelectionFeatureFlag();
  const setFilterBuilder = useUpdateFilterBuilderFeatureFlag();
  const setGraphViewer = useUpdateGraphViewerFeatureFlag();
  const setGPTSearch = useUpdateGPTSearch();

  const updateStatusState = (key: FeatureKey, status: boolean) => {
    track('FeatureFlag.Toggle', { key, status });
    switch (key) {
      case 'population': {
        setManualPopulation(status);
        break;
      }
      case 'suggestions': {
        setSuggestions(status);
        break;
      }
      case 'columns': {
        setColumnSelection(status);
        break;
      }
      case 'filters': {
        setFilterBuilder(status);
        break;
      }
      case 'graph': {
        setGraphViewer(status);
        break;
      }
      case 'gpt_search': {
        setGPTSearch(status);
        break;
      }
    }
    setHasChanged(true);
    setFeatureStatus((currValue) => ({
      ...currValue,
      [key]: status,
    }));
  };
  const { isEnabled: isGPTSearchEnabledForProject } = useGPTSearchForProject();

  const features: { [key in FeatureKey]: string } = useMemo(
    () => ({
      population: t('feature_preview_population_header', 'Population'),
      suggestions: t('feature_preview_suggestions_header', 'Smart Suggestions'),
      columns: t('feature_preview_columns_header', 'Column Selection'),
      filters: t('feature_preview_filters_header', 'Advanced Filters'),
      graph: t('feature_preview_graph_header', 'Knowledge Graph'),
      gpt_search: t('feature_preview_gpt_search_header', 'Copilot Search'),
    }),
    [t]
  );
  const featuresDetails: { [key in FeatureKey]: React.ReactNode } = useMemo(
    () => ({
      population: (
        <>
          <img src={MANUAL_POP_IMG} alt="Manual population" />
          {t(
            'feature_preview_population',
            `Allows you to manually create new instances. As well you can edit and delete existing instances.

Note: Not yet supported for list values.`
          )
            .split('\n')
            .map((el, i) => (
              <Body level="2" key={i}>
                {el}
              </Body>
            ))}
        </>
      ),
      suggestions: (
        <>
          <img src={SUGGESTIONS_IMG} alt="Suggestions population" />
          {t(
            'feature_preview_suggestions',
            `Provides smart suggestions for direct relations based on field values of related instances.

Recommend to be enabled alongside Population feature.`
          )
            .split('\n')
            .map((el, i) => (
              <Body level="2" key={i}>
                {el}
              </Body>
            ))}
        </>
      ),
      columns: (
        <>
          <img src={COLUMNS_IMG} alt="Column selection" />
          {t(
            'feature_preview_columns_selection',
            `Provides a way for you to choose which columns are visible in the table.`
          )
            .split('\n')
            .map((el, i) => (
              <Body level="2" key={i}>
                {el}
              </Body>
            ))}
        </>
      ),
      filters: (
        <>
          <img src={FILTER_BUILDER_IMG} alt="Filter builder" />
          {t(
            'feature_preview_filter_builder',
            `Build advanced filters right at home in the UI, with all the complexities you need. No need to learn GraphQL to make complex queries.

Once you are happy with the result, use the "Copy to code" button to copy the GraphQL query and variables for filter to use in your solution.

Note: This disables the basic column level filter within the table in favor of the more robust filter builder.`
          )
            .split('\n')
            .map((el, i) => (
              <Body level="2" key={i}>
                {el}
              </Body>
            ))}
        </>
      ),
      graph: (
        <>
          <img src={GRAPH_IMG} alt="Graph" />
          {t(
            'feature_preview_graph_explorer',
            `A way for you to explore data focusing on the relationship it has.
Start from an instance and explore connected instances.`
          )
            .split('\n')
            .map((el, i) => (
              <Body level="2" key={i}>
                {el}
              </Body>
            ))}
        </>
      ),
      gpt_search: (
        <>
          <img src={GPT_SEARCH_IMG} alt="GPT demo" />
          {t(
            'feature_preview_gpt_search',
            'Leveraging AI, get the ability to ask a question around data within your data model, and visualize it in graph, tabular and JSON format.'
          )
            .split('\n')
            .map((el, i) => (
              <Body level="2" key={i}>
                {el}
              </Body>
            ))}
        </>
      ),
    }),
    [t]
  );
  return (
    <Modal
      showBorders
      visible
      title={t('feature-preview-header', 'Feature Preview')}
      onCancel={() => onRequestClose(hasChanged)}
      hideFooter
      size="large"
      hidePaddings
    >
      <Flex
        style={{
          height: 400,
          borderBottom: '1px solid var(--cogs-border--muted)',
        }}
        gap={6}
      >
        <Flex
          style={{
            overflow: 'auto',
            width: 200,
            borderRight: '1px solid var(--cogs-border--muted)',
          }}
          direction="column"
        >
          {Object.entries(features).map(([key, value]) => (
            <ListItem
              $isSelected={key === selectedFeature}
              key={key}
              onClick={() => setFeature(key as FeatureKey)}
              gap={8}
              alignItems="center"
              style={{
                display:
                  key === 'gpt_search' && !isGPTSearchEnabledForProject
                    ? 'none'
                    : 'flex',
              }}
            >
              {featureStatus[key as FeatureKey] ? (
                <Icon type="EyeShow" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4.27515 3.24815C4.28332 3.25646 4.29125 3.26492 4.29894 3.27351L14.5127 13.4872C14.7958 13.7704 14.7958 14.2294 14.5127 14.5126C14.2295 14.7957 13.7705 14.7957 13.4874 14.5126L11.3172 12.3424C10.4233 12.742 9.32957 13 8 13C5.18274 13 3.42436 11.8417 2.38219 10.6321C1.87048 10.0382 1.54194 9.44512 1.34027 8.99825C1.23913 8.77415 1.16889 8.58458 1.12285 8.44678C1.09981 8.3778 1.08274 8.32154 1.07085 8.28013C1.0649 8.25941 1.06023 8.24238 1.05675 8.2293L1.0524 8.21266L1.05087 8.20661L1.05026 8.20417L1.04999 8.20309L1 8L1.04999 7.79691L1.05026 7.79583L1.05087 7.79339L1.0524 7.78734L1.05675 7.7707C1.06023 7.75762 1.0649 7.74059 1.07085 7.71987C1.08274 7.67846 1.09981 7.6222 1.12285 7.55322C1.16889 7.41542 1.23913 7.22585 1.34027 7.00175C1.54194 6.55488 1.87048 5.96183 2.38219 5.36791C2.66442 5.04034 2.99918 4.71653 3.39328 4.41846L2.75608 3.78126L1.48737 2.51255C1.20424 2.22942 1.20424 1.77038 1.48737 1.48725C1.7705 1.20412 2.22955 1.20412 2.51268 1.48725L4.2411 3.21567C4.25271 3.22606 4.26407 3.23689 4.27515 3.24815ZM4.58109 5.60628C4.18552 5.87391 3.86959 6.17254 3.61726 6.46542C3.23148 6.91317 2.98306 7.36178 2.83215 7.69617C2.77861 7.81481 2.73785 7.91793 2.70796 8C2.73785 8.08207 2.77861 8.18519 2.83215 8.30383C2.98306 8.63822 3.23148 9.08683 3.61726 9.53458C4.37006 10.4083 5.68877 11.3333 8 11.3333C8.78432 11.3333 9.45434 11.2268 10.0267 11.0519L8.80584 9.83102C8.55932 9.93967 8.2867 10 8 10C6.89543 10 6 9.10457 6 8C6 7.7133 6.06033 7.44068 6.16898 7.19416L4.58109 5.60628Z"
                    fillOpacity="0.9"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M14.1842 8L14.98 8.20309L15.03 8L14.98 7.79691L14.1842 8Z"
                    fillOpacity="0.9"
                  />
                  <path
                    d="M13.1978 8.30383C13.0469 8.63822 12.7985 9.08683 12.4127 9.53458C12.5236 9.42707 12.3199 9.64236 12.4127 9.53458V9.53458C12.1848 9.9755 12.2583 10.5467 12.7132 10.7452C13.0188 10.8785 13.3715 10.9196 13.6478 10.6321C14.1595 10.0382 14.4881 9.44512 14.6897 8.99825C14.7909 8.77415 14.8611 8.58458 14.9071 8.44678C14.9302 8.3778 14.9473 8.32154 14.9592 8.28013C14.9651 8.25941 14.9698 8.24238 14.9732 8.2293L14.9776 8.21266L14.9791 8.20661L14.9797 8.20417L14.98 8.20309L14.1842 8L14.98 7.79691L14.9797 7.79583L14.9791 7.79339L14.9776 7.78734L14.9732 7.7707C14.9698 7.75762 14.9651 7.74059 14.9592 7.71987C14.9473 7.67846 14.9302 7.6222 14.9071 7.55322C14.8611 7.41542 14.7909 7.22585 14.6897 7.00175C14.4881 6.55488 14.1595 5.96183 13.6478 5.36791C12.6056 4.15832 10.8473 3 8.03 3C7.44797 3 6.91113 3.04944 6.41646 3.13855C6.17113 3.18275 5.96782 3.34945 5.86123 3.57479V3.57479C5.67559 3.96721 5.82974 4.43627 6.21197 4.64207L6.25237 4.66383C6.43169 4.76038 6.63901 4.78837 6.84016 4.75646C7.20424 4.69869 7.59994 4.66667 8.03 4.66667C10.3412 4.66667 11.6599 5.59168 12.4127 6.46542C12.7985 6.91317 13.0469 7.36178 13.1978 7.69617C13.2514 7.81481 13.2921 7.91793 13.322 8C13.2921 8.08207 13.2514 8.18519 13.1978 8.30383Z"
                    fillOpacity="0.9"
                  />
                </svg>
              )}
              <span>{value}</span>
            </ListItem>
          ))}
        </Flex>
        <FeatureContent
          style={{ flex: 1, overflow: 'auto', padding: '16px 16px 0px 8px' }}
          direction="column"
        >
          <Flex alignItems="center" style={{ marginBottom: 16 }}>
            <Body style={{ flex: 1 }} strong>
              {features[selectedFeature]}
            </Body>
            <CustomSwitch
              checked={featureStatus[selectedFeature]}
              onChange={() =>
                updateStatusState(
                  selectedFeature,
                  !featureStatus[selectedFeature]
                )
              }
              label={t('feature-preview-enabled', 'Enabled')}
            />
          </Flex>
          {featuresDetails[selectedFeature]}
        </FeatureContent>
      </Flex>
      <Body level={3} style={{ padding: '12px 12px 0' }}>
        {t(
          'feature_preview_disclaimer',
          'Enabling these features may introduce instability to your experience. Please give any feedback or feature request you have via '
        )}
        <a
          href="https://hub.cognite.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('feature_preview_cognite_hub', 'Cognite Hub')}
        </a>
        .
      </Body>
    </Modal>
  );
};

const ListItem = styled(Flex)<{ $isSelected: boolean }>`
  background: ${(props) =>
    props.$isSelected ? 'var(--cogs-decorative--gradient--dawn)' : 'none'};
  color: ${(props) => (props.$isSelected ? 'white' : 'inherit')};
  padding: 8px 16px;
  border-bottom: 1px solid var(--cogs-border--muted);

  svg {
    fill: ${(props) => (props.$isSelected ? 'white' : 'black')};
  }

  &&:hover {
    cursor: pointer;
    background: ${(props) =>
      props.$isSelected
        ? 'var(--cogs-decorative--gradient--dawn)'
        : 'rgba(34, 42, 83, 0.06)'};
  }
`;

const CustomSwitch = styled(Switch)`
  .cogs-switch__root.Mui-checked .cogs-switch__track {
    background: var(--cogs-decorative--gradient--dawn);
  }
`;

const FeatureContent = styled(Flex)`
  img {
    margin-bottom: 16px;
    max-height: 276px;
    object-fit: cover;
    object-position: top left;
  }
`;
