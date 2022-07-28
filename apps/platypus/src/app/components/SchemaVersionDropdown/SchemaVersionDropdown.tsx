import { Flex, Body, Dropdown, Icon, Menu } from '@cognite/cogs.js';
import {
  DataModelVersion,
  DataModelVersionStatus,
} from '@platypus/platypus-core';
import { useState } from 'react';

import { MenuItem, DropdownButton, LastTimeText, VersionTag } from './elements';

import { TOKENS } from '@platypus-app/di';
import { useInjection } from '@platypus-app/hooks/useInjection';

type Props = {
  selectedVersion: DataModelVersion;
  versions: DataModelVersion[];
  onVersionSelect?: (version: DataModelVersion) => void;
};

const VersionType = ({
  status,
  isLatest,
}: {
  status: DataModelVersionStatus;
  isLatest: boolean;
}) => {
  return (
    <>
      {status === DataModelVersionStatus.PUBLISHED && isLatest && (
        <VersionTag status={status}>Latest</VersionTag>
      )}
      {status === DataModelVersionStatus.DRAFT && (
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
  const dateUtils = useInjection(TOKENS.dateUtils);

  const latestVersion =
    versions.filter((v) => v.status === DataModelVersionStatus.PUBLISHED)[0]
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
                  {dateUtils.isValid(schemaObj.lastUpdatedTime) ? (
                    <LastTimeText level={2}>
                      {dateUtils.toTimeDiffString(schemaObj.lastUpdatedTime)}
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
