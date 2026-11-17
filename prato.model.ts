export type CategoriaPrato = 'comum' | 'vegano';
export type FiltroCategoria = CategoriaPrato | 'todos';

/** Prato do cardápio do RU. `media` e `quantidade` vêm das avaliações do Firestore. */
export interface Prato {
  id: string;
  nome: string;
  categoria: CategoriaPrato;
  descricao?: string;
  icone?: string;
  disponivel: boolean;
  media: number;
  quantidade: number;
}

/** Dados fixos do prato (antes de calcular média e quantidade). */
export type PratoBase = Omit<Prato, 'media' | 'quantidade'>;

/** Chip de filtro do cardápio. */
export interface OpcaoFiltro {
  id: FiltroCategoria;
  label: string;
}
