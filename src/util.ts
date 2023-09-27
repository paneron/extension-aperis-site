import type { SourceEntryType } from './types';


/**
 * For a given page or post, media/illustrations
 * will be stored in a subdirectory with this name (located next to index.yaml).
 */
const MEDIA_DIR = '_media';


/** Given slash-prepended dataset-relative object path, returns source entry type. */
export function getSourceEntryType(objectPath: string): SourceEntryType {
  if (objectPath === '/index.yaml') return 'landing';
  if (objectPath.startsWith('/pages/')) return 'page';
  if (objectPath.startsWith('/posts/')) return 'post';
  throw new Error(`Unknown entry type: ${JSON.stringify(objectPath)}`);
}


/** Given source page path, full with index.yaml, returns parent page path of same shape. */
export function getParentPagePath(ofPath: string): string | null {
  const pathComponents = ofPath.split('/');
  const pathComponentCount = pathComponents.length;
  const nestingLevel = pathComponentCount - 3;
  const hasParent = nestingLevel > 0;
  if (!hasParent) {
    return null;
  }
  const parentPathComponents = [
    ...pathComponents.slice(0, pathComponents.length - 2),
    'index.yaml',
  ];
  const parentPath = parentPathComponents.join('/');
  return parentPath;
}


export function posixBasename(path: string): string {
  const components = path.split('/');
  return components[components.length - 1];
}


/**
 * Given source entry type and entry path,
 * throws an error if entry path does not match type.
 * Otherwise, returns true.
 */
export function validateEntryPath(type: SourceEntryType, entryPath: string) {
  const invalid = getSourceEntryType(entryPath) !== type;
  if (invalid) {
    console.error("Invalid path for source entry type", type, entryPath);
    throw new Error("Invalid path for source entry type");
  }
  if (entryPath[0] !== '/') {
    console.error("Invalid source entry path: doesn’t have leading slash", type, entryPath);
    throw new Error("Invalid source entry path: doesn’t have leading slash");
  }
  if (!entryPath.endsWith('/index.yaml')) {
    console.error("Invalid source entry path: doesn’t end with index.yaml", type, entryPath);
    throw new Error("Invalid source entry path: doesn’t end with index.yaml");
  }
  return true;
}


/**
 * Given entry path (always ends with index.yaml),
 * returns respective media subdir path as dataset-relative path without trailing slashes.
 */
export function getMediaDir(entryType: SourceEntryType, entryPath: string): string {
  if (validateEntryPath(entryType, entryPath)) {
    return entryPath.replace('index.yaml', MEDIA_DIR);
  }
  throw new Error("Cannot obtain media dir: invalid entry path");
}


// Below may be obsolete.

export function isDocPageAt(objectPath: string) {
  return (
    objectPath.startsWith('/docs/') &&
    objectPath !== '/meta.yaml' &&
    objectPath.endsWith('.yaml'));
}


export function objectPathToDocsPath(filepath: string): string {
  return filepath.replace('/index.yaml', '').replace('.yaml', '').replace(/^\//, '');
}


/* Returns two candidates: first with index.yaml, second without.
   This is more for supporting repositories created outside the extension,
   since we always use `index.yaml` here. */
export function filepathCandidates(forDocPath: string): [asNested: string, asFlat: string] {
  const pathWithoutLeadingSlash = forDocPath.replace(/^\//, '');
  return [
    `/${pathWithoutLeadingSlash}/index.yaml`,
    `/${pathWithoutLeadingSlash}.yaml`,
  ];
}


/* Returns candidates from `filepathCandidates()`, but specified each under its key
   (“flat” path for /path/to/doc/page.yaml, “nested” path for /path/to/doc/page/index.yaml),
   with `pathInUse` key containing the actually used path
   (checked using given `allFiles`, which should contain a list of all files in the repo
   relative to its root with leading slash).
   Paths will have leading slashes. */
export function getDocPagePaths
(docPath: string, allFiles: string[]):
{ pathInUse: string, nestedPath: string, flatPath: string } {

  const [nestedPath, flatPath] = filepathCandidates(docPath);

  if (allFiles.filter(p => p === nestedPath || p === flatPath).length !== 1) {
    throw new Error("Could not reliably find existing doc page path");
  }

  const result = {
    nestedPath: nestedPath,
    flatPath: flatPath,
  };

  if (allFiles.indexOf(nestedPath) >= 0) {
    return { ...result, pathInUse: nestedPath };
  } else if (allFiles.indexOf(flatPath) >= 0) {
    return { ...result, pathInUse: flatPath };
  } else {
    throw new Error("Could not find existing doc page path");
  }
}


export const PROSEMIRROR_DOC_STUB = {
  type: 'doc',
  content: [
    { type: 'paragraph', content: [] },
  ],
};
