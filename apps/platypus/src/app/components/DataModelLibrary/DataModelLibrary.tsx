import { useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';

import {
  Body,
  Button,
  Checkbox,
  Chip,
  Divider,
  Flex,
  Input,
  Modal,
  NotificationDot,
  Overline,
  SegmentedControl,
} from '@cognite/cogs.js';

import { useTranslation } from '../../hooks/useTranslation';
import { GraphqlCodeEditor } from '../../modules/solution/data-model/components/GraphqlCodeEditor/GraphqlCodeEditor';
import { SchemaVisualizer } from '../SchemaVisualizer/SchemaVisualizer';

import { DataModelLibraryItem, library } from './library';

type TagTree = {
  [key in string]: string[];
};

const InitialFilter = {
  templates: true,
  published: false,
};

export const DataModelLibrary = ({
  dataModels: propsDataModels,
  onConfirm,
  onCancel,
}: {
  dataModels: DataModelLibraryItem[];
  onConfirm: (item: DataModelLibraryItem) => void;
  onCancel: () => void;
}) => {
  const { t } = useTranslation('DataModelLibrary');

  const [selectedKey, setSelectedKey] = useState<string | undefined>();
  const [selectedView, setSelectedView] = useState('visualizer');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDMTypes, setSelectedDMTypes] = useState(InitialFilter);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [isFilterVisible, setFilterVisible] = useState(false);
  const dataModels = useMemo(() => {
    return (
      Object.entries(library)
        // hardcoded templates
        .reduce(
          (prev, [key, value]) =>
            prev.concat({ id: key, ...value, isTemplate: true }),
          [] as DataModelLibraryItem[]
        )
        // existing data models
        .concat(
          propsDataModels.map((el) => ({ ...el, name: el.name || el.id }))
        )
        // must have 1 valid version at least
        .filter((el) => el.versions.length > 0)
        // alphabetica ordered by name
        .sort((a, b) => a.name.localeCompare(b.name))
    );
  }, [propsDataModels]);

  const selectedDataModel = useMemo(
    () => dataModels.find((el) => el.id === selectedKey),
    [dataModels, selectedKey]
  );
  const categories = useMemo(
    () =>
      dataModels.reduce((prev, model) => {
        if (model.category) {
          if (prev[model.category]) {
            prev[model.category].push(model.id);
          } else {
            prev[model.category] = [model.id];
          }
        }
        return prev;
      }, {} as TagTree),
    [dataModels]
  );

  useEffect(() => {
    setSelectedCategories(Object.keys(categories));
  }, [categories]);

  const isAllCategoriesSelected = useMemo(
    () => selectedCategories.length === Object.keys(categories).length,
    [selectedCategories, categories]
  );

  const displayedDataModels = useMemo(() => {
    return dataModels
      .filter((el) => {
        // if templates should be visible, show templates
        if (selectedDMTypes.templates) {
          if (el.isTemplate) {
            return true;
          }
        }
        // if non-templates (published data models) should be visible, show non-templates
        if (selectedDMTypes.published) {
          if (!el.isTemplate) {
            return true;
          }
        }
        return false;
      })
      .filter((el) =>
        // filter out to show only data model with selected category
        isAllCategoriesSelected
          ? true
          : selectedCategories.includes(el.category || '')
      )
      .filter((el) =>
        // filter out to show only data model with proper search terms
        searchTerm
          ? el.name
              .concat(' ')
              .concat(el.description || '')
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          : true
      );
  }, [
    dataModels,
    selectedCategories,
    selectedDMTypes,
    searchTerm,
    isAllCategoriesSelected,
  ]);

  const hasFiltersBeenAdded = useMemo(
    () =>
      selectedCategories.length !== Object.keys(categories).length ||
      selectedDMTypes.published !== InitialFilter.published ||
      selectedDMTypes.templates !== InitialFilter.templates,
    [selectedCategories, categories, selectedDMTypes]
  );

  // if invalid key, deselect
  useEffect(() => {
    if (!displayedDataModels.some((el) => el.id === selectedKey)) {
      setSelectedKey(undefined);
    }
  }, [displayedDataModels, selectedKey]);

  const filterSection = useMemo(() => {
    return Object.keys(categories).map((key) => {
      return (
        <CategoryItem key={key}>
          <Checkbox
            style={{ flex: 1 }}
            key={key}
            label={key}
            checked={selectedCategories.includes(key)}
            onChange={() => {
              const newCategories = [...selectedCategories];
              const index = newCategories.indexOf(key);
              // If the category was there, remove it, otherwise, add it to list of selected categories
              if (index === -1) {
                newCategories.push(key);
              } else {
                newCategories.splice(index, 1);
              }
              setSelectedCategories(newCategories);
            }}
          />
          <Button
            onClick={() => setSelectedCategories([key])}
            size="small"
            className="only-button"
          >
            {t('library-button-only', 'only')}
          </Button>
        </CategoryItem>
      );
    });
  }, [categories, selectedCategories, t]);

  return (
    <StyledModal
      visible
      title={t('library-title', 'Data Model Library')}
      size="full-screen"
      showBorders
      hideFooter
      hidePaddings
      onCancel={onCancel}
    >
      <Flex style={{ height: '100%' }}>
        <Sidebar $closed={!isFilterVisible}>
          <Flex
            className="wrapped-content"
            direction="column"
            gap={16}
            style={{ paddingLeft: 8 }}
          >
            <Flex alignItems="center">
              <Body level={2} strong style={{ flex: 1 }}>
                {t('library-filter', 'Filter')}
              </Body>
              <Button
                icon="PanelLeft"
                aria-label="Close Filters"
                onClick={() => setFilterVisible(false)}
              />
            </Flex>
            <Flex style={{ flex: 1 }} direction="column" gap={8}>
              <Overline level={3} muted>
                {t('library-type-of-model', 'Type of data model')}
              </Overline>
              <Checkbox
                label={t('library-type-templates', 'Templates')}
                checked={selectedDMTypes.templates}
                onChange={({ target: { checked } }) =>
                  setSelectedDMTypes({ ...selectedDMTypes, templates: checked })
                }
              />
              <Checkbox
                label={t('library-type-published', 'Published data model')}
                checked={selectedDMTypes.published}
                onChange={({ target: { checked } }) =>
                  setSelectedDMTypes({ ...selectedDMTypes, published: checked })
                }
              />
            </Flex>
            <Divider direction="horizontal" />
            <Flex style={{ flex: 1 }} direction="column" gap={8}>
              <Overline level={3} muted>
                {t('library-categories', 'Categories')}
              </Overline>
              <Button size="small" style={{ alignSelf: 'start' }}>
                {t('library-select-all', 'Select all')}
              </Button>
              {filterSection}
            </Flex>
          </Flex>
        </Sidebar>
        <Sidebar>
          <Flex style={{ width: '100%' }} gap={4}>
            <Input
              containerStyle={{ flex: 1 }}
              fullWidth
              icon="Search"
              placeholder={t('library-search-placeholder', 'Search')}
              value={searchTerm}
              onChange={(ev) => setSearchTerm(ev.target.value)}
            />
            <NotificationDot hidden={!hasFiltersBeenAdded}>
              <Button
                type="ghost"
                toggled={isFilterVisible}
                icon="Filter"
                aria-label="Filter"
                onClick={() => setFilterVisible(!isFilterVisible)}
              />
            </NotificationDot>
          </Flex>
          <Flex style={{ overflow: 'auto', flex: 1 }} direction="column">
            {displayedDataModels.map((el) => (
              <ListItem
                key={el.id}
                $selected={selectedKey === el.id}
                onClick={() => setSelectedKey(el.id)}
                gap={8}
              >
                <Flex
                  direction="column"
                  style={{ flex: 1, overflow: 'auto' }}
                  gap={4}
                >
                  <Flex gap={4}>
                    <Body
                      strong
                      level={2}
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {el.name}
                    </Body>
                    {el.isTemplate && <Chip size="x-small" label="template" />}
                  </Flex>
                  <Body level={3} muted>
                    {`${t('library-last-update-label', 'Last update: ')}
                    ${el.versions[0].date.toISOString().split('T')[0]}`}
                  </Body>
                </Flex>
                <Chip
                  size="x-small"
                  type="neutral"
                  label={`v.${el.versions[0].version}`}
                />
              </ListItem>
            ))}
          </Flex>
        </Sidebar>
        <Flex
          style={{
            flex: 1,
            width: 0,
            height: '100%',
            position: 'relative',
          }}
        >
          {selectedDataModel ? (
            <Flex direction="column" style={{ flex: 1 }}>
              <Flex
                style={{
                  padding: '4px 16px',
                  borderBottom: '1px solid var(--cogs-border--muted)',
                }}
                alignItems="center"
              >
                <Body level={3} strong style={{ flex: 1 }}>
                  {t('library-data-model-preview', 'Data model preview')}
                </Body>
                <SegmentedControl
                  size="small"
                  currentKey={selectedView}
                  onButtonClicked={(key) => setSelectedView(key)}
                >
                  <SegmentedControl.Button icon="Code" key="code" />
                  <SegmentedControl.Button icon="GraphTree" key="visualizer" />
                </SegmentedControl>
              </Flex>
              <div style={{ width: '100%', flex: 1 }}>
                {selectedView === 'visualizer' ? (
                  <SchemaVisualizer
                    graphQLSchemaString={selectedDataModel.versions[0].dml}
                  />
                ) : (
                  <GraphqlCodeEditor
                    code={selectedDataModel.versions[0].dml}
                    disabled
                  />
                )}
              </div>
              <Flex
                alignItems="end"
                style={{
                  width: '100%',
                  paddingTop: 16,
                  paddingRight: 16,
                  borderTop: '1px solid var(--cogs-border--muted)',
                }}
                gap={8}
                direction="row-reverse"
              >
                <Button
                  type="primary"
                  onClick={() => onConfirm(selectedDataModel)}
                >
                  {t('library-confirm-import', 'Start from this data model')}
                </Button>
                <Button onClick={() => onCancel()}>
                  {t('library-cancel-import', 'Cancel')}
                </Button>
              </Flex>
            </Flex>
          ) : (
            <Placeholder>
              <Body muted>
                {t('library-non-selected', 'No data model selected.')}
              </Body>
            </Placeholder>
          )}
        </Flex>
      </Flex>
    </StyledModal>
  );
};

