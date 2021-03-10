/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { IsDate, IsString } from 'class-validator';

export class MediaUploadDto {
  /**
   * The link to the media file.
   * @example "example.com/uploads/testfile123.jpg"
   */
  @IsString()
  link: string;

  /**
   * The noteId of the note to which the uploaded file is linked to.
   * @example "noteId" TODO how looks a note id?
   */
  @IsString()
  noteId: string;

  /**
   * The date when the upload objects was created.
   * @example "2020-12-01 12:23:34"
   */
  @IsDate()
  createdAt: Date;

  /**
   * The userName of the user which uploaded the media file.
   * @example "testuser5"
   */
  @IsString()
  userName: string;
}
