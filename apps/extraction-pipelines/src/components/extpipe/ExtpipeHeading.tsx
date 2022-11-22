import React, { useState } from 'react';
import { useDeletePipeline, useSelectedExtpipe } from 'hooks/useExtpipe';
import {
  Body,
  Button,
  Colors,
  Dropdown,
  Flex,
  Menu,
  toast,
} from '@cognite/cogs.js';
import styled from 'styled-components';
import { LinkWrapper } from 'components/styled';
import { LastRunStatusMarker } from 'components/extpipes/cols/StatusMarker';
import { createExtPipePath } from 'utils/baseURL';
import { useTranslation } from 'common';
import { NavLink, useNavigate } from 'react-router-dom';
import { EXT_PIPE_PATH, HEALTH_PATH } from 'routing/RoutingConfig';
import { DeleteDialog } from './DeleteModal';
import { SecondaryTopbar } from '@cognite/cdf-utilities';

export const ExtpipeHeading = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { data: extpipe } = useSelectedExtpipe();
  const { mutate } = useDeletePipeline({
    onSuccess() {
      toast.success(t('delete-ext-pipeline-success'), {
        toastId: 'delete-extpipeline',
        position: 'bottom-right',
      });
      navigate(createExtPipePath(), { replace: true });
    },
    onError() {
      toast.error(t('delete-ext-pipeline-fail'), {
        toastId: 'delete-extpipeline',
      });
    },
  });
  if (!extpipe) {
    return null;
  }

  return (
    <StyledHeadingContainer>
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        doDelete={() => mutate(extpipe.id)}
        pipelineName={extpipe.name}
        close={() => {
          setIsDeleteDialogOpen(false);
        }}
      />
      <SecondaryTopbar
        extraContent={
          <Flex alignItems="center">
            <Flex alignItems="center" gap={8}>
              <Body level={2}>{t('last-status')}:</Body>{' '}
              <LastRunStatusMarker externalId={extpipe.externalId} />
            </Flex>
            <SecondaryTopbar.Divider />
            <Flex alignItems="end">
              <LinkWrapper>
                <TabsAndActions>
                  <PageNav>
                    <li>
                      <NavLink
                        end
                        to={createExtPipePath(
                          `/${EXT_PIPE_PATH}/${extpipe.id}`
                        )}
                        className="tab-link"
                      >
                        {t('overview')}
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to={createExtPipePath(
                          `/${EXT_PIPE_PATH}/${extpipe.id}/${HEALTH_PATH}`
                        )}
                        className="tab-link"
                      >
                        {t('run-history')}
                      </NavLink>
                    </li>
                  </PageNav>
                </TabsAndActions>
              </LinkWrapper>
            </Flex>
            <SecondaryTopbar.Divider />
            <Dropdown
              css="align-self: unset"
              visible={dropdownVisible}
              onClickOutside={() => setDropdownVisible(false)}
              content={
                <Menu>
                  <Menu.Header>{t('ext-pipeline-actions')}</Menu.Header>
                  <Button
                    icon="Delete"
                    onClick={() => {
                      setDropdownVisible(false);
                      setIsDeleteDialogOpen(true);
                    }}
                    type="ghost-danger"
                    data-testid="delete-menu-item"
                  >
                    {t('delete-ext-pipeline')}
                  </Button>
                </Menu>
              }
            >
              <Button
                onClick={() => setDropdownVisible(!dropdownVisible)}
                icon="EllipsisHorizontal"
                data-testid="extpipe-actions-dropdown-button"
                aria-label="More pipeline actions"
                iconPlacement="right"
              />
            </Dropdown>
          </Flex>
        }
        title={extpipe.name}
      />
    </StyledHeadingContainer>
  );
};

const StyledHeadingContainer = styled.div`
  border-bottom: 1px solid ${Colors['border--interactive--default']};
`;

const TabsAndActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  align-self: flex-end;
`;

const PageNav = styled.ul`
  && {
    margin: 0;
  }

  list-style: none;
  display: flex;
  height: 56px;
  padding: 0;

  a,
  li {
    display: flex;
    margin: 0;
    padding: 0;

    .tab-link {
      display: flex;
      align-items: center;
      color: ${Colors.black.hex()};
      padding: 4px 1rem 0;
      font-weight: bold;
      border-bottom: 3px solid transparent;

      &:hover {
        background-color: ${Colors['surface--interactive--hover']};
      }
    }

    .active {
      background-color: ${Colors['surface--interactive--toggled-default']};
      border-bottom: 3px solid ${Colors['border--interactive--toggled-default']};
    }
  }
`;
