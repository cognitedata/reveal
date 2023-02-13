import { Flex, Body, Dropdown, Icon, Menu, Chip } from '@cognite/cogs.js';
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
        <Chip size="x-small" type="neutral" label="Latest" />
      )}
      {status === DataModelVersionStatus.DRAFT && (
        <Chip size="x-small" label="Local draft" />
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

  const latest =
    versions.filter((v) => v.status === DataModelVersionStatus.PUBLISHED)[0] ||
    {};

  return (
    <div data-cy="schema-version-select">
      <Dropdown
        onClickOutside={() => setOpen(false)}
        visible={isOpen}
        content={
          <Menu
            style={{
              maxHeight: 192,
              width: 300,
              overflow: 'auto',
              display: 'block',
            }}
          >
            {versions.map((schemaObj) => (
              <Menu.Item
                css={{}}
                key={`${schemaObj.version}-${schemaObj.status}`}
                toggled={
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
                    style={{ marginRight: 16, textAlign: 'left' }}
                  >{`v. ${schemaObj.version}`}</Body>
                  {dateUtils.isValid(schemaObj.lastUpdatedTime as number) ? (
                    <LastTimeText level={2}>
                      {dateUtils.toTimeDiffString(
                        schemaObj.lastUpdatedTime as number
                      )}
                    </LastTimeText>
                  ) : null}
                </Flex>
                <VersionType
                  status={schemaObj.status}
                  isLatest={schemaObj.version === latest.version}
                />
              </Menu.Item>
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
                isLatest={selectedVersion.version === latest.version}
              />
            </Flex>
            <Icon type="ChevronDown" />
          </Flex>
        </DropdownButton>
      </Dropdown>
    </div>
  );
}
