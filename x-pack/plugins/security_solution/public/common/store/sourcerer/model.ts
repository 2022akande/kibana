/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { IIndexPattern } from '../../../../../../../src/plugins/data/common';
import { DocValueFields } from '../../../../common/search_strategy/common';
import {
  BrowserFields,
  EMPTY_BROWSER_FIELDS,
  EMPTY_DOCVALUE_FIELD,
  EMPTY_INDEX_PATTERN,
} from '../../../../common/search_strategy/index_fields';
import { DEFAULT_INDEX_PATTERN, DEFAULT_INDEX_PATTERN_ID } from '../../../../common/constants';

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
  selectablePatterns: string[];
  selectedKipId: string | null;
  selectedPatterns: string[];
}

export interface ManageScopeInit extends Partial<ManageScope> {
  id: SourcererScopeName;
}

export type SourcererScopeById = {
  [id in SourcererScopeName]: ManageScope;
};

export interface KibanaIndexPattern {
  id: string;
  patternList: string[];
  title: string;
}

export type KibanaIndexPatterns = KibanaIndexPattern[];

// ManageSourcerer
export interface SourcererModel {
  defaultIndexPattern: KibanaIndexPattern;
  kibanaIndexPatterns: KibanaIndexPatterns;
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
  selectablePatterns: [],
  selectedKipId: null,
  selectedPatterns: [],
};

export const initialSourcererState: SourcererModel = {
  defaultIndexPattern: { id: DEFAULT_INDEX_PATTERN_ID, title: DEFAULT_INDEX_PATTERN.join(',') }, // instantiated in plugin.tsx `getKibanaIndexPattern`
  kibanaIndexPatterns: [],
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
  [id in SourcererScopeName]: string;
};
export type SourcererScopePatterns = Partial<FSourcererScopePatterns>;
