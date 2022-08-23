import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useParams } from 'react-router';
import {
  Button,
  Colors,
  Dropdown,
  Input,
  Loader,
  Menu,
  toast,
} from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';
import {
  NavLink,
  Route,
  Switch,
  useHistory,
  useLocation,
  useRouteMatch,
} from 'react-router-dom';
import styled from 'styled-components';
import { FullPageLayout } from 'components/layout/FullPageLayout';
import { useExtpipeById } from 'hooks/useExtpipe';
import { useSelectedExtpipe } from 'hooks/useSelectedExtpipe';
import { ExtpipeDetails } from 'components/extpipe/ExtpipeDetails';
import { HEALTH_PATH, RouterParams } from 'routing/RoutingConfig';
import { ExtpipeRunHistory } from 'components/extpipe/ExtpipeRunHistory';
import { ExtpipeHeading } from 'components/extpipe/ExtpipeHeading';
import { DivFlex, LinkWrapper, Span3 } from 'components/styled';
import { RunFilterProvider } from 'hooks/runs/RunsFilterContext';
import { ExtpipeBreadcrumbs } from 'components/navigation/breadcrumbs/ExtpipeBreadcrumbs';
import { CapabilityCheck } from 'components/accessCheck/CapabilityCheck';
import { EXTPIPES_READS } from 'model/AclAction';
import { createExtPipePath } from 'utils/baseURL';
import { useQueryClient } from 'react-query';
import { deleteExtractionPipeline } from 'utils/ExtpipesAPI';
import { ErrorBox } from 'components/error/ErrorBox';
import { EditModal } from 'components/modals/EditModal';
import { getProject } from '@cognite/cdf-utilities';
import { useTranslation } from 'common';

interface ExtpipePageProps { }

type DeleteDialogProps = {
  isOpen: boolean;
  close: () => void;
  doDelete: () => void;
  pipelineName: string;
};
const DeleteDialog: FunctionComponent<DeleteDialogProps> = ({
  isOpen,
  pipelineName,
  close,
  doDelete,
}) => {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState('');
  const isDisabled = inputText.toLocaleLowerCase() !== 'delete';
  const closeCallback = useCallback(() => {
    setInputText('');
    close();
  }, [close]);
  return (
    <EditModal
      title={`${t('delete')} "${pipelineName}"?`}
      width={450}
      visible={isOpen}
      close={closeCallback}
    >
      <p>{t('delete-ext-pipeline-desc')}</p>
      <p>{t('delete-ext-pipeline-confirm', { extPipeline: pipelineName })}</p>
      <p style={{ marginTop: '1.5rem' }}>
        <Input
          id="delete-input-text"
          value={inputText}
          title="Type DELETE to confirm"
          onChange={(ev) => setInputText(ev.target.value)}
          placeholder="Type here"
          fullWidth
        />
      </p>
      <DivFlex justify="flex-end" css="gap: 0.5rem">
        <Button type="ghost" onClick={closeCallback} data-testId="cancel-btn">
          {t('cancel')}
        </Button>
        <Button type="danger" disabled={isDisabled} onClick={doDelete} data-testId="delete-btn">
          {t('delete')}
        </Button>
      </DivFlex>
    </EditModal>
  );
};

const ExtpipePageComponent: FunctionComponent<ExtpipePageProps> = () => {
  const { t } = useTranslation();
  const { search } = useLocation();
  const { path, url } = useRouteMatch();
  const { id } = useParams<RouterParams>();
  const history = useHistory();
  const project = getProject();
  const queryClient = useQueryClient();
  const { setExtpipe } = useSelectedExtpipe();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { data: extpipe, isLoading, error } = useExtpipeById(parseInt(id, 10));
  const sdk = useSDK();
  useEffect(() => {
    if (extpipe) {
      setExtpipe(extpipe);
    }
  }, [extpipe, setExtpipe]);

  const deletePipeline = useCallback(() => {
    if (extpipe == null) return;
    deleteExtractionPipeline(sdk, extpipe.id)
      .then(() => {
        toast.success(
          <div>
            <h3>{t('delete-ext-pipeline-success')}</h3>
            <span>
              {t('delete-ext-pipeline-success-desc', {
                extPipeline: extpipe.name,
              })}
            </span>
          </div>,
          {
            autoClose: 4000,
            position: 'bottom-right',
          }
        );
        setIsDeleteDialogOpen(false);
        queryClient.invalidateQueries(['extpipes', project]).then(() => {
          history.push(createExtPipePath());
        });
      })
      .catch(() => {
        toast.error(
          <div>
            <h3>{t('delete-ext-pipeline-fail')}</h3>
            <span>{t('delete-ext-pipeline-fail-desc')}</span>
          </div>,
          {
            autoClose: 4000,
            position: 'bottom-right',
          }
        );
        setIsDeleteDialogOpen(false);
      });
  }, [extpipe, history, project, queryClient, sdk, t]);

  const [dropdownVisible, setDropdownVisible] = useState(false);

  if (error != null) {
    return (
      <FullPageLayout
        pageHeadingText={t('extraction-pipeline', { count: 1 })}
        breadcrumbs={<ExtpipeBreadcrumbs />}
      >
        <ErrorBox heading={t('ext-pipeline-not-found', { id })}>
          <p>{t('ext-pipeline-not-found-desc')}</p>
        </ErrorBox>
      </FullPageLayout>
    );
  }
  return isLoading || extpipe == null ? (
    <Loader />
  ) : (
    <RunFilterProvider>
      <FullPageLayout
        pageHeadingText={extpipe.name}
        pageHeading={<ExtpipeHeading />}
        headingSide={
          <LinkWrapper>
            <TabsAndActions>
              <PageNav>
                <li>
                  <NavLink
                    to={{ pathname: url, search }}
                    exact
                    className="tab-link"
                  >
                    {t('overview')}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to={{ pathname: `${url}/${HEALTH_PATH}`, search }}
                    exact
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
                      data-testId="delete-menu-item"
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
        }
        breadcrumbs={<ExtpipeBreadcrumbs extpipe={extpipe} />}
      >
        <Switch>
          <Route exact path={path}>
            <ExtpipeDetails />
          </Route>
          <Route path={`${path}/${HEALTH_PATH}`}>
            <ExtpipeRunHistory extpipe={extpipe} />
          </Route>
        </Switch>
      </FullPageLayout>
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        doDelete={deletePipeline}
        pipelineName={extpipe.name}
        close={() => {
          setIsDeleteDialogOpen(false);
        }}
      />
    </RunFilterProvider>
  );
};

const ExtpipePage = () => {
  const { t } = useTranslation();
  return (
    <CapabilityCheck
      requiredPermissions={EXTPIPES_READS}
      topLevelHeading={t('extraction-pipeline', { count: 1 })}
    >
      <ExtpipePageComponent />
    </CapabilityCheck>
  );
};

const PageNav = styled.ul`
  ${Span3};

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
        border-bottom: 5px solid ${Colors['midblue-7'].hex()};
      }

      &.active {
        border-bottom: 5px solid ${Colors.primary.hex()};
      }
    }
  }
`;

const TabsAndActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  align-self: flex-end;
`;

export default ExtpipePage;
