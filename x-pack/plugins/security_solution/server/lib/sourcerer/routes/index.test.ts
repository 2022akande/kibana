/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { createSourcererIndexPatternRoute } from './';
import {
  requestMock,
  serverMock,
  requestContextMock,
} from '../../detection_engine/routes/__mocks__';

import { DEFAULT_INDEX_PATTERN_ID, SOURCERER_API_URL } from '../../../../common/constants';
import { StartServicesAccessor } from 'kibana/server';
import { StartPlugins } from '../../../plugin';

jest.mock('./helpers', () => {
  const original = jest.requireActual('./helpers');

  return {
    ...original,
    findExistingIndices: () => new Promise((resolve) => resolve([true, true])),
  };
});
const mockPattern = {
  id: 'security-solution',
  title:
    'apm-*-transaction*,traces-apm*,auditbeat-*,endgame-*,filebeat-*,logs-*,packetbeat-*,winlogbeat-*,ml_host_risk_score_*,.siem-signals-default',
};
const mockPatternList = [
  'apm-*-transaction*',
  'traces-apm*',
  'auditbeat-*',
  'endgame-*',
  'filebeat-*',
  'logs-*',
  'packetbeat-*',
  'winlogbeat-*',
  'ml_host_risk_score_*',
  '.siem-signals-default',
];
const mockDataViews = [
  {
    id: 'metrics-*',
    title: 'metrics-*',
  },
  {
    id: 'logs-*',
    title: 'logs-*',
  },
  mockPattern,
];
const getStartServices = jest.fn().mockReturnValue([
  null,
  {
    data: {
      indexPatterns: {
        indexPatternsServiceFactory: () => ({
          getIdsWithTitle: () => new Promise((rs) => rs(mockDataViews)),
          get: () => new Promise((rs) => rs(mockPattern)),
          createAndSave: () => new Promise((rs) => rs(mockPattern)),
          updateSavedObject: () => new Promise((rs) => rs(mockPattern)),
        }),
      },
    },
  },
] as unknown) as StartServicesAccessor<StartPlugins>;

const getStartServicesNotSiem = jest.fn().mockReturnValue([
  null,
  {
    data: {
      indexPatterns: {
        indexPatternsServiceFactory: () => ({
          getIdsWithTitle: () =>
            new Promise((rs) => rs(mockDataViews.filter((v) => v.id !== DEFAULT_INDEX_PATTERN_ID))),
          get: () => new Promise((rs) => rs(mockPattern)),
          createAndSave: () => new Promise((rs) => rs(mockPattern)),
          updateSavedObject: () => new Promise((rs) => rs(mockPattern)),
        }),
      },
    },
  },
] as unknown) as StartServicesAccessor<StartPlugins>;

const mockDataViewsTransformed = {
  defaultIndexPattern: {
    id: 'security-solution',
    patternList: ['apm-*-transaction*', 'traces-apm*'],
    title:
      'apm-*-transaction*,traces-apm*,auditbeat-*,endgame-*,filebeat-*,logs-*,packetbeat-*,winlogbeat-*,ml_host_risk_score_*,.siem-signals-default',
  },
  kibanaIndexPatterns: [
    {
      id: 'metrics-*',
      patternList: ['metrics-*'],
      title: 'metrics-*',
    },
    {
      id: 'logs-*',
      patternList: ['logs-*'],
      title: 'logs-*',
    },
    {
      id: 'security-solution',
      patternList: ['apm-*-transaction*', 'traces-apm*'],
      title:
        'apm-*-transaction*,traces-apm*,auditbeat-*,endgame-*,filebeat-*,logs-*,packetbeat-*,winlogbeat-*,ml_host_risk_score_*,.siem-signals-default',
    },
  ],
};

export const getSourcererRequest = (patternList: string[]) =>
  requestMock.create({
    method: 'post',
    path: SOURCERER_API_URL,
    body: { patternList },
  });

describe('sourcerer route', () => {
  let server: ReturnType<typeof serverMock.create>;
  let { context } = requestContextMock.createTools();

  beforeEach(() => {
    server = serverMock.create();
    ({ context } = requestContextMock.createTools());
  });

  test('returns sourcerer formatted Data Views when SIEM Data View does NOT exist', async () => {
    createSourcererIndexPatternRoute(server.router, getStartServicesNotSiem);
    const response = await server.inject(getSourcererRequest(mockPatternList), context);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockDataViewsTransformed);
  });

  test('returns sourcerer formatted Data Views when SIEM Data View exists', async () => {
    createSourcererIndexPatternRoute(server.router, getStartServices);
    const response = await server.inject(getSourcererRequest(mockPatternList), context);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockDataViewsTransformed);
  });

  test('returns sourcerer formatted Data Views when SIEM Data View exists and patternList input is changed', async () => {
    createSourcererIndexPatternRoute(server.router, getStartServices);
    mockPatternList.shift();
    const response = await server.inject(getSourcererRequest(mockPatternList), context);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      defaultIndexPattern: {
        id: 'security-solution',
        patternList: ['traces-apm*', 'auditbeat-*'],
        title:
          'traces-apm*,auditbeat-*,endgame-*,filebeat-*,logs-*,packetbeat-*,winlogbeat-*,ml_host_risk_score_*,.siem-signals-default',
      },
      kibanaIndexPatterns: [
        mockDataViewsTransformed.kibanaIndexPatterns[0],
        mockDataViewsTransformed.kibanaIndexPatterns[1],
        {
          id: 'security-solution',
          patternList: ['traces-apm*', 'auditbeat-*'],
          title:
            'traces-apm*,auditbeat-*,endgame-*,filebeat-*,logs-*,packetbeat-*,winlogbeat-*,ml_host_risk_score_*,.siem-signals-default',
        },
      ],
    });
  });
});
