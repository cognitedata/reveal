import { AuthContext, AuthProvider } from '@cognite/react-container';
import * as React from 'react';
import { ProjectResponse } from 'types/ApiInterface';
import { NewConfiguration, Source } from 'typings/interfaces';

import { ChangeType } from '../types';

export const useSourceConfiguration = ({ name }: { name: string | null }) => {
  const { authState } = React.useContext<AuthContext>(AuthProvider);
  const user = authState?.email;

  const [configuration, setConfiguration] = React.useState<NewConfiguration>({
    name,
    source: {
      external_id: '',
      instance: '',
      source: Source.STUDIO,
    },
    target: {
      external_id: '',
      instance: '',
      source: Source.OPENWORKS,
    },
    business_tags: [],
    author: String(user),
    datatypes: [],
    data_status: [],
  });

  function updateSourceRepository(value: ProjectResponse) {
    setConfiguration((prevState) => ({
      ...prevState,
      source: {
        ...prevState.source,
        instance: (value.instance || '').toString(),
        external_id: (value.external_id || '').toString(),
      },
      business_tags: [],
      datatypes: [],
      data_status: [],
    }));
  }

  function updateTargetProject(value: ProjectResponse) {
    setConfiguration((prevState) => ({
      ...prevState,
      target: {
        ...prevState.target,
        instance: (value.instance || '').toString(),
        external_id: (value.external_id || '').toString(),
      },
    }));
  }

  function updateBusinessTags(value: any) {
    setConfiguration((prevState) => ({
      ...prevState,
      business_tags: value,
    }));
  }

  function updateDataTypes(value: any) {
    setConfiguration((prevState) => ({
      ...prevState,
      datatypes: value,
    }));
  }

  function updateDataStatus(value: any) {
    setConfiguration((prevState) => ({
      ...prevState,
      data_status: value,
    }));
  }

  function updateAuthor() {
    setConfiguration((prevState) => ({
      ...prevState,
      author: String(user),
    }));
  }

  const handleConfigurationChange = (type: ChangeType, value: any) => {
    if (type === ChangeType.REPO) {
      updateSourceRepository(value);
    } else if (type === ChangeType.PROJECT) {
      updateTargetProject(value);
    } else if (type === ChangeType.TAGS) {
      updateBusinessTags(value);
    } else if (type === ChangeType.DATATYPES) {
      updateDataTypes(value);
    } else if (type === ChangeType.DATASTATUS) {
      updateDataStatus(value);
    } else if (type === ChangeType.AUTHOR) {
      updateAuthor();
    }
  };

  React.useEffect(() => {
    updateAuthor();
  }, [user]);

  React.useEffect(() => {
    // clear the selected date types when the users change "state"
    handleConfigurationChange(ChangeType.DATATYPES, []);
  }, [configuration.source.external_id]);

  return { configuration, onConfigurationChange: handleConfigurationChange };
};
