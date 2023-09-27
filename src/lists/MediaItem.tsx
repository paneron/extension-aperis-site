/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React from 'react';
import { jsx } from '@emotion/react';
import type { DeserializedMediaItem } from '../types';


const MediaItem: React.FC<{ objectData: DeserializedMediaItem, objectPath: string }> =
function ({ objectData, objectPath }) {
  const pathComponents = objectPath.split('/');
  const fname = pathComponents[pathComponents.length - 1];
  return <span>{fname}</span>;
}

export default MediaItem;
