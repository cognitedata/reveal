import React, { useState, useEffect } from 'react';
import noop from 'lodash/noop';
import { Button } from '@cognite/cogs.js';
import { AuthConsumer, AuthContext } from '@cognite/react-container';
import { CogniteClient, FileInfo } from '@cognite/sdk';
import FileUploader from 'components/FileUploader';
import { downloadFile, saveData } from 'utils/file';

const HomepageWrapper: React.FC = () => (
  <AuthConsumer>
    {({ client }: AuthContext) =>
      client ? <Homepage client={client} /> : null
    }
  </AuthConsumer>
);

interface DataWrapperProps {
  client: CogniteClient;
}
const Homepage: React.FC<DataWrapperProps> = ({ client }: DataWrapperProps) => {
  const [data, setData] = useState<FileInfo[]>();
  const [errorMessage, setErrorMessage] = useState('');

  const fetchData = async () => {
    try {
      const files = await client.files.list({
        filter: { source: 'Simulator Configuration' },
      });
      if (files.items) {
        setData(files.items);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only run once

  const onDownloadClicked = async (id: number, fileName: string) => {
    const [url] = await client.files.getDownloadUrls([{ id }]);
    const blob = await downloadFile(url.downloadUrl);
    saveData(blob, fileName);
  };

  const onDeleteClicked = async (id: number) => {
    await client.files.delete([{ id }]);
    setTimeout(fetchData, 2000);
  };

  if (!data && !errorMessage) {
    return null;
  }

  return (
    <div>
      <FileUploader
        onCancel={noop}
        onUploadSuccess={() => setTimeout(fetchData, 2000)}
        onFileListChange={noop}
        onUploadFailure={noop}
        beforeUploadStart={noop}
      />
      <br />
      {data && data.length !== 0 && (
        <table className="cogs-table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>File Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.mimeType}</td>
                <td>
                  <Button onClick={() => onDownloadClicked(row.id, row.name)}>
                    Download
                  </Button>{' '}
                  <Button onClick={() => onDeleteClicked(row.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HomepageWrapper;
