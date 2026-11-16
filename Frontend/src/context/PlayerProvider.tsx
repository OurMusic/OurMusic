import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type PropsWithChildren,
} from "react";
import { useAuth } from "./auth";
import { PlayerContext, type ModoRepeticao } from "./player";
import { musicaService } from "../services/ourMusicService";
import type { MusicaResumo } from "../types/api";
import { extrairYouTubeId } from "../utils/youtube";
import xIcon from "../assets/icons/x.svg";

interface YTPlayerInstance {
    loadVideoById: (options: { videoId: string; startSeconds?: number }) => void;
    cueVideoById: (options: { videoId: string; startSeconds?: number }) => void;
    playVideo: () => void;
    pauseVideo: () => void;
    stopVideo: () => void;
    seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
    getCurrentTime: () => number;
    getDuration: () => number;
    getPlayerState: () => number;
    setVolume: (volume: number) => void;
    mute: () => void;
    unMute: () => void;
    destroy: () => void;
}

interface YTNamespace {
    Player: new (
        element: HTMLElement,
        options: {
            height?: string | number;
            width?: string | number;
            videoId?: string;
            playerVars?: Record<string, number | string>;
            events?: {
                onReady?: (event: { target: YTPlayerInstance }) => void;
                onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void;
                onError?: (event: { data: number }) => void;
            };
        },
    ) => YTPlayerInstance;
    PlayerState?: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
    };
}

declare global {
    interface Window {
        YT?: YTNamespace;
        onYouTubeIframeAPIReady?: () => void;
    }
}

function carregarScriptYouTube(): Promise<YTNamespace> {
    if (typeof window === "undefined") {
        return Promise.reject(new Error("Ambiente sem janela."));
    }

    if (window.YT && typeof window.YT.Player === "function") {
        return Promise.resolve(window.YT);
    }

    return new Promise((resolve, reject) => {
        const callbackAnterior = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            callbackAnterior?.();
            if (window.YT && typeof window.YT.Player === "function") {
                resolve(window.YT);
            } else {
                reject(new Error("YouTube IFrame API indisponível."));
            }
        };

        const scriptExistente = document.querySelector<HTMLScriptElement>(
            'script[src="https://www.youtube.com/iframe_api"]',
        );
        if (!scriptExistente) {
            const script = document.createElement("script");
            script.src = "https://www.youtube.com/iframe_api";
            script.async = true;
            script.onerror = () => reject(new Error("Falha ao carregar o player do YouTube."));
            document.head.appendChild(script);
        }
    });
}

function descreverErroYouTube(codigo: number): string {
    if (codigo === 101 || codigo === 150) {
        return "Este vídeo bloqueou reprodução incorporada. Abra diretamente no YouTube.";
    }
    if (codigo === 100) {
        return "Vídeo não encontrado ou indisponível no YouTube.";
    }
    return "Não foi possível reproduzir este link do YouTube aqui.";
}

function mesclarFila(atual: MusicaResumo[], extras?: MusicaResumo[]): MusicaResumo[] {
    if (!extras || extras.length === 0) return atual;
    const mapa = new Map<number, MusicaResumo>();
    atual.forEach((m) => mapa.set(m.idMusica, m));
    extras.forEach((m) => mapa.set(m.idMusica, m));
    return Array.from(mapa.values());
}

