import React, { useState } from 'react';
import { useDeletePipeline, useSelectedExtpipe } from 'hooks/useExtpipe';
import { nameSchema } from 'utils/validation/extpipeSchemas';
import InlineEdit from 'components/extpipe/InlineEdit';
import {
  Button,
  Colors,
  Dropdown,
  Flex,
  Icon,
  Menu,
  Title,
  toast,
} from '@cognite/cogs.js';
import styled from 'styled-components';
import { rootUpdate } from 'hooks/details/useDetailsUpdate';
import { LinkWrapper, PAGE_MARGIN, StyledNavLink } from 'components/styled';
import { useOneOfPermissions } from 'hooks/useOneOfPermissions';
import { EXTPIPES_WRITES } from 'model/AclAction';
import { LastRunStatusMarker } from 'components/extpipes/cols/StatusMarker';
import { createExtPipePath } from 'utils/baseURL';
import { useTranslation } from 'common';
import { NavLink, useHistory } from 'react-router-dom';
import { EXT_PIPE_PATH, HEALTH_PATH } from 'routing/RoutingConfig';
import { DeleteDialog } from './DeleteModal';

export const ExtpipeHeading = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { data: extpipe } = useSelectedExtpipe();
  const perm = useOneOfPermissions(EXTPIPES_WRITES);
  const canEdit = perm.data;
  const { mutate } = useDeletePipeline({
    onSuccess() {
      toast.success(t('delete-ext-pipeline-success'), {
        toastId: 'delete-extpipeline',
        position: 'bottom-right',
      });
      history.replace(createExtPipePath());
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
    <>
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        doDelete={() => mutate(extpipe.id)}
        pipelineName={extpipe.name}
        close={() => {
          setIsDeleteDialogOpen(false);
        }}
      />
      <Flex
        id="heading"
        style={{
          borderBottom: `1px solid ${Colors['greyscale-grey5'].hex()}`,
        }}
        justifyContent="space-between"
        alignItems="stretch"
      >
        <Flex alignItems="center" style={{ padding: `1rem ${PAGE_MARGIN}` }}>
          <StyledNavLink
            to={{
              pathname: createExtPipePath(),
            }}
          >
            <div css="display: flex; align-items: center;">
              <Icon type="ArrowLeft" />
            </div>
          </StyledNavLink>
          <InlineEdit
            name="name"
            defaultValues={{ name: extpipe?.name }}
            schema={nameSchema}
            updateFn={rootUpdate({ extpipe, name: 'name' })}
            label={t('ext-pipeline-name')}
            viewComp={<StyledTitle level={1}>{extpipe.name}</StyledTitle>}
            canEdit={canEdit}
          />
          <span style={{ marginRight: '1rem' }}>{t('last-status')}:</span>{' '}
          <LastRunStatusMarker externalId={extpipe.externalId} />
        </Flex>
        <Flex alignItems="end">
          <LinkWrapper>
            <TabsAndActions>
              <PageNav>
                <li>
                  <NavLink
                    to={{
                      pathname: createExtPipePath(
                        `/${EXT_PIPE_PATH}/${extpipe.id}`
                      ),
                    }}
                    isActive={(_, { pathname }) => {
                      return !pathname.includes(HEALTH_PATH);
                    }}
                    className="tab-link"
                  >
                    {t('overview')}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to={{
                      pathname: createExtPipePath(
                        `/${EXT_PIPE_PATH}/${extpipe.id}/${HEALTH_PATH}`
                      ),
                    }}
                    isActive={(_, { pathname }) => {
                      return pathname.includes(HEALTH_PATH);
                    }}
                    className="tab-link"
                  >
                    {t('run-history')}
                  </NavLink>
                </li>
              </PageNav>
              <Dropdown
                css="align-self: unset"
                visible={dropdownVisible}
                onClickOutside={() => setDropdownVisible(false)}
                content={
                  <Menu>
                    <Menu.Header>{t('ext-pipeline-actions')}</Menu.Header>
                    <Menu.Item
                      onClick={() => {
                        setDropdownVisible(false);
                        setIsDeleteDialogOpen(true);
                      }}
                      color="danger"
                      data-testid="delete-menu-item"
                    >
                      {t('delete')}
                    </Menu.Item>
                  </Menu>
                }
              >
                <Button
                  onClick={() => setDropdownVisible(!dropdownVisible)}
                  icon="EllipsisHorizontal"
                  data-testid="extpipe-actions-dropdown-button"
                  aria-label="More pipeline actions"
                  iconPlacement="right"
                  type="ghost"
                />
              </Dropdown>
            </TabsAndActions>
          </LinkWrapper>
        </Flex>
      </Flex>
    </>
  );
};

const StyledTitle = styled(Title)`
  &.cogs-title-1 {
    font-size: 1.5rem;
    line-height: normal;
    margin: 0;
  }
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

  padding: 1rem 0 0.8rem 0;
  list-style: none;
  display: flex;

  a,
  li {
    margin: 0;
    padding: 0;

    .tab-link {
      padding: 0.75rem 1rem;
      color: ${Colors.black.hex()};
      font-weight: bold;

      &:hover {
        background-color: ${Colors['midblue-7'].hex()};
        border-bottom: 3px solid ${Colors['midblue-7'].hex()};
      }

      &.active {
        border-bottom: 3px solid ${Colors.primary.hex()};
      }
    }
  }
`;
