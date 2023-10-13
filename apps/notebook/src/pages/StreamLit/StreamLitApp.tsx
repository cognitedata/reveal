import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
  ForwardedRef,
  useImperativeHandle,
} from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';

import styled from 'styled-components';

import * as Sentry from '@sentry/react';
import { Modal } from 'antd';
import noop from 'lodash/noop';
import { useDebouncedCallback } from 'use-debounce';

import { trackEvent } from '@cognite/cdf-route-tracker';
import sdk, { getToken, getUserInformation } from '@cognite/cdf-sdk-singleton';
import { createLink } from '@cognite/cdf-utilities';
import {
  Button,
  Flex,
  Tooltip,
  Title,
  Dropdown,
  Menu,
  Icon,
  Chip,
} from '@cognite/cogs.js';

import zIndex from '../../utils/zIndex';

import AppSettings from './AppSettings';
import { saveApp } from './common';
import { ShareModal } from './components/ShareModal';
import { Editor } from './Editor/Editor';
import { ALLOWED_FEATURE_POLICY } from './policy';
import { AppData, StreamLitAppSpec } from './types';

export const NOTEBOOK_ORIGIN = 'https://andeplane.github.io/stlite-dev';

// Every 2 minutes
const INTERVAL = 2 * 60 * 1000;

type Props = {
  recheckTokenInterval?: number;
};

const HIDE_CODE_URL_PARAM = 'hideCode';
const HIDE_TOOLBAR_URL_PARAM = 'hideToolbar';
const SHARE_URL_PARAM = 'share';
const QR_URL_PARAM = 'qr';

