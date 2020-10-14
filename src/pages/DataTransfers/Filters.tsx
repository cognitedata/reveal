import React, { useState } from 'react';
import { format } from 'date-fns';
import dateFnsGenerateConfig from 'rc-picker/lib/generate/dateFns';
import generatePicker from 'antd/es/date-picker/generatePicker';
import 'antd/es/date-picker/style/index';
import { Button, Dropdown, Icon, Menu, Tooltip } from '@cognite/cogs.js';
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
  BackButton,
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
}: Props) => {
  const [sourceOpen, setSourceOpen] = useState(false);
  const [sourceProjectOpen, setSourceProjectOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);
  const [targetProjectOpen, setTargetProjectOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [datatypesOpen, setDatatypesOpen] = useState(false);
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
      />
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

  return (
    <FiltersWrapper>
      {configuration.configurations.length > 0 && !filterByProjects && (
        <StartContainer>
          <Dropdown
            content={ConfigsContent}
            visible={configOpen}
            onClickOutside={() => setConfigOpen(false)}
          >
            <>
              <Button
                type="secondary"
                icon="Down"
                iconPlacement="right"
                onClick={() => setConfigOpen(!configOpen)}
              >
                {configuration.selected
                  ? configuration.selected.name
                  : 'Select configuration'}
              </Button>
            </>
          </Dropdown>
          <span>or</span>
          <Button
            type="secondary"
            onClick={() => setFilterByProjects(true)}
            icon="Right"
            iconPlacement="right"
          >
            Filter by source and target projects
          </Button>
        </StartContainer>
      )}
      {filterByProjects && (
        <>
          <Tooltip content="Set configuration">
            <BackButton
              type="secondary"
              variant="outline"
              onClick={() => setFilterByProjects(false)}
              aria-label="Set configuration"
            >
              <Icon type="Left" />
            </BackButton>
          </Tooltip>
          {source.sources.length > 0 && (
            <Dropdown
              content={SourcesContent}
              visible={sourceOpen}
              onClickOutside={() => setSourceOpen(false)}
            >
              <>
                <DropdownLabel>Source</DropdownLabel>
                <Button
                  icon="Down"
                  iconPlacement="right"
                  onClick={() => setSourceOpen(!sourceOpen)}
                >
                  {source.selected || 'Select source'}
                </Button>
              </>
            </Dropdown>
          )}
          {source.selected && source.projects.length > 0 && (
            <Dropdown
              content={SourceProjectsContent}
              visible={sourceProjectOpen}
              onClickOutside={() => setSourceProjectOpen(false)}
            >
              <>
                <DropdownLabel>Source project</DropdownLabel>
                <Button
                  icon="Down"
                  iconPlacement="right"
                  onClick={() => setSourceProjectOpen(!sourceProjectOpen)}
                >
                  {source.selectedProject
                    ? source.selectedProject.external_id
                    : 'Select project'}
                </Button>
              </>
            </Dropdown>
          )}
          {source.selected &&
            source.selectedProject &&
            target.targets.length > 0 && (
              <Dropdown
                content={TargetsContent}
                visible={targetOpen}
                onClickOutside={() => setTargetOpen(false)}
              >
                <>
                  <DropdownLabel>Target</DropdownLabel>
                  <Button
                    icon="Down"
                    iconPlacement="right"
                    onClick={() => setTargetOpen(!targetOpen)}
                  >
                    {target.selected || 'Select target'}
                  </Button>
                </>
              </Dropdown>
            )}
          {target.selected && target.projects.length > 0 && (
            <Dropdown
              content={TargetProjectsContent}
              visible={targetProjectOpen}
              onClickOutside={() => setTargetProjectOpen(false)}
            >
              <>
                <DropdownLabel>Target project</DropdownLabel>
                <Button
                  icon="Down"
                  iconPlacement="right"
                  onClick={() => setTargetProjectOpen(!targetProjectOpen)}
                >
                  {target.selectedProject
                    ? target.selectedProject.external_id
                    : 'Select project'}
                </Button>
              </>
            </Dropdown>
          )}
          {source.selected &&
            source.selectedProject &&
            target.selected &&
            target.selectedProject && (
              <SecondaryFilters>
                {datatype.types.length > 0 && !dateOpen && (
                  <Dropdown
                    content={DatatypesContent}
                    visible={datatypesOpen}
                    onClickOutside={() => setDatatypesOpen(false)}
                  >
                    <>
                      <DropdownLabel>Datatype</DropdownLabel>
                      <Button
                        icon="Down"
                        iconPlacement="right"
                        onClick={() => setDatatypesOpen(!datatypesOpen)}
                      >
                        {datatype.selected || 'Select datatype'}
                      </Button>
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
                          <CalendarBtnWrapper
                            active={date.selectedRange !== null}
                          >
                            <Button
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
            )}
        </>
      )}
    </FiltersWrapper>
  );
};

export default Filters;
