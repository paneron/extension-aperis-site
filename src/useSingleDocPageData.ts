import log from 'electron-log';
import { useContext } from 'react';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { ValueHook } from '@riboseinc/paneron-extension-kit/types';
import { LandingPage, Post, StaticPage } from './types';


export default function useSingleSourceEntryData
<T extends StaticPage | Post | LandingPage>
(pagePath: string):
ValueHook<T | null> {
  const { useObjectData } = useContext(DatasetContext);
  const resp = useObjectData({ objectPaths: [pagePath] });

  if (!pagePath.endsWith('index.yaml')) {
    log.error("useSingleDocPageData: Invalid page path (doesn’t end with index.yaml)", pagePath);
  }

  return {
    ...resp,
    value: (resp.value.data?.[pagePath] ?? null) as T | null,
  };
}
