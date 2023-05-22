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
import styled from 'styled-components';
import { DataModelLibraryItem, library } from './library';
import { useEffect, useMemo, useState } from 'react';
import { SchemaVisualizer } from '../SchemaVisualizer/SchemaVisualizer';
import { GraphqlCodeEditor } from '@platypus-app/modules/solution/data-model/components/GraphqlCodeEditor/GraphqlCodeEditor';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

type TagTree = {
  [key in string]: string[];
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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDMTypes, setSelectedDMTypes] = useState({
    templates: true,
    published: true,
  });
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [isFilterVisible, setFilterVisible] = useState(false);
  const dataModels = useMemo(() => {
    return Object.entries(library)
      .reduce(
        (prev, [key, value]) =>
          prev.concat({ id: key, ...value, isTemplate: true }),
        [] as DataModelLibraryItem[]
      )
      .concat(propsDataModels.map((el) => ({ ...el, name: el.name || el.id })))
      .filter((el) => el.versions.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [propsDataModels]);

  const selectedDataModel = useMemo(
    () => dataModels.find((el) => el.id === selectedKey),
    [dataModels, selectedKey]
  );
  const labels = useMemo(
    () =>
      dataModels.reduce((prev, model) => {
        if (model.tags) {
          for (const tag of model.tags) {
            if (prev[tag]) {
              prev[tag].push(model.id);
            } else {
              prev[tag] = [model.id];
            }
          }
        }
        return prev;
      }, {} as TagTree),
    [dataModels]
  );

  useEffect(() => {
    setSelectedTags(Object.keys(labels));
  }, [labels]);

  const displayedDataModels = useMemo(() => {
    const isAllTagsSelected =
      selectedTags.length === Object.keys(labels).length;
    return dataModels
      .filter((el) => {
        return (
          (selectedDMTypes.templates && el.isTemplate) ||
          (selectedDMTypes.published && !el.isTemplate)
        );
      })
      .filter((el) =>
        isAllTagsSelected
          ? true
          : el.tags?.some((item) =>
              selectedTags.includes(item) && searchTerm
                ? el.name
                    .concat(' ')
                    .concat(el.description || '')
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
                : true
            )
      );
  }, [dataModels, selectedTags, selectedDMTypes, searchTerm, labels]);

  const hasFiltersBeenAdded = useMemo(
    () =>
      selectedTags.length !== Object.keys(labels).length ||
      Object.values(selectedDMTypes).includes(false),
    [selectedTags, labels, selectedDMTypes]
  );

  const filterSection = useMemo(() => {
    return Object.keys(labels).map((key) => {
      return (
        <Checkbox
          label={key}
          key={key}
          checked={selectedTags.includes(key)}
          onChange={() => {
            const newTags = [...selectedTags];
            const index = newTags.indexOf(key);
            if (index === -1) {
              newTags.push(key);
            } else {
              newTags.splice(index, 1);
            }
            setSelectedTags(newTags);
          }}
        />
      );
    });
  }, [labels, selectedTags]);

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
            <Flex style={{ flex: 1 }} direction="column" gap={16}>
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
            <Flex style={{ flex: 1 }} direction="column" gap={16}>
              <Overline level={3} muted>
                {t('library-labels', 'Labels')}
              </Overline>
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
