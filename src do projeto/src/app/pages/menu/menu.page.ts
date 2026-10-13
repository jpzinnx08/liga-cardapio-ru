import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';

type Tipo = 'comum' | 'veg';
interface Item { nome: string; tipo: Tipo; esgotado?: boolean; }
type Filtro = 'veg' | 'comum' | 'todos';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [IonContent],
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage {
  itens: Item[] = [
    { nome: 'Arroz + feijao', tipo: 'comum' },
    { nome: 'Opcao vegana', tipo: 'veg' },
    { nome: 'Frango grelhado', tipo: 'comum' },
    { nome: 'Salada', tipo: 'veg', esgotado: true },
    { nome: 'Sobremesa', tipo: 'comum' },
  ];
  filtros: { id: Filtro; label: string }[] = [
    { id: 'veg', label: 'Veg' }, { id: 'comum', label: 'Comum' }, { id: 'todos', label: 'Todos' },
  ];
  filtro: Filtro = 'todos';
  selecionados = new Set<string>();

  constructor(private auth: AuthService, private order: OrderService, private router: Router) {}

  get nome() { return this.auth.firstName; }
  get visiveis() { return this.itens.filter((i) => this.filtro === 'todos' || i.tipo === this.filtro); }
  get temEsgotado() { return this.visiveis.some((i) => i.esgotado); }

  toggle(i: Item) {
    if (i.esgotado) return;
    this.selecionados.has(i.nome) ? this.selecionados.delete(i.nome) : this.selecionados.add(i.nome);
  }

  fazerPedido() {
    this.order.create(this.itens.filter((i) => this.selecionados.has(i.nome)).map((i) => i.nome));
    this.router.navigateByUrl('/order');
  }

  async sair() { await this.auth.logout(); this.router.navigateByUrl('/login', { replaceUrl: true }); }
}
