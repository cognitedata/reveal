import { Button } from '@cognite/cogs.js';
import { useState } from 'react';
import { VerticalDivider } from '../../components/Divider';
import { dummyConventions } from '../../service/conventions';
import { Convention } from '../../types';
import { DrawerHeader } from '../../components/Drawer';
import { ConventionList } from './ConventionList';
import { ConventionHeader } from './ConventionHeader';
import { useNavigate } from 'react-router-dom';

interface Props {
  id: string;
}
export const ConventionView: React.FC<Props> = ({ id }) => {
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  const system = dummyConventions.find((item) => item.id === id);

  const [selectMode, setSelectMode] = useState(false);
  const [conventions, setConventions] = useState<Convention[]>(
    system?.conventions || []
  );
  const navigate = useNavigate();

  const handleConventionChange = (updatedConvention: Convention) => {
    setConventions((prevState) => {
      return [
        ...prevState.filter((item) => item.id !== updatedConvention.id),
        updatedConvention,
      ];
    });
  };

  if (!system) {
    return <p>No system found</p>;
  }

  return (
    <>
      <DrawerHeader title="Coding conventions for 'file name'">
        <Button
          onClick={() => setSelectMode((prevMode) => !prevMode)}
          icon={selectMode ? 'Checkmark' : 'Edit'}
          type={selectMode ? 'primary' : 'secondary'}
          aria-label="Edit mode"
        >
          {selectMode ? 'Done' : ''}
        </Button>
        {!selectMode && (
          <>
            <Button
              icon="Play"
              type="primary"
              onClick={() => navigate('/validations/' + id)}
            >
              Test
            </Button>
            <VerticalDivider />
            <Button icon="Close" aria-label="Close" />
          </>
        )}
      </DrawerHeader>

      <ConventionHeader
        conventions={conventions}
        editMode={selectMode}
        structureText={system!.structure!}
        onKeysChange={setActiveKeys}
        onConventionCreate={(newConvention) => {
          setConventions((prevState) => [...prevState, newConvention]);
        }}
      />

      <ConventionList
        conventions={conventions}
        editMode={selectMode}
        activeKeys={activeKeys}
        onKeysChange={setActiveKeys}
        onConventionChange={handleConventionChange}
      />
    </>
  );
};
