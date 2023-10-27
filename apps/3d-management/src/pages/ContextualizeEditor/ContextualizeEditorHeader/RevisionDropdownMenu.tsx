import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { UseQueryOptions } from '@tanstack/react-query';

import { formatTime, createLink } from '@cognite/cdf-utilities';
import { Menu, Button, Dropdown, Heading, toast } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

import { useTranslation } from '@data-exploration-lib/core';
import {
  use3DRevisionsQuery,
  Revision3DWithIndex,
} from '@data-exploration-lib/domain-layer';

import ErrorToast from '../../../components/ContextualizeThreeDViewer/components/ErrorToast';
import { useThreeDModelName } from '../../../components/ContextualizeThreeDViewer/hooks/useThreeDModelName';
import { ThreeDModelType } from '../../../components/ContextualizeThreeDViewer/types';
import { getThreeDModelType } from '../../../components/ContextualizeThreeDViewer/utils/getThreeDModelType';

// Link to data-explorer that employs the same pattern: data-exploration/src/app/containers/ThreeD/title/MenuItems/MainThreeDModelMenuItem.tsx

type RevisionOpts<T> = UseQueryOptions<Revision3DWithIndex[], unknown, T>;

export const useRevisionIndex = (
  modelId?: number,
  revisionId?: number,
  opts?: Omit<
    RevisionOpts<number | undefined>,
    'queryKey' | 'queryFn' | 'select'
  >
) => {
  return use3DRevisionsQuery(modelId, {
    select: (revisions = []) => {
      const index = [...revisions]
        .reverse()
        .findIndex((r) => r.id === revisionId);
      return index >= 0 ? index + 1 : index;
    },
    ...opts,
  });
};

type RevisionDropdownMenuProps = {
  modelId: number;
  revisionId: number;
};

const RevisionDropdownMenu: React.FC<RevisionDropdownMenuProps> = ({
  modelId,
  revisionId,
}) => {
  const sdk = useSDK();
  const [modelType, setModelType] = useState<ThreeDModelType>(
    ThreeDModelType.NONE
  );
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: revisions = [], isFetching } = use3DRevisionsQuery(modelId);

  const [isRevisionDropdownOpen, setIsRevisionDropdownOpen] = useState(false);
  const { data: revisionIndex } = useRevisionIndex(modelId, revisionId, {
    enabled: Boolean(revisionId),
  });
  const modelName = useThreeDModelName(modelId) ?? modelId;

  useEffect(() => {
    const loadThreeDModel = async () => {
      const threeDModelType = await getThreeDModelType(
        sdk,
        modelId,
        revisionId
      );
      if (threeDModelType === ThreeDModelType.UNKNOWN) {
        toast.error(
          <ErrorToast
            error={
              new Error(
                'Model type error or not recognized. Please refresh the page or try another model'
              )
            }
          />,
          {
            autoClose: false,
          }
        );
      }
      setModelType(threeDModelType);
    };

    loadThreeDModel();
  }, [sdk, modelId, revisionId]);

  if (!modelId) {
    return (
      <Menu>
        <Menu.Header>
          {t('NO_REVISIONS_AVAILABLE', 'No revisions available')}
        </Menu.Header>
      </Menu>
    );
  }

  const toggleRevisionDropdown = () => {
    setIsRevisionDropdownOpen(!isRevisionDropdownOpen);
  };

  return (
    <>
      <StyledInfoContainer>
        <StyledInfoText>
          <Heading level={5}>{modelName}</Heading>
        </StyledInfoText>
        <StyledRevisionInfoText>
          {t('REVISION_WITH_INDEX', `Revision ${revisionIndex}`, {
            revisionIndex,
          })}
        </StyledRevisionInfoText>
      </StyledInfoContainer>
      <Dropdown
        content={
          <Menu loading={isFetching}>
            {revisions?.map(({ createdTime, id, index, published }) => (
              <Menu.Item
                key={id}
                toggled={id === revisionId}
                disabled={
                  modelType === ThreeDModelType.CAD && id !== revisionId
                }
                description={
                  published
                    ? t('PUBLISHED', 'Published')
                    : t(
                        'CREATED_WITH_TIME',
                        `Created: ${formatTime(createdTime.getTime())}`,
                        {
                          time: formatTime(createdTime.getTime()),
                        }
                      )
                }
                onClick={() => {
                  if (id === revisionId) {
                    return;
                  }
                  navigate(
                    createLink(
                      `/3d-models/contextualize-editor/${modelId}/revisions/${id}`
                    )
                  );
                }}
              >
                {t('REVISION_WITH_INDEX', `Revision ${index}`, {
                  index,
                })}
              </Menu.Item>
            ))}
          </Menu>
        }
      >
        <Button
          onClick={toggleRevisionDropdown}
          icon="ChevronDown"
          aria-label="Revision dropdown menu"
          type="ghost"
        />
      </Dropdown>
    </>
  );
};

export default RevisionDropdownMenu;

const StyledInfoContainer = styled.div`
  padding: 10px 12px;
  border-radius: 4px;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const StyledInfoText = styled.p`
  margin: 0;
  font-size: 12px;
`;

const StyledRevisionInfoText = styled.p`
  margin: 0;
  color: gray;
  font-size: 12px;
`;
