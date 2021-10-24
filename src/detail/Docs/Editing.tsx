/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';


export default function () {
  return <>
    <p>
      Content is edited using semantic controls.
    </p>

    <p>
      Different types of text use different semantic schema, and therefore different controls are available.
      For example, a summary of a page does not allow subsections,
      while page contents do allow subsections (even recursively).
    </p>
  </>
}
