/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Spec } from 'immutability-helper';
import React, { useContext, useState } from 'react';
import { jsx } from '@emotion/react';
import { Button, ControlGroup, InputGroup } from '@blueprintjs/core';
import { AperisContext } from '../context';
import useSingleSourceEntryData from '../useSingleDocPageData';
import { StaticPage } from '../types';


const Redirects: React.VoidFunctionComponent<Record<never, never>> = function () {
  const { lastSelectedSourceEntry: { type: parentType, path: selectedPath }, operations } = useContext(AperisContext);
  const pageDataResp = useSingleSourceEntryData<StaticPage>(selectedPath);
  const pageData = pageDataResp.value;

  if (parentType !== 'page') {
    return <>N/A</>;
  }

  async function updatePage(details: string, spec: Spec<StaticPage>) {
    if (pageData !== null && operations) {
      await operations.pages.update(selectedPath, details, pageData, spec);
    } else {
      throw new Error("Can’t update page: old page data is not available");
    }
  }

  const deleteRedirect = (idx: number) => async () => {
    await updatePage('deleting redirect', { redirectFrom: {
      $splice: [[idx, 1]],
    } });
  }

  const updateRedirect = (idx: number) => async (val: string) => {
    await updatePage('updating redirect', { redirectFrom: {
      [idx]: { $set: val.replace(/^\//, '').replace(/\/$/, '') },
    } });
  }

  const addRedirect = async (val: string) => {
    if (pageData?.redirectFrom !== undefined) {
      await updatePage('updating redirect', { redirectFrom: {
        $push: [val],
      } });
    } else {
      await updatePage('updating redirect', { redirectFrom: {
        $set: [val],
      } });
    }
  }

  return (
    <ControlGroup vertical>
      {(pageData?.redirectFrom ?? []).map((redirect, idx) =>
        <RedirectItem
          key={idx}
          redirect={redirect}
          onDelete={operations ? deleteRedirect(idx) : undefined}
          onChange={operations ? updateRedirect(idx) : undefined}
        />
      )}
      <RedirectItem
        key={selectedPath}
        redirect=""
        onChange={operations ? addRedirect : undefined}
      />
    </ControlGroup>
  );
};

const RedirectItem: React.VoidFunctionComponent<{
  redirect: string
  onDelete?: () => void
  onChange?: (newURI: string) => void
}> = function ({ redirect, onChange, onDelete }) {
  const [edited, setEdited] = useState<null | string>(null);

  return (
    <InputGroup
      fill
      placeholder="Path to redirect from…"
      value={edited ?? redirect}
      disabled={!onChange}
      onChange={evt => setEdited(evt.currentTarget.value)}
      rightElement={edited !== null && edited !== redirect && onChange
        ? <Button
            minimal
            icon="tick-circle"
            disabled={!onChange}
            title="Save changes"
            intent="primary"
            onClick={onChange
              ? () => { onChange(edited); setEdited(null); }
              : undefined} />
        : <Button
            minimal
            icon="cross"
            disabled={!onDelete}
            title="Delete this redirect"
            onClick={onDelete} />
      }
    />
  )
};

export default Redirects;
