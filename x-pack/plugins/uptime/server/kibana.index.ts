/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Request, Server } from 'hapi';
import { PLUGIN } from '../../../legacy/plugins/uptime/common/constants';
import { KibanaTelemetryAdapter } from './lib/adapters/telemetry';
import { compose } from './lib/compose/kibana';
import { initUptimeServer } from './uptime_server';
import { UptimeCorePlugins, UptimeCoreSetup } from './lib/adapters/framework';
import { umDynamicSettings } from './lib/saved_objects';

export interface KibanaRouteOptions {
  path: string;
  method: string;
  vhost?: string | string[];
  handler: (request: Request) => any;
  options: any;
}

export interface KibanaServer extends Server {
  route: (options: KibanaRouteOptions) => void;
}

export const initServerWithKibana = (server: UptimeCoreSetup, plugins: UptimeCorePlugins) => {
  const { features, usageCollection } = plugins;
  const libs = compose(server);
  KibanaTelemetryAdapter.registerUsageCollector(usageCollection);

  features.registerFeature({
    id: PLUGIN.ID,
    name: PLUGIN.NAME,
    navLinkId: PLUGIN.ID,
    icon: 'uptimeApp',
    app: ['uptime', 'kibana'],
    catalogue: ['uptime'],
    privileges: {
      all: {
        api: ['uptime-read', 'uptime-write'],
        savedObject: {
          all: [umDynamicSettings.name],
          read: [],
        },
        ui: ['save', 'configureSettings', 'show'],
      },
      read: {
        api: ['uptime-read'],
        savedObject: {
          all: [],
          read: [umDynamicSettings.name],
        },
        ui: ['show'],
      },
    },
  });

  initUptimeServer(server, libs, plugins);
};
