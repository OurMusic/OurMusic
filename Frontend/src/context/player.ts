import { createContext, useContext } from "react";
import type { MusicaResumo } from "../types/api";

export type ModoRepeticao = "off" | "todas" | "uma";

export interface PlayerContextData {
    musicaAtual: MusicaResumo | null;
    fila: MusicaResumo[];
    tocando: boolean;
    carregandoAudio: boolean;
    tempoAtual: number;
    duracaoTotal: number;
    volume: number;
    mudo: boolean;
    aleatorio: boolean;
    repetir: ModoRepeticao;
    videoVisivel: boolean;
    erroPlayer: string;
    adicionadaRecentementeId: number | null;
    temLinkPlayavel: boolean;
    carregarMusicaSemTocar: (musica: MusicaResumo, listaFila?: MusicaResumo[]) => void;
    tocarMusica: (musica: MusicaResumo, listaFila?: MusicaResumo[]) => void;
    alternarPlayPause: (musicaAlvo?: MusicaResumo, listaFila?: MusicaResumo[]) => void;
    buscarTempo: (segundos: number) => void;
    alterarVolume: (valor: number) => void;
    alternarMudo: () => void;
    alternarAleatorio: () => void;
    ciclarRepetir: () => void;
    alternarVideoVisivel: () => void;
    proximaMusica: () => Promise<MusicaResumo | null>;
    anteriorMusica: () => Promise<MusicaResumo | null>;
    adicionarAFila: (musica: MusicaResumo) => void;
    definirFila: (lista: MusicaResumo[]) => void;
    pararPlayer: () => void;
}

export const PlayerContext = createContext<PlayerContextData>({} as PlayerContextData);

export function usePlayer() {
    return useContext(PlayerContext);
}
