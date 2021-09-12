/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React, { useContext } from 'react';
import { jsx } from '@emotion/react';
import { AperisContext } from '../context';


const MovePage: React.VoidFunctionComponent<Record<never, never>> =
function () {
  const { lastSelectedSourceEntry: { type: entryType } } = useContext(AperisContext);
  if (entryType === 'page' || entryType === 'post') {
    return <span>Coming soon</span>;
  } else {
    return <>N/A</>;
  }
};

export default MovePage;
