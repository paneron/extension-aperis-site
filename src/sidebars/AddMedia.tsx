/** @jsx jsx */
/** @jsxFrag React.Fragment */

import log from 'electron-log';
import React, { useContext } from 'react';
import { jsx } from '@emotion/react';
import { Button } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { ObjectDataset } from '@riboseinc/paneron-extension-kit/types/objects';
import { AperisContext } from '../context';
import { getAddMediaChangeset } from '../update';


const AddMedia: React.VoidFunctionComponent<Record<never, never>> =
function () {
  const { lastSelectedSourceEntry: { type: entryType, path: entryPath } } = useContext(AperisContext);

  const { performOperation, requestFileFromFilesystem, updateObjects } = useContext(DatasetContext);

  async function _handleAddIllustration() {
    if (!requestFileFromFilesystem) {
      throw new Error("Unable to request a file from filesystem: function not available");
    }
    if (!updateObjects) {
      throw new Error("Unable to update entry: function not available");
    }

    const selectedFiles: ObjectDataset = await requestFileFromFilesystem({
      prompt: "Choose images to add to this entry’s illustration collection",
      allowMultiple: false,
      filters: [{ name: "PNG and JPEG images", extensions: ['png', 'jpeg', 'jpg'] }],
    });

    log.info("Got files", selectedFiles);

    const objectChangeset = getAddMediaChangeset(entryType, entryPath, selectedFiles);

    //throw new Error(JSON.stringify(objectChangeset, undefined, 2));

    await updateObjects({
      commitMessage: `Add media to page ${entryPath}`,
      objectChangeset,
      _dangerouslySkipValidation: true,
    });
  }

  const handleAddIllustration = performOperation('adding media', _handleAddIllustration);

  if (entryType !== 'page' && entryType !== 'post') {
    return <>N/A</>;
  }

  return (
    <Button
        fill
        onClick={handleAddIllustration}
        icon="add-to-folder"
        disabled={!requestFileFromFilesystem || !updateObjects}>
      Select file…
    </Button>
  );
};

export default AddMedia;
