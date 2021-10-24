/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { OL } from '@blueprintjs/core';


export default function () {
  return <>
    <p>
      Aperis aims to allow to easily author and update websites for open projects.
    </p>

    <p>
      Each project can contain different associated software, specifications, respective documentation & reference, and news/blog articles.
    </p>

    <p>
      Some distinguishing features of Aperis are:
    </p>
    <OL>
      <li>visual, semi-realtime collaborative editing experience for site authors</li>
      <li>focus on semantic, open structured data and interoperability</li>
      <li>out-of-the-box nicely looking and easy to browse reader’s view, and</li>
      <li>sustainable, statically generated websites.</li>
    </OL>

    <p>
      This combination is what we found lacking among the various general-purpose CMS and developer-oriented SSGs.
    </p>
  </>
}
