/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React, { useContext } from 'react';
import { jsx } from '@emotion/react';
import { SourceEntryView, StaticPage } from '../../types';
import StaticPageForm from '../../StaticPageForm';
import { AperisContext } from '../../context';


const PageDetail: SourceEntryView<StaticPage> = function ({ entryData, entryPath }) {
  const { operations } = useContext(AperisContext);

  async function handleSave(originalData: StaticPage, newData: StaticPage) {
    await operations?.pages.replace(entryPath, 'changed something', originalData, newData);
  }

  return <StaticPageForm
    pagePath={entryPath}
    pageData={entryData}
    onSave={operations ? handleSave : undefined}
  />;
}

const PageTitle: SourceEntryView<StaticPage> = function ({ entryData, entryPath }) {
  return <>{entryData.title ?? `(${entryPath})`}</>
}

export default { main: PageDetail, title: PageTitle, plainTitle: async () => "static page" };
