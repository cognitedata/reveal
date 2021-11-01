import { Button, Popconfirm } from '@cognite/cogs.js';

export const ToolBar: React.FC<{
  mode: string;
  setMode: (mode: string) => void;
  setSelected: (selected: string[]) => void;
  saveSymbol: (symbolName: string) => void;
}> = (props) => {
  const modeText = props.mode === '' ? 'CREATE' : 'DONE';

  const handleCreate = () => {
    if (props.mode === 'CREATE') {
      // this means we want to save it
      // props.saveSymbol(selected, 'symbolName');
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
      <Popconfirm
        placement="bottom-end"
        content={
          <span>
            <strong />
            <br />
            <br />
          </span>
        }
        onConfirm={(): void => {
          props.saveSymbol('symbolName');
        }}
      >
        <Button onClick={handleCreate}> {modeText} </Button>
      </Popconfirm>
      <Button onClick={handleClear}>Clear Selected</Button>
    </div>
  );
};
