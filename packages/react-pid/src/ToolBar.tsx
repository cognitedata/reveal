import { Button } from '@cognite/cogs.js';

export const ToolBar: React.FC<{
  mode: string;
  setMode: (mode: string) => void;
  setSelected: (selected: string[]) => void;
}> = (props) => {
  const modeText = props.mode === '' ? 'CREATE' : 'DONE';
  const handleCreate = () => {
    if (props.mode === 'CREATE') {
      props.setMode('');
    } else {
      props.setMode('CREATE');
    }
  };
  const handleClear = () => {
    props.setSelected([]);
  };
  return (
    <div>
      <Button onClick={handleCreate}> {modeText} </Button>
      <Button onClick={handleClear}>Clear Selected</Button>
    </div>
  );
};
