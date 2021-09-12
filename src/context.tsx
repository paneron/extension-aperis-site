import { Spec } from 'immutability-helper';
import { createContext } from 'react';
import { LandingPage, Post, SiteSettings, SourceEntryType, StaticPage } from './types';


type SourceEntryManager<T> = {
  create: (path: string, data: T) => Promise<void>
  update: (path: string, details: string, oldData: T, updateSpec: Spec<T, never>) => Promise<void>
  replace: (path: string, details: string, oldData: T, newData: T) => Promise<void>
  move?: (oldPath: string, newPath: string) => Promise<void>
  delete: (path: string) => Promise<void>
}

export type AperisContext = {
  siteSettings: SiteSettings | null

  lastSelectedSourceEntry: {
    type: SourceEntryType

    /** Path with leading slash and index.yaml suffix, no URL prefix, defaults to /index.yaml */
    path: string
  }

  selectSourceEntry?: (entryPath: string) => void

  previewedMediaPath?: string
  previewMediaPath?: (path: string | undefined) => void

  operations?: {
    pages: SourceEntryManager<StaticPage>
    posts: SourceEntryManager<Post>
    landingPage: SourceEntryManager<LandingPage>
  }
};

export const AperisContext = createContext<AperisContext>({
  siteSettings: null,
  lastSelectedSourceEntry: {
    path: '/index.yaml',
    type: 'landing',
  },
});
