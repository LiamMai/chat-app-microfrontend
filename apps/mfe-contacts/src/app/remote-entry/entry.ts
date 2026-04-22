import { Component, NgModule } from '@angular/core';
import { NxWelcomeModule } from './nx-welcome/nx-welcome.module';

@Component({
  selector: 'app-mfe_contacts-entry',
  template: `<app-nx-welcome></app-nx-welcome>`,
  standalone: true,
  imports: [NxWelcomeModule],
})
export class RemoteEntryComponent {}

@NgModule({
  imports: [RemoteEntryComponent],
  exports: [RemoteEntryComponent],
})
export class RemoteEntryModule {}
