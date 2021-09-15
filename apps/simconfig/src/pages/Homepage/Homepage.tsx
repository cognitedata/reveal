import React, { useState, useEffect } from 'react';
import noop from 'lodash/noop';
import { Button } from '@cognite/cogs.js';
import { AuthConsumer, AuthContext } from '@cognite/react-container';
import { CogniteClient, FileInfo } from '@cognite/sdk';
import FileUploader from 'components/FileUploader';
import {
  downloadFile,
  saveData,
  UploadFileMetadataResponse,
  FileInfoWithMetadata,
  updateFileMetadata,
  makeFileFilter,
  makeMetadataUpdate,
} from 'utils/file';

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
  const [data, setData] = useState<FileInfo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchData = async () => {
    try {
      const files = await client.files.list({
        filter: {
          source: 'PROSPER',
        },
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

  const onDeleteClicked = async (file: FileInfoWithMetadata) => {
    await updateFileMetadata(
      client,
      file,
      data,
      'previous-version',
      'next-version'
    );
    await updateFileMetadata(
      client,
      file,
      data,
      'next-version',
      'previous-version'
    );
    await client.files.delete([{ id: file.id }]);
    setTimeout(fetchData, 2000);
  };

  const onUploadSuccess = async (file: UploadFileMetadataResponse) => {
    const searchFile = await client.files.search(makeFileFilter(file));
    await client.files.update(
      makeMetadataUpdate(file.id, {
        'previous-version': file.metadata['previous-version'],
        'next-version': file.metadata['next-version'],
        category: file.metadata.category,
      })
    );
    if (searchFile.length === 1) {
      await client.files.update(
        makeMetadataUpdate(searchFile[0].id, {
          'previous-version': (searchFile[0] as FileInfoWithMetadata).metadata[
            'previous-version'
          ],
          'next-version': file.id.toString(),
          category: (searchFile[0] as FileInfoWithMetadata).metadata.category,
        })
      );
      await client.files.update(
        makeMetadataUpdate(file.id, {
          'next-version': file.metadata['next-version'],
          'previous-version': searchFile[0].id.toString(),
          category: file.metadata.category,
        })
      );
    }
    setTimeout(fetchData, 2000);
  };

  if (!data && !errorMessage) {
    return null;
  }

  return (
    <div>
      <FileUploader
        onCancel={noop}
        onUploadSuccess={onUploadSuccess}
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
              <th>Category</th>
              <th>ID</th>
              <th>Previous version ID</th>
              <th>Next version ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((dataRow) => {
              const row = dataRow as FileInfoWithMetadata;
              return (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.mimeType}</td>
                  <td>{row.metadata.category}</td>
                  <td>{row.id}</td>
                  <td>{row.metadata['previous-version']}</td>
                  <td>{row.metadata['next-version']}</td>
                  <td>
                    <Button onClick={() => onDownloadClicked(row.id, row.name)}>
                      Download
                    </Button>{' '}
                    <Button onClick={() => onDeleteClicked(row)}>Delete</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HomepageWrapper;
