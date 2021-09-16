/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { MappingRuntimeFields } from '@elastic/elasticsearch/api/types';
import { IIndexPattern } from '../../../../../../../src/plugins/data/common';
import { DocValueFields } from '../../../../common/search_strategy/common';
import {
  BrowserFields,
  EMPTY_BROWSER_FIELDS,
  EMPTY_DOCVALUE_FIELD,
  EMPTY_INDEX_PATTERN,
} from '../../../../common/search_strategy/index_fields';

export type ErrorModel = Error[];

export enum SourcererScopeName {
  default = 'default',
  detections = 'detections',
  timeline = 'timeline',
}

export interface ManageScope {
  browserFields: BrowserFields;
  docValueFields: DocValueFields[];
  errorMessage: string | null;
  id: SourcererScopeName;
  indexPattern: IIndexPattern;
  indicesExist: boolean | undefined | null;
  loading: boolean;
  // Remove once issue resolved: https://github.com/elastic/kibana/issues/111762
  runtimeMappings: MappingRuntimeFields;
  selectedDataViewId: string;
  selectedPatterns: string[];
}

export interface ManageScopeInit extends Partial<ManageScope> {
  id: SourcererScopeName;
}

export type SourcererScopeById = {
  [id in SourcererScopeName]: ManageScope;
};

export interface KibanaDataView {
  /** Uniquely identifies a Kibana Index Pattern */
  id: string;
  /**  list of active patterns that return data  */
  patternList: string[];
  /**
   * title of Kibana Index Pattern
   * title also serves as "all pattern list", including inactive
   */
  title: string;
}

// ManageSourcerer
export interface SourcererModel {
  defaultDataView: KibanaDataView;
  kibanaDataViews: KibanaDataView[];
  signalIndexName: string | null;
  sourcererScopes: SourcererScopeById;
}

export const initSourcererScope = {
  browserFields: EMPTY_BROWSER_FIELDS,
  docValueFields: EMPTY_DOCVALUE_FIELD,
  errorMessage: null,
  indexPattern: EMPTY_INDEX_PATTERN,
  indicesExist: true,
  loading: false,
  runtimeMappings: {},
  selectedDataViewId: '',
  selectedPatterns: [],
};

export const initialSourcererState: SourcererModel = {
  defaultDataView: {
    id: '',
    title: '',
    patternList: [],
  },
  kibanaDataViews: [],
  signalIndexName: null,
  sourcererScopes: {
    [SourcererScopeName.default]: {
      ...initSourcererScope,
      id: SourcererScopeName.default,
    },
    [SourcererScopeName.detections]: {
      ...initSourcererScope,
      id: SourcererScopeName.detections,
    },
    [SourcererScopeName.timeline]: {
      ...initSourcererScope,
      id: SourcererScopeName.timeline,
    },
  },
};

export type FSourcererScopePatterns = {
  [id in SourcererScopeName]: {
    id: string;
    selectedPatterns: string[];
  };
};
export type SourcererScopePatterns = Partial<FSourcererScopePatterns>;
