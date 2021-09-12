import { ObjectChangeset } from '@riboseinc/paneron-extension-kit/types';
import { SiteSettings } from '../types';

export interface DeploymentSetup {
  title: string
  description: string
  getChangeset: (settings: SiteSettings, remove: boolean) => ObjectChangeset
}
