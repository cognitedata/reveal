import { Flex, Body, Dropdown, Icon, Menu } from '@cognite/cogs.js';
import { SolutionSchema, SolutionSchemaStatus } from '@platypus/platypus-core';
import { useState } from 'react';

import { MenuItem, DropdownButton, LastTimeText, VersionTag } from './elements';

import services from '@platypus-app/di';

type Props = {
  selectedVersion: SolutionSchema;
  versions: SolutionSchema[];
  onVersionSelect?: (version: SolutionSchema) => void;
};

const VersionType = ({
  status,
  isLatest,
}: {
  status: SolutionSchemaStatus;
  isLatest: boolean;
}) => {
  return (
    <>
      {status === SolutionSchemaStatus.PUBLISHED && isLatest && (
        <VersionTag status={status}>Latest</VersionTag>
      )}
      {status === SolutionSchemaStatus.DRAFT && (
        <VersionTag status={status}>Local draft</VersionTag>
      )}
    </>
  );
};

export function SchemaVersionDropdown({
  versions,
  selectedVersion,
  onVersionSelect,
}: Props) {
  const [isOpen, setOpen] = useState(false);
  const latestVersion =
    versions.filter((v) => v.status === SolutionSchemaStatus.PUBLISHED)[0]
      ?.version || '999999';
  return (
    <div data-cy="schema-version-select">
      <Dropdown
        onClickOutside={() => setOpen(false)}
        visible={isOpen}
        content={
          <Menu style={{ maxHeight: 192, width: 300, overflow: 'auto' }}>
            {versions.map((schemaObj) => (
              <MenuItem
                key={`${schemaObj.version}-${schemaObj.status}`}
                selected={
                  schemaObj.version === selectedVersion.version &&
                  schemaObj.status === selectedVersion.status
                }
                onClick={() => {
                  onVersionSelect && onVersionSelect(schemaObj);
                  setOpen(false);
                }}
              >
                <Flex alignItems="center" style={{ flex: '1 1 100px' }}>
                  <Body
                    level={2}
                    style={{ width: 50, textAlign: 'left' }}
                  >{`v. ${schemaObj.version}`}</Body>
                  {services().dateUtils.isValid(schemaObj.lastUpdatedTime) ? (
                    <LastTimeText level={2}>
                      {services().dateUtils.toTimeDiffString(
                        schemaObj.lastUpdatedTime
                      )}
                    </LastTimeText>
                  ) : null}
                </Flex>
                <Flex alignItems="center">
                  <VersionType
                    status={schemaObj.status}
                    isLatest={schemaObj.version === latestVersion}
                  />
                  <div
                    role="button"
                    aria-label="Version select actions"
                    onClick={(e) => e.stopPropagation()}
                    style={{ padding: 0, width: 28, height: 28, marginLeft: 4 }}
                  >
                    <Icon type="EllipsisVertical" style={{ margin: 0 }} />
                  </div>
                </Flex>
              </MenuItem>
            ))}
          </Menu>
        }
      >
        <DropdownButton
          open={isOpen}
          type="ghost"
          onClick={() => setOpen(!isOpen)}
        >
          <Flex
            justifyContent="space-between"
            alignItems="center"
            style={{ width: '100%' }}
          >
            <Body level="2"> v. {selectedVersion.version}</Body>
            <Flex alignItems="center" style={{ margin: '0 10px' }}>
              <VersionType
                status={selectedVersion.status}
                isLatest={selectedVersion.version === latestVersion}
              />
            </Flex>
            <Icon type="ChevronDown" />
          </Flex>
        </DropdownButton>
      </Dropdown>
    </div>
  );
}
