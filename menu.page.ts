import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonToast } from '@ionic/angular';
import { BandejaModalComponent } from '../../components/bandeja-modal/bandeja-modal.component';
import { AvaliacaoModalComponent } from '../../components/avaliacao-modal/avaliacao-modal.component';
import { EstrelasComponent } from '../../components/estrelas/estrelas.component';
import { PratoCardComponent } from '../../components/prato-card/prato-card.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { FiltroCategoria, NovaAvaliacao, Prato } from '../../models';
import { AuthService } from '../../services/auth.service';
import { PratoService } from '../../services/prato.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [IonContent, IonButton, IonToast, TopbarComponent, PratoCardComponent, AvaliacaoModalComponent, BandejaModalComponent, EstrelasComponent],
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage {
  private service = inject(PratoService);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly filtros = this.service.filtros;
  readonly destaque = this.service.destaque;
  readonly erro = this.service.erro;
  readonly carregando = this.service.carregando;

  // filtro, seleção, bandeja e total vivem no PratoService; a página só repassa e exibe
  readonly filtro = this.service.filtroAtivo;
  readonly pratos = this.service.pratosFiltrados;
  readonly selecionados = this.service.selecionados;
  readonly bandeja = this.service.bandeja;
  readonly total = this.service.total;
  readonly confirmando = signal(false);
  readonly confirmandoEnvio = signal(false);
  readonly pratoAvaliando = signal<Prato | null>(null);
  readonly enviando = signal(false);
  readonly toast = signal<{ msg: string; cor: 'success' | 'danger' } | null>(null);

  get nome(): string { return this.auth.firstName; }
  get mediaDestaque(): string { return (this.destaque()?.media ?? 0).toFixed(1).replace('.', ','); }

  // ----- eventos vindos do componente filho (prato-card)
  abrirAvaliacao(p: Prato): void { this.pratoAvaliando.set(p); }

  alternarSelecao(p: Prato): void {
    const r = this.service.alternarSelecao(p);
    if (!r.ok) this.toast.set({ msg: r.msg, cor: 'danger' });
  }

  filtrar(f: FiltroCategoria): void { this.service.definirFiltro(f); }

  // ----- eventos vindos do modal de avaliação
  fecharModal(): void { this.pratoAvaliando.set(null); }

  async enviarAvaliacao(dados: NovaAvaliacao): Promise<void> {
    const prato = this.pratoAvaliando();
    if (!prato) return;
    this.enviando.set(true);
    try {
      await this.service.enviarAvaliacao(prato, dados);
      this.pratoAvaliando.set(null);
      this.toast.set({ msg: 'Avaliação enviada com sucesso! Obrigado 💚', cor: 'success' });
    } catch (e) {
      this.toast.set({ msg: e instanceof Error ? e.message : 'Não foi possível enviar a avaliação.', cor: 'danger' });
    } finally {
      this.enviando.set(false);
    }
  }

  tentarNovamente(): void { this.service.escutar(); }

  /** Abre a etapa de confirmação da bandeja. */
  fazerPedido(): void {
    if (this.total() === 0) {
      this.toast.set({ msg: 'Escolha ao menos um prato para montar a bandeja.', cor: 'danger' });
      return;
    }
    this.confirmando.set(true);
  }

  fecharConfirmacao(): void { this.confirmando.set(false); }

  async confirmarBandeja(): Promise<void> {
    this.confirmandoEnvio.set(true);
    try {
      await this.service.confirmarBandeja();
      // fecha o modal e espera a animação terminar ANTES de navegar,
      // senão a página do cardápio fica em segundo plano com o modal preso aberto
      this.confirmandoEnvio.set(false);
      this.confirmando.set(false);
      await new Promise((r) => setTimeout(r, 400));
      await this.router.navigateByUrl('/order');
    } catch (e) {
      this.toast.set({ msg: e instanceof Error ? e.message : 'Não foi possível confirmar a bandeja.', cor: 'danger' });
    } finally {
      this.confirmandoEnvio.set(false);
    }
  }

  irAvaliacoes(): void { this.router.navigateByUrl('/avaliacoes'); }

  async sair(): Promise<void> {
    await this.auth.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
