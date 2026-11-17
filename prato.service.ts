import { Injectable, computed, signal } from '@angular/core';
import {
  DocumentData, Timestamp, Unsubscribe, addDoc, collection, getFirestore,
  onSnapshot, orderBy, query, serverTimestamp,
} from 'firebase/firestore';
import { firebaseApp } from '../firebase';
import { Avaliacao, FiltroCategoria, ItemPedido, NovaAvaliacao, OpcaoFiltro, Prato, PratoBase, ResultadoSelecao } from '../models';
import { AuthService } from './auth.service';
import { OrderService } from './order.service';

@Injectable({ providedIn: 'root' })
export class PratoService {
  private db = getFirestore(firebaseApp);
  private unsub?: Unsubscribe;
  private timer?: ReturnType<typeof setTimeout>;

  /** Pratos de demonstração (disponibilidade controlada por definirDisponibilidade). */
  private base = signal<PratoBase[]>([
    { id: 'feijoada', nome: 'Feijoada', categoria: 'comum', icone: '🍲', disponivel: true, descricao: 'Feijão preto com carnes, farofa e couve' },
    { id: 'strogonoff', nome: 'Strogonoff', categoria: 'comum', icone: '🍛', disponivel: true, descricao: 'Strogonoff de frango com batata palha' },
    { id: 'arroz-feijao', nome: 'Arroz e feijão', categoria: 'comum', icone: '🍚', disponivel: true, descricao: 'Arroz branco e feijão carioca' },
    { id: 'frango-grelhado', nome: 'Frango grelhado', categoria: 'comum', icone: '🍗', disponivel: true, descricao: 'Filé de frango grelhado com ervas' },
    { id: 'opcao-vegana', nome: 'Opção vegana', categoria: 'vegano', icone: '🌱', disponivel: true, descricao: 'Grão-de-bico com legumes assados' },
    { id: 'salada', nome: 'Salada', categoria: 'vegano', icone: '🥗', disponivel: false, descricao: 'Folhas, tomate e cenoura' },
    { id: 'sobremesa', nome: 'Sobremesa', categoria: 'comum', icone: '🍮', disponivel: true, descricao: 'Pudim de leite' },
  ]);

  private lista = signal<Avaliacao[]>([]);

  readonly avaliacoes = this.lista.asReadonly();
  readonly carregando = signal(true);
  readonly erro = signal('');

