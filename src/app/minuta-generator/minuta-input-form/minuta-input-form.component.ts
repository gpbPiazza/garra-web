import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface MinutaFormData {
  file: File;
  isTransmitenteSupraqualificada: boolean;
  isAdquirenteSupraqualificada: boolean;
}

@Component({
  selector: 'app-minuta-input-form',
  standalone: true,
  styleUrls: [
    '../_shared-styles.scss',
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule,
    ReactiveFormsModule
  ],
  template: `
    <mat-card class="generate-minuta-card">
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
                  (click)="onGenerateClick()">
                  GERAR MINUTA
                </button>
              </div>
            </div>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    @use '../shared-styles' as shared;

    @include shared.card;
    @include shared.themed-icons;

    .generate-minuta-card {
      display: flex;
      flex-direction: column;
      align-items: center;
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
      margin: 0 auto;
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
    
    .file-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `]
})
export class MinutaInputFormComponent {
  @Output() generateMinuta = new EventEmitter<MinutaFormData>();
  @Input() resetTrigger = 0;
  
  minutaForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
    this.minutaForm = this.fb.group({
      pdfFile: [null, Validators.required],
      transmitenteSupraqualificada: [false],
      adquirenteSupraqualificada: [false]
    });
  }
  
  ngOnChanges() {
    if (this.resetTrigger > 0) {
      this.resetForm();
    }
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
  
  resetForm() {
    this.minutaForm.reset({
      pdfFile: null,
      transmitenteSupraqualificada: false,
      adquirenteSupraqualificada: false
    });
  }

  onGenerateClick() {
    if (this.minutaForm.invalid) return;
    
    const file = this.getFormFile();
    if (file) {
      this.generateMinuta.emit({
        file: file,
        isTransmitenteSupraqualificada: this.minutaForm.get('transmitenteSupraqualificada')?.value || false,
        isAdquirenteSupraqualificada: this.minutaForm.get('adquirenteSupraqualificada')?.value || false
      });
    }
  }
}