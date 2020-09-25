import React, { useState } from 'react';
import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import { DataTransferObject, GenericResponseObject } from 'typings/interfaces';
import { DropdownLabel, FiltersWrapper } from './elements';

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
    onSelectConfiguration: (selected: GenericResponseObject) => void;
  };
  datatype: {
    types: string[];
    selected: string | null;
    onSelectType: (selected: string) => void;
  };
};

const Filters = ({ source, target }: Props) => {
  const [sourceOpen, setSourceOpen] = useState(false);
  const [sourceProjectOpen, setSourceProjectOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);
  const [targetProjectOpen, setTargetProjectOpen] = useState(false);
  // const [configOpen, setConfigOpen] = useState(false);
  // const [datatypesOpen, setDatatypesOpen] = useState(false);

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
  /*
  const DatatypesContent = (
    <Menu>
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
*/
  return (
    <FiltersWrapper>
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
      {source.selected && source.selectedProject && target.targets.length > 0 && (
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
      {/* source.selected &&
        source.selectedProject &&
        target.selected &&
        target.selectedProject && (
          <SecondaryFilters>
            {datatype.types.length > 0 && (
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
            {configuration.configurations.length > 0 && (
              <Dropdown
                content={ConfigsContent}
                visible={configOpen}
                onClickOutside={() => setConfigOpen(false)}
              >
                <>
                  <DropdownLabel>Configuration</DropdownLabel>
                  <Button
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
            )}
          </SecondaryFilters>
        ) */}
    </FiltersWrapper>
  );
};

export default Filters;
