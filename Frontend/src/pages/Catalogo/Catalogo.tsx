import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/header/Header";
import CardMusica from "../../components/cardMusica/CardMusica";
import { useAuth } from "../../context/auth";
import { generoService, musicaService } from "../../services/ourMusicService";
import { getApiErrorMessage } from "../../services/api";
import type { Genero, MusicaResumo } from "../../types/api";
import {
    CAPAS_PADRAO,
    formatarDuracao,
    obterAnoLancamento,
    obterCapaMusica,
    obterPrimeiroNome,
} from "../../utils/formatters";
import arrowUpRightDark from "../../assets/icons/arrow-up-right-dark.svg";
import arrowUpRightGreen from "../../assets/icons/arrow-up-right-green.svg";
import searchIcon from "../../assets/icons/search.svg";
import chevronRight from "../../assets/icons/chevron-right.svg";
import "./Catalogo.css";

const GENEROS_FIGMA_COMPLEMENTARES = [
    "Maid Core",
    "Tribal",
    "Sertanejo",
    "Eletrônica",
    "Indie",
    "MPB",
    "Ambiente",
];

const DESTAQUES_EDITORIAIS = [
    {
        seloDesktop: "DESTAQUE DO CATÁLOGO",
        seloMobile: "NO RADAR / MPB",
        titulo: "Deixe o som te levar.",
        descricao:
            "Explore as músicas disponíveis, filtre por gênero musical, pesquise pelo título e acesse os detalhes completos.",
        artistaMobile: "Lia Luz · Entre marés",
        capa: CAPAS_PADRAO[0],
    },
    {
        seloDesktop: "CURADORIA OURMUSIC",
        seloMobile: "EM ALTA / TRIBAL",
        titulo: "Novas frequências no ar.",
        descricao:
            "Descubra faixas selecionadas do acervo, navegue pelos gêneros e acompanhe a ficha técnica e letra de cada obra.",
        artistaMobile: "Caio Sol · Sol de domingo",
        capa: CAPAS_PADRAO[1],
    },
    {
        seloDesktop: "SELEÇÃO DA SEMANA",
        seloMobile: "ESCOLHA / SERTANEJO",
        titulo: "Cada faixa, uma história.",
        descricao:
            "Use a busca rápida por título ou selecione um gênero abaixo para filtrar o catálogo em tempo real.",
        artistaMobile: "Marina Reis · Tudo em seu lugar",
        capa: CAPAS_PADRAO[2],
    },
];

