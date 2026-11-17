/** Avaliação de um prato (documento da coleção `avaliacoes`). */
export interface Avaliacao {
  id: string;
  pratoId: string;
  nomePrato: string;
  nota: number;          // 1 a 5
  comentario: string;
  usuarioId: string;
  nomeUsuario: string;
  data: Date;
}

/** Dados preenchidos pelo aluno no modal de avaliação. */
export interface NovaAvaliacao {
  nota: number;
  comentario: string;
}
