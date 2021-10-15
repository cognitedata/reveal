import { Dropdown, Menu } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import { Asset } from '@cognite/sdk';
import { ShapeConfig } from 'konva/lib/Shape';
import { Marker } from 'library/tools/ListTool';
import debounce from 'lodash/debounce';
import { useEffect, useState, createRef, useCallback } from 'react';

export type ListToolStatus = 'CLOSE' | 'OPEN';

export const LIST_TOOL_STATUSES: Record<
  ListToolStatus,
  { display: string; styleOverrides: ShapeConfig }
> = {
  CLOSE: {
    display: 'CLOSE',
    styleOverrides: {
      fill: 'rgba(213, 26, 70, 0.1)',
      stroke: '#D51A46',
      cornerRadius: 5,
    },
  },
  OPEN: {
    display: 'OPEN',
    styleOverrides: {
      fill: 'rgba(24, 175, 142, 0.1)',
      stroke: '#18AF8E',
      cornerRadius: 50,
    },
  },
};
export type ListItem = {
  marker: Marker;
  order: number;
  text: string;
  status?: ListToolStatus;
  notes?: string;
  assetId?: number;
};

type ListToolSidebarAssetProps = {
  asset?: Asset;
  text?: string;
  onAssetChange: (nextAsset?: Asset) => void;
  onTextChange: (nextString: string) => void;
  canChangeAsset?: boolean;
};

const ListToolSidebarAsset = ({
  asset,
  text,
  onAssetChange,
  onTextChange,
  canChangeAsset,
}: ListToolSidebarAssetProps) => {
  const { client } = useAuthContext();
  const inputRef = createRef<HTMLInputElement>();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [value, setValue] = useState(asset?.name || text);
  const [options, setOptions] = useState<Asset[]>([]);

  useEffect(() => {
    setValue(asset?.name || text);
  }, [asset, text]);

  const onConfirm = (asset?: Asset) => {
    inputRef.current!.blur();
    setDropdownOpen(false);
    if (asset) {
      setValue(asset.name);
      onAssetChange(asset);
    } else if (value) {
      onTextChange(value);
    }
  };
  const loadOptions = (input: string) => {
    if (!input) {
      setOptions([]);
      return;
    }
    client?.assets
      .search({
        search: {
          query: input,
        },
      })
      .then((assets) => {
        setOptions(assets);
        setDropdownOpen(true);
      });
  };
  const debouncedLoadOptions = useCallback(debounce(loadOptions, 1000), []);

  if (asset) {
    return (
      <div
        onKeyDown={(e) => {
          if (e.key === 'Enter' && canChangeAsset) {
            onAssetChange(undefined);
          }
        }}
        tabIndex={-1}
        role="button"
        className="list-item__text"
        style={{
          fontStyle: canChangeAsset ? 'italic' : 'normal',
          cursor: canChangeAsset ? 'pointer' : 'default',
        }}
        onClick={() => {
          if (canChangeAsset) {
            onAssetChange(undefined);
          }
        }}
      >
        {value}
      </div>
    );
  }

  const assetResultsDropdown = options.length > 0 && (
    <Menu>
      {options.map((asset) => (
        <Menu.Item
          key={asset.id}
          onClick={() => {
            onConfirm(asset);
          }}
        >
          {asset.name}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown visible={isDropdownOpen} content={assetResultsDropdown}>
      <input
        ref={inputRef}
        className="list-item__text"
        value={value}
        placeholder="Unknown tag"
        style={{
          fontStyle: canChangeAsset ? 'italic' : 'normal',
        }}
        onBlur={() => {
          setTimeout(() => {
            setDropdownOpen(false);
          }, 500);
        }}
        onChange={(e) => {
          e.stopPropagation();
          setValue(e.target.value);
          debouncedLoadOptions(e.target.value);
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
        onKeyUp={(e) => {
          if (e.key === 'Enter') {
            onConfirm();
          }
        }}
      />
    </Dropdown>
  );
};

export default ListToolSidebarAsset;
