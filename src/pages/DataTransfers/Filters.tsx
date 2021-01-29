import React, { useState } from 'react';
import { format } from 'date-fns';
import dateFnsGenerateConfig from 'rc-picker/lib/generate/dateFns';
import generatePicker from 'antd/es/date-picker/generatePicker';
import 'antd/es/date-picker/style/index';
import { Button, Dropdown, Input, Menu, Tooltip } from '@cognite/cogs.js';
import {
  DataTransferObject,
  GenericResponseObject,
  SelectedDateRangeType,
} from 'typings/interfaces';
import {
  CalendarWrapper,
  CalendarBtnWrapper,
  DropdownLabel,
  FiltersWrapper,
  SecondaryFilters,
  StartContainer,
  DropdownWrapper,
  DropdownWithMargin,
  DropdownButton,
  DropdownSeparator,
} from './elements';

type Props = {
  source: {
    sources: string[];
    selected: string | null;
    onSelectSource: (selected: string) => void;
    projects: DataTransferObject[];
    selectedProject: DataTransferObject | null;
    onSelectProject: (selected: DataTransferObject) => void;
  };
  target: {
    targets: string[];
    selected: string | null;
    onSelectTarget: (selected: string) => void;
    projects: DataTransferObject[];
    selectedProject: DataTransferObject | null;
    onSelectProject: (selected: DataTransferObject) => void;
  };
  configuration: {
    configurations: GenericResponseObject[];
    selected: GenericResponseObject | null;
    onSelectConfiguration: (selected: GenericResponseObject | null) => void;
  };
  datatype: {
    types: string[];
    selected: string | null;
    onSelectType: (selected: string | null) => void;
  };
  date: {
    selectedRange: SelectedDateRangeType | null;
    onSelectDate: (selected: SelectedDateRangeType | null) => void;
  };
  filterByProjects: boolean;
  setFilterByProjects: (nextState: boolean) => void;
  onNameSearchChange: (searchString: string) => void;
};

const DatePicker = generatePicker<Date>(dateFnsGenerateConfig);

