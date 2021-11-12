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
  Modal,
  toast,
} from '@cognite/cogs.js';
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
import { useAppEnv } from 'hooks/useAppEnv';
import { ExtpipeDetails } from 'components/extpipe/ExtpipeDetails';
import { HEALTH_PATH, RouterParams } from 'routing/RoutingConfig';
import {
  EXT_PIPE_TAB_OVERVIEW,
  EXT_PIPE_TAB_RUN_HISTORY,
} from 'utils/constants';
import { ExtpipeRunHistory } from 'components/extpipe/ExtpipeRunHistory';
import { ExtpipeHeading } from 'components/extpipe/ExtpipeHeading';
import { LinkWrapper } from 'styles/StyledLinks';
import { RunFilterProvider } from 'hooks/runs/RunsFilterContext';
import { ExtpipeBreadcrumbs } from 'components/navigation/breadcrumbs/ExtpipeBreadcrumbs';
import { Span3 } from 'styles/grid/StyledGrid';
import { CapabilityCheck } from 'components/accessCheck/CapabilityCheck';
import { EXTPIPES_READS } from 'model/AclAction';
import { createExtPipePath } from 'utils/baseURL';
import { ids } from 'cogs-variables';
import { useQueryClient } from 'react-query';
import { deleteExtractionPipeline } from 'utils/ExtpipesAPI';
import { ErrorBox } from 'components/error/ErrorBox';

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

interface ExtpipePageProps {}
const DeleteDialog: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  doDelete: () => void;
  pipelineName: string;
}> = (props) => {
  const [inputText, setInputText] = useState('');
  const isDisabled = inputText.toLocaleLowerCase() !== 'delete';
  const { close } = props;
  const closeCallback = useCallback(() => {
    setInputText('');
    close();
  }, [close]);
  return (
    <Modal
      title={`Delete "${props.pipelineName}"?`}
      okDisabled={isDisabled}
      visible={props.isOpen}
      okText="Delete"
      onCancel={closeCallback}
      onOk={props.doDelete}
      appElement={document.getElementsByClassName(ids.styleScope).item(0)!}
      getContainer={() =>
        document.getElementsByClassName(ids.styleScope).item(0) as any
      }
    >
      <p>
        This will remove the extraction pipeline and its metadata and run
        history. It will NOT delete any data already ingested through the
        pipeline.
      </p>
      <p>Are you sure you want to delete &quot;{props.pipelineName}&quot;?</p>
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
    </Modal>
  );
};

const ExtpipePage: FunctionComponent<ExtpipePageProps> = () => {
  const { search } = useLocation();
  const { path, url } = useRouteMatch();
  const { id } = useParams<RouterParams>();
  const history = useHistory();
  const { project } = useAppEnv();
  const queryClient = useQueryClient();
  const { setExtpipe } = useSelectedExtpipe();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { data: extpipe, isLoading, error } = useExtpipeById(parseInt(id, 10));
  useEffect(() => {
    if (extpipe) {
      setExtpipe(extpipe);
    }
  }, [extpipe, setExtpipe]);

  const deletePipeline = useCallback(() => {
    if (extpipe == null) return;
    deleteExtractionPipeline(extpipe.id)
      .then(() => {
        toast.success(
          <div>
            <h3>Extraction pipeline deleted</h3>
            <span>
              The extraction pipeline &quot;{extpipe.name}&quot; was
              successfully deleted
            </span>
          </div>,
          {
            autoClose: 4000,
            position: 'bottom-right',
          }
        );
        setIsDeleteDialogOpen(false);
        queryClient.invalidateQueries(['extpipes', project]).then(() => {
          // queryClient.invalidateQueries([
          //   'extpipe',
          //   extpipe.id,
          //   project,
          // ]);
          history.push(createExtPipePath());
        });
      })
      .catch(() => {
        toast.error(
          <div>
            <h3>Failed to delete extraction pipeline</h3>
            <span>
              Something went wrong when attempting to delete the extraction
              pipeline.
            </span>
          </div>,
          {
            autoClose: 4000,
            position: 'bottom-right',
          }
        );
        setIsDeleteDialogOpen(false);
      });
  }, [extpipe, history, project, queryClient]);

  const [dropdownVisible, setDropdownVisible] = useState(false);

  if (error != null) {
    return (
      <FullPageLayout
        pageHeadingText="Extraction pipeline"
        breadcrumbs={<ExtpipeBreadcrumbs />}
      >
        <ErrorBox heading={`Extraction pipeline id: '${id}' not found`}>
          <p>
            Extraction pipeline does not exist, or you may lack sufficient
            access rights.
          </p>
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
                    {EXT_PIPE_TAB_OVERVIEW}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to={{ pathname: `${url}/${HEALTH_PATH}`, search }}
                    exact
                    className="tab-link"
                  >
                    {EXT_PIPE_TAB_RUN_HISTORY}
                  </NavLink>
                </li>
              </PageNav>
              <Dropdown
                css="align-self: unset"
                visible={dropdownVisible}
                onClickOutside={() => setDropdownVisible(false)}
                content={
                  <Menu>
                    <Menu.Header>Actions for extraction pipeline</Menu.Header>
                    <Menu.Item
                      onClick={() => {
                        setDropdownVisible(false);
                        setIsDeleteDialogOpen(true);
                      }}
                      color="danger"
                    >
                      Delete
                    </Menu.Item>
                  </Menu>
                }
              >
                <Button
                  onClick={() => setDropdownVisible(!dropdownVisible)}
                  icon="MoreOverflowEllipsisHorizontal"
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

export default () => (
  <CapabilityCheck
    requiredPermissions={EXTPIPES_READS}
    topLevelHeading="Extraction pipeline"
  >
    <ExtpipePage />
  </CapabilityCheck>
);
