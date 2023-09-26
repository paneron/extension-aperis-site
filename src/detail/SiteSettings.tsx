/** @jsx jsx */
/** @jsxFrag React.Fragment */

//import log from 'electron-log';
import { css, jsx } from '@emotion/react';
import React, { useState, useEffect, useContext } from 'react';
import { Button, ControlGroup, FormGroup, InputGroup, Menu, MenuDivider, MenuItem, NonIdealState } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import type { ObjectChangeset, ObjectDataset } from '@riboseinc/paneron-extension-kit/types/objects';

import deploymentSetup from '../deployment';
import useSiteSettings from '../site-settings/useSiteSettings';
import type { SiteSettings } from '../types';
import { toObjectChangeset } from '../site-settings/util';
import { SETTINGS_STUB } from '../site-settings/constants';
import { DetailWrapper } from './util';
import MenuWrapper from '../widgets/MenuWrapper';


const SiteSettings: React.FC<Record<never, never>> = function () {
  const { updateObjects, performOperation } = useContext(DatasetContext);

  const [editedSettings, updateEditedSettings] = useState<SiteSettings | null>(null);

  const originalSettings = useSiteSettings();

  const settings: SiteSettings | null = editedSettings ?? originalSettings.value;
  const isBusy: boolean = originalSettings.isUpdating;

  async function _handleWriteDeploymentSetup(setupID: string, settings: SiteSettings, remove = false) {
    let changeset: ObjectChangeset;
    const setup = deploymentSetup[setupID];
    try {
      changeset = setup.getChangeset(settings, remove);
    } catch (e) {
      //console.error("Unable to retrieve changeset for deployment setup with ID", setupID);
      throw new Error(`Unable to retrieve changeset for deployment setup ${setupID}`);
    }

    //console.debug("Deployment changeset", JSON.stringify(changeset));

    const commitMessage = remove
      ? `Remove deployment setup ${setup.title}`
      : `Write deployment setup ${setup.title}`;

    await updateObjects!({
      commitMessage,
      objectChangeset: changeset,
      _dangerouslySkipValidation: true,
    });
  }

  async function _handleSaveSettings() {
    if (isBusy || !updateObjects || editedSettings === null || JSON.stringify(editedSettings) === JSON.stringify(originalSettings)) { return; }

    if (editedSettings.deploymentSetup !== originalSettings.value?.deploymentSetup) {
      if (originalSettings.value?.deploymentSetup) {
        await _handleWriteDeploymentSetup(originalSettings.value.deploymentSetup, originalSettings.value, true);
      }
    }
    if (editedSettings.deploymentSetup) {
      await _handleWriteDeploymentSetup(editedSettings.deploymentSetup, editedSettings, false);
    }

    //console.debug("Site settings changeset", toObjectChangeset(editedSettings));

    await updateObjects({
      commitMessage: "Update site settings",
      objectChangeset: toObjectChangeset(editedSettings),
      _dangerouslySkipValidation: true,
    });

    updateEditedSettings(null);
  }

  const handleSaveSettings = performOperation('writing site settings', _handleSaveSettings);

  if (settings === null) {
    return <NonIdealState
      description={
        <Button onClick={() => updateEditedSettings(SETTINGS_STUB)}>
          Initialize site settings
        </Button>
      }
    />
  }

  return (
    <DetailWrapper>
      <div css={css`padding: 15px; flex: 1;`}>
        <FormGroup>
          <InputGroup
            fill
            value={settings.title}
            disabled={isBusy}
            onChange={(evt: React.FormEvent<HTMLInputElement>) =>
              updateEditedSettings({ ...settings, title: evt.currentTarget.value })} />
        </FormGroup>

        <FormGroup label="Branding:">
          <SVGFileInputWithPreview
            text="Change header banner image"
            contentsBlob={settings.headerBannerBlob}
            onContentsChange={!isBusy ? (newBlob) => {
              updateEditedSettings({ ...settings, headerBannerBlob: newBlob })
            } : undefined}
          />
          <SVGFileInputWithPreview
            text="Change footer banner image"
            contentsBlob={settings.footerBannerBlob}
            onContentsChange={!isBusy ? (newBlob) => {
              updateEditedSettings({ ...settings, footerBannerBlob: newBlob })
            } : undefined}
          />
        </FormGroup>

        <FormGroup label="Footer banner link:" inline>
          <InputGroup
            value={settings.footerBannerLink}
            disabled={isBusy}
            onChange={(evt: React.FormEvent<HTMLInputElement>) =>
              updateEditedSettings({ ...settings, footerBannerLink: evt.currentTarget.value })} />
        </FormGroup>
        <FormGroup label="Prefixes:" labelInfo="(if in doubt, leave empty)">
          <ControlGroup>
            <InputGroup
              fill
              title="Global React site prefix under domain name, when deployed. Used e.g. in shared static hosting setups, like GitLab or GitHub Pages."
              placeholder="for the whole site"
              value={settings.siteURLPrefix}
              disabled={isBusy}
              onChange={(evt: React.FormEvent<HTMLInputElement>) =>
                updateEditedSettings({ ...settings, siteURLPrefix: evt.currentTarget.value })} />
            <InputGroup
              fill
              title="Path prefix for these docs within the React site."
              placeholder="for the docs"
              value={settings.docsURLPrefix}
              disabled={isBusy}
              onChange={(evt: React.FormEvent<HTMLInputElement>) =>
                updateEditedSettings({ ...settings, docsURLPrefix: evt.currentTarget.value })} />
          </ControlGroup>
        </FormGroup>
      </div>
      <MenuWrapper>
        <Button
            disabled={isBusy || editedSettings === null}
            onClick={handleSaveSettings}
            intent={editedSettings !== null ? 'success' : undefined}>
          Write site settings
        </Button>
        <Popover2
            content={
              <Menu>
                <MenuDivider title={settings.deploymentSetup ? "Remove deployment setup" : "Select deployment setup"} />
                {settings.deploymentSetup
                  ? <MenuItem
                        icon="trash"
                        disabled={isBusy || editedSettings !== null || !updateObjects}
                        onClick={() => updateEditedSettings({ ...settings, deploymentSetup: null })}
                        text={deploymentSetup[settings.deploymentSetup]?.title} />
                  : Object.entries(deploymentSetup).map(([setupID, setup]) =>
                      <MenuItem
                        key={setupID}
                        icon="add"
                        disabled={isBusy || editedSettings !== null || !updateObjects}
                        onClick={() => updateEditedSettings({ ...settings, deploymentSetup: setupID })}
                        text={setup.title}
                        title={setup.description} />
                    )}
              </Menu>
            }>
          <Button
            disabled={true /*isBusy || editedSettings !== null*/}
            title="Deployment setup configuration is disabled while we are implementing a more robust publication solution."
            icon="more"
          />
        </Popover2>
      </MenuWrapper>
    </DetailWrapper>
  );
};