export function PlayerProvider({ children }: PropsWithChildren) {
    const { autenticado } = useAuth();

    const [musicaAtual, setMusicaAtual] = useState<MusicaResumo | null>(null);
    const [fila, setFila] = useState<MusicaResumo[]>([]);
    const [tocando, setTocando] = useState(false);
    const [carregandoAudio, setCarregandoAudio] = useState(false);
    const [tempoAtual, setTempoAtual] = useState(0);
    const [duracaoTotal, setDuracaoTotal] = useState(0);
    const [volume, setVolume] = useState(80);
    const [mudo, setMudo] = useState(false);
    const [aleatorio, setAleatorio] = useState(false);
    const [repetir, setRepetir] = useState<ModoRepeticao>("todas");
    const [videoVisivel, setVideoVisivel] = useState(false);
    const [erroPlayer, setErroPlayer] = useState("");
    const [adicionadaRecentementeId, setAdicionadaRecentementeId] = useState<number | null>(
        null,
    );

    const containerYtRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YTPlayerInstance | null>(null);
    const playerProntoRef = useRef(false);
    const pendenteRef = useRef<{ videoId: string; autoPlay: boolean } | null>(null);
    const musicaAtualRef = useRef<MusicaResumo | null>(null);
    const filaRef = useRef<MusicaResumo[]>([]);
    const repetirRef = useRef<ModoRepeticao>("todas");
    const aleatorioRef = useRef(false);
    const volumeRef = useRef(80);
    const mudoRef = useRef(false);
    const aoTerminarFaixaRef = useRef<() => void>(() => {});

    useEffect(() => {
        musicaAtualRef.current = musicaAtual;
    }, [musicaAtual]);

    useEffect(() => {
        filaRef.current = fila;
    }, [fila]);

    useEffect(() => {
        repetirRef.current = repetir;
    }, [repetir]);

    useEffect(() => {
        aleatorioRef.current = aleatorio;
    }, [aleatorio]);

    useEffect(() => {
        volumeRef.current = volume;
    }, [volume]);

    useEffect(() => {
        mudoRef.current = mudo;
    }, [mudo]);

    const garantirFilaCompleta = useCallback(async (listaInicial?: MusicaResumo[]) => {
        let base = mesclarFila(filaRef.current, listaInicial);
        if (base.length <= 1) {
            try {
                const resposta = await musicaService.listar({
                    pagina: 1,
                    tamanhoPagina: 100,
                });
                base = mesclarFila(base, resposta.items);
                setFila(base);
                filaRef.current = base;
            } catch {
                // Mantém fila atual caso falhe
            }
        }
        return base;
    }, []);

    const despacharVideoParaYouTube = useCallback(
        (videoId: string, autoPlay: boolean) => {
            if (playerRef.current && playerProntoRef.current) {
                if (autoPlay) {
                    playerRef.current.loadVideoById({ videoId, startSeconds: 0 });
                    playerRef.current.setVolume(mudoRef.current ? 0 : volumeRef.current);
                    if (mudoRef.current) {
                        playerRef.current.mute();
                    } else {
                        playerRef.current.unMute();
                    }
                } else {
                    playerRef.current.cueVideoById({ videoId, startSeconds: 0 });
                }
            } else {
                pendenteRef.current = { videoId, autoPlay };
            }
        },
        [],
    );

    const pararPlayer = useCallback(() => {
        pendenteRef.current = null;
        if (playerRef.current && playerProntoRef.current) {
            try {
                playerRef.current.stopVideo();
            } catch {
                // Ignora caso iframe ainda não esteja pronto
            }
        }
        setTocando(false);
        setCarregandoAudio(false);
        setTempoAtual(0);
        setVideoVisivel(false);
        setErroPlayer("");
        setMusicaAtual(null);
    }, []);

    // Limpa reprodução ao deslogar
    useEffect(() => {
        if (!autenticado) {
            const timeout = window.setTimeout(() => pararPlayer(), 0);
            return () => window.clearTimeout(timeout);
        }
    }, [autenticado, pararPlayer]);

    // Inicializa YouTube IFrame API uma única vez enquanto autenticado
    useEffect(() => {
        if (!autenticado) return;
        let desmontado = false;

        void carregarScriptYouTube()
            .then((YT) => {
                if (desmontado || !containerYtRef.current || playerRef.current) return;

                playerRef.current = new YT.Player(containerYtRef.current, {
                    width: "100%",
                    height: "100%",
                    playerVars: {
                        autoplay: 0,
                        controls: 1,
                        rel: 0,
                        modestbranding: 1,
                        playsinline: 1,
                        origin: window.location.origin,
                    },
                    events: {
                        onReady: (event) => {
                            if (desmontado) return;
                            playerProntoRef.current = true;
                            event.target.setVolume(
                                mudoRef.current ? 0 : volumeRef.current,
                            );
                            if (pendenteRef.current) {
                                const { videoId, autoPlay } = pendenteRef.current;
                                pendenteRef.current = null;
                                if (autoPlay) {
                                    event.target.loadVideoById({ videoId, startSeconds: 0 });
                                } else {
                                    event.target.cueVideoById({ videoId, startSeconds: 0 });
                                }
                            }
                        },
                        onStateChange: (event) => {
                            if (desmontado) return;
                            const estado = event.data;
                            // 0=ENDED, 1=PLAYING, 2=PAUSED, 3=BUFFERING, 5=CUED
                            if (estado === 1) {
                                setTocando(true);
                                setCarregandoAudio(false);
                                setErroPlayer("");
                                const dur = event.target.getDuration();
                                if (Number.isFinite(dur) && dur > 0) {
                                    setDuracaoTotal(Math.round(dur));
                                }
                            } else if (estado === 2 || estado === 5) {
                                setTocando(false);
                                setCarregandoAudio(false);
                            } else if (estado === 3) {
                                setCarregandoAudio(true);
                            } else if (estado === 0) {
                                setTocando(false);
                                setCarregandoAudio(false);
                                aoTerminarFaixaRef.current();
                            }
                        },
                        onError: (event) => {
                            if (desmontado) return;
                            setTocando(false);
                            setCarregandoAudio(false);
                            setErroPlayer(descreverErroYouTube(event.data));
                        },
                    },
                });
            })
            .catch(() => {
                // Caso bloqueador de rede impeça iframe_api, mantém mensagem quando tentar tocar
            });

        return () => {
            desmontado = true;
            if (playerRef.current) {
                try {
                    playerRef.current.destroy();
                } catch {
                    // Ignora falha ao destruir iframe
                }
                playerRef.current = null;
                playerProntoRef.current = false;
            }
        };
    }, [autenticado]);

    // Atualiza tempo atual em tempo real enquanto estiver tocando
    useEffect(() => {
        if (!tocando) return;
        const interval = window.setInterval(() => {
            const p = playerRef.current;
            if (!p || !playerProntoRef.current) return;
            try {
                const atual = p.getCurrentTime();
                const dur = p.getDuration();
                if (Number.isFinite(atual) && atual >= 0) {
                    setTempoAtual(Math.floor(atual));
                }
                if (Number.isFinite(dur) && dur > 0) {
                    setDuracaoTotal(Math.round(dur));
                }
            } catch {
                // Ignora leitura transitória
            }
        }, 250);

        return () => window.clearInterval(interval);
    }, [tocando]);

    const tocarMusica = useCallback(
        (musica: MusicaResumo, listaFila?: MusicaResumo[]) => {
            setMusicaAtual(musica);
            setFila((atual) => mesclarFila(atual, [musica, ...(listaFila || [])]));
            setTempoAtual(0);
            setDuracaoTotal(musica.duracao || 0);
            setErroPlayer("");

            const videoId = extrairYouTubeId(musica.urlMusica);
            if (!videoId) {
                setTocando(false);
                setCarregandoAudio(false);
                if (playerRef.current && playerProntoRef.current) {
                    try {
                        playerRef.current.stopVideo();
                    } catch {
                        // Ignora
                    }
                }
                setErroPlayer(
                    "Esta música ainda não possui um link do YouTube cadastrado.",
                );
                return;
            }

            setCarregandoAudio(true);
            despacharVideoParaYouTube(videoId, true);
            void garantirFilaCompleta([musica, ...(listaFila || [])]);
        },
        [despacharVideoParaYouTube, garantirFilaCompleta],
    );

    const carregarMusicaSemTocar = useCallback(
        (musica: MusicaResumo, listaFila?: MusicaResumo[]) => {
            setFila((atual) => mesclarFila(atual, [musica, ...(listaFila || [])]));
            if (musicaAtualRef.current) return;

            setMusicaAtual(musica);
            setTempoAtual(0);
            setDuracaoTotal(musica.duracao || 0);
            setErroPlayer("");
            setTocando(false);
            setCarregandoAudio(false);

            const videoId = extrairYouTubeId(musica.urlMusica);
            if (videoId) {
                despacharVideoParaYouTube(videoId, false);
            }
            void garantirFilaCompleta([musica, ...(listaFila || [])]);
        },
        [despacharVideoParaYouTube, garantirFilaCompleta],
    );

    const alternarPlayPause = useCallback(
        (musicaAlvo?: MusicaResumo, listaFila?: MusicaResumo[]) => {
            const alvo = musicaAlvo ?? musicaAtualRef.current;
            if (!alvo) return;

            if (alvo.idMusica !== musicaAtualRef.current?.idMusica) {
                tocarMusica(alvo, listaFila);
                return;
            }

            const videoId = extrairYouTubeId(alvo.urlMusica);
            if (!videoId) {
                setErroPlayer(
                    "Esta música ainda não possui um link do YouTube cadastrado.",
                );
                return;
            }

            const p = playerRef.current;
            if (!p || !playerProntoRef.current) {
                tocarMusica(alvo, listaFila);
                return;
            }

            if (tocando) {
                p.pauseVideo();
                setTocando(false);
            } else {
                const estado = p.getPlayerState();
                // 5=CUED, -1=UNSTARTED -> se nunca iniciou, loadVideoById garante disparo
                if (estado === -1) {
                    tocarMusica(alvo, listaFila);
                } else {
                    p.playVideo();
                    setTocando(true);
                }
            }
        },
        [tocando, tocarMusica],
    );

    const buscarTempo = useCallback((segundos: number) => {
        const clamped = Math.max(0, Math.floor(segundos));
        setTempoAtual(clamped);
        const p = playerRef.current;
        if (p && playerProntoRef.current) {
            try {
                p.seekTo(clamped, true);
            } catch {
                // Ignora
            }
        }
    }, []);

    const alterarVolume = useCallback((valor: number) => {
        const clamped = Math.max(0, Math.min(100, Math.round(valor)));
        setVolume(clamped);
        setMudo(clamped === 0);
        const p = playerRef.current;
        if (p && playerProntoRef.current) {
            try {
                if (clamped === 0) {
                    p.mute();
                } else {
                    p.unMute();
                    p.setVolume(clamped);
                }
            } catch {
                // Ignora
            }
        }
    }, []);

    const alternarMudo = useCallback(() => {
        const novoMudo = !mudoRef.current;
        setMudo(novoMudo);
        const p = playerRef.current;
        if (p && playerProntoRef.current) {
            try {
                if (novoMudo) {
                    p.mute();
                } else {
                    p.unMute();
                    p.setVolume(volumeRef.current || 80);
                }
            } catch {
                // Ignora
            }
        }
    }, []);

    const alternarAleatorio = useCallback(() => {
        setAleatorio((a) => !a);
    }, []);

    const ciclarRepetir = useCallback(() => {
        setRepetir((atual) =>
            atual === "off" ? "todas" : atual === "todas" ? "uma" : "off",
        );
    }, []);

    const alternarVideoVisivel = useCallback(() => {
        setVideoVisivel((v) => !v);
    }, []);

    const obterProximaNaFila = useCallback(
        async (direcao: 1 | -1, automatico = false): Promise<MusicaResumo | null> => {
            const lista = await garantirFilaCompleta();
            if (lista.length === 0) return null;

            const atual = musicaAtualRef.current;
            const reproduziveis = lista.filter((m) => extrairYouTubeId(m.urlMusica));
            const candidatos = reproduziveis.length > 0 ? reproduziveis : lista;

            if (candidatos.length === 1 && atual?.idMusica === candidatos[0].idMusica) {
                if (automatico && repetirRef.current === "off") return null;
                return candidatos[0];
            }

            if (aleatorioRef.current && candidatos.length > 1) {
                const outros = candidatos.filter((m) => m.idMusica !== atual?.idMusica);
                const escolhida = outros[Math.floor(Math.random() * outros.length)];
                tocarMusica(escolhida, lista);
                return escolhida;
            }

            const idxAtual = candidatos.findIndex((m) => m.idMusica === atual?.idMusica);
            if (idxAtual === -1) {
                const primeira = candidatos[0];
                tocarMusica(primeira, lista);
                return primeira;
            }

            if (
                automatico &&
                direcao === 1 &&
                repetirRef.current === "off" &&
                idxAtual === candidatos.length - 1
            ) {
                return null;
            }

            const proximoIdx = (idxAtual + direcao + candidatos.length) % candidatos.length;
            const escolhida = candidatos[proximoIdx];
            tocarMusica(escolhida, lista);
            return escolhida;
        },
        [garantirFilaCompleta, tocarMusica],
    );

    const proximaMusica = useCallback(
        () => obterProximaNaFila(1, false),
        [obterProximaNaFila],
    );

    const anteriorMusica = useCallback(async () => {
        if (tempoAtual > 5 && playerRef.current && playerProntoRef.current) {
            buscarTempo(0);
            return musicaAtualRef.current;
        }
        return obterProximaNaFila(-1, false);
    }, [buscarTempo, obterProximaNaFila, tempoAtual]);

    useEffect(() => {
        aoTerminarFaixaRef.current = () => {
            if (repetirRef.current === "uma" && playerRef.current && playerProntoRef.current) {
                playerRef.current.seekTo(0, true);
                playerRef.current.playVideo();
                return;
            }
            void obterProximaNaFila(1, true);
        };
    }, [obterProximaNaFila]);

    const adicionarAFila = useCallback((musica: MusicaResumo) => {
        setFila((atual) => {
            const sem = atual.filter((item) => item.idMusica !== musica.idMusica);
            const idxAtual = sem.findIndex(
                (item) => item.idMusica === musicaAtualRef.current?.idMusica,
            );
            if (idxAtual === -1) return [...sem, musica];
            return [...sem.slice(0, idxAtual + 1), musica, ...sem.slice(idxAtual + 1)];
        });
        setAdicionadaRecentementeId(musica.idMusica);
        window.setTimeout(() => {
            setAdicionadaRecentementeId((id) => (id === musica.idMusica ? null : id));
        }, 1800);
    }, []);

    const definirFila = useCallback((lista: MusicaResumo[]) => {
        setFila((atual) => mesclarFila(atual, lista));
    }, []);

    const temLinkPlayavel = Boolean(extrairYouTubeId(musicaAtual?.urlMusica));

    return (
        <PlayerContext.Provider
            value={{
                musicaAtual,
                fila,
                tocando,
                carregandoAudio,
                tempoAtual,
                duracaoTotal,
                volume,
                mudo,
                aleatorio,
                repetir,
                videoVisivel,
                erroPlayer,
                adicionadaRecentementeId,
                temLinkPlayavel,
                carregarMusicaSemTocar,
                tocarMusica,
                alternarPlayPause,
                buscarTempo,
                alterarVolume,
                alternarMudo,
                alternarAleatorio,
                ciclarRepetir,
                alternarVideoVisivel,
                proximaMusica,
                anteriorMusica,
                adicionarAFila,
                definirFila,
                pararPlayer,
            }}
        >
            {children}

            {autenticado ? (
                <div
                    className={`om-yt-pip ${videoVisivel && musicaAtual ? "om-yt-pip--aberta" : "om-yt-pip--oculta"}`}
                    aria-hidden={!videoVisivel}
                >
                    {videoVisivel && musicaAtual ? (
                        <div className="om-yt-pip__cabecalho">
                            <span className="om-yt-pip__titulo">
                                {musicaAtual.titulo} · {musicaAtual.artista}
                            </span>
                            <button
                                type="button"
                                className="om-yt-pip__fechar"
                                onClick={() => setVideoVisivel(false)}
                                aria-label="Minimizar vídeo"
                            >
                                <img src={xIcon} alt="" />
                            </button>
                        </div>
                    ) : null}
                    <div className="om-yt-pip__palco">
                        <div ref={containerYtRef} className="om-yt-pip__iframe" />
                    </div>
                </div>
            ) : null}
        </PlayerContext.Provider>
    );
}
