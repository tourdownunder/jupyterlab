// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  Widget
} from '@phosphor/widgets';

import {
  IRenderMime
} from '@jupyterlab/rendermime-interfaces';

import '../style/index.css';

/**
 * The MIME type for Media
 * reference https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats
 */
export
const MIME_TYPES = [
  'audio/basic',
  'audio/mid',
  'audio/rmi',
  'audio/mp3',
  'audio/mp4',
  'audio/webm',
  'audio/ogg',
  'audio/wave',
  'audio/wav',
  'audio/x-wav',
  'audio/x-pn-wav',
  'audio/flac',
  'audio/x-flac',
  'video/webm',
  'video/ogg',
  'video/mp4',
];

export
const EXTENSIONS = [
  'midi',
  'mp3',
  'mp4',
  'webm',
  'ogg',
  'wav',
];

export
const MEDIA_CLASS = 'jp-MediaViewer';

export
const MEDIA_CONTAINER_CLASS = 'jp-MediaContainer';

/**
 * A class for rendering a Media document.
 */
export
class RenderedMedia extends Widget implements IRenderMime.IRenderer {
  constructor() {
    super({ node: Private.createNode() });
  }

  /**
   * Render Media into this widget's node.
   */
  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    let mimeType = model.data.type as string;
    alert('mimeType:' + mimeType);
    // if mime type is not in supporred array, do nothing.
    if (MIME_TYPES.indexOf(mimeType) === -1) {
      return Promise.resolve(void 0);
    }
    // Use the first part of the mimeType for the source type
    let srcType = mimeType.split('/')[0];
    alert('srcType:' + srcType);
    let data = model.data[mimeType] as string;
    // If there is no data, do nothing.
    if (!data) {
      alert('Null data');
      return Promise.resolve(void 0);
    }

    const blob = Private.b64toBlob(data, mimeType);

    let oldUrl = this._objectUrl;
    this._objectUrl = URL.createObjectURL(blob);
    this.node.querySelector('embed').setAttribute(srcType, this._objectUrl);

    // Release reference to any previous object url.
    if (oldUrl) {
      try {
        URL.revokeObjectURL(oldUrl);
      } catch (error) { /* no-op */ }
    }
    return Promise.resolve(void 0);
  }

  /**
   * Dispose of the resources held by the media widget.
   */
  dispose() {
    try {
      URL.revokeObjectURL(this._objectUrl);
    } catch (error) { /* no-op */ }
    super.dispose();
  }

  private _objectUrl = '';
}


/**
 * A mime renderer factory for Media data.
 */
export
const rendererFactory: IRenderMime.IRendererFactory = {
  safe: false,
  mimeTypes: MIME_TYPES,
  defaultRank: 75,
  createRenderer: options => new RenderedMedia()
};


const extensions: IRenderMime.IExtension | IRenderMime.IExtension[] = [
  {
    id: '@jupyterlab/media-extension:factory',
    rendererFactory,
    dataType: 'string',
    fileTypes: [{
      name: 'Media',
      displayName: 'Media',
      fileFormat: 'base64',
      mimeTypes: MIME_TYPES,
      extensions: EXTENSIONS
    }],
    documentWidgetFactoryOptions: {
      name: 'Media',
      modelName: 'base64',
      primaryFileType: 'Media',
      fileTypes: ['Media'],
      defaultFor: ['Media']
    }
  }
];

export default extensions;


/**
 * A namespace for Media widget private data.
 */
namespace Private {
  /**
   * Create the node for the Media widget.
   */
  export
  function createNode(): HTMLElement {
    let node = document.createElement('div');
    node.className = MEDIA_CONTAINER_CLASS;
    let media = document.createElement('embed');
    media.className = MEDIA_CLASS;
    media.setAttribute('type', 'video/mp4'); // HACK. How do I get the model.mimeType here
    node.appendChild(media);
    return node;
  }

  /**
   * Below is copled from pdf-extension. Move to a common place
   * Convert a base64 encoded string to a Blob object.
   * Modified from a snippet found here:
   * https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
   *
   * @param b64Data - The base64 encoded data.
   *
   * @param contentType - The mime type of the data.
   *
   * @param sliceSize - The size to chunk the data into for processing.
   *
   * @returns a Blob for the data.
   */
  export
  function b64toBlob(b64Data: string, contentType: string = '', sliceSize: number = 512): Blob {
    const byteCharacters = atob(b64Data);
    let byteArrays: Uint8Array[] = [];
    alert('contentType:' + contentType);
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);

      let byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      let byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, {type: contentType});
  }
}
