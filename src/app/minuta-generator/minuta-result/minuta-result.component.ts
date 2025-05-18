import { Clipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-minuta-result',
  standalone: true,
  styleUrls: [
    '../_shared-styles.scss',
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-actions></mat-card-actions>
        <mat-card-title-group>
          <mat-card-title>Resultado da minuta!</mat-card-title>
          <mat-card-subtitle>Copie o resultado e valide se está como esperado!</mat-card-subtitle>
        </mat-card-title-group>
        <mat-card-actions>
          <button 
            mat-icon-button 
            (click)="onCopyContent()"
            matTooltip="Copiar Conteúdo">
            <mat-icon>content_copy</mat-icon>
          </button>
          <button 
            mat-icon-button 
            (click)="onNewMinuta()"
            matTooltip="Mais uma minuta!">
          <mat-icon>add_circle</mat-icon>
        </button>
      </mat-card-actions>
      </mat-card-header>
      <mat-card-content>
        <div [innerHTML]="content"></div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    @use '../shared-styles' as shared;

    @include shared.card;
    @include shared.themed-icons;
  `]
})
export class MinutaResultComponent {
  @Input() content: SafeHtml | null = null;
  @Input() rawContent: string = '';
  @Output() newMinuta = new EventEmitter<void>();
  
  constructor(
    private clipboard: Clipboard,
    private snackBar: MatSnackBar
  ) {}
  
  onCopyContent() {
    if (this.rawContent) {
      this.clipboard.copy(this.rawContent);
      this.snackBar.open('Conteúdo copiado!', 'Fechar', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    }
  }
  
  onNewMinuta() {
    this.newMinuta.emit();
  }
}