  readonly filtros: OpcaoFiltro[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'comum', label: 'Comum' },
    { id: 'vegano', label: '🌱 Veg' },
  ];

  /** Pratos com média e quantidade calculadas a partir das avaliações. */
  readonly pratos = computed<Prato[]>(() =>
    this.base().map((p) => {
      const doPrato = this.lista().filter((a) => a.pratoId === p.id);
      return { ...p, media: PratoService.calcularMedia(doPrato), quantidade: doPrato.length };
    }),
  );

  /** Prato mais bem avaliado (precisa ter ao menos 1 avaliação). */
  readonly destaque = computed<Prato | null>(() => {
    const ranking = this.pratos()
      .filter((p) => p.quantidade > 0)
      .sort((a, b) => b.media - a.media || b.quantidade - a.quantidade);
    return ranking[0] ?? null;
  });

  // ----- filtro, seleção e total da bandeja (regras de negócio)
  readonly filtroAtivo = signal<FiltroCategoria>('todos');
  readonly selecionados = signal<string[]>([]);
  readonly pratosFiltrados = computed(() => this.filtrar(this.filtroAtivo()));
  readonly bandeja = computed(() => this.pratos().filter((p) => this.selecionados().includes(p.id)));
  readonly total = computed(() => this.bandeja().length);

  constructor(private auth: AuthService, private order: OrderService) {
    this.escutar();
  }

  static calcularMedia(avaliacoes: Avaliacao[]): number {
    if (!avaliacoes.length) return 0;
    return avaliacoes.reduce((soma, a) => soma + a.nota, 0) / avaliacoes.length;
  }

  filtrar(categoria: FiltroCategoria): Prato[] {
    return this.pratos().filter((p) => categoria === 'todos' || p.categoria === categoria);
  }

  avaliacoesDoPrato(pratoId: string): Avaliacao[] {
    return this.lista().filter((a) => a.pratoId === pratoId);
  }

  definirDisponibilidade(id: string, disponivel: boolean): void {
    this.base.update((l) => l.map((p) => (p.id === id ? { ...p, disponivel } : p)));
    if (!disponivel) this.selecionados.update((l) => l.filter((x) => x !== id));
  }

  definirFiltro(f: FiltroCategoria): void { this.filtroAtivo.set(f); }

  estaSelecionado(id: string): boolean { return this.selecionados().includes(id); }

  /** Seleciona ou remove um prato. Prato esgotado é bloqueado e devolve um aviso. */
  alternarSelecao(p: Prato): ResultadoSelecao {
    if (!p.disponivel) return { ok: false, msg: `${p.nome} está esgotado e não pode ser escolhido.` };
    const ja = this.estaSelecionado(p.id);
    this.selecionados.update((l) => (ja ? l.filter((x) => x !== p.id) : [...l, p.id]));
    return { ok: true, msg: ja ? `${p.nome} removido da bandeja.` : `${p.nome} adicionado à bandeja.` };
  }

  limparBandeja(): void { this.selecionados.set([]); }

  /** Confirma a bandeja: grava um documento novo em `pedidos` e devolve o código. */
  async confirmarBandeja(): Promise<string> {
    const user = this.auth.user;
    if (!user) throw new Error('Faça login para confirmar a bandeja.');
    const itens = this.bandeja();
    if (itens.length === 0) throw new Error('Escolha ao menos um prato para confirmar a bandeja.');
    const esgotado = itens.find((p) => !p.disponivel);
    if (esgotado) throw new Error(`${esgotado.nome} está esgotado. Remova-o da bandeja.`);

    const codigo = this.order.gerarCodigo();
    const pratos: ItemPedido[] = itens.map((p) => ({ id: p.id, nome: p.nome, categoria: p.categoria }));
    const gravar = addDoc(collection(this.db, 'pedidos'), {
      usuarioId: user.uid,
      nomeUsuario: this.auth.firstName || 'Aluno',
      pratos,
      total: pratos.length,
      status: 'confirmado',
      codigo,
      data: serverTimestamp(),
    });
    const limite = new Promise<never>((_, rej) =>
      setTimeout(() => rej(new Error('Não foi possível confirmar a bandeja. Verifique a conexão e as regras do Firestore.')), 15000));
    try {
      await Promise.race([gravar, limite]);
    } catch (e: any) {
      if (e?.code === 'permission-denied') throw new Error('Sem permissão no Firestore. Publique as regras do arquivo firestore.rules.');
      throw e;
    }
    this.order.create(pratos.map((p) => p.nome), codigo);
    this.limparBandeja();
    return codigo;
  }

  /** Grava a avaliação no Firestore. A lista (e as médias) atualizam pelo listener em tempo real. */
  async enviarAvaliacao(prato: Prato, dados: NovaAvaliacao): Promise<void> {
    const nota = Math.round(dados.nota);
    if (!(nota >= 1 && nota <= 5)) throw new Error('Escolha uma nota de 1 a 5 estrelas.');
    const user = this.auth.user;
    if (!user) throw new Error('Faça login para avaliar.');

    const gravar = addDoc(collection(this.db, 'avaliacoes'), {
      pratoId: prato.id,
      nomePrato: prato.nome,
      nota,
      comentario: dados.comentario.trim().slice(0, 500),
      usuarioId: user.uid,
      nomeUsuario: this.auth.firstName || 'Aluno',
      data: serverTimestamp(),
    });
    const limite = new Promise<never>((_, rej) =>
      setTimeout(() => rej(new Error('Não foi possível confirmar o envio. Verifique a conexão e as regras do Firestore.')), 15000));
    try {
      await Promise.race([gravar, limite]);
    } catch (e: any) {
      if (e?.code === 'permission-denied') throw new Error('Sem permissão no Firestore. Publique as regras do arquivo firestore.rules.');
      throw e;
    }
  }

  /** (Re)inicia a escuta em tempo real da coleção `avaliacoes`. */
  escutar(): void {
    this.unsub?.();
    clearTimeout(this.timer);
    this.carregando.set(true);
    this.erro.set('');
    this.timer = setTimeout(() => {
      if (this.carregando()) {
        this.carregando.set(false);
        this.erro.set('Sem resposta do Firestore. Confira a configuração do Firebase e sua conexão.');
      }
    }, 10000);

    const q = query(collection(this.db, 'avaliacoes'), orderBy('data', 'desc'));
    this.unsub = onSnapshot(
      q,
      (snap) => {
        clearTimeout(this.timer);
        this.lista.set(snap.docs.map((d) => this.paraAvaliacao(d.id, d.data({ serverTimestamps: 'estimate' }))));
        this.carregando.set(false);
        this.erro.set('');
      },
      (err) => {
        clearTimeout(this.timer);
        this.carregando.set(false);
        this.erro.set(err.code === 'permission-denied'
          ? 'Sem permissão para ler as avaliações. Publique as regras do arquivo firestore.rules.'
          : 'Não foi possível carregar as avaliações do Firestore.');
      },
    );
  }

  private paraAvaliacao(id: string, d: DocumentData): Avaliacao {
    const ts = d['data'] as Timestamp | null | undefined;
    return {
      id,
      pratoId: String(d['pratoId'] ?? ''),
      nomePrato: String(d['nomePrato'] ?? ''),
      nota: Number(d['nota'] ?? 0),
      comentario: String(d['comentario'] ?? ''),
      usuarioId: String(d['usuarioId'] ?? ''),
      nomeUsuario: String(d['nomeUsuario'] ?? 'Aluno'),
      data: ts ? ts.toDate() : new Date(),
    };
  }
}
