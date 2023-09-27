import code from '@riboseinc/reprose/features/code/schema';
import admonition from '@riboseinc/reprose/features/admonition/schema';
import emphasis from '@riboseinc/reprose/features/inline-emphasis/schema';
import paragraph from '@riboseinc/reprose/features/paragraph/schema';
import section from '@riboseinc/reprose/features/section/schema';
import lists from '@riboseinc/reprose/features/lists/schema';
import links from '@riboseinc/reprose/features/links/schema';
import image, { FeatureOptions as ImageFeatureOptions } from '@riboseinc/reprose/features/image/schema';
import figure from '@riboseinc/reprose/features/figure/schema';

import featuresToSchema from '@riboseinc/reprose/schema';

import { getMime } from '../util';


export function getImageFeatureOptions(protocol: string, imageDirAbsPath: string): ImageFeatureOptions {
  return {
    getSrcToShow: (src) => `${protocol}${imageDirAbsPath}/${src}`,
    getSrcToStore: (src) => src.replace(`${protocol}${imageDirAbsPath}`, ''),
  };
};

export function getImageFeatureOptions2(
  /** Dataset-relative path to media (could be page-specific, for example). */
  imageDir: string,
  /** Given dataset-relative path to a media file, returns Base64-rendered representation. */
  asBase64: ((srcPath: string) => string) | ((srcPath: string) => Promise<string>),
): ImageFeatureOptions {
  return {
    getSrcToShow: async function getSrcToRenderInDOM (src) {
      const path = `${imageDir}/${src}`;
      const mime = getMime(src);
      if (!mime) {
        throw new Error(`Unable to determine mime for ${src}`);
      }
      const base64 = await asBase64(path);
      return `data:${mime};base64,${base64}`;
    },
    getSrcToStore: function getSrcToStore (src) { return src; },
  };
};

export function getContentsSchema(opts: { image: ImageFeatureOptions }) {
  return featuresToSchema([
    paragraph,
    lists,
    admonition,
    emphasis,
    section,
    image(opts.image),
    figure,
    links(),
    code({ allowBlocks: true }),
  ]);
}

export const summarySchema = featuresToSchema([
  emphasis,
  code({ allowBlocks: false }),
]);
