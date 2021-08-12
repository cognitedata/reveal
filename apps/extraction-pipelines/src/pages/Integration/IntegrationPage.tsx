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
  Icon,
  Input,
  Loader,
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
import { useIntegrationById } from 'hooks/useIntegration';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { useAppEnv } from 'hooks/useAppEnv';
import InteractiveCopyWithText from 'components/InteractiveCopyWithText';
import { IntegrationDetails } from 'components/integration/IntegrationDetails';
import { HEALTH_PATH, RouterParams } from 'routing/RoutingConfig';
import {
  EXT_PIPE_TAB_OVERVIEW,
  EXT_PIPE_TAB_RUN_HISTORY,
} from 'utils/constants';
import { IntegrationHealth } from 'components/integration/IntegrationHealth';
import { IntegrationHeading } from 'components/integration/IntegrationHeading';
import { LinkWrapper } from 'styles/StyledLinks';
import { RunFilterProvider } from 'hooks/runs/RunsFilterContext';
import { IntegrationBreadcrumbs } from 'components/navigation/breadcrumbs/IntegrationBreadcrumbs';
import { Span3 } from 'styles/grid/StyledGrid';
import { CapabilityCheck } from 'components/accessCheck/CapabilityCheck';
import { EXTPIPES_READS } from 'model/AclAction';
import { createExtPipePath } from 'utils/baseURL';
import { ids } from 'cogs-variables';
import { useQueryClient } from 'react-query';
import { deleteExtractionPipeline } from 'utils/IntegrationsAPI';
import { ErrorBox } from 'components/error/ErrorBox';

const PageNav = styled.ul`
  ${Span3};
  margin: 0;
  padding: 1rem 0 0.8rem 0;
  list-style: none;
  display: flex;
  border-bottom: 0.0625rem solid ${Colors['greyscale-grey3'].hex()};
  li {
    margin: 0;
    padding: 0;
    &:first-child {
      margin: 0 0 0 1rem;
    }
    .tab-link {
      padding: 0.75rem 1rem;
      margin: 0 1rem;
      color: ${Colors.black.hex()};
      font-weight: bold;
      &:hover {
        background-color: ${Colors['midblue-7'].hex()};
      }
      &.active {
        border-bottom: 3px solid ${Colors.primary.hex()};
      }
    }
  }
`;

const IconWithSpace = styled(Icon)`
  margin-right: 1rem;
`;

interface IntegrationPageProps {}
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

const IntegrationPage: FunctionComponent<IntegrationPageProps> = () => {
  const { pathname, search } = useLocation();
  const { path, url } = useRouteMatch();
  const { origin } = useAppEnv();
  const { id } = useParams<RouterParams>();
  const history = useHistory();
  const { project } = useAppEnv();
  const queryClient = useQueryClient();
  const { setIntegration } = useSelectedIntegration();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { data: integration, isLoading, error } = useIntegrationById(
    parseInt(id, 10)
  );
  useEffect(() => {
    if (integration) {
      setIntegration(integration);
    }
  }, [integration, setIntegration]);

  const deletePipeline = useCallback(() => {
    if (integration == null) return;
    deleteExtractionPipeline(integration.id)
      .then(() => {
        toast.success(
          <div>
            <h3>Extraction pipeline deleted</h3>
            <span>
              The extraction pipeline &quot;{integration.name}&quot; was
              successfully deleted
            </span>
          </div>,
          {
            autoClose: 4000,
            position: 'bottom-right',
          }
        );
        setIsDeleteDialogOpen(false);
        queryClient.invalidateQueries(['integrations', project]).then(() => {
          // queryClient.invalidateQueries([
          //   'integration',
          //   integration.id,
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
  }, [integration, history, project, queryClient]);

  if (error != null) {
    return (
      <FullPageLayout
        pageHeadingText="Extraction pipeline"
        breadcrumbs={<IntegrationBreadcrumbs />}
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
  return isLoading || integration == null ? (
    <Loader />
  ) : (
    <RunFilterProvider>
      <FullPageLayout
        pageHeadingText={integration.name}
        pageHeading={<IntegrationHeading />}
        headingSide={
          <div>
            <LinkWrapper>
              <InteractiveCopyWithText
                id="copy-link-this-page"
                textToCopy={`${origin}${pathname}${search}`}
                copyType="pageLink"
              >
                <>Copy link to this page</>
              </InteractiveCopyWithText>
              <DeleteDialog
                isOpen={isDeleteDialogOpen}
                doDelete={deletePipeline}
                pipelineName={integration.name}
                close={() => {
                  setIsDeleteDialogOpen(false);
                }}
              />
              <Button
                type="ghost-danger"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <IconWithSpace type="Trash" />
                Delete extraction pipeline
              </Button>
            </LinkWrapper>
          </div>
        }
        breadcrumbs={<IntegrationBreadcrumbs integration={integration} />}
      >
        <PageNav>
          <li>
            <NavLink to={{ pathname: url, search }} exact className="tab-link">
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
        <Switch>
          <Route exact path={path}>
            <IntegrationDetails />
          </Route>
          <Route path={`${path}/${HEALTH_PATH}`}>
            <IntegrationHealth integration={integration} />
          </Route>
        </Switch>
      </FullPageLayout>
    </RunFilterProvider>
  );
};

export default () => (
  <CapabilityCheck
    requiredPermissions={EXTPIPES_READS}
    topLevelHeading="Extraction pipeline"
  >
    <IntegrationPage />
  </CapabilityCheck>
);