const ListItem = styled(Flex)<{ $selected?: boolean }>`
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  background: ${(props) =>
    props.$selected
      ? 'var(--cogs-surface--interactive--toggled-hover)'
      : 'white'};

  &&:hover {
    background: ${(props) =>
      props.$selected
        ? 'var(--cogs-surface--interactive--toggled-pressed)'
        : 'var(--cogs-surface--interactive--hover)'};
  }
`;

const StyledModal = styled(Modal)`
  #cogs-modal__content {
    height: 100%;
  }
`;

const Placeholder = styled(Flex)`
  background-image: radial-gradient(
    var(--cogs-border-default) 1px,
    transparent 1px
  );
  background-color: var(--cogs-bg-canvas);
  background-size: 24px 24px;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const Sidebar = styled(Flex)<{ $closed?: boolean }>`
  width: ${(props) => (props.$closed ? 0 : 280)}px;
  overflow: hidden;
  padding-top: 8px;
  padding-left: ${(props) => (props.$closed ? '0px' : '8px')};
  padding-right: ${(props) => (props.$closed ? '0px' : '8px')};
  border-right: 1px solid var(--cogs-border--muted);
  gap: 8px;
  flex-direction: column;
  transition: all 0.5s;
  .wrapped-content {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`;

const CategoryItem = styled(Flex)`
  .only-button {
    opacity: 0;
    transition: 0.5s all;
  }
  &&:hover .only-button {
    opacity: 1;
  }
`;
