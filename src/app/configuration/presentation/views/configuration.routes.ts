// src/app/configuration/presentation/views/configuration.routes.ts

import { Routes } from '@angular/router';
import { ConfigurationComponent } from './configuration';

export const configurationRoutes: Routes = [
  {
    path: '',
    component: ConfigurationComponent,
    data: { 
      title: 'configuration.title',
      breadcrumb: 'nav.configuration'
    }
  }
];
