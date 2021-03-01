/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import {
  AuthProviders,
  BannerDto,
  BrandingDto,
  CustomAuthNamesDto,
  FrontendConfigDto,
  IframeCommunicationDto,
  SpecialLinksDto,
} from './frontend-config.dto';
import authConfiguration, { AuthConfig } from '../config/auth.config';
import customizationConfiguration, {
  CustomizationConfig,
} from '../config/customization.config';
import appConfiguration, { AppConfig } from '../config/app.config';
import externalConfiguration, {
  ExternalConfig,
} from '../config/external.config';
import { getServerVersionFromPackageJson } from '../utils/serverVersion';
import { promises as fs, Stats } from 'fs';
import { join } from 'path';

@Injectable()
export class FrontendConfigService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @Inject(appConfiguration.KEY)
    private appConfig: AppConfig,
    @Inject(authConfiguration.KEY)
    private authConfig: AuthConfig,
    @Inject(customizationConfiguration.KEY)
    private customizationConfig: CustomizationConfig,
    @Inject(externalConfiguration.KEY)
    private externalConfig: ExternalConfig,
  ) {
    this.logger.setContext(FrontendConfigService.name);
  }

  async getFrontendConfig(): Promise<FrontendConfigDto> {
    return {
      allowAnonymous: false,
      allowRegister: this.authConfig.email.enableRegister,
      authProviders: this.getAuthProviders(),
      banner: await FrontendConfigService.getBanner(),
      branding: this.getBranding(),
      customAuthNames: this.getCustomAuthNames(),
      iframeCommunication: this.getIframeCommunication(),
      maxDocumentLength: this.appConfig.maxDocumentLength,
      plantumlServer: this.externalConfig.plantUMLServer,
      specialLinks: this.getSpecialLinks(),
      useImageProxy: !!this.externalConfig.imageProxy,
      version: await getServerVersionFromPackageJson(),
    };
  }

  private getAuthProviders(): AuthProviders {
    return {
      dropbox: !!this.authConfig.dropbox.clientID,
      facebook: !!this.authConfig.facebook.clientID,
      github: !!this.authConfig.github.clientID,
      gitlab: this.authConfig.gitlab.length !== 0,
      google: !!this.authConfig.google.clientID,
      internal: this.authConfig.email.enableLogin,
      ldap: this.authConfig.ldap.length !== 0,
      oauth2: this.authConfig.oauth2.length !== 0,
      saml: this.authConfig.saml.length !== 0,
      twitter: !!this.authConfig.twitter.consumerKey,
    };
  }

  private getCustomAuthNames(): CustomAuthNamesDto {
    return {
      gitlab: this.authConfig.gitlab.map((entry) => {
        return {
          identifier: entry.identifier,
          providerName: entry.providerName,
        };
      }),
      ldap: this.authConfig.ldap.map((entry) => {
        return {
          identifier: entry.identifier,
          providerName: entry.providerName,
        };
      }),
      oauth2: this.authConfig.oauth2.map((entry) => {
        return {
          identifier: entry.identifier,
          providerName: entry.providerName,
        };
      }),
      saml: this.authConfig.saml.map((entry) => {
        return {
          identifier: entry.identifier,
          providerName: entry.providerName,
        };
      }),
    };
  }

  private getBranding(): BrandingDto {
    return {
      logo: this.customizationConfig.branding.customLogo,
      name: this.customizationConfig.branding.customName,
    };
  }

  private getSpecialLinks(): SpecialLinksDto {
    return {
      imprint: this.customizationConfig.specialLinks.imprint,
      privacy: this.customizationConfig.specialLinks.privacy,
      termsOfUse: this.customizationConfig.specialLinks.termsOfUse,
    };
  }

  private getIframeCommunication(): IframeCommunicationDto {
    return {
      editorOrigin: this.appConfig.domain,
      rendererOrigin: this.appConfig.rendererOrigin,
    };
  }

  private static async getBanner(): Promise<BannerDto> {
    const path = join(__dirname, '../../banner.md');
    try {
      const bannerContent: string = await fs.readFile(path, {
        encoding: 'utf8',
      });
      const fileStats: Stats = await fs.stat(path);
      return {
        text: bannerContent,
        timestamp: fileStats.mtimeMs.toString(),
      };
    } catch (e) {
      return {
        text: '',
        timestamp: '0',
      };
    }
  }
}
