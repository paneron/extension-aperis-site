import { ObjectChangeset } from '@riboseinc/paneron-extension-kit/types/objects';
import { SiteSettings, SiteSettingsFile } from '../types';
import {
  DEFAULT_FOOTER_BANNER_SVG,
  DEFAULT_HEADER_BANNER_SVG,
  FOOTER_BANNER_FILENAME,
  HEADER_BANNER_FILENAME,
  SETTINGS_FILENAME,
} from './constants';


export function toFileContents(settings: SiteSettings): SiteSettingsFile {
  return {
    title: settings.title,
    docsURLPrefix: settings.docsURLPrefix,
    siteURLPrefix: settings.siteURLPrefix,
    footerBannerLink: settings.footerBannerLink,
    deploymentSetup: settings.deploymentSetup,
  };
}

export function fromFileContents(
  settingsFileData: SiteSettingsFile,
  headerBannerBlob: string = DEFAULT_HEADER_BANNER_SVG,
  footerBannerBlob: string = DEFAULT_FOOTER_BANNER_SVG,
): SiteSettings | null {
  return {
    title: settingsFileData.title,
    docsURLPrefix: settingsFileData.docsURLPrefix,
    siteURLPrefix: settingsFileData.siteURLPrefix,
    footerBannerLink: settingsFileData.footerBannerLink,

    headerBannerBlob,
    footerBannerBlob,
    deploymentSetup: settingsFileData.deploymentSetup || null,
  };
}

export function validateSettingsFile(settingsFileData: SiteSettingsFile): boolean {
  const settingsFormatIsCorrect: boolean = (
    (settingsFileData.title || '') !== '' &&
    settingsFileData.docsURLPrefix !== undefined &&
    settingsFileData.siteURLPrefix !== undefined &&
    (settingsFileData.footerBannerLink || '') !== '');
  return settingsFormatIsCorrect;
}


export function toObjectChangeset(settings: SiteSettings | null): ObjectChangeset {
  if (settings) {
    const settingsFileData = toFileContents(settings);
    return {
      [`/${SETTINGS_FILENAME}`]: {
        oldValue: undefined,
        newValue: settingsFileData,
      },
      [`/${HEADER_BANNER_FILENAME}`]: {
        oldValue: undefined,
        newValue: { asText: settings.headerBannerBlob ?? DEFAULT_HEADER_BANNER_SVG },
      },
      [`/${FOOTER_BANNER_FILENAME}`]: {
        oldValue: undefined,
        newValue: { asText: settings.footerBannerBlob ?? DEFAULT_FOOTER_BANNER_SVG },
      },
    };
  } else {
    return {
      [`/${SETTINGS_FILENAME}`]: {
        oldValue: undefined,
        newValue: null,
      },
      [`/${HEADER_BANNER_FILENAME}`]: {
        oldValue: undefined,
        newValue: null,
      },
      [`/${FOOTER_BANNER_FILENAME}`]: {
        oldValue: undefined,
        newValue: null,
      },
    };
  }
}
