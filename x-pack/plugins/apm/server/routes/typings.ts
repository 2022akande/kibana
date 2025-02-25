/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  CoreSetup,
  RequestHandlerContext,
  Logger,
  KibanaRequest,
  CoreStart,
} from 'src/core/server';
import { IRuleDataClient } from '../../../rule_registry/server';
import { AlertingApiRequestHandlerContext } from '../../../alerting/server';
import type { RacApiRequestHandlerContext } from '../../../rule_registry/server';
import { LicensingApiRequestHandlerContext } from '../../../licensing/server';
import { APMConfig } from '..';
import { APMPluginDependencies } from '../types';
import { UsageCollectionSetup } from '../../../../../src/plugins/usage_collection/server';
import { UxUIFilters } from '../../typings/ui_filters';

export interface ApmPluginRequestHandlerContext extends RequestHandlerContext {
  licensing: LicensingApiRequestHandlerContext;
  alerting: AlertingApiRequestHandlerContext;
  rac: RacApiRequestHandlerContext;
}

export interface APMRouteCreateOptions {
  options: {
    tags: Array<
      | 'access:apm'
      | 'access:apm_write'
      | 'access:ml:canGetJobs'
      | 'access:ml:canCreateJob'
    >;
    body?: { accepts: Array<'application/json' | 'multipart/form-data'> };
    disableTelemetry?: boolean;
  };
}

export type TelemetryUsageCounter = ReturnType<
  UsageCollectionSetup['createUsageCounter']
>;

export interface APMRouteHandlerResources {
  request: KibanaRequest;
  context: ApmPluginRequestHandlerContext;
  params: {
    query: {
      _inspect: boolean;
      start?: number;
      end?: number;
      uiFilters?: UxUIFilters;
    };
  };
  config: APMConfig;
  logger: Logger;
  core: {
    setup: CoreSetup;
    start: () => Promise<CoreStart>;
  };
  plugins: {
    [key in keyof APMPluginDependencies]: {
      setup: Required<APMPluginDependencies>[key]['setup'];
      start: () => Promise<Required<APMPluginDependencies>[key]['start']>;
    };
  };
  ruleDataClient: IRuleDataClient;
  telemetryUsageCounter?: TelemetryUsageCounter;
  kibanaVersion: string;
}
