/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React from 'react';
import { jsx } from '@emotion/react';
import { NonIdealState } from '@blueprintjs/core';


const PostArchive: React.FC<{ uri: string }> = function ({ uri }) {
  return <NonIdealState
    icon="cog"
    title="Post archive is coming soon"
  />;
};


const PostArchiveTitle: React.FC<{ uri: string }> = function ({ uri }) {
  return <>Post archive</>;
}


export default { main: PostArchive, title: PostArchiveTitle, plainTitle: async () => "Post archive" };
