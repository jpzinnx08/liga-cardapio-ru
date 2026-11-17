import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonModal, IonTitle, IonToolbar } from '@ionic/angular';
import { NovaAvaliacao, Prato } from '../../models';

@Component({
  selector: 'app-avaliacao-modal',
  standalone: true,
  imports: [FormsModule, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent],
  templateUrl: './avaliacao-modal.component.html',
  styleUrls: ['./avaliacao-modal.component.scss'],
})
export class AvaliacaoModalComponent implements OnChanges {
  /** Prato sendo avaliado; null = modal fechado. */
  @Input() prato: Prato | null = null;
  @Input() enviando = false;

  /** Emite nota + comentário quando o aluno confirma. */
  @Output() enviar = new EventEmitter<NovaAvaliacao>();
  /** Emite quando o aluno cancela ou fecha o modal. */
  @Output() cancelar = new EventEmitter<void>();

  readonly opcoes = [1, 2, 3, 4, 5];
  nota = 0;
  comentario = '';
  semNota = false;

  ngOnChanges(c: SimpleChanges): void {
    if (c['prato'] && this.prato) {
      this.nota = 0;
      this.comentario = '';
      this.semNota = false;
    }
  }

  escolher(n: number): void { this.nota = n; this.semNota = false; }

  confirmar(): void {
    if (!this.nota) { this.semNota = true; return; }
    this.enviar.emit({ nota: this.nota, comentario: this.comentario });
  }
}
