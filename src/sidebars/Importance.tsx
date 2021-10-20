/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React, { useContext, useEffect, useState } from 'react';
import { jsx } from '@emotion/react';
import { Button, NumericInput } from '@blueprintjs/core';
import { AperisContext } from '../context';
import useSingleSourceEntryData from '../useSingleSourceEntryData';
import { StaticPage } from '../types';


const Importance: React.VoidFunctionComponent<Record<never, never>> = function () {
  const {
    lastSelectedSourceEntry: { type: parentType, path: selectedPath },
    operations,
  } = useContext(AperisContext);

  const pageDataResp = useSingleSourceEntryData<StaticPage>(selectedPath);
  const pageData = pageDataResp.value;

  const [editedImportance, setEditedImportance] = useState<null | number>(null);

  useEffect(() => {
    setEditedImportance(null);
  }, [selectedPath]);

  if (parentType !== 'page') {
    return <></>;
  }

  const updateImportance = async () => {
    if (operations && editedImportance !== null && pageData !== null) {
      await operations.pages.update(selectedPath, 'updating importance', pageData, { importance: {
        $set: editedImportance,
      } });
      setEditedImportance(null);
    }
  }

  return (
    <>
      <NumericInput
        value={editedImportance ?? pageData?.importance ?? 0}
        onValueChange={setEditedImportance}
        fill
        rightElement={
          <Button
            minimal
            icon="tick-circle"
            disabled={editedImportance === null || pageData === null}
            intent={editedImportance !== null ? 'primary' : undefined}
            onClick={updateImportance}
            text="Confirm"
          />}
      />
    </>
  );
};

export default Importance;
