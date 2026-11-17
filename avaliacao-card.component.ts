import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Avaliacao } from '../../models';
import { EstrelasComponent } from '../estrelas/estrelas.component';

@Component({
  selector: 'app-avaliacao-card',
  standalone: true,
  imports: [DatePipe, EstrelasComponent],
  templateUrl: './avaliacao-card.component.html',
  styleUrls: ['./avaliacao-card.component.scss'],
})
export class AvaliacaoCardComponent {
  @Input({ required: true }) avaliacao!: Avaliacao;
}
