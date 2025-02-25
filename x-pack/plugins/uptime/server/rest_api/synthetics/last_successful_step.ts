/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { schema } from '@kbn/config-schema';
import {
  isRefResult,
  isFullScreenshot,
  JourneyStep,
} from '../../../common/runtime_types/ping/synthetics';
import { UMServerLibs } from '../../lib/lib';
import { UMRestApiRouteFactory } from '../types';
import { API_URLS } from '../../../common/constants';

export const createLastSuccessfulStepRoute: UMRestApiRouteFactory = (libs: UMServerLibs) => ({
  method: 'GET',
  path: API_URLS.SYNTHETICS_SUCCESSFUL_STEP,
  validate: {
    query: schema.object({
      monitorId: schema.string(),
      stepIndex: schema.number(),
      timestamp: schema.string(),
      location: schema.maybe(schema.string()),
    }),
  },
  handler: async ({ uptimeEsClient, request, response }) => {
    const { timestamp, monitorId, stepIndex, location } = request.query;

    const step: JourneyStep | null = await libs.requests.getStepLastSuccessfulStep({
      uptimeEsClient,
      monitorId,
      stepIndex,
      timestamp,
      location,
    });

    if (step === null) {
      return response.notFound();
    }

    if (!step.synthetics?.step?.index) {
      return response.ok({ body: step });
    }

    const screenshot = await libs.requests.getJourneyScreenshot({
      uptimeEsClient,
      checkGroup: step.monitor.check_group,
      stepIndex: step.synthetics.step.index,
    });

    if (screenshot === null) {
      return response.ok({ body: step });
    }

    step.synthetics.isScreenshotRef = isRefResult(screenshot);
    step.synthetics.isFullScreenshot = isFullScreenshot(screenshot);

    return response.ok({
      body: step,
    });
  },
});
