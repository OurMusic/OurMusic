export type TipoUsuario = "Admin" | "Usuario";

export interface Genero {
    idGenero: number;
    nome: string;
}

export interface GeneroPayload {
    nome: string;
}

export interface Usuario {
    idUsuario: number;
    nome: string;
    email: string;
    tipoUsuario: TipoUsuario;
    ativo: boolean;
}

export interface UsuarioPayload {
    nome: string;
    email: string;
    senha: string;
    tipoUsuario: TipoUsuario;
}

export interface UsuarioAtualizacaoPayload {
    nome: string;
    email: string;
    senha?: string;
    tipoUsuario?: TipoUsuario;
    ativo?: boolean;
}

export interface MusicaResumo {
    idMusica: number;
    titulo: string;
    artista: string;
    dataLancamento: string;
    duracao: number;
    imagemCapa?: string | null;
    generos: Genero[];
}

export interface Musica extends MusicaResumo {
    letra?: string | null;
    comentario?: string | null;
}

export interface MusicaPaginadaResponse {
    items: MusicaResumo[];
    total: number;
    pagina: number;
    tamanhoPagina: number;
}

export interface MusicaFiltroParams {
    pagina?: number;
    tamanhoPagina?: number;
    busca?: string;
    idGenero?: number | null;
}

export interface MusicaPayload {
    titulo: string;
    artista: string;
    letra?: string | null;
    dataLancamento: string;
    duracao: number;
    comentario?: string | null;
    imagemCapa?: string | null;
    arquivoImagem?: File | null;
    idGeneros: number[];
}

export interface LoginPayload {
    email: string;
    senha: string;
}

export interface LoginResponse {
    token: string;
    expiracaoUtc: string;
    usuario: Usuario;
}

export interface AuthSession extends LoginResponse {
    usuario: Usuario;
}
