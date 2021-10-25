/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { H4 } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React from 'react';


export default function () {
  return <>
    <p>
      Content is formatted using semantic controls.
      Main controls are displayed in the toolbar above the text field,
      and other controls may be displayed in mini pop-ups when certain elements are selected.
    </p>

    <p>
      Different types of text use different semantic schema, and therefore different controls are available.
      For example, a summary of a page does not allow subsections,
      while page contents do allow subsections (even recursively).
    </p>

    <H4>Technical details</H4>

    <p>
      First version of Aperis was developed with AsciiDoc format as source.
      However, we’ve quickly realised that AsciiDoc isn’t sufficient as
      an authoritative storage for semantic data.
      Now, Aperis uses a ProseMirror-compatible hierarchical structure of content blocks,
      and we’re switching the rendering components to ProseMirror as well.
    </p>
  </>
}
