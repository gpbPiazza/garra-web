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
            <p>Edite os valores não encontrados clicando aqui abaixo.</p>
            <mat-card-actions>
              <button 
                mat-raised-button
                [disabled]="!editMode"
                *ngFor="let token of tokensNotFound" 
                highlighted
                (click)="focusOnToken(token)">
                  {{ token }}
              </button>
          </mat-card-actions>
          </div>

        <div class="minuta-editor-container" [class.editing-mode]="editMode">
          <div #minutaEditor 
              class="minuta-editor" 
              [attr.contenteditable]="editMode"
              (input)="onEditorInput()">
          </div>
        </div>
      </mat-card-content>
      
      <mat-card-actions align="end">
        <button 
          mat-button 
          mat-raised-button 
          [class.attention-needed]="tokensNotFound.length > 0 &&  !editMode"
          (click)="onEditMode()">
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
    }
    
    .editing-mode {
      border: 2px solid var(--mat-sys-primary);
      background-color: var(--mat-sys-surface-bright)
    }

    .minuta-editor {
      min-height: 300px;
      max-height: 600px;
      overflow-y: auto;
      outline: none;
      font-size: 16px;
      line-height: 1.5;
    }

    .attention-needed {
      animation: pulse 1.5s infinite;
      margin-right: 1rem;
    }

    @keyframes pulse {
      0% {
        transform: scale(1.2);
      }
      70% {
        transform: scale(1.3);
      }
      100% {
        transform: scale(1.2);
      }
    }

    mat-card-actions  {
      button {
        margin-left: 0.5rem;
      }
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
    if (!this.content) return;
    
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
        `<span id="${token}">[[${token} NÃO ENCONTRADO]]</span>`
      );
    });

    this.content = highlightedContent;
    this.minutaEditor.nativeElement.innerHTML = highlightedContent;
  }

  focusOnToken(token: string): void {
    if (!this.editMode) {
      this.onEditMode()
    }

    const tokenElement = document.getElementById(`${token}`)
    if (!tokenElement) return;

    const range = document.createRange();
    range.selectNode(tokenElement);
    const selection = window.getSelection();

    if (!selection) return;

    selection.removeAllRanges();
    selection.addRange(range);

    const handleKeyPress = (event: KeyboardEvent) => {
      this.tokensNotFound = this.tokensNotFound.filter(t => t !== token)
      document.removeEventListener('keydown', handleKeyPress);
    };
  
    document.addEventListener('keydown', handleKeyPress);

    this.snackBar.open(`Editando: ${token}`, 'OK', {duration: 3000});
  }

  onEditorInput(): void {
    this.editedContent = this.minutaEditor.nativeElement.innerHTML;
  }

  onEditMode(): void {
    this.editMode = !this.editMode;
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
    this.newMinuta.emit();
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