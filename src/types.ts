export type DeserializedMediaItem = { asText: string } | { asBase64: string }

export type SourceEntryType = 'page' | 'post' | 'landing'


export interface SiteSettings {
  title: string
  docsURLPrefix: string
  siteURLPrefix: string
  footerBannerLink: string
  headerBannerBlob: string
  footerBannerBlob: string
  deploymentSetup: string | null
}


export interface SiteSettingsFile {
  title: string
  docsURLPrefix: string
  siteURLPrefix: string
  footerBannerLink: string
  deploymentSetup: string | null
}


export interface LandingPage {
  welcomeNotice?: ProseMirrorStructure
}


export interface StaticPage {
  importance?: number
  title: string
  summary?: ProseMirrorStructure | string
  contents?: ProseMirrorStructure | string
  excerpt?: string
  redirectFrom?: string[]
}


export interface Author {
  name: string
  tagline?: string
  profilePictureURL: string
  gravatarEmail: string // encoded
}


export interface Post {
  title: string
  authors: Author[]
  categoryIDs: string[]

  summary: ProseMirrorStructure
  contents: ProseMirrorStructure

  creationTime: Date
  publicationTime?: Date
  latestRevisionTime?: Date
}


export type ProseMirrorStructure = { doc: Record<string, any> };


export function isProseMirrorStructure(data: string | ProseMirrorStructure): data is ProseMirrorStructure {
  return data.hasOwnProperty('doc') && ((data as ProseMirrorStructure).doc.type !== undefined);
}


// Views

export type SourceEntryView<T extends StaticPage | Post | LandingPage> =
  React.FC<{ entryData: T, entryPath: string }>;

export type SourceEntryViewConfig<T extends StaticPage | Post | LandingPage> = {
  main: SourceEntryView<T>
  title: SourceEntryView<T>
  plainTitle: (uri: string) => Promise<string>
};


// Provisional

export interface IllustrationMeta {
  alt: string
}

export interface IncludedDocumentation {
  source: {
    repoURL: string
    branch: string
    subtree: string
    versioning?: {
      tagPattern: string
    }
  }
}
