import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Loader } from '@cognite/cogs.js';

import { VerticalDivider } from '../../components/Divider';
import { DrawerHeader } from '../../components/Drawer';
import { useConventionCreateMutate } from '../../service/hooks/mutate/useConventionCreateMutate';
import { useConventionUpdateMutate } from '../../service/hooks/mutate/useConventionUpdateMutate';
import { useConventionListQuery } from '../../service/hooks/query/useConventionListQuery';
import { useSystemQuery } from '../../service/hooks/query/useSystemQuery';
import { Convention } from '../../types';

import { ConventionHeader } from './ConventionHeader';
import { ConventionList } from './ConventionList';

interface Props {
  id: string;
}
export const ConventionView: React.FC<Props> = () => {
  const navigate = useNavigate();

  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  const { data: system, isLoading } = useSystemQuery();

  const { data: conventions } = useConventionListQuery();

  const { mutate: createConvention } = useConventionCreateMutate();
  const { mutate: updateConventions } = useConventionUpdateMutate();

  const [editMode, setEditMode] = useState(false);
  const toggleEditMode = () => setEditMode((prevState) => !prevState);

  const [updatingConventions, setUpdatingConventions] = useState<Convention[]>(
    []
  );

  const transformedConventions = useMemo(
    () =>
      conventions?.reduce(
        (acc, item) => {
          if (acc.some(({ id }) => id === item.id)) {
            return acc;
          }

          return [...acc, item];
        },
        [...updatingConventions]
      ),
    [conventions, updatingConventions]
  );

  const handleConventionChange = (updatedConvention: Convention) => {
    setUpdatingConventions((prevState) => {
      return [
        ...prevState.filter((item) => item.id !== updatedConvention.id),
        updatedConvention,
      ];
    });
  };

  const handleConventionCreate = (
    newConvention: Omit<Convention, 'id' | 'systemId'>
  ) => {
    createConvention({
      keyword: newConvention.keyword,
      start: newConvention.start,
      end: newConvention.end,
    });
  };

  // const handleConventionDeleteClick = (deletedConvention: Convention) => {};

  const handleDoneClick = () => {
    console.log('updatingConventions', updatingConventions);
    updateConventions(updatingConventions);

    toggleEditMode();
    setUpdatingConventions([]);
  };

  const handleCancelClick = () => {
    setUpdatingConventions([]);
    toggleEditMode();
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!system || !conventions || !transformedConventions) {
    return <p>No entry found</p>;
  }

  return (
    <>
      <DrawerHeader title={`Coding conventions for "${system.title}"`}>
        {editMode ? (
          <>
            <Button
              onClick={() => handleDoneClick()}
              icon={editMode ? 'Checkmark' : 'Edit'}
              type={editMode ? 'primary' : 'secondary'}
              aria-label="Edit mode"
            >
              Done
            </Button>
            <VerticalDivider />
            <Button icon="Close" onClick={handleCancelClick} />
          </>
        ) : (
          <>
            <Button
              icon="MagicWand"
              type="secondary"
              onClick={() => navigate('test')}
            >
              Test
            </Button>
            <Button
              icon="Play"
              type="primary"
              onClick={() => navigate('validate')}
            >
              Validate
            </Button>
            <VerticalDivider />
            <Button
              onClick={() => handleDoneClick()}
              icon="Edit"
              type="secondary"
              aria-label="Edit mode"
            />
            <Button
              icon="Close"
              aria-label="Close"
              onClick={() => {
                navigate('/');
              }}
            />
          </>
        )}
      </DrawerHeader>

      <ConventionHeader
        conventions={conventions}
        editMode={editMode}
        structureText={system.structure}
        onKeysChange={setActiveKeys}
        onConventionCreate={(newConvention) => {
          handleConventionCreate(newConvention);
        }}
      />

      <ConventionList
        conventions={transformedConventions}
        editMode={editMode}
        activeKeys={activeKeys}
        onKeysChange={setActiveKeys}
        onConventionChange={handleConventionChange}
        // onConventionDeleteClick={handleConventionDeleteClick}
      />
    </>
  );
};
