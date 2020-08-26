import React, { useState } from 'react';
import { Button, Icon } from '@cognite/cogs.js';
import {
  Configuration,
  DummyUser,
  Source as SourceType,
} from 'typings/interfaces';
import {
  Arrow,
  Source,
  SystemConfiguration,
  SystemHeader,
  Target,
} from '../elements';

enum UIState {
  INITIAL,
  SELECT_PROJECT,
  SELECT_TAGS,
  SELECT_TYPES,
  CONFIRMED,
}

const PetrelStudioToOpenWorks = ({ name }: { name?: string }) => {
  const initialConfiguration: Configuration = {
    name,
    source: {
      external_id: '',
      source: SourceType.STUDIO,
    },
    target: {
      external_id: '',
      source: SourceType.OPENWORKS,
    },
    business_tags: [],
    author: DummyUser.ERLAND,
    datatypes: [],
  };

  const [configuration, setConfiguration] = useState<Configuration>(
    initialConfiguration
  );

  const [uiState, setUiState] = useState<UIState>(UIState.INITIAL);

  return (
    <>
      <Source>
        <SystemHeader>
          <b>Petrel Studio</b>
          <Icon type="Settings" />
        </SystemHeader>
        <SystemConfiguration>
          {uiState === UIState.INITIAL && (
            <>
              <p>No Source repository selected</p>
              <Button
                type="primary"
                onClick={() => setUiState(UIState.SELECT_PROJECT)}
              >
                Configure
              </Button>
            </>
          )}
          {uiState === UIState.SELECT_PROJECT && (
            <>
              <p>Select Repository</p>
            </>
          )}
        </SystemConfiguration>
      </Source>
      <Arrow>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 300 31"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
            d="M2 16.6337h296L283.383 2M2 16.6337h296l-14.617 11.973"
          />
        </svg>
      </Arrow>
      <Target>
        <SystemHeader>
          <b>Open Works</b>
          <Icon type="Settings" />
        </SystemHeader>
        <SystemConfiguration>
          <p>No Target project selected</p>
          <Button type="primary">Configure</Button>
        </SystemConfiguration>
      </Target>
    </>
  );
};

export default PetrelStudioToOpenWorks;
