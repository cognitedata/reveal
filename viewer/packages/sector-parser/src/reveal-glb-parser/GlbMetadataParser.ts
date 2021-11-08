/*!
 * Copyright 2021 Cognite AS
 */

import assert from 'assert';
import { GlbHeaderData, GltfJson } from '../types';

export class GlbMetadataParser {
  private _textDecoder: TextDecoder;

  private readonly GLB_HEADER_BYTE_SIZE = 12;
  private readonly CHUNK_HEADER_BYTE_SIZE = 8;

  constructor() {
    this._textDecoder = new TextDecoder();
  }

  public parseGlbMetadata(glbByteData: ArrayBuffer): GlbHeaderData {
    this.parseGlbHeaders(glbByteData);

    const { length: jsonLength, json } = this.parseJson(glbByteData);

    const { length: binContentLength, byteOffsetToBinContent } = this.parseBinHeaders(
      glbByteData,
      this.CHUNK_HEADER_BYTE_SIZE + jsonLength
    );

    return {
      json,
      byteOffsetToBinContent,
      binContentLength
    };
  }

  private parseGlbHeaders(data: ArrayBuffer) {
    const dataView = new DataView(data, 0, this.GLB_HEADER_BYTE_SIZE);

    const fileTypeIdentifier = this._textDecoder.decode(new Uint8Array(data, 0, 4));
    const version = dataView.getUint32(4, true);
    const length = dataView.getUint32(8, true);

    assert(fileTypeIdentifier === 'glTF', 'Unknown file format');
    assert(version === 2, `Unsupported glTF version{${version}}`);

    return { fileTypeIdentifier, version, length };
  }

  private parseJson(data: ArrayBuffer): { type: string; length: number; json: GltfJson } {
    const dataView = new DataView(data, this.GLB_HEADER_BYTE_SIZE, this.CHUNK_HEADER_BYTE_SIZE);

    const length = dataView.getUint32(0, true);
    const type = this._textDecoder.decode(new Uint8Array(data, this.GLB_HEADER_BYTE_SIZE + 4, 4));

    assert(type === 'JSON');

    const jsonBytes = new Uint8Array(data, this.GLB_HEADER_BYTE_SIZE + this.CHUNK_HEADER_BYTE_SIZE, length);
    const json = JSON.parse(this._textDecoder.decode(jsonBytes)) as GltfJson;

    assert(json !== undefined, 'Failed to assign types to gltf json');

    return { type, length, json };
  }

  private parseBinHeaders(data: ArrayBuffer, offset: number) {
    const dataView = new DataView(data, this.GLB_HEADER_BYTE_SIZE + offset, this.CHUNK_HEADER_BYTE_SIZE);

    const length = dataView.getUint32(0, true);

    const type = this._textDecoder.decode(new Uint8Array(data, this.GLB_HEADER_BYTE_SIZE + offset + 4, 4));

    assert(type.includes('BIN'));

    return { type, byteOffsetToBinContent: this.GLB_HEADER_BYTE_SIZE + offset + this.CHUNK_HEADER_BYTE_SIZE, length };
  }
}
