/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { Post, SourceEntryView } from '../../types';

const PostDetail: SourceEntryView<Post> = function ({ entryData, entryPath }) {
  return <span>Post view coming soon</span>;
}

const PostTitle: SourceEntryView<Post> = function ({ entryData, entryPath }) {
  return <span>{entryData.title ?? `(${entryPath})`}</span>
}

export default { main: PostDetail, title: PostTitle, plainTitle: async () => "static page" };

