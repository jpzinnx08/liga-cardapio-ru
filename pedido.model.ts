/** Item da bandeja gravado no pedido. */
export interface ItemPedido {
  id: string;
  nome: string;
  categoria: 'comum' | 'vegano';
}

export type StatusPedido = 'confirmado';

/** Bandeja confirmada (documento da coleção `pedidos`). */
export interface Pedido {
  id?: string;
  usuarioId: string;
  nomeUsuario: string;
  pratos: ItemPedido[];
  total: number;          // quantidade de pratos na bandeja
  status: StatusPedido;
  codigo: string;
  data: Date;
}

/** Resultado de uma tentativa de selecionar/remover um prato. */
export interface ResultadoSelecao {
  ok: boolean;
  msg: string;
}