const StreamLitApp = React.forwardRef(
  (
    { recheckTokenInterval = INTERVAL }: Props,
    ref: ForwardedRef<HTMLIFrameElement | null>
  ) => {
    const params = useParams();
    const myIframe = useRef<HTMLIFrameElement>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [iframeKey, setIframeKey] = useState(0); // used to force iframe to reload

    const [showAppSettings, setShowAppSettings] = useState(false);
    const [showShare, setShowShare] = useState(false);

    const [app, setApp] = useState<StreamLitAppSpec | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);
    const [initialApp, setInitialApp] = useState<StreamLitAppSpec | undefined>(
      undefined
    );
    const [searchParams, setSearchParams] = useSearchParams();

    const isOnMobile = window.innerWidth < 768;

    const { hideCode, share, hideToolbar, qr } = useMemo(
      () => ({
        hideCode: searchParams.get(HIDE_CODE_URL_PARAM) || isOnMobile,
        share: searchParams.get(SHARE_URL_PARAM),
        qr: searchParams.get(QR_URL_PARAM),
        hideToolbar: searchParams.get(HIDE_TOOLBAR_URL_PARAM) || isOnMobile,
      }),
      [searchParams, isOnMobile]
    );

    const fileExternalId = params.appId;
    const navigate = useNavigate();

    useEffect(() => {
      trackEvent('StreamlitApps.Open', {
        fromShared: share,
        fromQr: qr,
        fileExternalId,
      });
    }, [share, qr, fileExternalId]);

    useEffect(() => {
      const navElement = document.getElementById('navigation');
      if (navElement) {
        navElement.style.display = hideToolbar ? 'none' : 'block';
      }
    }, [hideToolbar]);

    useEffect(() => {
      const handleKeyDown = (event: any) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
          event.preventDefault();
          if (app) {
            saveApp(app, sdk);
            setInitialApp(app);
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [app]);

    const setHide = useCallback(
      (param: string, shouldHide: boolean) => {
        trackEvent('StreamlitApps.HideComponent', {
          component: param,
          hidden: shouldHide,
        });
        setSearchParams((prev) => {
          if (shouldHide) {
            prev.set(param, 'true');
          } else {
            prev.delete(param);
          }
          return prev;
        });
      },
      [setSearchParams]
    );

    useEffect(() => {
      const handleBeforeUnload = (event: any) => {
        if (app && initialApp && app.code !== initialApp.code) {
          event.preventDefault();
          return (event.returnValue = 'Are you sure you want to close?');
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }, [app, initialApp]);

    const syncApp = useCallback(() => {
      // Send latest code to the app
      if (app && app.code && Object.keys(app.code.files).length > 0) {
        myIframe.current?.contentWindow?.postMessage(
          {
            app: {
              ...app.code,
            },
          },

          NOTEBOOK_ORIGIN
        );
      }
    }, [app]);

    // Sync app when streamlit is ready
    useEffect(() => {
      const handler = async (event: MessageEvent<any>) => {
        if (typeof event.data === 'object' && 'streamlitstatus' in event.data) {
          if (event.data.streamlitstatus === 'ready') {
            syncApp();
          }
        }
      };

      window.addEventListener('message', handler, false);
      return () => {
        window.removeEventListener('message', handler);
      };
    }, [syncApp]);

    useEffect(() => {
      // Sync app on all changes
      syncApp();
    }, [app, syncApp]);

    const filesWithChanges = useMemo(() => {
      if (!app || !initialApp) {
        return [];
      }
      const newFileWithChanges: string[] = [];
      Object.keys(app.code.files).forEach((file) => {
        if (
          app.code.files[file]?.content !== initialApp.code.files[file]?.content
        ) {
          newFileWithChanges.push(file);
        }
      });
      return newFileWithChanges;
    }, [app, initialApp]);

    useEffect(() => {
      (async () => {
        if (fileExternalId) {
          setIsLoading(true);
          sdk.files
            .retrieve([{ externalId: fileExternalId }])
            .then(async (files) => {
              const urls = await sdk.files.getDownloadUrls([
                { externalId: fileExternalId },
              ]);
              if (urls.length > 0) {
                const file = files[0];
                const response = await fetch(urls[0].downloadUrl);
                const responseText = await response.text();
                let code: AppData = {
                  requirements: [],
                  entrypoint: 'main.py',
                  files: {
                    'main.py': { content: { text: '', $case: 'text' } },
                  },
                };
                try {
                  code = JSON.parse(responseText);
                  if (!code.entrypoint) {
                    // Backwards compatibility
                    code.entrypoint = 'main.py';
                  }
                } catch (e) {
                  Sentry.captureException(e);
                  // eslint-disable-next-line no-console
                  console.error('unable to parse file', e);
                }
                const appData: StreamLitAppSpec = {
                  name: file.metadata?.name || '',
                  description: file.metadata?.description || '',
                  fileExternalId: file.externalId || '',
                  creator: file.metadata?.creator || '',
                  createdAt: file.createdTime,
                  published: file.metadata?.published === 'true' ? true : false,
                  dataSetId: file.dataSetId,
                  code,
                };

                setApp(appData);
                setInitialApp(appData);
                setIsLoading(false);
              }
            })
            .catch((newError: Error) => {
              console.log(newError);
              if ('status' in newError && newError.status === 403) {
                setError('You do not have access to this file');
              } else {
                throw newError;
              }
            });
        }
      })();
    }, [fileExternalId]);

    const onSaveClick = useCallback(async () => {
      if (app) {
        saveApp(app, sdk);
        setInitialApp(app);
      }
    }, [app]);

    const fetchAndSendToken = useCallback(async () => {
      return getToken().then(async (newToken) => {
        const userInfo = (await getUserInformation()) as {
          email?: string;
          mail?: string;
        };
        const email = userInfo?.email || userInfo?.mail;
        // send token only if the token has changed since last time
        myIframe.current?.contentWindow?.postMessage(
          {
            token: newToken,
            baseUrl: sdk.getBaseUrl(),
            project: sdk.project,
            email,
          },
          NOTEBOOK_ORIGIN
        );

        return newToken;
      });
    }, []);

    // Add handler from notebook
    useEffect(() => {
      const handler = async (event: MessageEvent<any>) => {
        if (event.data === 'getToken') {
          await fetchAndSendToken();
        }
      };

      window.addEventListener('message', handler, false);
      return () => {
        window.removeEventListener('message', handler);
      };
    }, [fetchAndSendToken]);

    // Add interval for checking token
    useEffect(() => {
      const interval = setInterval(
        () => fetchAndSendToken(),
        // try and fetch token every 2 minutes
        recheckTokenInterval
      );
      return () => {
        if (interval) {
          clearTimeout(interval);
        }
      };
    }, [fetchAndSendToken, recheckTokenInterval]);

    const changeHandler = (file: string, newValue: string | undefined = '') => {
      setApp((currApp) => ({
        ...currApp!,
        code: {
          ...currApp!.code,
          files: {
            ...currApp!.code.files,
            [file]: { content: { text: newValue, $case: 'text' } },
          },
        },
      }));
    };

    const debouncedChangeHandler = useDebouncedCallback(changeHandler, 500);

    useImperativeHandle(ref, () => myIframe.current as any);

    if (error) {
      return <Flex style={{ padding: 24 }}>{error}</Flex>;
    }

    return (
      <>
        <Flex
          style={{
            height: '100%',
            background: 'rgb(245, 245, 245)',
            ...(hideToolbar && {
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: zIndex.MAXIMUM,
            }),
          }}
          direction="column"
        >
          {!share && !isOnMobile && (
            <Flex
              gap={6}
              style={{
                padding: 12,
                borderBottom: '1px solid var(--cogs-border--muted)',
                background: '#fff',
              }}
              alignItems="center"
            >
              {!hideToolbar && (
                <>
                  <Tooltip content="Go back to app list page">
                    <Button
                      icon="ArrowLeft"
                      aria-label="ArrowLeft"
                      onClick={() => {
                        if (filesWithChanges.length > 0) {
                          Modal.confirm({
                            title: 'Unsaved changes',
                            content: `You have unsaved changes in the following files: ${filesWithChanges.join(
                              ', '
                            )}. Are you sure you want to leave?`,
                            onOk: () => {
                              navigate(createLink('/streamlit-apps'));
                            },
                          });
                          return;
                        }

                        navigate(createLink('/streamlit-apps'));
                      }}
                    />
                  </Tooltip>
                  <Flex
                    style={{ flex: 1, marginLeft: 8 }}
                    gap={8}
                    alignItems="center"
                  >
                    <Title level={5}>{app?.name}</Title>
                    <Chip
                      size="x-small"
                      type={app?.published ? 'neutral' : 'default'}
                      label={app?.published ? 'Published' : 'Draft'}
                    />
                  </Flex>

                  <Button
                    disabled={app?.code === initialApp?.code}
                    onClick={onSaveClick}
                  >
                    Save
                  </Button>
                </>
              )}
              <Dropdown
                hideOnClick
                content={
                  <Menu>
                    <Menu.Item
                      hasCheckbox
                      checkboxProps={{
                        checked: !hideCode,
                        onChange: () => {
                          setHide(HIDE_CODE_URL_PARAM, !hideCode);
                        },
                      }}
                    >
                      Show Code
                    </Menu.Item>
                    <Menu.Item
                      hasCheckbox
                      checkboxProps={{
                        checked: !hideToolbar,
                        onChange: () => {
                          setHide(HIDE_TOOLBAR_URL_PARAM, !hideToolbar);
                        },
                      }}
                    >
                      Show Toolbar
                    </Menu.Item>
                  </Menu>
                }
              >
                <Button icon="EyeShow">Show / Hide</Button>
              </Dropdown>
              <Button
                icon="Share"
                onClick={() => {
                  trackEvent('StreamlitApps.ShareClicked', { fileExternalId });
                  setShowShare(true);
                }}
              >
                Share
              </Button>
            </Flex>
          )}
          <Flex style={{ flex: 1 }} direction="row">
            {!hideCode && (
              <>
                {!isLoading && app && (
                  <Editor
                    appData={app.code}
                    filesWithChanges={filesWithChanges}
                    onRequirementsChange={noop}
                    onChange={debouncedChangeHandler}
                    onShowSettingsClicked={() => setShowAppSettings(true)}
                    onAppFilesChange={async (newAppData) => {
                      const newApp = {
                        ...app,
                        code: newAppData,
                      };
                      await saveApp(newApp, sdk);
                      setApp(newApp);
                      setInitialApp(newApp);
                      setIframeKey((currKey) => currKey + 1);
                    }}
                  />
                )}
                {isLoading && (
                  <Flex
                    style={{ flex: 1 }}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon type="Loader" size={32} />
                  </Flex>
                )}
              </>
            )}
            <IFrame
              style={{ flex: 1 }}
              data-testid="iframe-for-notebook"
              ref={myIframe}
              key={iframeKey}
              src={`${NOTEBOOK_ORIGIN}`}
              allow={ALLOWED_FEATURE_POLICY}
            ></IFrame>
          </Flex>
        </Flex>

        {showAppSettings && app && (
          <AppSettings
            app={app}
            onClose={() => setShowAppSettings(false)}
            onSave={async (newApp: StreamLitAppSpec) => {
              // We need to refresh Streamlit if requirements or entrypoint changed
              const needsRefresh =
                JSON.stringify(newApp.code.requirements) !==
                  JSON.stringify(app.code.requirements) ||
                newApp.code.entrypoint !== app.code.entrypoint;

              trackEvent('StreamlitApps.ChangeSettings', {
                updatedRequirements: needsRefresh,
                requirements: newApp.code.requirements,
                entryPoint: newApp.code.entrypoint,
              });

              // Save to CDF
              await saveApp(newApp, sdk);
              // set app objects
              setApp(newApp);
              setInitialApp(newApp);
              if (needsRefresh) {
                // This will trigger refresh of the iframe
                setIframeKey((currKey) => currKey + 1);
              }
            }}
          />
        )}
        {showShare && (
          <ShareModal
            appFileExternalId={fileExternalId}
            appName={app!.name}
            onClose={() => setShowShare(false)}
          />
        )}
      </>
    );
  }
);

const IFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

StreamLitApp.displayName = 'StreamLit';

export default StreamLitApp;
