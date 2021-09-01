/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import memoizeOne from 'memoize-one';
import { createSelector } from 'reselect';
import { State } from '../types';
import {
  KibanaIndexPattern,
  KibanaIndexPatterns,
  ManageScope,
  SourcererScopeById,
  SourcererScopeName,
} from './model';
import { getPatternList, getScopePatternListSelection } from './helpers';

export const sourcererKibanaIndexPatternsSelector = ({ sourcerer }: State): KibanaIndexPatterns =>
  sourcerer.kibanaIndexPatterns;

export const sourcererSignalIndexNameSelector = ({ sourcerer }: State): string | null =>
  sourcerer.signalIndexName;

export const sourcererDefaultIndexPatternSelector = ({ sourcerer }: State): KibanaIndexPattern =>
  sourcerer.defaultIndexPattern;

export const sourcererScopeIdSelector = (
  { sourcerer }: State,
  scopeId: SourcererScopeName
): ManageScope => sourcerer.sourcererScopes[scopeId];

export const scopeIdSelector = () => createSelector(sourcererScopeIdSelector, (scope) => scope);

export const sourcererScopesSelector = ({ sourcerer }: State): SourcererScopeById =>
  sourcerer.sourcererScopes;

export const scopesSelector = () => createSelector(sourcererScopesSelector, (scopes) => scopes);

export const kibanaIndexPatternsSelector = () =>
  createSelector(sourcererKibanaIndexPatternsSelector, (patterns) => patterns);

export const signalIndexNameSelector = () =>
  createSelector(sourcererSignalIndexNameSelector, (signalIndexName) => signalIndexName);

export const defaultIndexPatternSelector = () =>
  createSelector(sourcererDefaultIndexPatternSelector, (patterns) => patterns);

export const getIndexNamesSelectedSelector = () => {
  const getScopeSelector = scopeIdSelector();
  const getDefaultIndexPatternSelector = defaultIndexPatternSelector();
  return (
    state: State,
    scopeId: SourcererScopeName
  ): { indexNames: string[]; previousIndexNames: string } => {
    const scope = getScopeSelector(state, scopeId);
    const defaultIndexPattern = getDefaultIndexPatternSelector(state);
    return {
      indexNames:
        scope.selectedPatterns.length === 0
          ? getPatternList(defaultIndexPattern)
          : scope.selectedPatterns,
      previousIndexNames: scope.indexPattern.title,
    };
  };
};
export interface SelectedKip {
  kipId: string;
  patternList: string[];
  selectedPatterns: string[];
}
export const getSelectedKipSelector = () => {
  const getScopeSelector = scopeIdSelector();
  const getDefaultIndexPatternSelector = defaultIndexPatternSelector();
  const getKibanaIndexPatternsSelector = kibanaIndexPatternsSelector();

  return (state: State, scopeId: SourcererScopeName): SelectedKip => {
    const scope = getScopeSelector(state, scopeId);
    const defaultIndexPattern = getDefaultIndexPatternSelector(state);
    const kibanaIndexPatterns = getKibanaIndexPatternsSelector(state);
    const kipId = scope.selectedKipId === null ? defaultIndexPattern.id : scope.selectedKipId;
    const theKip = kibanaIndexPatterns.find((kip) => kip.id === kipId);
    console.log('theKip', JSON.stringify(theKip));
    const patternList = theKip != null ? theKip.patternList : [];
    const selectedPatterns =
      scope.selectedPatterns.length === 0 && theKip != null
        ? getScopePatternListSelection(kibanaIndexPatterns, kipId, scopeId)
        : scope.selectedPatterns;
    return {
      kipId,
      patternList,
      selectedPatterns,
    };
  };
};

export const getAllExistingIndexNamesSelector = () => {
  const getSignalIndexNameSelector = signalIndexNameSelector();
  const getDefaultIndexPatternSelector = defaultIndexPatternSelector();

  return (state: State): string[] => {
    const signalIndexName = getSignalIndexNameSelector(state);
    const defaultIndexPattern = getPatternList(getDefaultIndexPatternSelector(state));
    return signalIndexName != null
      ? [...defaultIndexPattern, signalIndexName]
      : defaultIndexPattern;
  };
};

const EXCLUDE_ELASTIC_CLOUD_INDEX = '-*elastic-cloud-logs-*';

export const getSourcererScopeSelector = () => {
  const getScopeIdSelector = scopeIdSelector();
  const getSelectedPatterns = memoizeOne((selectedPatternsStr: string[]): string[] => {
    const selectedPatterns = selectedPatternsStr.length > 0 ? selectedPatternsStr.sort() : [];
    return selectedPatterns.some((index) => index === 'logs-*')
      ? [...selectedPatterns, EXCLUDE_ELASTIC_CLOUD_INDEX]
      : selectedPatterns;
  });

  const getIndexPattern = memoizeOne(
    (indexPattern, title) => ({
      ...indexPattern,
      title,
    }),
    (newArgs, lastArgs) => newArgs[0] === lastArgs[0] && newArgs[1].length === lastArgs[1].length
  );

  return (state: State, scopeId: SourcererScopeName): ManageScope => {
    const scope = getScopeIdSelector(state, scopeId);
    const selectedPatterns = getSelectedPatterns(scope.selectedPatterns);
    const indexPattern = getIndexPattern(scope.indexPattern, selectedPatterns.join());

    return {
      ...scope,
      selectedPatterns,
      indexPattern,
    };
  };
};
