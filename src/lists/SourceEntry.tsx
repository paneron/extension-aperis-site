/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React from 'react';
import { jsx } from '@emotion/react';
import { LandingPage, Post, StaticPage } from '../types';
import { getSourceEntryType } from '../util';


const SourceEntry: React.FC<{ objectData: StaticPage | Post | LandingPage, objectPath: string }> =
function ({ objectData, objectPath }) {
  if (!objectPath) {
    return <>N/A</>;
  }
  const type = getSourceEntryType(objectPath);
  if (type === 'page' || type === 'post') {
    return <span>{(objectData as StaticPage | Post).title ?? objectPath}</span>
  } else {
    return <span>Landing page</span>
  }
}

export const Page: React.FC<{ objectData: StaticPage, objectPath: string }> =
function ({ objectData, objectPath }) {
  return <SourceEntry objectData={objectData} objectPath={objectPath} />
}

export default SourceEntry;
