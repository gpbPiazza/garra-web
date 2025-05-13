import { Clipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-minuta-generator',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule, 
    MatCardModule, 
    MatIconModule, 
    MatProgressBarModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatTooltipModule,
    ReactiveFormsModule
  ],
  template: `
    <mat-progress-bar *ngIf="isLoading" mode="indeterminate"></mat-progress-bar>
    <div class="minuta-container">
      <mat-card class="generate-minuta-card" *ngIf="!minutaResult">
        <mat-card-header>
          <mat-card-title>Gerar minuta!</mat-card-title>
          <mat-card-subtitle>É tudo muito fácil e rápido!</mat-card-subtitle>
          <mat-card-subtitle>Selecione um arquivo ato consultar e gere sua minuta!</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="minutaForm">
            <div class="form-container">
              <button type="button" mat-raised-button *ngIf="!getFormFile()" class="file-upload-container">
                <label for="pdf-upload" class="file-selector">
                  Selecione arquivo PDF
                  <input 
                    id="pdf-upload"
                    type="file" 
                    accept="application/pdf"
                    (change)="onFileSelected($event)"
                    class="file-input"
                  >
                </label>
              </button>
              
              <div *ngIf="getFormFile()" class="selected-file-container">
                <div class="selected-file-info">
                  <mat-icon>description</mat-icon>
                  <span class="file-name">{{ getFormFile()?.name }}</span>
                  <button 
                    mat-icon-button 
                    (click)="removeFile()"
                    matTooltip="Remover arquivo">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
                
                <div class="checkbox-container">
                  <mat-checkbox formControlName="transmitenteSupraqualificada">
                    Transmitente supraqualificada
                  </mat-checkbox>
                  <mat-checkbox formControlName="adquirenteSupraqualificada">
                    Adquirente supraqualificada
                  </mat-checkbox>
                </div>
                
                <div class="button-container">
                  <button 
                    mat-flat-button
                    class="generate-button"
                    [disabled]="minutaForm.invalid"
                    (click)="generateMinuta()">
                    GERAR MINUTA
                  </button>
                </div>
              </div>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
      
      <mat-card *ngIf="minutaResult">
        <mat-card-header>
          <mat-card-actions></mat-card-actions>
          <mat-card-title-group>
            <mat-card-title>Resultado da minuta!</mat-card-title>
            <mat-card-subtitle>Copie o resultado e valide se está como esperado!</mat-card-subtitle>
          </mat-card-title-group>
          <mat-card-actions>
            <button 
              mat-icon-button 
              (click)="copyMinutaContent()"
              matTooltip="Copiar Conteúdo">
              <mat-icon>content_copy</mat-icon>
            </button>
            <button 
              mat-icon-button 
              (click)="clearMinutaResultAndFile()"
              matTooltip="Mais uma minuta!">
            <mat-icon>add_circle</mat-icon>
          </button>
        </mat-card-actions>
        </mat-card-header>
        <mat-card-content>
          <div [innerHTML]="minutaResult"></div>
        </mat-card-content>
      </mat-card>
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
    
    .generate-minuta-card {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    mat-card {
      width: 100%;
      max-width: 800px;
    }

    mat-card-header {
      justify-content: center;
    }
    
    mat-card-title {
      text-align: center;
      font-weight: 600;
      font-size: 42px;
      line-height: 52px;
    }

    mat-card-subtitle {
      max-width: 800px;
      margin: 8px auto 0;
      line-height: 32px;
      font-size: 22px;
      font-weight: 400;
      text-align: center;
    }

    mat-card-title-group{ 
      justify-content: center;
    }
    
    .file-selector{
      display: flex;
      justify-content: center;
      align-items: center;    

      min-width: 330px;
      
      padding: 24px 48px;
      font-weight: 500;
      font-size: 24px;
      line-height: 28px;
      cursor: pointer;
    }
    

    .file-upload-container {
      display: flex;
      justify-content: center;
      margin: 1rem 0;
    }
    
    .file-input {
      display: none;
    }
    
    .selected-file-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      margin: 1.5rem 0;
      gap: 1.5rem;
    }
    
    .selected-file-info {
      display: flex;
      align-items: center;
      background-color: rgba(0, 0, 0, 0.04);
      padding: 12px 16px;
      border-radius: 8px;
      width: 80%;
      max-width: 400px;
      margin: 0 auto; /* Center this div */
    }
    
    .checkbox-container {
      display: flex;
      flex-direction: column;
      align-self: flex-start; 
      padding-left: 25px;
      width: 100%;
    }
    
    .button-container {
      display: flex;
      justify-content: center;
      width: 100%;
    }
    
    .generate-button {
      min-width: 200px;
    }

    mat-icon {
      @include mat.icon-overrides(
        (
          color: var(--mat-sys-tertiary),
        )
      );
    }
    
    .file-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `]
})
export class MinutaGeneratorComponent {
  minutaResult: SafeHtml | null = null;
  rawHtmlContent = '';
  isLoading = false;
  
  minutaForm: FormGroup;
  
  constructor(
    private apiService: ApiService,
    private sanitizer: DomSanitizer,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.minutaForm = this.fb.group({
      pdfFile: [null, Validators.required],
      transmitenteSupraqualificada: [false],
      adquirenteSupraqualificada: [false]
    });
  }
  
  getFormFile(): File | null {
    return this.minutaForm.get('pdfFile')?.value;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.minutaForm.patchValue({
        pdfFile: input.files[0]
      });
      this.minutaForm.get('pdfFile')?.markAsDirty();
      this.minutaForm.get('pdfFile')?.updateValueAndValidity();
    }
  }
  
  removeFile() {
    this.minutaForm.patchValue({
      pdfFile: null
    });
    this.minutaForm.get('pdfFile')?.markAsDirty();
    this.minutaForm.get('pdfFile')?.updateValueAndValidity();
  }
  
  clearMinutaResultAndFile() {
    this.minutaResult = null;
    this.rawHtmlContent = '';
    this.minutaForm.reset({
      pdfFile: null,
      transmitenteSupraqualificada: false,
      adquirenteSupraqualificada: false
    });
  }

  generateMinuta() {
    if (this.minutaForm.invalid) return;
    
    this.isLoading = true;
    this.minutaResult = null;
    
    const file = this.getFormFile();
    
    if (file) {
      const isTransmitente = this.minutaForm.get('transmitenteSupraqualificada')?.value || false;
      const isAdquirente = this.minutaForm.get('adquirenteSupraqualificada')?.value || false;
      
      this.apiService.generateMinuta(file, isTransmitente, isAdquirente)
        .subscribe({
          next: (htmlContent) => {
            this.rawHtmlContent = htmlContent;
            this.minutaResult = this.sanitizer.bypassSecurityTrustHtml(htmlContent);
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
  }

  copyMinutaContent() {
    if (this.rawHtmlContent) {
      this.clipboard.copy(this.rawHtmlContent);
      this.snackBar.open('Conteúdo copiado!', 'Fechar', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    }
  }
}