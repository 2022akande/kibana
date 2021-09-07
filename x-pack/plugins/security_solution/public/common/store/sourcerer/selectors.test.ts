/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { cloneDeep } from 'lodash/fp';
import { mockGlobalState, mockSourcererState } from '../../mock';
import { SourcererScopeName } from './model';
import { getSourcererScopeSelector } from './selectors';

describe('Sourcerer selectors', () => {
  describe('getSourcererScopeSelector', () => {
    it('Should exclude elastic cloud alias when selected patterns include "logs-*" as an alias', () => {
      const mapStateToProps = getSourcererScopeSelector();
      expect(
        mapStateToProps(mockGlobalState, SourcererScopeName.default).selectedPatterns
      ).toEqual([...mockSourcererState.defaultIndexPattern.patternList, '-*elastic-cloud-logs-*']);
    });

    it('Should NOT exclude elastic cloud alias when selected patterns does NOT include "logs-*" as an alias', () => {
      const mapStateToProps = getSourcererScopeSelector();
      const myMockGlobalState = cloneDeep(mockGlobalState);
      myMockGlobalState.sourcerer.sourcererScopes.default.selectedPatterns = [
        'apm-*-transaction*',
        'auditbeat-*',
        'endgame-*',
        'filebeat-*',
        'packetbeat-*',
        'traces-apm*',
        'winlogbeat-*',
      ];
      expect(
        mapStateToProps(myMockGlobalState, SourcererScopeName.default).selectedPatterns
      ).toEqual([
        'apm-*-transaction*',
        'auditbeat-*',
        'endgame-*',
        'filebeat-*',
        'packetbeat-*',
        'traces-apm*',
        'winlogbeat-*',
      ]);
    });

    it('Should NOT exclude elastic cloud alias when selected patterns include "logs-endpoint.event-*" as an alias', () => {
      const mapStateToProps = getSourcererScopeSelector();
      const myMockGlobalState = cloneDeep(mockGlobalState);
      myMockGlobalState.sourcerer.sourcererScopes.default.selectedPatterns = [
        'apm-*-transaction*',
        'auditbeat-*',
        'endgame-*',
        'filebeat-*',
        'packetbeat-*',
        'traces-apm*',
        'winlogbeat-*',
        'logs-endpoint.event-*',
      ];
      expect(
        mapStateToProps(myMockGlobalState, SourcererScopeName.default).selectedPatterns
      ).toEqual([
        'apm-*-transaction*',
        'auditbeat-*',
        'endgame-*',
        'filebeat-*',
        'logs-endpoint.event-*',
        'packetbeat-*',
        'traces-apm*',
        'winlogbeat-*',
      ]);
    });
  });
});
