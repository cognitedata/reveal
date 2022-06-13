import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import NewHeader from 'components/NewHeader';
import styled from 'styled-components';
import { getContainer } from 'utils/utils';
import {
  getExtractorsWithReleases,
  ExtractorWithRelease,
  Artifact,
  Release,
  getDownloadUrl,
} from './ExtractorDownloadApi';
import { Colors } from '@cognite/cogs.js';
import { ExpandableConfig } from 'antd/lib/table/interface';

const LinkStyled = styled.a`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: left;
  align-items: left;
`;

const extractorColumns = [
  {
    title: 'Version',
    dataIndex: 'version',
    key: 'version',
    width: 110,
  },
  {
    title: 'Release date',
    dataIndex: 'releasedAt',
    key: 'releasedAt',
    width: 140,
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Download links',
    dataIndex: 'downloads',
    key: 'downloads',
    width: 280,
  },
];

const StyledExtractorsContainer = styled.div`
  padding: 18px 44px;
`;

const artifactPlatform = (artifact: Artifact): string => {
  switch (artifact.platform) {
    case 'docs':
      return 'Documentation';
    case 'windows':
      return 'Windows';
    case 'linux':
      return 'Linux';
    case 'macos':
      return 'MacOS';
  }
  return '';
};

const artifactType = (artifact: Artifact): string => {
  const name = artifact.name.toLowerCase();
  if (name.endsWith('zip') || name.endsWith('gz') || name.endsWith('tar')) {
    return 'zip';
  } else if (name.endsWith('pdf')) {
    return 'pdf';
  } else if (
    name.endsWith('msi') ||
    name.endsWith('rpm') ||
    name.endsWith('deb')
  ) {
    return 'installer';
  } else {
    return 'executable';
  }
};

const GetArtifactName = (artifact: Artifact): string => {
  return `${artifactPlatform(artifact)} ${artifactType(artifact)}`;
};

const GetExtractors = () => {
  const [extractors, setExtractors] = useState<ExtractorWithRelease[]>();
  useEffect(() => {
    getExtractorsWithReleases()
      .then((res) => {
        setExtractors(res);
      })
      // eslint-disable-next-line no-console
      .catch((e) => console.error(e));
  }, []);

  return extractors;
};

const Download = (artifact: Artifact) => {
  getDownloadUrl(artifact)
    .then((url) => {
      const a = document.createElement('a');
      a.href = url;
      a.download = artifact.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    })
    // eslint-disable-next-line no-console
    .catch((e) => console.error(e));
};

const VersionTable = ({ releases }: { releases: Release[] }) => {
  if (!releases) {
    return (
      <Table
        dataSource={undefined}
        columns={extractorColumns}
        pagination={false}
        getPopupContainer={getContainer}
      />
    );
  }

  const dataSource: {
    key: number;
    version: string;
    description: string | undefined;
    releasedAt: string;
    artifacts: Artifact[];
    downloads: JSX.Element[];
  }[] = [];
  releases.forEach((release, idx) => {
    dataSource.push({
      key: idx,
      version: release.version,
      description: release.description,
      releasedAt: new Date(release.createdTime ?? 0).toLocaleDateString(
        'en-GB'
      ),
      artifacts: release.artifacts,
      downloads: release.artifacts.map((artifact) => (
        <LinkStyled onClick={() => Download(artifact)} key={artifact.name}>
          {GetArtifactName(artifact)}
        </LinkStyled>
      )),
    });
  });

  return (
    <Table
      dataSource={dataSource}
      columns={extractorColumns}
      pagination={false}
      getPopupContainer={getContainer}
    />
  );
};

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 250,
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  },
];

const expandableConfig: ExpandableConfig<ExtractorWithRelease> = {
  defaultExpandAllRows: false,
  expandedRowRender: (record) => <VersionTable releases={record.releases} />,
};

const Extractors = () => {
  return (
    <StyledExtractorsContainer>
      <NewHeader
        title="Extractor downloads"
        ornamentColor={Colors['lightblue']}
        breadcrumbs={[
          { title: 'Data ingestion', path: '/ingest' },
          { title: 'Extractors', path: '/extractors' },
        ]}
      />
      <Table
        dataSource={GetExtractors()}
        columns={columns}
        pagination={false}
        rowKey={(record) => record.externalId}
        expandable={expandableConfig}
        getPopupContainer={getContainer}
      />
    </StyledExtractorsContainer>
  );
};

export default Extractors;
