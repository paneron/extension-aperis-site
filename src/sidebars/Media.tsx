/** @jsx jsx */
/** @jsxFrag React.Fragment */

//import log from 'electron-log';
import React, { useContext } from 'react';
import { jsx, css } from '@emotion/react';
import { Spinner } from '@blueprintjs/core';
import makeSearchResultList from '@riboseinc/paneron-extension-kit/widgets/SearchResultList';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { AperisContext } from '../context';
import type { DeserializedMediaItem, SourceEntryType } from '../types';
import MediaItem from '../lists/MediaItem';
import SVGPreview from '../widgets/SVGPreview';
import { getMime, getMediaDir, posixBasename } from '../util';


/** Selected entry media list. Can be used in a sidebar. */
const Media: React.VoidFunctionComponent<{
  /** Invoked with a media filename (relative to media dir) if it’s opened (double-click or otherwise). */
  onChooseItem?: (relativeMediaFilename: string) => void
}> = React.memo(function ({ onChooseItem }) {
  const {
    previewedMediaPath,
    previewMediaPath,
    lastSelectedSourceEntry: { type: entryType, path: selectedPath },
  } = useContext(AperisContext);

  if (entryType !== 'page' && entryType !== 'post') {
    return <div css={css`padding: 15px;`}>Not applicable.</div>;
  }

  const mediaPath = getMediaDir(entryType, selectedPath);
  const pathComponentCount = selectedPath.split('/').length;
  const mediaPathComponentCount = pathComponentCount + 1;
  const queryExp = `return objPath.startsWith("${mediaPath}/") && (objPath.endsWith('.png') || objPath.endsWith('.svg') || objPath.endsWith('.jpg')) && objPath.split('/').length === ${mediaPathComponentCount}`;

  return (
    <div css={css`display: flex; flex-flow: column nowrap;`}>
      <div css={css`background: white; height: 20vh; display: flex; flex-flow: column nowrap; align-items: center; justify-content: center;`}>
        {previewedMediaPath
          ? <MediaPreview
              css={css`height: 20vh; max-height: calc(20vh - 10px);`}
              entryType={entryType}
              entryPath={selectedPath}
              mediaPath={previewedMediaPath}
            />
          : <span css={css`position: absolute; inset: auto;`}>(nothing to preview)</span>}
      </div>
      <div css={css`height: 20vh;`}>
        <SearchResultList
          queryExpression={queryExp}
          selectedItemPath={previewedMediaPath ?? null}
          onSelectItem={previewMediaPath
            ? path => previewMediaPath(path ?? undefined)
            : () => void 0}
          onOpenItem={onChooseItem
            ? (objPath => onChooseItem(objPath.replace(mediaPath, '')))
            : undefined}
        />
      </div>
    </div>
  );
});

export default Media;


const MediaPreview: React.VoidFunctionComponent<{
  entryType: SourceEntryType
  entryPath: string
  mediaPath: string
  className?: string
}> = function ({ entryType, entryPath, mediaPath, className }) {
  const { useObjectData } = useContext(DatasetContext);
  const mediaDir = getMediaDir(entryType, entryPath);
  const mediaBasename = posixBasename(mediaPath);
  const _mediaPath = `${mediaDir}/${mediaBasename}`;
  const data = useObjectData({ objectPaths: [_mediaPath] }).value.data[_mediaPath];
  const mime = getMime(mediaBasename);

  if (data && mime) {
    if (data?.asBase64) {
      return <img src={`data:${mime};base64,${data.asBase64}`} className={className} />;
    } else if (mime.startsWith('image/svg') && data?.asText) {
      return <SVGPreview svgData={data.asText} className={className} />
    } else {
      return <Spinner />;
    }
  } else {
    //throw new Error(`Unable to determine data URI MIME for ${mediaBasename}`);
    return <Spinner />;
  }
}


const SearchResultList = makeSearchResultList<DeserializedMediaItem>(MediaItem, () => ({
  name: 'image',
  iconProps: {
    icon: 'media',
  },
}));



// const PageMedia: React.FC<{
//   media: string[]
//   mediaData: ReturnType<Hooks.Data.GetObjectDataset>
//   onAdd?: () => Promise<void>
//   onDelete?: (idx: number) => Promise<void>
// }> = function ({ media, mediaData, onAdd, onDelete }) {
//   if (mediaData.isUpdating) {
//     return <Spinner />;
//   }
//   return (
//     <>
//       {media.map((mediaFileName, idx) => {
//         const hasFile = Object.keys(mediaData.value).find(p => nodePath.basename(p) === mediaFileName) !== undefined;
//         return (
//           <FieldWithErrors
//               key={`media-${idx}`}
//               helperText={idx === media.length - 1
//                 ? "You can use media in page contents by clicking “Insert image” in editor toolbar."
//                 : undefined}
//               label={<>
//                 {media.length > 1
//                   ? <Tag css={css`font-family: monospace`} round minimal>{idx + 1}</Tag>
//                   : null}
//                 &ensp;
//                 Media:
//               </>}
//               errors={[]}
//               inline
//               css={css`margin-bottom: .5em; .bp3-form-content { flex: 1; }`}>
//             <ControlGroup>
//               <InputGroup fill value={mediaFileName} disabled />
//               {!hasFile
//                 ? <Tooltip content="Media file cannot be found"><Button intent="warning" disabled icon="warning-sign" /></Tooltip>
//                 : null}
//               <Button
//                 disabled={!onDelete}
//                 title="Delete media from page"
//                 onClick={() => onDelete ? onDelete(idx) : void 0}>Delete</Button>
//             </ControlGroup>
//           </FieldWithErrors>
//         );
//       })}
// 
//       <Button disabled={!onAdd} onClick={onAdd} css={css`margin: 1rem`} icon="media">
//         Add media
//       </Button>
//     </>
//   );
// };
