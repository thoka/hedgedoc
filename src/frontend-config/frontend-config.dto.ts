/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ServerVersion } from '../monitoring/server-status.dto';

export class AuthProviders {
  /**
   * Is Facebook available as a auth provider?
   */
  @IsBoolean()
  facebook: boolean;

  /**
   * Is GitHub available as a auth provider?
   */
  @IsBoolean()
  github: boolean;

  /**
   * Is Twitter available as a auth provider?
   */
  @IsBoolean()
  twitter: boolean;

  /**
   * Is at least one GitLab server available as a auth provider?
   */
  @IsBoolean()
  gitlab: boolean;

  /**
   * Is DropBox available as a auth provider?
   */
  @IsBoolean()
  dropbox: boolean;

  /**
   * Is at least one LDAP server available as a auth provider?
   */
  @IsBoolean()
  ldap: boolean;

  /**
   * Is Google available as a auth provider?
   */
  @IsBoolean()
  google: boolean;

  /**
   * Is at least one SAML provider available as a auth provider?
   */
  @IsBoolean()
  saml: boolean;

  /**
   * Is at least one OAuth2 provider available as a auth provider?
   */
  @IsBoolean()
  oauth2: boolean;

  /**
   * Is internal auth available?
   */
  @IsBoolean()
  internal: boolean;
}

export class BannerDto {
  /**
   * The text that is shown in the banner
   * @example This is a test banner
   */
  @IsString()
  text: string;

  /**
   * When the banner was last changed in ms since 01.01.1970
   * @example 1614610648000
   */
  @IsString()
  timestamp: string;
}

export class BrandingDto {
  /**
   * The name to be displayed next to the HedgeDoc logo
   * @example ACME Corp
   */
  @IsString()
  name: string;

  /**
   * The logo to be displayed next to the HedgeDoc logo
   */
  @IsString()
  logo: string;
}

export class CustomAuthEntry {
  /**
   * The identifier with which the auth provider can be called
   * @example gitlab
   */
  @IsString()
  identifier: string;

  /**
   * The name given to the auth provider
   * @example GitLab
   */
  @IsString()
  providerName: string;
}

export class CustomAuthNamesDto {
  /**
   * All configured GitLab server
   */
  @IsArray()
  @ValidateNested({ each: true })
  gitlab: CustomAuthEntry[];

  /**
   * All configured LDAP server
   */
  @IsArray()
  @ValidateNested({ each: true })
  ldap: CustomAuthEntry[];

  /**
   * All configured OAuth2 provider
   */
  @IsArray()
  @ValidateNested({ each: true })
  oauth2: CustomAuthEntry[];

  /**
   * All configured SAML provider
   */
  @IsArray()
  @ValidateNested({ each: true })
  saml: CustomAuthEntry[];
}

export class SpecialLinksDto {
  /**
   * A link to the privacy notice
   */
  @IsString()
  privacy: string;

  /**
   * A link to the terms of use
   */
  @IsString()
  termsOfUse: string;

  /**
   * A link to the imprint
   */
  @IsString()
  imprint: string;
}

export class IframeCommunicationDto {
  /**
   * The origin under which the editor page will be served
   * @example https://md.example.com
   */
  @IsString()
  editorOrigin: string;

  /**
   * The origin under which the renderer page will be served
   * @example https://md-renderer.example.com
   */
  @IsString()
  rendererOrigin: string;
}

export class FrontendConfigDto {
  /**
   * Is anonymous usage of the instance allowed?
   */
  @IsBoolean()
  allowAnonymous: boolean;

  /**
   * Are users allowed to register on this instance?
   */
  @IsBoolean()
  allowRegister: boolean;

  /**
   * Which auth providers are available?
   */
  @ValidateNested()
  authProviders: AuthProviders;

  /**
   * Individual branding information
   */
  @ValidateNested()
  branding: BrandingDto;

  /**
   * An optional banner that will be shown
   */
  @ValidateNested()
  banner: BannerDto;

  /**
   * The custom names of auth providers, which can be specified multiple times
   */
  @ValidateNested()
  customAuthNames: CustomAuthNamesDto;

  /**
   * Is an image proxy enabled?
   */
  @IsBoolean()
  useImageProxy: boolean;

  /**
   * Links to some special pages
   */
  @ValidateNested()
  specialLinks: SpecialLinksDto;

  /**
   * The version of HedgeDoc
   */
  @ValidateNested()
  version: ServerVersion;

  /**
   * The plantUML server that should be used to render.
   */
  @IsString()
  @IsOptional()
  plantumlServer: string;

  /**
   * The maximal length of each document
   */
  @IsNumber()
  maxDocumentLength: number;

  /**
   * The frontend capsules the markdown rendering into a secured iframe, to increase the security. The browser will treat the iframe target as cross-origin even if they are on the same domain.
   * You can go even one step further and serve the editor and the renderer on different (sub)domains to eliminate even more attack vectors by making sessions, cookies, etc. not available for the renderer, because they aren't set on the renderer origin.
   * However, The editor and the renderer need to know the other's origin to communicate with each other, even if they are the same.
   */
  @ValidateNested()
  iframeCommunication: IframeCommunicationDto;
}