function Catalogo() {
    const { usuario } = useAuth();
    const [generos, setGeneros] = useState<Genero[]>([]);
    const [musicas, setMusicas] = useState<MusicaResumo[]>([]);
    const [total, setTotal] = useState(0);
    const [totalGeral, setTotalGeral] = useState(0);
    const [pagina, setPagina] = useState(1);
    const tamanhoPagina = 15;
    const [busca, setBusca] = useState("");
    const [idGeneroSelecionado, setIdGeneroSelecionado] = useState<number | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    // Estados de animação lenta de fade-in / fade-out
    const [indiceDestaque, setIndiceDestaque] = useState(0);
    const [destaqueFadeOut, setDestaqueFadeOut] = useState(false);
    const [gradeFadeOut, setGradeFadeOut] = useState(false);
    const [cicloGrade, setCicloGrade] = useState(0);

    const carregarGeneros = useCallback(async () => {
        try {
            const lista = await generoService.listar();
            setGeneros(lista);
        } catch {
            // Mantém lista complementar caso falhe
        }
    }, []);

    const carregarMusicas = useCallback(async () => {
        setCarregando(true);
        setErro("");
        try {
            const resposta = await musicaService.listar({
                pagina,
                tamanhoPagina,
                busca,
                idGenero: idGeneroSelecionado,
            });
            setMusicas(resposta.items);
            setTotal(resposta.total);
            if (!busca.trim() && !idGeneroSelecionado) {
                setTotalGeral(resposta.total);
            }
        } catch (error) {
            setErro(getApiErrorMessage(error));
        } finally {
            setCarregando(false);
            setGradeFadeOut(false);
            setCicloGrade((c) => c + 1);
        }
    }, [pagina, tamanhoPagina, busca, idGeneroSelecionado]);

    useEffect(() => {
        const timeout = window.setTimeout(() => void carregarGeneros(), 0);
        return () => window.clearTimeout(timeout);
    }, [carregarGeneros]);

    useEffect(() => {
        const timeout = window.setTimeout(() => void carregarMusicas(), 220);
        return () => window.clearTimeout(timeout);
    }, [carregarMusicas]);

    // Ciclo lento e visível de fade-out (900ms) -> troca -> fade-in (900ms) no destaque editorial
    useEffect(() => {
        const totalSlides = Math.max(DESTAQUES_EDITORIAIS.length, musicas.length);
        let timeoutTroca: number | undefined;

        const intervalo = window.setInterval(() => {
            setDestaqueFadeOut(true);
            timeoutTroca = window.setTimeout(() => {
                setIndiceDestaque((atual) => (atual + 1) % totalSlides);
                setDestaqueFadeOut(false);
            }, 900);
        }, 6500);

        return () => {
            window.clearInterval(intervalo);
            if (timeoutTroca) window.clearTimeout(timeoutTroca);
        };
    }, [musicas.length]);

    function selecionarGeneroComFade(idGenero: number | null) {
        if (idGenero === idGeneroSelecionado && !busca) return;
        setGradeFadeOut(true);
        window.setTimeout(() => {
            setIdGeneroSelecionado(idGenero);
            setPagina(1);
        }, 450);
    }

    function mudarPaginaComFade(novaPagina: number) {
        if (novaPagina === pagina) return;
        setGradeFadeOut(true);
        window.setTimeout(() => {
            setPagina(novaPagina);
        }, 450);
    }

    const generoAtivo = generos.find((g) => g.idGenero === idGeneroSelecionado) ?? null;
    const totalPaginas = Math.max(1, Math.ceil(total / tamanhoPagina));
    const inicioItem = total === 0 ? 0 : (pagina - 1) * tamanhoPagina + 1;
    const fimItem = Math.min(total, pagina * tamanhoPagina);

    const slideEditorial =
        DESTAQUES_EDITORIAIS[indiceDestaque % DESTAQUES_EDITORIAIS.length];
    const musicaDestaque =
        musicas.length > 0 ? musicas[indiceDestaque % musicas.length] : null;
    const capaBanner = musicaDestaque
        ? obterCapaMusica(musicaDestaque.imagemCapa, indiceDestaque)
        : slideEditorial.capa;
    const numeroEdicao = String((indiceDestaque % 3) + 1).padStart(2, "0");

    const primeiroNome = obterPrimeiroNome(usuario?.nome).toUpperCase();

    return (
        <div
            className="om-app-shell om-fade-in-page"
            data-node-id="2:6421"
            data-name="Catálogo de músicas"
        >
            <Sidebar modo="descoberta" itemAtivo="catalogo" />

            <div className="om-main-area">
                <Header />

                <main className="om-page-content om-catalogo">
                    <section
                        className="om-catalogo__apresentacao om-stagger-1"
                        data-node-id="2:6458"
                    >
                        <div className="om-catalogo__saudacao" data-node-id="2:6459">
                            <p className="om-catalogo__boas-vindas" data-node-id="2:6460">
                                BOM TE VER POR AQUI, {primeiroNome}
                            </p>
                            <h1 className="om-catalogo__titulo" data-node-id="2:6461">
                                Seu próximo som favorito.
                            </h1>
                        </div>
                        <p className="om-catalogo__tamanho" data-node-id="2:6462">
                            {totalGeral || total} músicas para descobrir
                        </p>
                    </section>

                    <section
                        className="om-catalogo__destaque om-stagger-2"
                        data-node-id="2:6463"
                    >
                        <div
                            className={`om-catalogo__destaque-chamada om-fade-transition ${destaqueFadeOut ? "om-is-fading-out" : "om-is-fading-in"}`}
                            data-node-id="2:6464"
                        >
                            <p className="om-catalogo__destaque-selo" data-node-id="2:6465">
                                <span className="om-only-desktop">
                                    {slideEditorial.seloDesktop}
                                </span>
                                <span className="om-only-mobile">
                                    {slideEditorial.seloMobile}
                                </span>
                            </p>
                            <h2
                                className="om-catalogo__destaque-titulo"
                                data-node-id="2:6466"
                            >
                                {slideEditorial.titulo}
                            </h2>
                            <p
                                className="om-catalogo__destaque-desc om-only-desktop"
                                data-node-id="2:6467"
                            >
                                {slideEditorial.descricao}
                            </p>
                            <p className="om-catalogo__destaque-artista-mobile om-only-mobile">
                                {musicaDestaque
                                    ? `${musicaDestaque.artista} · ${musicaDestaque.titulo}`
                                    : slideEditorial.artistaMobile}
                            </p>
                            <Link
                                to={
                                    musicaDestaque
                                        ? `/musicas/${musicaDestaque.idMusica}`
                                        : "/catalogo#resultados"
                                }
                                className="om-catalogo__destaque-btn om-only-desktop"
                                data-node-id="2:6468"
                            >
                                <img src={arrowUpRightDark} alt="" />
                                <span>Explorar música</span>
                            </Link>
                            <Link
                                to={
                                    musicaDestaque
                                        ? `/musicas/${musicaDestaque.idMusica}`
                                        : "/catalogo#resultados"
                                }
                                className="om-catalogo__destaque-link-mobile om-only-mobile"
                                data-node-id="2:7236"
                            >
                                <span>Explorar música</span>
                                <img src={arrowUpRightGreen} alt="" />
                            </Link>
                        </div>

                        <div
                            className={`om-catalogo__destaque-arte om-fade-transition ${destaqueFadeOut ? "om-is-fading-out" : "om-is-fading-in"}`}
                            data-node-id="2:6471"
                        >
                            <div
                                className="om-catalogo__destaque-edicao om-only-desktop"
                                data-node-id="2:6472"
                            >
                                <span className="om-catalogo__edicao-rotulo">ESCOLHA</span>
                                <span className="om-catalogo__edicao-numero">
                                    {numeroEdicao}
                                </span>
                                <span className="om-catalogo__edicao-linha" />
                            </div>
                            <div
                                className="om-catalogo__destaque-capa"
                                data-node-id="2:6476"
                            >
                                <img src={capaBanner} alt="Álbum em destaque" />
                            </div>
                        </div>
                    </section>

                    <section
                        id="generos"
                        className="om-catalogo__pesquisa-generos om-stagger-3"
                        data-node-id="2:6477"
                    >
                        <div className="om-catalogo__busca-wrapper" data-node-id="2:6478">
                            <div className="om-catalogo__busca" data-node-id="2:6479">
                                <span className="om-catalogo__busca-icone">
                                    <img src={searchIcon} alt="" />
                                </span>
                                <input
                                    type="search"
                                    value={busca}
                                    onChange={(e) => {
                                        setGradeFadeOut(true);
                                        setBusca(e.target.value);
                                        setPagina(1);
                                    }}
                                    placeholder="Buscar músicas pelo título..."
                                    aria-label="Buscar músicas pelo título"
                                />
                            </div>
                        </div>

                        <div className="om-catalogo__generos-lista" data-node-id="2:6485">
                            <button
                                type="button"
                                className={`om-catalogo__genero-pill ${idGeneroSelecionado === null ? "om-catalogo__genero-pill--ativo" : ""}`}
                                onClick={() => selecionarGeneroComFade(null)}
                                data-node-id="2:6486"
                            >
                                Todos
                            </button>

                            {generos.map((genero) => (
                                <button
                                    key={genero.idGenero}
                                    type="button"
                                    className={`om-catalogo__genero-pill ${idGeneroSelecionado === genero.idGenero ? "om-catalogo__genero-pill--ativo" : ""}`}
                                    onClick={() => selecionarGeneroComFade(genero.idGenero)}
                                >
                                    {genero.nome}
                                </button>
                            ))}

                            {GENEROS_FIGMA_COMPLEMENTARES.filter(
                                (nomeFigma) =>
                                    !generos.some(
                                        (g) =>
                                            g.nome.toLowerCase() === nomeFigma.toLowerCase(),
                                    ),
                            ).map((nomeExtra) => (
                                <button
                                    key={nomeExtra}
                                    type="button"
                                    className="om-catalogo__genero-pill"
                                    onClick={() => {
                                        setGradeFadeOut(true);
                                        setBusca(nomeExtra);
                                        setIdGeneroSelecionado(null);
                                        setPagina(1);
                                    }}
                                >
                                    {nomeExtra}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section
                        id="resultados"
                        className={`om-catalogo__resultados om-stagger-4 om-fade-transition ${gradeFadeOut ? "om-is-fading-out" : "om-is-fading-in"}`}
                        data-node-id="2:6502"
                    >
                        <div className="om-catalogo__resultados-topo" data-node-id="2:6503">
                            <div
                                className="om-catalogo__resultados-resumo"
                                data-node-id="2:6504"
                            >
                                <h2
                                    className="om-catalogo__resultados-titulo"
                                    data-node-id="2:6505"
                                >
                                    {generoAtivo
                                        ? `Explore ${generoAtivo.nome}`
                                        : "Explore a MPB"}
                                </h2>
                                <span
                                    className="om-catalogo__resultados-qtd"
                                    data-node-id="2:6506"
                                >
                                    {total} {total === 1 ? "música" : "músicas"}
                                </span>
                            </div>
                        </div>

                        {erro ? (
                            <p className="om-alert om-alert-error" role="alert">
                                {erro}
                            </p>
                        ) : null}

                        {carregando && musicas.length === 0 ? (
                            <p className="om-catalogo__estado">Carregando catálogo...</p>
                        ) : musicas.length === 0 ? (
                            <p className="om-catalogo__estado">
                                Nenhuma música encontrada para os filtros selecionados.
                            </p>
                        ) : (
                            <div
                                key={cicloGrade}
                                className="om-catalogo__grade"
                                data-node-id="2:6510"
                            >
                                {musicas.map((musica, idx) => {
                                    const generoPrincipal =
                                        musica.generos[0]?.nome || "Catálogo";
                                    const ano = obterAnoLancamento(musica.dataLancamento);
                                    const duracaoFmt = formatarDuracao(musica.duracao);
                                    const metadados =
                                        idx >= 3
                                            ? `${generoPrincipal}  ·  ${ano}  ·  ${duracaoFmt}`
                                            : `${generoPrincipal} · ${duracaoFmt}`;

                                    return (
                                        <CardMusica
                                            key={musica.idMusica}
                                            id={musica.idMusica}
                                            titulo={musica.titulo}
                                            artista={musica.artista}
                                            metadados={metadados}
                                            imagem={musica.imagemCapa}
                                            indice={idx}
                                        />
                                    );
                                })}
                            </div>
                        )}

                        <div
                            className="om-catalogo__paginacao om-only-desktop"
                            data-node-id="2:6556"
                        >
                            <span
                                className="om-catalogo__paginacao-texto"
                                data-node-id="2:6557"
                            >
                                Mostrando {inicioItem}–{fimItem}
                            </span>

                            <div className="om-catalogo__paginas" data-node-id="2:6558">
                                <button
                                    type="button"
                                    className="om-catalogo__pagina-anterior"
                                    onClick={() =>
                                        mudarPaginaComFade(Math.max(1, pagina - 1))
                                    }
                                    disabled={pagina <= 1}
                                    data-node-id="2:6559"
                                >
                                    Anterior
                                </button>

                                {Array.from(
                                    { length: Math.min(totalPaginas, 5) },
                                    (_, i) => i + 1,
                                ).map((num) => (
                                    <button
                                        key={num}
                                        type="button"
                                        className={`om-catalogo__pagina-num ${pagina === num ? "om-catalogo__pagina-num--ativa" : ""}`}
                                        onClick={() => mudarPaginaComFade(num)}
                                    >
                                        {num}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    className="om-catalogo__pagina-proxima"
                                    onClick={() =>
                                        mudarPaginaComFade(
                                            Math.min(totalPaginas, pagina + 1),
                                        )
                                    }
                                    disabled={pagina >= totalPaginas}
                                    data-node-id="2:6571"
                                >
                                    <img src={chevronRight} alt="" />
                                    <span>Próxima</span>
                                </button>
                            </div>
                        </div>

                        <div className="om-catalogo__mobile-paginacao om-only-mobile">
                            <button
                                type="button"
                                className="om-catalogo__carregar-mais"
                                onClick={() =>
                                    mudarPaginaComFade(
                                        pagina < totalPaginas ? pagina + 1 : 1,
                                    )
                                }
                                data-node-id="2:7289"
                            >
                                Carregar mais músicas
                            </button>
                            <p
                                className="om-catalogo__contagem-mobile"
                                data-node-id="2:7291"
                            >
                                {musicas.length} de {total} músicas
                            </p>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default Catalogo;
