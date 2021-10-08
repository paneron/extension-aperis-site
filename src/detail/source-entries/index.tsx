/** @jsx jsx */
/** @jsxFrag React.Fragment */

//import log from 'electron-log';
import React from 'react';
import { jsx } from '@emotion/react';
import { NonIdealState, Spinner } from '@blueprintjs/core';

import useSingleSourceEntryData from '../../useSingleSourceEntryData';
import { SourceEntryViewConfig, SourceEntryType } from '../../types';
import { getSourceEntryType } from '../../util';

import landing from './landing';
import post from './post';
import page from './page';


const SOURCE_ENTRY_VIEWS: Record<SourceEntryType, SourceEntryViewConfig<any>> = {
  page,
  post,
  landing,
};


const FallbackView = (opts: { entryData: any, entryPath: string }) => <NonIdealState
  icon="heart-broken"
  title="Unable to show item"
  description={`Entry data cannot be loaded, or view for ${opts.entryPath} cannot be determined`}
/>;

const LoadingView = (opts: { entryData: any, entryPath: string }) => <NonIdealState
  icon={<Spinner />}
  description={`Loading data for ${opts.entryPath}`}
/>;


const EntryDetail: React.FC<{ uri: string }> = function ({ uri }) {
  const resp = useSingleSourceEntryData(uri);
  const { value: entryData } = resp;
  const entryType = getSourceEntryType(uri);
  const entryView = SOURCE_ENTRY_VIEWS[entryType].main ?? FallbackView;
  const View = resp.isUpdating
    ? LoadingView
    : entryData !== null
      ? entryView
      : FallbackView;
  return <View entryData={entryData} entryPath={uri} />;
};


const EntryTitle: React.FC<{ uri: string }> = function ({ uri }) {
  const resp = useSingleSourceEntryData(uri);
  const { value: entryData } = resp;
  const entryType = getSourceEntryType(uri);
  const entryView = SOURCE_ENTRY_VIEWS[entryType].title;
  const fallbackView = ((opts: any) => <>{uri}</>);
  const View = !resp.isUpdating && entryData !== null ? entryView : fallbackView;
  return <View entryData={entryData} entryPath={uri} />;
}


export default { main: EntryDetail, title: EntryTitle, plainTitle: async (uri: string) => {
  try {
    return await SOURCE_ENTRY_VIEWS[getSourceEntryType(uri)].plainTitle(uri);
  } catch (e) {
    return "source entry";
  }
} };
