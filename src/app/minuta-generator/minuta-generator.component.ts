import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService } from '../services/api.service';
import { MinutaFormData, MinutaInputFormComponent } from './minuta-input-form/minuta-input-form.component';
import { MinutaResultComponent } from './minuta-result/minuta-result.component';

@Component({
  selector: 'app-minuta-generator',
  standalone: true,
  imports: [
    CommonModule, 
    MatProgressBarModule,
    MatSnackBarModule,
    MinutaInputFormComponent,
    MinutaResultComponent
  ],
  template: `
    <mat-progress-bar *ngIf="isLoading" mode="indeterminate"></mat-progress-bar>
    <div class="minuta-container">
      <app-minuta-input-form 
        *ngIf="!minutaResult"
        [resetTrigger]="resetTrigger"
        (generateMinuta)="onGenerateMinuta($event)">
      </app-minuta-input-form>
      
      <app-minuta-result 
        *ngIf="minutaResult"
        [content]="minutaResult"
        [rawContent]="rawHtmlContent"
        (newMinuta)="clearMinutaResultAndFile()">
      </app-minuta-result>
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
    }
  `]
})
export class MinutaGeneratorComponent {
  minutaResult: SafeHtml | null = null;
  rawHtmlContent = '';
  isLoading = false;
  resetTrigger = 0;
  
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
        this.minutaResult = this.sanitizer.bypassSecurityTrustHtml(this.rawHtmlContent);
        this.isLoading = false;
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
  
  clearMinutaResultAndFile() {
    this.minutaResult = null;
    this.rawHtmlContent = '';
    this.resetTrigger++;
  }
}