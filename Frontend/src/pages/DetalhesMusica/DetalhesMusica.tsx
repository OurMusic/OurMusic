import { useCallback, useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/header/Header";
import ModalConfirmacao from "../../components/modalConfirmacao/ModalConfirmacao";
import { perfilEhAdministrador, useAuth } from "../../context/auth";
import { usePlayer } from "../../context/player";
import { comentarioService, musicaService } from "../../services/ourMusicService";
import { getApiErrorMessage } from "../../services/api";
import type { Comentario, Musica, MusicaResumo } from "../../types/api";
import { extrairYouTubeId } from "../../utils/youtube";
import {
    formatarDataBr,
    formatarDuracao,
    obterAnoLancamento,
    obterCapaMusica,
    obterIniciais,
} from "../../utils/formatters";
import arrowLeft from "../../assets/icons/arrow-left.svg";
import disc3Btn from "../../assets/icons/disc-3-btn.svg";
import share2 from "../../assets/icons/share-2.svg";
import arrowUpRightMuted from "../../assets/icons/arrow-up-right-muted.svg";
import cardAnterior from "../../assets/icons/player/card-anterior.svg";
import cardPlay from "../../assets/icons/player/card-play.svg";
import cardPause from "../../assets/icons/player/card-pause.svg";
import cardProxima from "../../assets/icons/player/card-proxima.svg";
import "./DetalhesMusica.css";

interface ComentarioItem {
    id: string;
    iniciais: string;
    autor: string;
    perfil: string;
    horario: string;
    texto: string;
}

function formatarHorarioComentario(dataIso: string) {
    const data = new Date(dataIso);
    if (Number.isNaN(data.getTime())) return "";
    const minutos = Math.floor((Date.now() - data.getTime()) / 60000);
    if (minutos < 1) return "·  agora mesmo";
    if (minutos < 60) return `·  há ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `·  há ${horas} h`;
    const dias = Math.floor(horas / 24);
    if (dias < 30) return `·  há ${dias} ${dias === 1 ? "dia" : "dias"}`;
    return `·  ${data.toLocaleDateString("pt-BR")}`;
}

function DetalhesMusica() {
    const { id = "" } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { usuario, perfil } = useAuth();
    const isAdmin = perfilEhAdministrador(perfil);
    const {
        musicaAtual,
        tocando,
        tempoAtual,
        duracaoTotal,
        erroPlayer,
        carregarMusicaSemTocar,
        alternarPlayPause,
        buscarTempo,
        proximaMusica,
        anteriorMusica,
    } = usePlayer();

    const [musica, setMusica] = useState<Musica | null>(null);
    const [relacionadas, setRelacionadas] = useState<MusicaResumo[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
    const [excluindo, setExcluindo] = useState(false);

    const [novoComentario, setNovoComentario] = useState("");
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [publicandoComentario, setPublicandoComentario] = useState(false);
    const [erroComentario, setErroComentario] = useState("");

    const carregar = useCallback(async () => {
        if (!id) return;
        setCarregando(true);
        setErro("");
        try {
            const [detalhe, listagem] = await Promise.all([
                musicaService.buscar(id),
                musicaService.listar({ pagina: 1, tamanhoPagina: 10 }),
            ]);
            setMusica(detalhe);
            const listaRelacionadas = listagem.items
                .filter((item) => item.idMusica !== detalhe.idMusica)
                .slice(0, 3);
            setRelacionadas(listaRelacionadas);
            carregarMusicaSemTocar(detalhe, [detalhe, ...listagem.items]);
            try {
                setErroComentario("");
                setComentarios(await comentarioService.listarPorMusica(detalhe.idMusica));
            } catch (error) {
                setComentarios([]);
                setErroComentario(getApiErrorMessage(error));
            }
        } catch (error) {
            setErro(getApiErrorMessage(error));
        } finally {
            setCarregando(false);
        }
    }, [id, carregarMusicaSemTocar]);

    useEffect(() => {
        const timeout = window.setTimeout(() => void carregar(), 0);
        return () => window.clearTimeout(timeout);
    }, [carregar]);

    useEffect(() => {
        if (location.hash === "#letra" && musica) {
            const el = document.getElementById("letra");
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [location.hash, musica]);

    async function confirmarExclusao() {
        if (!musica) return;
        setExcluindo(true);
        setErro("");
        try {
            await musicaService.excluir(musica.idMusica);
            setConfirmandoExclusao(false);
            navigate("/catalogo", { replace: true });
        } catch (error) {
            setErro(getApiErrorMessage(error));
            setConfirmandoExclusao(false);
        } finally {
            setExcluindo(false);
        }
    }

    async function publicarComentario(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const textoLimpo = novoComentario.trim();
        if (!textoLimpo || !musica || publicandoComentario) return;

        setPublicandoComentario(true);
        setErroComentario("");
        try {
            const criado = await comentarioService.cadastrar(musica.idMusica, textoLimpo);
            setComentarios((atuais) => [criado, ...atuais]);
            setNovoComentario("");
        } catch (error) {
            setErroComentario(getApiErrorMessage(error));
        } finally {
            setPublicandoComentario(false);
        }
    }

    const capaPrincipal = obterCapaMusica(musica?.imagemCapa, musica?.idMusica || 0);
    const generosTexto =
        musica && musica.generos.length > 0
            ? musica.generos.map((g) => g.nome).join(" · ")
            : "Sem gênero";
    const generosVirgula =
        musica && musica.generos.length > 0
            ? musica.generos.map((g) => g.nome).join(", ")
            : "—";
    const duracaoFormatada = formatarDuracao(musica?.duracao || 228);
    const temLetra = Boolean(musica?.letra && musica.letra.trim());
    const iniciaisUsuario = obterIniciais(usuario?.nome || "Ana Costa");
    const podeGerenciar = Boolean(
        musica &&
            (isAdmin ||
                musica.idUsuario === undefined ||
                musica.idUsuario === usuario?.idUsuario),
    );

    const estaMusicaNoPlayer = Boolean(
        musica && musicaAtual?.idMusica === musica.idMusica,
    );
    const estaTocandoEsta = estaMusicaNoPlayer && tocando;
    const tempoExibido = estaMusicaNoPlayer ? tempoAtual : 0;
    const duracaoExibida = estaMusicaNoPlayer
        ? duracaoTotal || musica?.duracao || 0
        : musica?.duracao || 0;
    const maxDuracaoHub = Math.max(1, duracaoExibida || 1);
    const pctHub = Math.min(100, Math.max(0, (tempoExibido / maxDuracaoHub) * 100));
    const temUrlYouTube = Boolean(extrairYouTubeId(musica?.urlMusica));

    async function irParaAnterior() {
        const alvo = await anteriorMusica();
        if (alvo && musica && alvo.idMusica !== musica.idMusica) {
            navigate(`/musicas/${alvo.idMusica}`);
        }
    }

    async function irParaProxima() {
        const alvo = await proximaMusica();
        if (alvo && musica && alvo.idMusica !== musica.idMusica) {
            navigate(`/musicas/${alvo.idMusica}`);
        }
    }

    const comentariosBase: ComentarioItem[] = [];
    if (musica?.comentario && musica.comentario.trim()) {
        comentariosBase.push({
            id: "comentario-cadastro",
            iniciais: obterIniciais(musica.artista || "MR"),
            autor: musica.artista || "Marina Reis",
            perfil: "Autora do cadastro",
            horario: "·  há 2 dias",
            texto: musica.comentario.trim(),
        });
    }
    const comentariosApi: ComentarioItem[] = comentarios.map((comentario) => {
        const proprio = usuario?.idUsuario === comentario.idUsuario;
        const autor = comentario.nomeUsuario || (proprio ? usuario?.nome : "") || "Usuário";
        return {
            id: `comentario-${comentario.idComentario}`,
            iniciais: obterIniciais(autor),
            autor,
            perfil: proprio ? (isAdmin ? "Administrador" : "Usuário") : "",
            horario: formatarHorarioComentario(comentario.dataComentario),
            texto: comentario.texto,
        };
    });
    const listaComentarios = [...comentariosApi, ...comentariosBase];

    return (
        <div className="om-app-shell" data-node-id="52:2" data-name="Detalhes da música">
            <Sidebar itemAtivo="catalogo" />

            <div className="om-main-area">
                <Header />

                <main className="om-page-content om-detalhes">
                    <Link
                        to="/catalogo"
                        className="om-detalhes__voltar"
                        aria-label="Voltar ao catálogo"
                        data-node-id="2:6612"
                    >
                        <img src={arrowLeft} alt="" />
                    </Link>

                    {erro ? (
                        <p className="om-alert om-alert-error" role="alert">
                            {erro}
                        </p>
                    ) : null}

                    {carregando && !musica ? (
                        <p className="om-detalhes__estado">Carregando detalhes da música...</p>
                    ) : musica ? (
                        <>
                            <section
                                className="om-detalhes__identidade"
                                data-node-id="2:6615"
                                data-name="Identidade da música"
                            >
                                <div className="om-detalhes__capa" data-node-id="2:6616">
                                    <img
                                        src={capaPrincipal}
                                        alt={`Capa de ${musica.titulo}`}
                                    />
                                </div>

                                <div className="om-detalhes__apresentacao" data-node-id="2:6617">
                                    <div className="om-detalhes__classificacao" data-node-id="2:6618">
                                        <span className="om-detalhes__badge-ano" data-node-id="2:6619">
                                            {obterAnoLancamento(musica.dataLancamento)}
                                        </span>
                                        <span
                                            className="om-detalhes__badge-genero"
                                            data-node-id="2:6621"
                                        >
                                            {generosTexto}
                                        </span>
                                    </div>

                                    <div className="om-detalhes__titulo-artista" data-node-id="2:6623">
                                        <h1 className="om-detalhes__titulo" data-node-id="2:6624">
                                            {musica.titulo}
                                        </h1>
                                        <p className="om-detalhes__artista" data-node-id="2:6625">
                                            {musica.artista}
                                        </p>
                                    </div>

                                    <p className="om-detalhes__meta" data-node-id="2:6626">
                                        {`Lançamento: ${formatarDataBr(musica.dataLancamento)}  ·  Duração: ${duracaoFormatada} (${musica.duracao}s)`}
                                    </p>

                                    {podeGerenciar ? (
                                        <div className="om-detalhes__acoes" data-node-id="52:60">
                                            <Link
                                                to={`/musicas/editar/${musica.idMusica}`}
                                                className="om-detalhes__btn-editar"
                                                data-node-id="52:61"
                                            >
                                                <img src={disc3Btn} alt="" />
                                                <span>Editar música</span>
                                            </Link>

                                            <button
                                                type="button"
                                                className="om-detalhes__btn-excluir"
                                                onClick={() => setConfirmandoExclusao(true)}
                                                data-node-id="52:65"
                                            >
                                                <img src={share2} alt="" />
                                                <span>Excluir minha música</span>
                                            </button>
                                        </div>
                                    ) : null}
                                </div>

                                <div
                                    className="om-detalhes__hub-player"
                                    data-node-id="52:69"
                                    data-name="Hub de reprodução"
                                >
                                    <div
                                        className="om-detalhes__hub-controles"
                                        data-node-id="52:70"
                                    >
                                        <button
                                            type="button"
                                            className="om-detalhes__hub-nav-btn"
                                            onClick={() => void irParaAnterior()}
                                            aria-label="Música anterior"
                                            data-node-id="52:71"
                                        >
                                            <img src={cardAnterior} alt="" />
                                        </button>

                                        <button
                                            type="button"
                                            className="om-detalhes__hub-play-btn"
                                            onClick={() =>
                                                alternarPlayPause(musica, [
                                                    musica,
                                                    ...relacionadas,
                                                ])
                                            }
                                            aria-label={
                                                estaTocandoEsta
                                                    ? `Pausar ${musica.titulo}`
                                                    : `Reproduzir ${musica.titulo}`
                                            }
                                            data-node-id="52:74"
                                        >
                                            <img
                                                src={estaTocandoEsta ? cardPause : cardPlay}
                                                alt=""
                                            />
                                        </button>

                                        <button
                                            type="button"
                                            className="om-detalhes__hub-nav-btn"
                                            onClick={() => void irParaProxima()}
                                            aria-label="Próxima música"
                                            data-node-id="52:77"
                                        >
                                            <img src={cardProxima} alt="" />
                                        </button>
                                    </div>

                                    <div
                                        className="om-detalhes__hub-progresso"
                                        data-node-id="52:80"
                                    >
                                        <input
                                            type="range"
                                            min={0}
                                            max={maxDuracaoHub}
                                            value={Math.min(tempoExibido, maxDuracaoHub)}
                                            onChange={(event) => {
                                                const valor = Number(event.target.value);
                                                if (!estaMusicaNoPlayer) {
                                                    alternarPlayPause(musica, [
                                                        musica,
                                                        ...relacionadas,
                                                    ]);
                                                }
                                                buscarTempo(valor);
                                            }}
                                            className="om-detalhes__hub-range"
                                            style={
                                                {
                                                    "--slider-pct": `${pctHub}%`,
                                                } as CSSProperties
                                            }
                                            aria-label="Linha do tempo da música"
                                            data-node-id="52:81"
                                        />

                                        <div
                                            className="om-detalhes__hub-tempo"
                                            data-node-id="52:85"
                                        >
                                            <span className="om-detalhes__hub-tempo-atual">
                                                {formatarDuracao(tempoExibido)}
                                            </span>
                                            <span className="om-detalhes__hub-tempo-total">
                                                {formatarDuracao(duracaoExibida)}
                                            </span>
                                        </div>
                                    </div>

                                    {!temUrlYouTube ? (
                                        <p className="om-detalhes__hub-status">
                                            Link do YouTube não cadastrado
                                        </p>
                                    ) : estaMusicaNoPlayer && erroPlayer ? (
                                        <a
                                            href={musica.urlMusica || "#"}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="om-detalhes__hub-link-yt"
                                        >
                                            Abrir no YouTube ↗
                                        </a>
                                    ) : null}
                                </div>
                            </section>

                            <section
                                id="letra"
                                className="om-detalhes__informacoes"
                                data-node-id="52:88"
                                data-name="Informações detalhadas"
                            >
                                <div className="om-detalhes__sobre" data-node-id="52:89">
                                    <h2 className="om-detalhes__secao-titulo" data-node-id="52:90">
                                        Letra da música
                                    </h2>

                                    <div
                                        className={`om-detalhes__paragrafo om-detalhes__letra ${!temLetra ? "om-detalhes__letra--indisponivel" : ""}`}
                                        data-node-id="52:92"
                                    >
                                        {temLetra ? (
                                            `Letra: "${musica.letra!.trim()}"`
                                        ) : (
                                            <span className="om-detalhes__letra-vazia">
                                                Letra indisponível
                                            </span>
                                        )}
                                    </div>

                                    <div className="om-detalhes__tags" data-node-id="52:93">
                                        {musica.generos.map((genero) => (
                                            <Link
                                                key={genero.idGenero}
                                                to={`/catalogo?idGenero=${genero.idGenero}`}
                                                className="om-detalhes__tag om-detalhes__tag--link"
                                            >
                                                {genero.nome}
                                            </Link>
                                        ))}
                                        <span
                                            className={`om-detalhes__tag ${!temLetra ? "om-detalhes__tag--indisponivel" : ""}`}
                                        >
                                            {temLetra
                                                ? "Letra disponível"
                                                : "Letra indisponível"}
                                        </span>
                                    </div>
                                </div>

                                <aside className="om-detalhes__ficha" data-node-id="2:6646">
                                    <h3 className="om-detalhes__ficha-titulo" data-node-id="2:6647">
                                        Dados do banco
                                    </h3>

                                    <div className="om-detalhes__ficha-linha" data-node-id="2:6648">
                                        <span>ID da música</span>
                                        <strong>
                                            #{String(musica.idMusica).padStart(2, "0")}
                                        </strong>
                                    </div>

                                    <div className="om-detalhes__ficha-linha" data-node-id="2:6651">
                                        <span>Artista</span>
                                        <strong>{musica.artista}</strong>
                                    </div>

                                    <div className="om-detalhes__ficha-linha" data-node-id="2:6654">
                                        <span>Lançamento</span>
                                        <strong>{formatarDataBr(musica.dataLancamento)}</strong>
                                    </div>

                                    <div className="om-detalhes__ficha-linha" data-node-id="2:6657">
                                        <span>Duração</span>
                                        <strong>
                                            {musica.duracao} seg ({duracaoFormatada})
                                        </strong>
                                    </div>

                                    <div className="om-detalhes__ficha-linha" data-node-id="2:6660">
                                        <span>Gênero(s)</span>
                                        <strong>{generosVirgula}</strong>
                                    </div>
                                </aside>
                            </section>

                            <section
                                className="om-detalhes__comentarios-card"
                                data-node-id="39:2"
                                data-name="Caixa de comentários"
                            >
                                <div
                                    className="om-detalhes__comentarios-topo"
                                    data-node-id="39:3"
                                >
                                    <div
                                        className="om-detalhes__comentarios-titulo-grupo"
                                        data-node-id="39:4"
                                    >
                                        <h2
                                            className="om-detalhes__comentarios-titulo"
                                            data-node-id="39:5"
                                        >
                                            Comentários
                                        </h2>
                                        <span
                                            className="om-detalhes__comentarios-contador"
                                            data-node-id="39:6"
                                        >
                                            {listaComentarios.length}{" "}
                                            {listaComentarios.length === 1
                                                ? "comentário"
                                                : "comentários"}
                                        </span>
                                    </div>
                                    <p
                                        className="om-detalhes__comentarios-subtitulo"
                                        data-node-id="39:8"
                                    >
                                        Compartilhe sua avaliação ou comentário sobre esta música
                                    </p>
                                </div>

                                <div
                                    className="om-detalhes__novo-comentario"
                                    data-node-id="39:9"
                                >
                                    <div
                                        className="om-detalhes__comentario-avatar om-detalhes__comentario-avatar--usuario"
                                        data-node-id="39:10"
                                    >
                                        <span>{iniciaisUsuario}</span>
                                    </div>

                                    <form
                                        className="om-detalhes__comentario-form"
                                        onSubmit={publicarComentario}
                                        data-node-id="39:12"
                                    >
                                        <textarea
                                            className="om-detalhes__comentario-textarea"
                                            value={novoComentario}
                                            onChange={(event) =>
                                                setNovoComentario(event.target.value.slice(0, 255))
                                            }
                                            maxLength={255}
                                            placeholder="Escreva um comentário sobre a música, letra ou produção..."
                                            data-node-id="39:13"
                                        />
                                        <div
                                            className="om-detalhes__comentario-barra"
                                            data-node-id="39:15"
                                        >
                                            <span
                                                className="om-detalhes__comentario-limite"
                                                data-node-id="39:16"
                                            >
                                                {novoComentario.length} / 255 caracteres
                                            </span>
                                            <button
                                                type="submit"
                                                className="om-detalhes__comentario-btn"
                                                disabled={!novoComentario.trim() || publicandoComentario}
                                                data-node-id="39:17"
                                            >
                                                {publicandoComentario ? "Publicando..." : "Publicar comentário"}
                                            </button>
                                        </div>
                                        {erroComentario ? (
                                            <p className="om-alert om-alert-error" role="alert">
                                                {erroComentario}
                                            </p>
                                        ) : null}
                                    </form>
                                </div>

                                <div
                                    className="om-detalhes__comentarios-lista"
                                    data-node-id="39:19"
                                >
                                    {listaComentarios.length === 0 ? (
                                        <p className="om-detalhes__comentarios-vazio">
                                            Nenhum comentário publicado ainda para esta música.
                                        </p>
                                    ) : (
                                        listaComentarios.map((item) => (
                                            <article
                                                key={item.id}
                                                className="om-detalhes__comentario-item"
                                                data-node-id="39:20"
                                            >
                                                <div
                                                    className="om-detalhes__comentario-avatar"
                                                    data-node-id="39:21"
                                                >
                                                    <span>{item.iniciais}</span>
                                                </div>
                                                <div
                                                    className="om-detalhes__comentario-conteudo"
                                                    data-node-id="39:23"
                                                >
                                                    <div
                                                        className="om-detalhes__comentario-autor-linha"
                                                        data-node-id="39:24"
                                                    >
                                                        <strong
                                                            className="om-detalhes__comentario-autor"
                                                            data-node-id="39:25"
                                                        >
                                                            {item.autor}
                                                        </strong>
                                                        {item.perfil ? (
                                                            <span
                                                                className="om-detalhes__comentario-perfil"
                                                                data-node-id="39:26"
                                                            >
                                                                {item.perfil}
                                                            </span>
                                                        ) : null}
                                                        <span
                                                            className="om-detalhes__comentario-horario"
                                                            data-node-id="39:28"
                                                        >
                                                            {item.horario}
                                                        </span>
                                                    </div>
                                                    <p
                                                        className="om-detalhes__comentario-texto"
                                                        data-node-id="39:29"
                                                    >
                                                        {item.texto}
                                                    </p>
                                                </div>
                                            </article>
                                        ))
                                    )}
                                </div>
                            </section>

                            <section
                                className="om-detalhes__relacionadas"
                                data-node-id="2:6663"
                                data-name="Músicas relacionadas"
                            >
                                <div
                                    className="om-detalhes__relacionadas-topo"
                                    data-node-id="2:6664"
                                >
                                    <h2 className="om-detalhes__relacionadas-titulo">
                                        Continue na mesma sintonia
                                    </h2>
                                    <Link
                                        to={
                                            musica.generos[0]
                                                ? `/catalogo?idGenero=${musica.generos[0].idGenero}`
                                                : "/catalogo"
                                        }
                                        className="om-detalhes__relacionadas-link"
                                    >
                                        Explorar mais {musica.generos[0]?.nome || "MPB"} →
                                    </Link>
                                </div>

                                <div
                                    className="om-detalhes__sugestoes"
                                    data-node-id="2:6667"
                                >
                                    {relacionadas.map((rel, idx) => (
                                        <Link
                                            key={rel.idMusica}
                                            to={`/musicas/${rel.idMusica}`}
                                            className="om-detalhes__sugestao"
                                        >
                                            <div className="om-detalhes__sugestao-capa">
                                                <img
                                                    src={obterCapaMusica(
                                                        rel.imagemCapa,
                                                        idx + 1,
                                                    )}
                                                    alt={rel.titulo}
                                                />
                                            </div>
                                            <div className="om-detalhes__sugestao-info">
                                                <p className="om-detalhes__sugestao-titulo">
                                                    {rel.titulo}
                                                </p>
                                                <p className="om-detalhes__sugestao-artista">
                                                    {rel.artista}
                                                </p>
                                            </div>
                                            <span className="om-detalhes__sugestao-icone">
                                                <img src={arrowUpRightMuted} alt="" />
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        </>
                    ) : null}

                    <ModalConfirmacao
                        show={confirmandoExclusao}
                        titulo="Excluir esta música?"
                        mensagem="Esta ação removerá a música e seus vínculos em MusicaGenero (Admin exclui qualquer música; Usuário exclui apenas as próprias)."
                        itemTitulo={musica?.titulo}
                        itemSubtitulo={
                            musica
                                ? `${musica.artista} · ${musica.generos[0]?.nome || "Catálogo"} · ${duracaoFormatada}`
                                : ""
                        }
                        itemImagem={capaPrincipal}
                        avisoPermanente="Esta ação é permanente e não pode ser desfeita."
                        textoConfirmar={excluindo ? "Excluindo..." : "Sim, excluir música"}
                        textoCancelar="Cancelar"
                        enviando={excluindo}
                        onClose={() => setConfirmandoExclusao(false)}
                        onConfirm={() => void confirmarExclusao()}
                    />
                </main>
            </div>
        </div>
    );
}

export default DetalhesMusica;
