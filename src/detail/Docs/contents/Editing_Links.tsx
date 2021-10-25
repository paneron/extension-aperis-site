/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { OL, UL } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React from 'react';


export default function () {
  return <>
    <p>
      When allowed by the schema, you can insert a link as follows:
    </p>

    <OL>
      <li>Select a span of text</li>
      <li>Click the “Make a link” toolbar button</li>
      <li>Click on the span of text, which should have changed color, and edit link properties</li>
    </OL>

    <p>
      Currently, two link schemas are supported:
    </p>

    <UL>
      <li>Regular Web URLs that use <code>https</code> (preferred) or <code>http</code> protocol</li>
      <li>URN references (currently, only ISO standards are supported)</li>
    </UL>
  </>
}

