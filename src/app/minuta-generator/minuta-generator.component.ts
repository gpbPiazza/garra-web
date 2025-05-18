import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService } from '../services/api.service';
import { MinutaCheckComponent } from './minuta-check/minuta-check.component';
import { MinutaFormData, MinutaInputFormComponent } from './minuta-input-form/minuta-input-form.component';

enum MinutaGeneratorState {
  INPUT = 'input',
  CHECK = 'check',
}

@Component({
  selector: 'app-minuta-generator',
  standalone: true,
  imports: [
    CommonModule, 
    MatProgressBarModule,
    MatSnackBarModule,
    MinutaInputFormComponent,
    MinutaCheckComponent,
  ],
  template: `
    <mat-progress-bar *ngIf="isLoading" mode="indeterminate"></mat-progress-bar>
    <div class="minuta-container">
      <app-minuta-input-form 
        *ngIf="currentState === 'input'"
        [resetTrigger]="resetTrigger"
        (generateMinuta)="onGenerateMinuta($event)">
      </app-minuta-input-form>
      
      <app-minuta-check
        *ngIf="currentState === 'check'"
        [content]="minutaResult"
        [rawContent]="rawHtmlContent"
        [tokensNotFound]="tokensNotFound"
        (newMinuta)="clearMinutaResultAndFile()">
      </app-minuta-check>
    </div>
  `,
  styles: [` 
    @use '@angular/material' as mat;

    mat-progress-bar {
      position: fixed;
      top: 64px; 
      left: 0;
      right: 0;
      z-index: 999;
    }
    
    .minuta-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
    }
  `]
})
export class MinutaGeneratorComponent {
  minutaResult: SafeHtml | null = null;
  rawHtmlContent = '';
  tokensNotFound: string[] = [];
  isLoading = false;
  resetTrigger = 0;
  currentState: MinutaGeneratorState = MinutaGeneratorState.INPUT;
  
  constructor(
    private apiService: ApiService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar
  ) {}
  
  onGenerateMinuta(formData: MinutaFormData) {
    this.isLoading = true;
    this.minutaResult = null;
    
    this.apiService.generateMinuta(
      formData.file, 
      formData.isTransmitenteSupraqualificada, 
      formData.isAdquirenteSupraqualificada
    )
    .subscribe({
      next: (resp) => {
        this.rawHtmlContent = resp.data?.minuta_html ?? "";
        this.tokensNotFound = resp.data?.tokens_not_found ?? [];
        this.minutaResult = this.sanitizer.bypassSecurityTrustHtml(this.rawHtmlContent);
        this.isLoading = false;
        this.currentState = MinutaGeneratorState.CHECK;
      },
      error: (error) => {
        console.error('Error generating minuta:', error);
        this.isLoading = false;
        this.snackBar.open('Erro ao gerar minuta. Tente novamente.', 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  
  finalizeMinuta(editedContent: string) {
    this.rawHtmlContent = editedContent;
    this.minutaResult = this.sanitizer.bypassSecurityTrustHtml(editedContent);
  }
  
  clearMinutaResultAndFile() {
    this.minutaResult = null;
    this.rawHtmlContent = '';
    this.tokensNotFound = [];
    this.resetTrigger++;
    this.currentState = MinutaGeneratorState.INPUT;
  }
}