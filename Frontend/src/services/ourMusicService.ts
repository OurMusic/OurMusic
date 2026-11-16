import { axiosInstance } from "./api";
import type {
    Genero,
    GeneroPayload,
    LoginPayload,
    LoginResponse,
    Musica,
    MusicaFiltroParams,
    MusicaPaginadaResponse,
    MusicaPayload,
    Usuario,
    UsuarioAtualizacaoPayload,
    UsuarioPayload,
} from "../types/api";

function musicaFormData(payload: MusicaPayload) {
    const formData = new FormData();
    formData.append("Titulo", payload.titulo);
    formData.append("Artista", payload.artista);
    formData.append("DataLancamento", payload.dataLancamento);
    formData.append("Duracao", String(payload.duracao));

    if (payload.letra !== undefined && payload.letra !== null) {
        formData.append("Letra", payload.letra);
    }

    if (payload.comentario !== undefined && payload.comentario !== null) {
        formData.append("Comentario", payload.comentario);
    }

    if (payload.arquivoImagem) {
        formData.append("ArquivoImagem", payload.arquivoImagem);
    } else if (payload.imagemCapa && payload.imagemCapa.trim()) {
        formData.append("ImagemCapa", payload.imagemCapa.trim());
    }

    payload.idGeneros.forEach((idGenero) => {
        formData.append("IdGeneros", String(idGenero));
    });

    return formData;
}

function progressoUpload(onProgress?: (porcentagem: number) => void) {
    return {
        onUploadProgress: (progress: { loaded: number; total?: number }) => {
            if (progress.total && onProgress) {
                onProgress(Math.round((progress.loaded * 100) / progress.total));
            }
        },
    };
}

export const authService = {
    async login(payload: LoginPayload) {
        const { data } = await axiosInstance.post<LoginResponse>("Login", payload);
        return data;
    },

    async sair() {
        await axiosInstance.post("Login/Sair");
    },
};

export const musicaService = {
    async listar(params: MusicaFiltroParams = {}) {
        const query: Record<string, string | number> = {
            pagina: params.pagina ?? 1,
            tamanhoPagina: params.tamanhoPagina ?? 10,
        };
        if (params.busca && params.busca.trim()) {
            query.busca = params.busca.trim();
        }
        if (params.idGenero) {
            query.idGenero = params.idGenero;
        }
        const { data } = await axiosInstance.get<MusicaPaginadaResponse>("Musica", {
            params: query,
        });
        return data;
    },

    async buscar(id: number | string) {
        const { data } = await axiosInstance.get<Musica>(`Musica/${id}`);
        return data;
    },

    async cadastrar(payload: MusicaPayload, onProgress?: (porcentagem: number) => void) {
        const { data } = await axiosInstance.post<Musica>(
            "Musica",
            musicaFormData(payload),
            progressoUpload(onProgress),
        );
        return data;
    },

    async atualizar(
        id: number | string,
        payload: MusicaPayload,
        onProgress?: (porcentagem: number) => void,
    ) {
        await axiosInstance.put(
            `Musica/${id}`,
            musicaFormData(payload),
            progressoUpload(onProgress),
        );
    },

    async excluir(id: number | string) {
        await axiosInstance.delete(`Musica/${id}`);
    },
};

export const generoService = {
    async listar() {
        const { data } = await axiosInstance.get<Genero[]>("Genero");
        return data;
    },

    async buscar(id: number | string) {
        const { data } = await axiosInstance.get<Genero>(`Genero/${id}`);
        return data;
    },

    async cadastrar(payload: GeneroPayload) {
        const { data } = await axiosInstance.post<Genero>("Genero", payload);
        return data;
    },

    async atualizar(id: number | string, payload: GeneroPayload) {
        await axiosInstance.put(`Genero/${id}`, payload);
    },

    async excluir(id: number | string) {
        await axiosInstance.delete(`Genero/${id}`);
    },
};

export const usuarioService = {
    async listar() {
        const { data } = await axiosInstance.get<Usuario[]>("Usuario");
        return data;
    },

    async buscar(id: number | string) {
        const { data } = await axiosInstance.get<Usuario>(`Usuario/${id}`);
        return data;
    },

    async cadastrar(payload: UsuarioPayload) {
        const { data } = await axiosInstance.post<Usuario>("Usuario", payload);
        return data;
    },

    async atualizar(id: number | string, payload: UsuarioAtualizacaoPayload) {
        await axiosInstance.put(`Usuario/${id}`, payload);
    },

    async desativar(id: number | string) {
        await axiosInstance.delete(`Usuario/${id}`);
    },
};
