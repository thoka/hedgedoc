/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import { buildErrorMessage } from './utils';

export interface ExternalConfig {
  plantUMLServer: string;
  imageProxy: string;
}

const schema = Joi.object({
  plantUMLServer: Joi.string().optional().label('HD_PLANTUML_SERVER'),
  imageProxy: Joi.string().optional().label('HD_IMAGE_PROXY'),
});

export default registerAs('externalConfig', () => {
  const externalConfig = schema.validate(
    {
      plantUMLServer: process.env.HD_PLANTUML_SERVER,
      imageProxy: process.env.HD_IMAGE_PROXY,
    },
    {
      abortEarly: false,
      presence: 'required',
    },
  );
  if (externalConfig.error) {
    const errorMessages = externalConfig.error.details.map(
      (detail) => detail.message,
    );
    throw new Error(buildErrorMessage(errorMessages));
  }
  return externalConfig.value as ExternalConfig;
});
