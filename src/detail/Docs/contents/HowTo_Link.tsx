/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { Button, OL, UL } from '@blueprintjs/core';


export default function () {
  return <>
    <p>
      Where allowed by the schema, you can insert a link as follows:
    </p>

    <OL>
      <li>Select a span of text</li>
      <li>Click “Make a link” toolbar button (<Button small icon="link" />)</li>
      <li>Click on the span of text, which should have changed color</li>
      <li>In the pop-up that appears, specify link target and click the confirmation button</li>
    </OL>

    <p>
      Currently, two link schemas are supported:
    </p>

    <UL>
      <li>URLs using <code>https</code> (preferred) or <code>http</code> protocol</li>
      <li>URN references (currently, only ISO standards are supported)</li>
    </UL>
  </>
}

