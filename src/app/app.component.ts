import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { MinutaGeneratorComponent } from './minuta-generator/minuta-generator.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    MinutaGeneratorComponent,
],
  template: `
    <app-header></app-header>
    <div class="content">
      <app-minuta-generator></app-minuta-generator>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }
    
    .content {
      padding-top: 60px; 
      background-color: var(--mat-sys-background);
      color: var(--mat-sys-on-background);
      height: 100vh;
      width: 100%;
    }
  `],
})
export class AppComponent  {}
