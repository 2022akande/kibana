/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { isEmpty } from 'lodash/fp';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

import {
  setSourcererScopeLoading,
  setSelectedKip,
  setSignalIndexName,
  setSource,
  initTimelineIndexPatterns,
} from './actions';
import { initialSourcererState, SourcererModel } from './model';
import { defaultIndexPatternByEventType } from './helpers';

export type SourcererState = SourcererModel;

export const sourcererReducer = reducerWithInitialState(initialSourcererState)
  .case(setSignalIndexName, (state, { signalIndexName }) => ({
    ...state,
    signalIndexName,
  }))
  .case(setSourcererScopeLoading, (state, { id, loading }) => ({
    ...state,
    sourcererScopes: {
      ...state.sourcererScopes,
      [id]: {
        ...state.sourcererScopes[id],
        loading,
      },
    },
  }))
  .case(setSelectedKip, (state, payload) => {
    const { id, eventType, ...rest } = payload;
    return {
      ...state,
      sourcererScopes: {
        ...state.sourcererScopes,
        [id]: {
          ...state.sourcererScopes[id],
          ...rest,
        },
      },
    };
  })
  // TODO: Steph/sourcerer gtfo
  .case(initTimelineIndexPatterns, (state, { id, selectedPatterns, eventType }) => {
    console.log('initTimelineIndexPatterns', selectedPatterns, eventType);
    return {
      ...state,
      sourcererScopes: {
        ...state.sourcererScopes,
        [id]: {
          ...state.sourcererScopes[id],
          selectedPatterns: isEmpty(selectedPatterns)
            ? // TODO: Steph/sourcerer replace with createDefaultIndexPatterns or not cuz we're getting rid of this?
              defaultIndexPatternByEventType({ state, eventType })
            : selectedPatterns,
        },
      },
    };
  })
  .case(setSource, (state, { id, payload }) => {
    return {
      ...state,
      sourcererScopes: {
        ...state.sourcererScopes,
        [id]: {
          ...state.sourcererScopes[id],
          ...payload,
        },
      },
    };
  })
  .build();