const Buffer = require('electron').remote.getGlobal('Buffer');



const SVGFileInputWithPreview: React.VoidFunctionComponent<{
  text: string
  contentsBlob: string
  onContentsChange?: (blob: string) => void
}> = function ({ text, contentsBlob, onContentsChange }) {

  const { performOperation, requestFileFromFilesystem } = useContext(DatasetContext);

  const [previewDataURL, setPreviewDataURL] = useState<null | string>(null);

  useEffect(() => {
    let base64string: string;
    try {
      base64string = Buffer.from(contentsBlob, 'utf-8').toString('base64');
    } catch (e) {
      console.error("Failed to convert SVG contents to base64", e);
      return;
    }
    const dataURL = `data:image/svg+xml;base64,${base64string}`;
    setPreviewDataURL(dataURL);
  }, [contentsBlob]);

  async function _handleChangeFile() {
    if (!onContentsChange || !requestFileFromFilesystem) {
      return;
    }

    const result: ObjectDataset = await requestFileFromFilesystem({
      prompt: "Please choose a reasonably lightweight SVG file",
      filters: [{ name: "Images", extensions: ['svg'] }],
    });

    if (Object.keys(result).length !== 1) {
      throw new Error("More or fewer than one file was selected");
    }

    const chosenFile = Object.values(result)[0];
    if (!chosenFile) {
      throw new Error("More or fewer than one file was selected");
    }

    const fileContents = chosenFile.asString;

    //console.info("File contents", fileContents);

    onContentsChange(fileContents);
  }

  const handleChangeFile = performOperation('selecting file', _handleChangeFile);

  return (
    <div css={css`display: flex; flex-flow: row nowrap; align-items: center; overflow: hidden;`}>
      {previewDataURL
        ? <img
            src={previewDataURL}
            css={css`width: 2rem; height: 2rem; margin-right: .5rem; flex-shrink: 0;`} />
        : null}
      <Button alignText="left" fill disabled={!onContentsChange} onClick={handleChangeFile}>
        {text}
      </Button>
    </div>
  );
};


export default { main: SiteSettings, title: () => <>Site settings</>, plainTitle: async () => "site settings" };
