import React, { CSSProperties } from 'react';
import { bindActionCreators } from 'redux';
import { createStructuredSelector, createSelector } from 'reselect';
import { connect } from 'react-redux';
import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import Spinner from 'src/components/Spinner';
import { Tooltip, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import * as FileActions from 'src/store/modules/File';
import * as RevisionActions from 'src/store/modules/Revision';

const ThumbnailHint = styled.div`
  display: flex;
  align-items: center;
  line-height: 16px;
`;

type WithFileId = {
  fileId: number;
  modelId: never;
};

type WithModelId = {
  fileId: never;
  modelId: number;
};

type Props = (WithFileId | WithModelId) & {
  revisions: {
    items: Array<{
      items: Array<any>;
    }>;
    modelMap: Array<number>;
  };
  downloadThumbnail: Function;
  fetchRevisions: Function;
  width?: string;
  style?: CSSProperties;
};

type State = {
  imageSrc?: string;
  loading: boolean;
};

export class Thumbnail extends React.Component<Props, State> {
  mounted = false;

  constructor(props) {
    super(props);

    this.state = {
      imageSrc: undefined,
      loading: true,
    };

    this.mounted = false;
  }

  async componentDidMount() {
    this.mounted = true;
    await this.acquirefileURL();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  acquirefileURL = async () => {
    let { fileId } = this.props;
    let imageUrl;
    if (!fileId) {
      await this.props.fetchRevisions({
        modelId: this.props.modelId,
      });

      const revsIndex = this.props.revisions.modelMap.findIndex(
        (item) => item === this.props.modelId
      );

      const revsForTheModel = this.props.revisions.items[revsIndex];

      const revWithThumbnail = revsForTheModel.items.find(
        (i) => i.thumbnailThreedFileId || false
      );

      if (revWithThumbnail) {
        fileId = revWithThumbnail.thumbnailThreedFileId;
      }
    }
    if (fileId) {
      const arraybuffers = await sdk.files3D.retrieve(fileId);
      const arrayBufferView = new Uint8Array(arraybuffers);
      const blob = new Blob([arrayBufferView]);
      const urlCreator = window.URL || window.webkitURL;
      imageUrl = urlCreator.createObjectURL(blob);
    }

    if (this.mounted) {
      this.setState({
        imageSrc: imageUrl || null,
        loading: false,
      });
    }
  };

  render() {
    // let the user use these extra props when utilizing Image component
    const validPropNames = ['width', 'onClick']; // style is also valid

    const propsToAdd = Object.assign(
      {},
      ...validPropNames.map((prop) => ({ [prop]: this.props[prop] }))
    );

    if (this.state.loading) {
      return <Spinner style={{ marginTop: 0 }} />;
    }
    if (this.state.imageSrc) {
      return (
        <img
          alt="Thumbnail could not be loaded"
          src={this.state.imageSrc}
          style={{ textAlign: 'center', ...this.props.style }}
          {...propsToAdd}
        />
      );
    }

    return (
      <ThumbnailHint>
        <span>This model has no thumbnail</span>
        <Tooltip content="To create a thumbnail, open one of the revisions, and press the camera button.">
          <Icon type="Help" style={{ marginLeft: '4px' }} />
        </Tooltip>
      </ThumbnailHint>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  thumbnails: createSelector(
    (state: any) => state.files.thumbnails,
    (revisionState) => revisionState
  ),
  revisions: createSelector(
    (state: any) => state.revisions.data,
    (revisionState) => revisionState
  ),
  auth: createSelector(
    (state: any) => state.auth,
    (authState) => authState
  ),
});

function mapDispatchToProps(dispatch) {
  // @ts-ignore
  return bindActionCreators({ ...FileActions, ...RevisionActions }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Thumbnail);
