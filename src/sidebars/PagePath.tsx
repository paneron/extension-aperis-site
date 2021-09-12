/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useContext } from 'react';
import { AperisContext } from '../context';
import PropertyView, { TextInput } from '@riboseinc/paneron-extension-kit/widgets/Sidebar/PropertyView';


const PagePath: React.VoidFunctionComponent<Record<never, never>> =
function () {
  const { lastSelectedSourceEntry: { path: entryPath } } = useContext(AperisContext);
  const url = entryPath.replace('index.yaml', '');
  return <>
    <PropertyView label="File">
      <TextInput value={entryPath} />
    </PropertyView>
    <PropertyView label="URL">
      <TextInput value={url} />
    </PropertyView>
  </>;
};

export default PagePath;
