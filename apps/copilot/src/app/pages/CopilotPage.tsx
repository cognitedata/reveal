import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  FusionQAFlow,
  useCopilotContext,
  HRQueryFlow,
  GraphQlQueryFlow,
} from '@fusion/copilot-core';

import sdk from '@cognite/cdf-sdk-singleton';
import { createLink, getProject } from '@cognite/cdf-utilities';

export const CopilotPage = () => {
  const navigate = useNavigate();
  const project = getProject();
  const { registerFlow } = useCopilotContext();

  useEffect(() => {
    const unmount = registerFlow({
      flow: new FusionQAFlow({ sdk }),
      messageActions: {
        text: (message) =>
          message.links?.slice(0, 2).map((link, i) => ({
            content: `Open source ${i}`,
            onClick: () => {
              // modify query params to include page and full screen
              window.open(link.metadata.url, '_blank');
            },
          })) || [],
      },
    });
    const unmount2 = registerFlow({
      flow: new GraphQlQueryFlow({ sdk }),
      messageActions: {
        'data-model-query': (message) => [
          {
            content: 'Debug',
            icon: 'Bug',
            onClick: () => {
              console.log(message);
            },
          },
        ],
      },
    });
    return () => {
      unmount();
      unmount2();
    };
  }, [registerFlow]);

  useEffect(() => {
    if (project === 'cognite2') {
      const unmount = registerFlow({
        flow: new HRQueryFlow({ sdk }),
        messageActions: {
          text: (message) =>
            message.fileLinks?.slice(0, 2).map((link, i) => ({
              content: `Open source ${i}`,
              onClick: () => {
                // modify query params to include page and full screen
                const url = createLink(`/explore/search/file`, {
                  page: link.metadata.page,
                  'full-page': true,
                  journey: `file-${link.metadata.fileId}`,
                });

                navigate(url);
              },
            })) || [],
        },
      });
      return () => {
        unmount();
      };
    }
  }, [registerFlow, project, navigate]);

  return <></>;
};
