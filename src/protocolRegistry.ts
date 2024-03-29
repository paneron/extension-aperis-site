import type { ProtocolRegistry } from '@riboseinc/paneron-extension-kit/widgets/TabbedWorkspace/types';

import SourceEntry from './detail/source-entries';
import PageGraph from './detail/PageGraph';
import PostArchive from './detail/PostArchive';
import SiteSettings from './detail/SiteSettings';
import Docs from './detail/Docs';


export const SOURCE_ENTRY = 'sourceentry';
export const SITE_SETTINGS = 'sitesettings';
export const PAGE_GRAPH = 'pagegraph';
export const POST_ARCHIVE = 'postarchive';
export const DOCS = 'docs';

export const protocols = [
  SOURCE_ENTRY,
  SITE_SETTINGS,
  PAGE_GRAPH,
  POST_ARCHIVE,
  DOCS,
] as const;

export type Protocol = typeof protocols[number];

export function isValidProtocol(val: string): val is Protocol {
  return protocols.indexOf(val as Protocol) >= 0;
}

const protocolRegistry: ProtocolRegistry<Protocol> = {
  sourceentry: SourceEntry,
  sitesettings: SiteSettings,
  pagegraph: PageGraph,
  postarchive: PostArchive,
  docs: Docs,
};

export default protocolRegistry;
