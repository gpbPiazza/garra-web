import { Clipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-minuta-check',
  standalone: true,
  styleUrls: [
    '../_shared-styles.scss',
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Revise sua minuta</mat-card-title>
        <mat-card-subtitle>Verifique se todas as informações estão corretas</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <div *ngIf="tokensNotFound?.length" class="tokens-warning">
          <h3>Atenção: Alguns dados não foram encontrados</h3>
          <p>Por favor, verifique e complete os seguintes campos na minuta:</p>
          <mat-chip-set>
            <mat-chip 
              *ngFor="let token of tokensNotFound" 
              highlighted>
              {{ token }}
            </mat-chip>
          </mat-chip-set>
        </div>
        
        <div class="minuta-editor-container">
          <div #minutaEditor 
              class="minuta-editor" 
              [class.highlight-missing]="tokensNotFound.length" 
              contenteditable="true"
              (input)="onEditorInput()">
          </div>
        </div>
      </mat-card-content>
      
      <mat-card-actions align="end">

        <button mat-button (click)="onDownload()">
          <mat-icon>download</mat-icon>
          EXPORTAR
        </button>
        <button mat-button mat-raised-button  (click)="onCopy()">
          <mat-icon>content_copy</mat-icon>
          COPIAR
        </button>
        <button mat-raised-button (click)="this.newMinuta.emit()">
          <mat-icon>add_circle</mat-icon>
          GERAR NOVA MINUTA!
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    @use '../shared-styles' as shared;

    @include shared.card;
    @include shared.themed-icons;

    .tokens-warning {
      margin-bottom: 1rem;
      padding: 1rem;
      background-color: var(--mat-sys-error-container);
      border-left: 4px solid var(--mat-sys-error);
      border-radius: 4px;
    }
    
    .tokens-warning h3 {
      margin-top: 0;
      color: var(--mat-sys-on-error-container);
    }
    
    .minuta-editor-container {
      margin: 1rem 0;
      border: 1px solid var(--mat-sys-outline);
      border-radius: 4px;
      padding: 1rem;
      max-height: 500px;
      overflow-y: auto;
    }
    
    .minuta-editor {
      min-height: 300px;
      padding: 0.5rem;
      outline: none;
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      line-height: 1.5;
    }
    
    .highlight-missing {
      background-color: var(--mat-sys-surface-container-highest);
    }
    
    .token-missing {
      background-color: var(--mat-sys-error-container);
      padding: 0 2px;
      border-radius: 2px;
    }
  `]
})
export class MinutaCheckComponent implements OnInit {
  @Input() content: SafeHtml | null = null;
  @Input() rawContent: string = '';
  @Input() tokensNotFound: string[] = [];
  
  @Output() newMinuta = new EventEmitter<void>();
  
  
  @ViewChild('minutaEditor') minutaEditor!: ElementRef<HTMLDivElement>;
  
  editedContent: string = '';
  
  constructor(
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
  ) {}
  
  ngOnInit(): void {
    this.editedContent = this.rawContent;
  }
  
  ngAfterViewInit(): void {
    if (this.minutaEditor && this.content) {
      this.minutaEditor.nativeElement.innerHTML = this.rawContent;
    
      if (this.tokensNotFound?.length) {
        this.highlightMissingTokens();
      }
    }
  }
  
  highlightMissingTokens(): void {
    const editorContent = this.minutaEditor.nativeElement.innerHTML;
    let highlightedContent = editorContent;
    
    this.tokensNotFound.forEach(token => {
      const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const tokenRegex = new RegExp(`\\[\\[${escapedToken} NÃO ENCONTRADO\\]\\]`, 'g');
      
      highlightedContent = highlightedContent.replace(
        tokenRegex, 
        `<span class="token-missing">[[${token} NÃO ENCONTRADO]]</span>`
      );
    });
    
    this.minutaEditor.nativeElement.innerHTML = highlightedContent;
  }
  
  onEditorInput(): void {
    this.editedContent = this.minutaEditor.nativeElement.innerHTML;
  }
  
  onCopy() {
    const content = this.editedContent || this.rawContent;
    this.clipboard.copy(content);
    this.snackBar.open('Conteúdo copiado!', 'Fechar', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
  
  onDownload(): void {
    const content = this.editedContent || this.rawContent;

    const blob = new Blob([content], { type: 'text/html' });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'minuta.html';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    this.snackBar.open('Minuta exportada com sucesso!', 'Fechar', {
      duration: 2000
    });
  }
}