const Filters = ({
  source,
  target,
  date,
  datatype,
  configuration,
  filterByProjects,
  setFilterByProjects,
  onNameSearchChange,
}: Props) => {
  const [sourceOpen, setSourceOpen] = useState(false);
  const [sourceProjectOpen, setSourceProjectOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);
  const [targetProjectOpen, setTargetProjectOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [datatypesOpen, setDatatypesOpen] = useState(false);
  const [nameFilter, setNameFilter] = useState('');
  const { RangePicker } = DatePicker;

  if (!source.sources || source.sources.length < 1) {
    return null;
  }

  const SourcesContent = (
    <Menu>
      {source.sources.map((item) => (
        <Menu.Item
          key={item}
          onClick={() => {
            source.onSelectSource(item);
            setSourceOpen(false);
          }}
          appendIcon="Right"
        >
          {item}
        </Menu.Item>
      ))}
    </Menu>
  );

  const TargetsContent = (
    <Menu>
      {target.targets.map((item) => (
        <Menu.Item
          key={item}
          onClick={() => {
            target.onSelectTarget(item);
            setTargetOpen(false);
          }}
          appendIcon="Right"
        >
          {item}
        </Menu.Item>
      ))}
    </Menu>
  );

  const SourceProjectsContent = (
    <Menu>
      {source.projects.map((item) => (
        <Menu.Item
          key={item.id}
          onClick={() => {
            source.onSelectProject(item);
            setSourceProjectOpen(false);
          }}
          appendIcon="Right"
        >
          {item.external_id}
        </Menu.Item>
      ))}
    </Menu>
  );

  const TargetProjectsContent = (
    <Menu>
      {target.projects.map((item) => (
        <Menu.Item
          key={item.id}
          onClick={() => {
            target.onSelectProject(item);
            setTargetProjectOpen(false);
          }}
          appendIcon="Right"
        >
          {item.external_id}
        </Menu.Item>
      ))}
    </Menu>
  );

  const DateContent = (
    <CalendarWrapper>
      <RangePicker
        onChange={(selected) => {
          date.onSelectDate(selected);
          setDateOpen(false);
        }}
        value={date.selectedRange}
        open={dateOpen}
        popupStyle={{ backgroundColor: 'white', paddingTop: '52px' }}
      />
      <Button
        className="close-button"
        icon="Close"
        iconPlacement="right"
        size="small"
        variant="outline"
        aria-label="Close"
        onClick={() => setDateOpen(false)}
      >
        Close
      </Button>
    </CalendarWrapper>
  );

  const DatatypesContent = (
    <Menu>
      {datatype.selected && (
        <Menu.Item
          key="removeDatatypeItem"
          onClick={() => {
            datatype.onSelectType(null);
            setDatatypesOpen(false);
          }}
          appendIcon="Close"
        >
          Reset
        </Menu.Item>
      )}
      {datatype.types.map((item) => (
        <Menu.Item
          key={item}
          onClick={() => {
            datatype.onSelectType(item);
            setDatatypesOpen(false);
          }}
          appendIcon="Right"
        >
          {item}
        </Menu.Item>
      ))}
    </Menu>
  );

  const ConfigsContent = (
    <Menu>
      {configuration.selected && (
        <Menu.Item
          key="removeConfigItem"
          onClick={() => {
            configuration.onSelectConfiguration(null);
            setConfigOpen(false);
          }}
          appendIcon="Close"
        >
          Reset
        </Menu.Item>
      )}
      {configuration.configurations.map((item) => (
        <Menu.Item
          key={`${item.id}_${item.name}`}
          onClick={() => {
            configuration.onSelectConfiguration(item);
            setConfigOpen(false);
          }}
          appendIcon="Right"
        >
          {item.name}
        </Menu.Item>
      ))}
    </Menu>
  );

  function getFormattedDateRange(selectedRange: SelectedDateRangeType) {
    const first = selectedRange[0];
    const second = selectedRange[1];
    if (first && second) {
      return `${format(first, 'P')} - ${format(second, 'P')}`;
    }
    return selectedRange.join(' - ');
  }

  function resetFilters() {
    setNameFilter('');
    source.onSelectSource('');
    target.onSelectTarget('');
    configuration.onSelectConfiguration(null);
    datatype.onSelectType('');
    date.onSelectDate(null);
  }

  const renderSecondaryFilters = () => {
    /* eslint-disable react/prop-types */
    if (
      configuration.selected ||
      (source.selected &&
        source.selectedProject &&
        target.selected &&
        target.selectedProject)
    ) {
      return (
        <SecondaryFilters>
          <Input
            value={nameFilter}
            icon="Search"
            iconPlacement="left"
            onChange={(e) => {
              setNameFilter(e.target.value);
              onNameSearchChange(e.target.value);
            }}
            title="Filter by name"
            placeholder="Search by name"
            className={!dateOpen ? 'input-visible' : 'input-hidden'}
          />
          {datatype.types.length > 0 && !dateOpen && (
            <Dropdown
              content={DatatypesContent}
              visible={datatypesOpen}
              onClickOutside={() => setDatatypesOpen(false)}
            >
              <>
                <DropdownLabel>Datatype</DropdownLabel>
                <DropdownButton
                  icon="Down"
                  iconPlacement="right"
                  onClick={() => setDatatypesOpen(!datatypesOpen)}
                >
                  {datatype.selected || 'Select datatype'}
                </DropdownButton>
              </>
            </Dropdown>
          )}
          <div
            style={{
              alignSelf: 'flex-end',
              marginLeft: '0.5rem',
              marginBottom: '0.5rem',
            }}
          >
            <Dropdown content={DateContent} visible={dateOpen}>
              <>
                {!dateOpen && (
                  <Tooltip
                    content={
                      date.selectedRange
                        ? getFormattedDateRange(date.selectedRange)
                        : 'Filter by updated date'
                    }
                  >
                    <CalendarBtnWrapper active={date.selectedRange !== null}>
                      <DropdownButton
                        unstyled
                        icon="Calendar"
                        onClick={() => setDateOpen(!dateOpen)}
                        aria-label="Filter by updated date"
                      />
                    </CalendarBtnWrapper>
                  </Tooltip>
                )}
              </>
            </Dropdown>
          </div>
        </SecondaryFilters>
      );
    }
    return null;
  };

  return (
    <FiltersWrapper>
      <>
        {configuration.configurations.length > 0 && (
          <StartContainer>
            <DropdownWrapper disabled={!!source.selected}>
              <Dropdown
                content={ConfigsContent}
                visible={configOpen}
                onClickOutside={() => setConfigOpen(false)}
              >
                <>
                  <DropdownLabel>Configuration</DropdownLabel>
                  <DropdownButton
                    type="secondary"
                    icon="Down"
                    iconPlacement="right"
                    onClick={() => setConfigOpen(!configOpen)}
                  >
                    {configuration.selected
                      ? configuration.selected.name
                      : 'Select'}
                  </DropdownButton>
                </>
              </Dropdown>
            </DropdownWrapper>
            <DropdownSeparator>or</DropdownSeparator>
            <DropdownWrapper disabled={!!configuration.selected}>
              {source.sources.length > 0 && (
                <Dropdown
                  content={SourcesContent}
                  visible={sourceOpen}
                  onClickOutside={() => setSourceOpen(false)}
                >
                  <>
                    <DropdownLabel>Source</DropdownLabel>
                    <DropdownButton
                      icon="Down"
                      iconPlacement="right"
                      onClick={() => setSourceOpen(!sourceOpen)}
                    >
                      {source.selected || 'Select'}
                    </DropdownButton>
                  </>
                </Dropdown>
              )}
              {source.selected && source.projects.length > 0 && (
                <DropdownWithMargin>
                  <Dropdown
                    content={SourceProjectsContent}
                    visible={sourceProjectOpen}
                    onClickOutside={() => setSourceProjectOpen(false)}
                  >
                    <>
                      <DropdownLabel>Source project</DropdownLabel>
                      <DropdownButton
                        icon="Down"
                        iconPlacement="right"
                        onClick={() => setSourceProjectOpen(!sourceProjectOpen)}
                      >
                        {source.selectedProject
                          ? source.selectedProject.external_id
                          : 'Select project'}
                      </DropdownButton>
                    </>
                  </Dropdown>
                </DropdownWithMargin>
              )}
              {source.selected &&
                source.selectedProject &&
                target.targets.length > 0 && (
                  <DropdownWithMargin>
                    <Dropdown
                      content={TargetsContent}
                      visible={targetOpen}
                      onClickOutside={() => setTargetOpen(false)}
                    >
                      <>
                        <DropdownLabel>Target</DropdownLabel>
                        <DropdownButton
                          icon="Down"
                          iconPlacement="right"
                          onClick={() => setTargetOpen(!targetOpen)}
                        >
                          {target.selected || 'Select'}
                        </DropdownButton>
                      </>
                    </Dropdown>
                  </DropdownWithMargin>
                )}
              {target.selected && target.projects.length > 0 && (
                <DropdownWithMargin>
                  <Dropdown
                    content={TargetProjectsContent}
                    visible={targetProjectOpen}
                    onClickOutside={() => setTargetProjectOpen(false)}
                  >
                    <>
                      <DropdownLabel>Target project</DropdownLabel>
                      <DropdownButton
                        icon="Down"
                        iconPlacement="right"
                        onClick={() => setTargetProjectOpen(!targetProjectOpen)}
                      >
                        {target.selectedProject
                          ? target.selectedProject.external_id
                          : 'Select'}
                      </DropdownButton>
                    </>
                  </Dropdown>
                </DropdownWithMargin>
              )}
            </DropdownWrapper>

            <Button
              style={{ marginLeft: '16px' }}
              variant="ghost"
              type="danger"
              onClick={resetFilters}
            >
              Reset
            </Button>
          </StartContainer>
        )}
        {renderSecondaryFilters()}
      </>
    </FiltersWrapper>
  );
};

export default Filters;
