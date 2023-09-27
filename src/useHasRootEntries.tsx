import type { LandingPage, StaticPage } from './types';
import useSingleSourceEntryData from './useSingleSourceEntryData';


export default function useHasRootEntries():
{ landingPage: boolean | undefined, topLevelPage: boolean | undefined }
{
  const landingPageResp = useSingleSourceEntryData<LandingPage>('/index.yaml');
  const topLevelStaticPageResp = useSingleSourceEntryData<StaticPage>('/pages/index.yaml');

  const topLevelStaticPageExists: boolean | undefined = topLevelStaticPageResp.isUpdating
    ? undefined
    : topLevelStaticPageResp.value !== null;

  const landingExists: boolean | undefined = landingPageResp.isUpdating
    ? undefined
    : landingPageResp.value !== null;

  return {
    landingPage: landingExists,
    topLevelPage: topLevelStaticPageExists,
  };
}
