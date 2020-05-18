import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// 开发环境在控制台打印信息
if (!environment.production) {
    (window as any).log = console.log;
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
