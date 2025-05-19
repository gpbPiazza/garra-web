import { Clipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
              [attr.contenteditable]=this.editMode
              (input)="onEditorInput()">
          </div>
        </div>
      </mat-card-content>
      
      <mat-card-actions align="end">
        <button mat-button mat-raised-button (click)="onEditMode()">
          <mat-icon>{{ editMode ? 'check' : 'edit' }}</mat-icon>
          {{ editMode ? 'FINALIZAR EDIÇÃO' : 'EDITAR' }}
      </button>
        <button mat-button mat-raised-button [disabled]=editMode (click)="onDownload()">
          <mat-icon>download</mat-icon>
          EXPORTAR
        </button>
        <button mat-button mat-raised-button  [disabled]=editMode (click)="onCopy()">
          <mat-icon>content_copy</mat-icon>
          COPIAR
        </button>
        <button mat-raised-button [disabled]=editMode (click)="onNewMinuta()">
          <mat-icon>add_circle</mat-icon>
          GERAR NOVA MINUTA!
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .tokens-warning {
      margin-bottom: 1rem;
      padding: 1rem;
      background-color: var(--mat-sys-error-container);
      border-left: 4px solid var(--mat-sys-error);
      border-radius: 4px;
    }

    .tokens-warning, h3 {
      margin-top: 0;
      color: var(--mat-sys-on-error-container);
    }
    

    .minuta-editor-container {
      border-radius: 4px;
      padding: 1rem;
      box-shadow: var(--mat-sys-level2);
      background-color: var(--mat-sys-surface);
    }
    
    .minuta-editor {
      min-height: 300px;
      max-height: 600px;
      overflow-y: auto;
      outline: none;
      font-size: 16px;
      line-height: 1.5;
    }
  `]
})
export class MinutaCheckComponent implements AfterViewInit {
  @Input() content = '';
  @Input() rawContent = '';
  @Input() tokensNotFound: string[] = [];

  @Output() newMinuta = new EventEmitter<void>();

  @ViewChild('minutaEditor') minutaEditor!: ElementRef<HTMLDivElement>;
  
  editedContent = '';
  editMode = false;

  constructor(
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
  ) { }

  ngAfterViewInit(): void {
    if (!this.minutaEditor) return;
    if (!this.content) return ;
    
    this.minutaEditor.nativeElement.innerHTML = this.content; 

    if (!this.tokensNotFound?.length) return;

    this.highlightMissingTokens();
  }

  highlightMissingTokens(): void {
    let highlightedContent = this.minutaEditor.nativeElement.innerHTML;

    this.tokensNotFound.forEach(token => {
      const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const tokenRegex = new RegExp(`\\[\\[${escapedToken} NÃO ENCONTRADO\\]\\]`, 'g');

      highlightedContent = highlightedContent.replace(
        tokenRegex,
        `<span style="color: var(--mat-sys-on-error-container);">[[${token} NÃO ENCONTRADO]]</span>`
      );
    });

    this.content = highlightedContent;
    this.minutaEditor.nativeElement.innerHTML = highlightedContent;
  }

  onEditorInput(): void {
    this.editedContent = this.minutaEditor.nativeElement.innerHTML;
  }

  onEditMode(): void {
    this.editMode = this.editMode ? false : true;
  }

  onCopy() {
    const content = this.editedContent || this.minutaEditor.nativeElement.innerHTML;
    this.clipboard.copy(content);
    this.snackBar.open('Conteúdo copiado!', 'Fechar', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  onNewMinuta() {
    this.editedContent = '';
    this.content = '';
    this.editedContent = '';
    this.newMinuta.emit()
  }

  onDownload(): void {
    const content = this.editedContent || this.minutaEditor.nativeElement.innerHTML;

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