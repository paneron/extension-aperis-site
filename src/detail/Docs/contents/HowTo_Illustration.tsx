/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { Button, OL } from '@blueprintjs/core';


export default function () {
  return <>
    <p>
      Where allowed by the schema, you can insert an illustration.
    </p>

    <OL>
      <li>If necessary, use Add an illustration block of the Illustrations sidebar to select a file &amp; add it to the repository</li>
      <li>Select a media file in the Available illustrations block of the Illustrations sidebar</li>
      <li>In the editor field, where a figure can be inserted, click <Button small text="Insert image" /> to insert selected media file wrapped in a figure</li>
    </OL>

    <p>
      Currently, only .png and .svg images are supported as illustrations.
      Please make sure to select images with appropriate dimensions.
    </p>
  </>
}

