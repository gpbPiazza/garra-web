import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
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

function fileTypeValidator(control: AbstractControl): ValidationErrors | null {
  const file = control.value as File;
  if (!file) return null;
  
  if (file.type !== 'application/pdf') {
    return { invalidFileType: true };
  }
  
  return null;
}

function fileSizeValidator(maxSizeInMB: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value as File;
    if (!file) return null;
    
    // Convert MB to bytes (1MB = 1,048,576 bytes)
    const maxSizeInBytes = maxSizeInMB * 1048576;
    
    if (file.size > maxSizeInBytes) {
      return { fileTooLarge: { actualSize: file.size, maxSize: maxSizeInBytes } };
    }
    
    return null;
  };
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
              <div class="selected-file-info" [class.error]="minutaForm.invalid">
                <mat-icon>description</mat-icon>
                <span class="file-name">{{ getFormFile()?.name }}</span>
                <button 
                  mat-icon-button 
                  (click)="removeFile()"
                  matTooltip="Remover arquivo">
                  <mat-icon>close</mat-icon>
                </button>
              </div>

              <div *ngIf="minutaForm.invalid" class="validation-error">
                <div *ngIf="hasFileTypeError()">
                  O arquivo deve ser um PDF.
                </div>
                <div *ngIf="hasFileSizeError()">
                  O arquivo não pode exceder 300MB.
                </div>
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
      background-color: var(--mat-sys-surface-dim);
      padding: 12px 16px;
      border-radius: 8px;
      width: 80%;
      max-width: 400px;
      margin: 0 auto;
      
      &.error {
        background-color: var(--mat-sys-error-container);
        border: 1px solid var(--mat-sys-error);
      }
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
    
    .validation-error {
      color: var(--mat-sys-error);
      font-size: 0.875rem;
      width: 80%;
      max-width: 400px;
      margin: -0.5rem auto 0;
    }
  `]
})
export class MinutaInputFormComponent {
  @Output() generateMinuta = new EventEmitter<MinutaFormData>();
  @Input() resetTrigger = 0;
  
  minutaForm: FormGroup;
  readonly MAX_FILE_SIZE_MB = 300;
  
  constructor(private fb: FormBuilder) {
    this.minutaForm = this.fb.group({
      pdfFile: [
        null, 
        [
          Validators.required, 
          fileTypeValidator, 
          fileSizeValidator(this.MAX_FILE_SIZE_MB)
        ]
      ],
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
      // Only take the first file if multiple are somehow selected
      const file = input.files[0];
      
      this.minutaForm.patchValue({
        pdfFile: file
      });
      
      const fileControl = this.minutaForm.get('pdfFile');
      fileControl?.markAsDirty();
      fileControl?.updateValueAndValidity();
    }
  }
  
  hasFileError(): boolean {
    const fileControl = this.minutaForm.get('pdfFile');
    return fileControl ? (fileControl.invalid && fileControl.touched) : false;
  }
  
  hasFileTypeError(): boolean {
    const fileControl = this.minutaForm.get('pdfFile');
    return fileControl ? fileControl.hasError('invalidFileType') : false;
  }
  
  hasFileSizeError(): boolean {
    const fileControl = this.minutaForm.get('pdfFile');
    return fileControl ? fileControl.hasError('fileTooLarge') : false;
  }
  
  removeFile() {
    this.minutaForm.patchValue({
      pdfFile: null
    });
    const fileControl = this.minutaForm.get('pdfFile');
    fileControl?.markAsDirty();
    fileControl?.updateValueAndValidity();
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