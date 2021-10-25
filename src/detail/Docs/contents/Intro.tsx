/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useContext } from 'react';
import { H4, OL } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';


export default function () {
  const { openExternalLink } = useContext(DatasetContext);

  return <>
    <p>
      This is documentation for a <a onClick={() => openExternalLink({ uri: 'https://paneron.org' })}>Paneron</a> extension
      intended for editing Aperis sites.
    </p>

    <H4>What is Aperis?</H4>

    <p>
      Aperis is an open-source framework that aims to simplify authoring open project websites.
    </p>

    <p>
      A project website can contain different associated software, specifications, respective documentation & reference, and news/blog articles.
    </p>

    <H4>Test preview version note</H4>

    <p>
      Aperis itself and this extension are under active development.
      Some features are missing, and there are gaps in documentation.
    </p>

    <H4>Why Aperis?</H4>

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
