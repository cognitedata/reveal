import React, { useState } from 'react';
import styled from 'styled-components';
import { Icon } from '@cognite/cogs.js';

import { Flex, Box, Text } from '../common/index';
import Input from '../common/Input';

type Project = any;

interface ProjectsListProps {
  projects: Project[];
  title: string;
  search?: boolean;
  onProjectClick: (project: string) => void;
}

const createBoldText = (text: string, boldPart: string) =>
  boldPart !== '' ? (
    <>
      {text.split(boldPart).map((v, idx, arr) =>
        idx < arr.length - 1 ? (
          <>
            {v}
            <b>{boldPart}</b>
          </>
        ) : (
          <>{v}</>
        )
      )}
    </>
  ) : (
    <>{text}</>
  );

const ProjectsList = ({
  projects,
  title,
  search,
  onProjectClick,
}: ProjectsListProps) => {
  const [searchUiVisible, setSearchUiVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const SearchUi = (
    <Flex direction="column">
      <Flex items="center" direction="row">
        <Box flex={1}>
          <Text size={13} transform="uppercase">
            {title} ({projects.length})
          </Text>
        </Box>
        <Box mr={8} cursor="pointer">
          <Icon type="Search" />
        </Box>
      </Flex>
      <Box mt={5}>
        <Flex direction="row" items="center">
          <Box flex={1}>
            <Input
              placeholder="Search for project names"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Box>
          <Box
            pl={15}
            cursor="pointer"
            onClick={() => {
              setSearchUiVisible(false);
              setSearchTerm('');
            }}
          >
            <Text color="#4a67fb" size={14}>
              Cancel
            </Text>
          </Box>
        </Flex>
      </Box>
    </Flex>
  );

  const Header = (
    <Flex items="center" direction="row">
      <Box flex={1}>
        <Text size={13} transform="uppercase">
          {title}
        </Text>
      </Box>
      {search && (
        <Box mr={8} cursor="pointer" onClick={() => setSearchUiVisible(true)}>
          <Icon type="Search" />
        </Box>
      )}
    </Flex>
  );

  const visibleProjects = projects.filter((p) => p.includes(searchTerm));

  return (
    <div>
      <Box mb={10}>{searchUiVisible ? SearchUi : Header}</Box>
      {visibleProjects.length === 0 && (
        <Text>No projects match your search</Text>
      )}
      {visibleProjects.map((p) => (
        <ItemWrapper
          key={p}
          p={8}
          mb={5}
          backgroundColor="#f5f5f5"
          borderRadius={5}
          cursor="pointer"
          onClick={() => onProjectClick(p)}
        >
          <Flex items="center" direction="row">
            <Box flex={1}>
              <div>{createBoldText(p, searchTerm)}</div>
            </Box>
            <Icon className="icon" type="ChevronRightLarge" />
          </Flex>
        </ItemWrapper>
      ))}
    </div>
  );
};

const ItemWrapper = styled(Box)`
  cursor: pointer;
  :hover {
    .icon {
      color: #4a67fb;
    }
  }
`;

export default ProjectsList;
