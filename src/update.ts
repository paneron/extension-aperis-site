// import log from 'electron-log';
// import yaml from 'js-yaml';
import path from 'path';

import { ObjectChange, ObjectChangeset } from '@riboseinc/paneron-extension-kit/types/objects';

import { SourceEntryType } from './types';
import { BufferDataset } from '@riboseinc/paneron-extension-kit/types/buffers';
import { getMediaDir } from './util';


export function getAddMediaChangeset(
  entryType: SourceEntryType,
  entryPath: string,
  mediaBufferDataset: BufferDataset,
): ObjectChangeset {
  let changeset: ObjectChangeset = {};

  const entryMediaPath = getMediaDir(entryType, entryPath);

  for (const [objectPath, objectData] of Object.entries(mediaBufferDataset)) {
    if (objectData === null) {
      continue;
    }

    const relativeMediaFilename = path.posix.basename(objectPath);
    const targetPath = path.posix.join(entryMediaPath, relativeMediaFilename);

    changeset[targetPath] = {
      oldValue: undefined,
      newValue: { binaryData: objectData },
    } as ObjectChange;
  }

  return changeset;
}


// /* Can be used to move files corresponding to given media items to another directory,
//    or to delete them (e.g., if the page is getting deleted). */
// export function getUpdateMediaChangeset(
//   media: StaticPage["media"],
//   mediaData: ReturnType<DocPageMediaHook>["value"],
//   sourceDir: string,
//   targetDir: string | null,
// ): ObjectChangeset {
//   let changeset: ObjectChangeset = {};
// 
//   log.info("Update media changeset", arguments);
//   if (sourceDir === null) {
//     log.error("Update media: Missing source dir", media);
//     throw new Error("Missing source directory");
//   }
//   if (sourceDir === targetDir) {
//     log.warn("Update media: Source and target dirs are the same");
//     return {};
//   }
//   if (sourceDir.startsWith('/') || targetDir?.startsWith('/')) {
//     log.warn("Leading slashes when getting update media changeset");
//   }
//   //log.debug("Getting update media changeset", media, mediaData, sourceDir, targetDir);
// 
//   for (const relativeMediaFilename of media) {
//     const fileData = mediaData.data[path.posix.join(sourceDir, relativeMediaFilename)];
// 
//     if (fileData === null) {
//       log.error("Updating media: Cannot find media data", fileData);
//       throw new Error("Cannot find media data to move");
//     }
// 
//     if (targetDir !== null) {
//       changeset[path.posix.join(targetDir, relativeMediaFilename)] = {
//         oldValue: null,
//         newValue: { binaryData: fileData.value },
//       };
//     }
// 
//     changeset[path.posix.join(sourceDir, relativeMediaFilename)] = {
//       oldValue: { binaryData: fileData.value },
//       newValue: null,
//     };
// 
//   }
//   return changeset;
// }


// export function getAddPageChangeset(
//   newPageFilePath: string,
//   newPageData: StaticPage,
//   parentFilePaths: { pathInUse: string, nestedPath: string, flatPath: string },
//   parentPageData: StaticPage,
//   parentPageMediaData: ReturnType<DocPageMediaHook>["value"],
// ): ObjectChangeset {
//   const parentDataYAML = yaml.dump(parentPageData, { noRefs: true });
// 
//   return {
//     [newPageFilePath]: {
//       oldValue: null,
//       newValue: newPageData,
//     },
//     [parentFilePaths.nestedPath]: {
//       oldValue: undefined,
//       newValue: parentDataYAML,
//     },
//     [parentFilePaths.flatPath]: {
//       oldValue: undefined,
//       newValue: null,
//     },
//   };
// }
