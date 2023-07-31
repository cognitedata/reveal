import { useState } from 'react';
import { Button, Drawer, Input } from '@cognite/cogs.js';
import { CogniteClient, FileInfo } from '@cognite/sdk';
import debounce from 'lodash/debounce';

type FileSidebarProps = {
  visible: boolean;
  onToggle: (next: boolean) => void;
  client: CogniteClient;
  onFileClick: (nextFile: FileInfo) => void;
};

const FileSidebar = ({
  visible,
  onToggle,
  client,
  onFileClick,
}: FileSidebarProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FileInfo[]>([]);

  const onSearch = async (query: string) => {
    const results = await client.files
      .search({
        search: {
          name: query,
        },
        limit: 20,
      })
      .then((res) =>
        res.filter(
          (file) =>
            file.mimeType?.includes('image') || file.mimeType?.includes('pdf')
        )
      );
    setResults(results);
  };

  const debouncedSearch = debounce(onSearch, 500);

  const onQuery = (query: string) => {
    setQuery(query);
    debouncedSearch(query);
  };

  const renderResults = () => {
    if (!query) {
      return null;
    }
    if (results.length <= 0) {
      return <div>No results</div>;
    }

    return results.map((file) => (
      <div key={file.id} style={{ width: '100%', marginBottom: 8 }}>
        <Button onClick={() => onFileClick(file)} block>
          {file.name}
        </Button>
      </div>
    ));
  };

  return (
    <Drawer
      visible={visible}
      footer={null}
      width={360}
      onClose={() => onToggle(false)}
      title="Add a file from CDF"
    >
      <Input
        type="text"
        placeholder="Search"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        style={{ width: '100%' }}
      />
      {renderResults()}
    </Drawer>
  );
};

export default FileSidebar;
