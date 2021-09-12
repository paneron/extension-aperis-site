import { useContext } from 'react';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { ValueHook } from '@riboseinc/paneron-extension-kit/types';
import { SiteSettings, SiteSettingsFile } from '../types';
import { FOOTER_BANNER_FILENAME, HEADER_BANNER_FILENAME, SETTINGS_FILENAME } from './constants';
import { fromFileContents, validateSettingsFile } from './util';


const objPaths = {
  settings: `/${SETTINGS_FILENAME}`,
  headerBanner: `/${HEADER_BANNER_FILENAME}`,
  footerBanner: `/${FOOTER_BANNER_FILENAME}`,
}


export default function useSiteSettings(): ValueHook<SiteSettings | null> {
  const { useObjectData } = useContext(DatasetContext);

  const originalSettingsResp = useObjectData({
    objectPaths: [objPaths.settings, objPaths.headerBanner, objPaths.footerBanner],
  });

  const settingsData = originalSettingsResp.value.data[objPaths.settings] as SiteSettingsFile | null ;

  let value: SiteSettings | null;

  if (settingsData) {
    const settingsAreValid = validateSettingsFile(settingsData);
    if (settingsAreValid) {
      const headerBannerData = originalSettingsResp.value.data[objPaths.headerBanner];
      const footerBannerData = originalSettingsResp.value.data[objPaths.footerBanner];
      value = fromFileContents(
        settingsData,
        headerBannerData?.asText,
        footerBannerData?.asText,
      );
    } else {
      value = null;
    }
  } else {
    value = null;
  }

  return {
    ...originalSettingsResp,
    value,
  };
}
