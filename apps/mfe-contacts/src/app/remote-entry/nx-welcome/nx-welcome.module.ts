import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { NxWelcomeComponent } from './nx-welcome.component';

@NgModule({
  declarations: [NxWelcomeComponent],
  imports: [CommonModule, MatButtonModule, MatCardModule, MatBadgeModule],
  exports: [NxWelcomeComponent],
})
export class NxWelcomeModule {}
