import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Prato } from '../../models';
import { EstrelasComponent } from '../estrelas/estrelas.component';

@Component({
  selector: 'app-prato-card',
  standalone: true,
  imports: [EstrelasComponent],
  templateUrl: './prato-card.component.html',
  styleUrls: ['./prato-card.component.scss'],
})
export class PratoCardComponent {
  @Input({ required: true }) prato!: Prato;
  @Input() selecionado = false;
  @Input() destaque = false;

  /** Pede ao pai para abrir a avaliação deste prato. */
  @Output() avaliar = new EventEmitter<Prato>();
  /** Informa ao pai que o aluno tentou escolher (ou remover) o prato; o service aplica a regra. */
  @Output() selecionar = new EventEmitter<Prato>();

  get mediaTexto(): string { return this.prato.media.toFixed(1).replace('.', ','); }

  onAvaliar(): void { this.avaliar.emit(this.prato); }

  onSelecionar(): void {
    this.selecionar.emit(this.prato);
  }
}
