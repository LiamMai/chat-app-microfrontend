import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mfe-contacts-entry',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `<router-outlet></router-outlet>`,
})
export class RemoteEntryComponent {}

@NgModule({
  imports: [RemoteEntryComponent],
  exports: [RemoteEntryComponent],
})
export class RemoteEntryModule {}
