/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useState, useEffect, useContext } from 'react';
import { Spinner } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';

import { toBase64 } from '../util';


const SVGPreview: React.VoidFunctionComponent<{
  /** Not really a blob—rather, text representation of the SVG. (Misnomer.) */
  svgData: string
  className?: string
}> = React.memo(function ({ svgData, className }) {
  const { getBlob } = useContext(DatasetContext);

  const [previewDataURL, setPreviewDataURL] = useState<null | string>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!getBlob) {
        console.error("Failed to convert SVG to base64: `getBlob()` is not available");
        return;
      }
      if (!svgData) {
        console.error("Failed to convert SVG to base64: SVG string contents is empty", svgData);
        return;
      }

      let base64string: string;
      try {
        base64string = toBase64(await getBlob(svgData));
      } catch (e) {
        console.error("Failed to convert SVG contents to base64", e);
        return;
      }

      if (!base64string.trim()) {
        console.error("Failed to convert SVG contents to base64 (got empty string)");
      }

      const dataURL = `data:image/svg+xml;base64,${base64string}`;

      if (cancelled) {
        return;
      }

      setPreviewDataURL(dataURL);
    })();

    return function cleanUp() {
      cancelled = true;
    };
  }, [svgData, getBlob]);

  return (previewDataURL
    ? <img src={previewDataURL} className={className} />
    : <Spinner />)
});


export default SVGPreview;
