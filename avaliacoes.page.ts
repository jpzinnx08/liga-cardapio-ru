import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular';
import { AvaliacaoCardComponent } from '../../components/avaliacao-card/avaliacao-card.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { PratoService } from '../../services/prato.service';

@Component({
  selector: 'app-avaliacoes',
  standalone: true,
  imports: [IonContent, IonButton, TopbarComponent, AvaliacaoCardComponent],
  templateUrl: './avaliacoes.page.html',
  styleUrls: ['./avaliacoes.page.scss'],
})
export class AvaliacoesPage {
  private service = inject(PratoService);
  private router = inject(Router);

  readonly avaliacoes = this.service.avaliacoes;
  readonly carregando = this.service.carregando;
  readonly erro = this.service.erro;

  tentarNovamente(): void { this.service.escutar(); }
  voltar(): void { this.router.navigateByUrl('/menu'); }
}
