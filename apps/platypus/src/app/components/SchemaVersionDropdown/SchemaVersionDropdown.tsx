import { useEffect, useState } from 'react';

import {
  DataModelVersion,
  DataModelVersionStatus,
} from '@platypus/platypus-core';

import {
  Flex,
  Body,
  Dropdown,
  Icon,
  Menu,
  Chip,
  Tooltip,
} from '@cognite/cogs.js';

import { TOKENS } from '../../di';
import { useInjection } from '../../hooks/useInjection';
import { useMixpanel } from '../../hooks/useMixpanel';

import { DropdownButton, LastTimeText } from './elements';

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
  const { track } = useMixpanel();

  useEffect(() => {
    if (isOpen) {
      track('DataModel.Versions.List');
    }
  }, [isOpen, track]);

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
            data-cy="schema-version-select-menu"
            style={{
              maxHeight: 192,
              minWidth: 300,
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
                <Flex alignItems="center">
                  <Tooltip
                    disabled={schemaObj.version.length < 12}
                    content={`v. ${schemaObj.version}`}
                  >
                    <Body
                      level={2}
                      style={{
                        marginRight: 8,
                        textAlign: 'left',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        maxWidth: 100,
                      }}
                    >
                      {`v. ${schemaObj.version}`}
                    </Body>
                  </Tooltip>
                  {dateUtils.isValid(schemaObj.lastUpdatedTime as number) ? (
                    <LastTimeText level={2}>
                      {dateUtils.toTimeDiffString(
                        schemaObj.lastUpdatedTime as number
                      )}
                    </LastTimeText>
                  ) : null}
                  <VersionType
                    status={schemaObj.status}
                    isLatest={schemaObj.version === latest.version}
                  />
                </Flex>
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
            <Body
              level="2"
              style={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                flex: 1,
                textAlign: 'start',
              }}
            >
              v. {selectedVersion.version}
            </Body>
            <Flex alignItems="center" style={{ margin: '0 10px' }}>
              <VersionType
                status={selectedVersion.status}
                isLatest={selectedVersion.version === latest.version}
              />
            </Flex>
            {/* Ideally we would put the flexShrink style directly on the Icon but
            typescript complains that Icon doesn't have a style prop. */}
            <Flex alignItems="center" style={{ flexShrink: 0 }}>
              <Icon type="ChevronDown" />
            </Flex>
          </Flex>
        </DropdownButton>
      </Dropdown>
    </div>
  );
}
