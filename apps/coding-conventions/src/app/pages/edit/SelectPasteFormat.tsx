import { Menu } from '@cognite/cogs.js';
import { Modal } from '../../components/Modal/Modal';

export type PasteDelimiter = ' ' | '\t' | '\n' | undefined | null;

interface SelectPasteFormatProps {
  onPasteFormatChange: (pasteFormat: PasteDelimiter) => void;
}

export const SelectPasteFormat = ({
  onPasteFormatChange,
}: SelectPasteFormatProps) => {
  return (
    <div
      // eslint-disable-next-line @cognite/no-number-z-index
      style={{ position: 'absolute', zIndex: 1 }}
    >
      <Menu>
        <Menu.Item
          icon={'Close'}
          onClick={() => {
            onPasteFormatChange(null);
          }}
        />

        <Menu.Item
          onClick={() => {
            onPasteFormatChange(' ');
          }}
        >
          Space
        </Menu.Item>
        <Menu.Item onClick={() => onPasteFormatChange('\t')}>Tab</Menu.Item>
        <Menu.Item onClick={() => onPasteFormatChange('\n')}>
          New Line
        </Menu.Item>
      </Menu>
    </div>
  );
};
