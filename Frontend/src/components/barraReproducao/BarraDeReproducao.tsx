import { useEffect, useState, type CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { usePlayer } from "../../context/player";
import { formatarDuracao, obterCapaMusica } from "../../utils/formatters";
import barAdicionar from "../../assets/icons/player/bar-adicionar.svg";
import barAleatorio from "../../assets/icons/player/bar-aleatorio.svg";
import barAnterior from "../../assets/icons/player/bar-anterior.svg";
import barPlay from "../../assets/icons/player/bar-play.svg";
import barPausar from "../../assets/icons/player/bar-pausar.svg";
import barProxima from "../../assets/icons/player/bar-proxima.svg";
import barRepetir from "../../assets/icons/player/bar-repetir.svg";
import barLetra from "../../assets/icons/player/bar-letra.svg";
import barFila from "../../assets/icons/player/bar-fila.svg";
import barVolume from "../../assets/icons/player/bar-volume.svg";
import barTelaCheia from "../../assets/icons/player/bar-tela-cheia.svg";
import "./BarraDeReproducao.css";

function BarraDeReproducao() {
    const navigate = useNavigate();
    const { autenticado } = useAuth();
    const {
        musicaAtual,
        fila,
        tocando,
        tempoAtual,
        duracaoTotal,
        volume,
        mudo,
        aleatorio,
        repetir,
        videoVisivel,
        erroPlayer,
        adicionadaRecentementeId,
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
        tocarMusica,
    } = usePlayer();

    const [filaAberta, setFilaAberta] = useState(false);

    const visivel = autenticado && Boolean(musicaAtual);

    useEffect(() => {
        document.body.classList.toggle("om-com-player", visivel);
        return () => document.body.classList.remove("om-com-player");
    }, [visivel]);

    if (!visivel || !musicaAtual) return null;

    const capa = obterCapaMusica(musicaAtual.imagemCapa, musicaAtual.idMusica);
    const maxDuracao = Math.max(1, duracaoTotal || musicaAtual.duracao || 1);
    const pctProgresso = Math.min(100, Math.max(0, (tempoAtual / maxDuracao) * 100));
    const volumeEfetivo = mudo ? 0 : volume;
    const recemAdicionada = adicionadaRecentementeId === musicaAtual.idMusica;

    function abrirLetra() {
        navigate(`/musicas/${musicaAtual!.idMusica}#letra`);
    }

    return (
        <aside
            className="om-player-bar"
            data-node-id="52:181"
            data-name="Barra de reprodução"
            aria-label="Reprodutor de áudio"
        >
            {erroPlayer ? (
                <div className="om-player-bar__aviso" role="status">
                    <span>{erroPlayer}</span>
                    {musicaAtual.urlMusica ? (
                        <a
                            href={musicaAtual.urlMusica}
                            target="_blank"
                            rel="noreferrer"
                            className="om-player-bar__aviso-link"
                        >
                            Abrir no YouTube ↗
                        </a>
                    ) : null}
                </div>
            ) : null}

            {filaAberta ? (
                <div className="om-player-bar__fila-popover" role="dialog" aria-label="Fila de reprodução">
                    <div className="om-player-bar__fila-topo">
                        <strong>Fila de reprodução</strong>
                        <span>
                            {fila.length} {fila.length === 1 ? "faixa" : "faixas"}
                        </span>
                    </div>
                    <div className="om-player-bar__fila-lista">
                        {fila.map((item) => {
                            const ativa = item.idMusica === musicaAtual.idMusica;
                            return (
                                <button
                                    key={item.idMusica}
                                    type="button"
                                    className={`om-player-bar__fila-item ${ativa ? "om-player-bar__fila-item--ativa" : ""}`}
                                    onClick={() => tocarMusica(item, fila)}
                                >
                                    <img
                                        src={obterCapaMusica(item.imagemCapa, item.idMusica)}
                                        alt=""
                                    />
                                    <div className="om-player-bar__fila-info">
                                        <span className="om-player-bar__fila-titulo">
                                            {item.titulo}
                                        </span>
                                        <span className="om-player-bar__fila-artista">
                                            {item.artista}
                                        </span>
                                    </div>
                                    <span className="om-player-bar__fila-dur">
                                        {formatarDuracao(item.duracao, false)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : null}

            <div className="om-player-bar__faixa" data-node-id="52:182">
                <Link
                    to={`/musicas/${musicaAtual.idMusica}`}
                    className="om-player-bar__capa-link"
                    data-node-id="52:183"
                >
                    <img src={capa} alt={musicaAtual.titulo} />
                </Link>

                <Link
                    to={`/musicas/${musicaAtual.idMusica}`}
                    className="om-player-bar__dados"
                    data-node-id="52:184"
                >
                    <span className="om-player-bar__titulo" data-node-id="52:185">
                        {musicaAtual.titulo}
                    </span>
                    <span className="om-player-bar__artista" data-node-id="52:186">
                        {musicaAtual.artista}
                    </span>
                </Link>

                <button
                    type="button"
                    className={`om-player-bar__icon-btn ${recemAdicionada ? "om-player-bar__icon-btn--ativa" : ""}`}
                    onClick={() => adicionarAFila(musicaAtual)}
                    title={recemAdicionada ? "Adicionada à fila" : "Manter / adicionar à fila"}
                    aria-label="Adicionar à fila"
                    data-node-id="52:187"
                >
                    <img src={barAdicionar} alt="" />
                    {recemAdicionada ? (
                        <span className="om-player-bar__add-ok">✓</span>
                    ) : null}
                </button>
            </div>

            <div className="om-player-bar__centro" data-node-id="52:191">
                <div className="om-player-bar__botoes" data-node-id="52:192">
                    <button
                        type="button"
                        className={`om-player-bar__icon-btn ${aleatorio ? "om-player-bar__icon-btn--ativa" : "om-player-bar__icon-btn--desligada"}`}
                        onClick={alternarAleatorio}
                        aria-label="Alternar modo aleatório"
                        aria-pressed={aleatorio}
                        data-node-id="52:193"
                    >
                        <img src={barAleatorio} alt="" />
                    </button>

                    <button
                        type="button"
                        className="om-player-bar__icon-btn"
                        onClick={() => void anteriorMusica()}
                        aria-label="Música anterior"
                        data-node-id="52:199"
                    >
                        <img src={barAnterior} alt="" />
                    </button>

                    <button
                        type="button"
                        className="om-player-bar__play-btn"
                        onClick={() => alternarPlayPause()}
                        aria-label={tocando ? "Pausar" : "Reproduzir"}
                        data-node-id="52:202"
                    >
                        <img src={tocando ? barPausar : barPlay} alt="" />
                    </button>

                    <button
                        type="button"
                        className="om-player-bar__icon-btn"
                        onClick={() => void proximaMusica()}
                        aria-label="Próxima música"
                        data-node-id="52:206"
                    >
                        <img src={barProxima} alt="" />
                    </button>

                    <button
                        type="button"
                        className={`om-player-bar__icon-btn ${repetir !== "off" ? "om-player-bar__icon-btn--ativa" : "om-player-bar__icon-btn--desligada"}`}
                        onClick={ciclarRepetir}
                        aria-label={`Repetir: ${repetir}`}
                        title={
                            repetir === "off"
                                ? "Repetição desativada"
                                : repetir === "todas"
                                  ? "Repetir fila"
                                  : "Repetir faixa atual"
                        }
                        data-node-id="52:209"
                    >
                        <img src={barRepetir} alt="" />
                        {repetir === "uma" ? (
                            <span className="om-player-bar__rep-badge">1</span>
                        ) : null}
                    </button>
                </div>

                <div className="om-player-bar__linha-tempo" data-node-id="52:215">
                    <span className="om-player-bar__tempo" data-node-id="52:216">
                        {formatarDuracao(tempoAtual, false)}
                    </span>

                    <input
                        type="range"
                        min={0}
                        max={maxDuracao}
                        value={Math.min(tempoAtual, maxDuracao)}
                        onChange={(event) => buscarTempo(Number(event.target.value))}
                        className="om-player-bar__range"
                        style={{ "--slider-pct": `${pctProgresso}%` } as CSSProperties}
                        aria-label="Progresso da música"
                        data-node-id="52:217"
                    />

                    <span className="om-player-bar__tempo" data-node-id="52:220">
                        {formatarDuracao(duracaoTotal || musicaAtual.duracao, false)}
                    </span>
                </div>
            </div>

            <div className="om-player-bar__opcoes" data-node-id="52:221">
                <button
                    type="button"
                    className="om-player-bar__icon-btn"
                    onClick={abrirLetra}
                    aria-label="Ir para a letra da música"
                    title="Ver letra da música"
                    data-node-id="52:222"
                >
                    <img src={barLetra} alt="" />
                </button>

                <button
                    type="button"
                    className={`om-player-bar__icon-btn ${filaAberta ? "om-player-bar__icon-btn--ativa" : ""}`}
                    onClick={() => setFilaAberta((aberta) => !aberta)}
                    aria-label="Abrir fila de reprodução"
                    aria-expanded={filaAberta}
                    data-node-id="52:226"
                >
                    <img src={barFila} alt="" />
                </button>

                <button
                    type="button"
                    className={`om-player-bar__icon-btn ${mudo ? "om-player-bar__icon-btn--desligada" : ""}`}
                    onClick={alternarMudo}
                    aria-label={mudo ? "Ativar som" : "Silenciar"}
                    data-node-id="52:231"
                >
                    <img src={barVolume} alt="" />
                </button>

                <input
                    type="range"
                    min={0}
                    max={100}
                    value={volumeEfetivo}
                    onChange={(event) => alterarVolume(Number(event.target.value))}
                    className="om-player-bar__range om-player-bar__volume-slider"
                    style={{ "--slider-pct": `${volumeEfetivo}%` } as CSSProperties}
                    aria-label="Nível de volume"
                    data-node-id="52:234"
                />

                <button
                    type="button"
                    className={`om-player-bar__icon-btn ${videoVisivel ? "om-player-bar__icon-btn--ativa" : ""}`}
                    onClick={alternarVideoVisivel}
                    aria-label={videoVisivel ? "Minimizar vídeo" : "Mostrar vídeo do YouTube"}
                    aria-pressed={videoVisivel}
                    title={videoVisivel ? "Minimizar vídeo" : "Exibir vídeo do YouTube"}
                    data-node-id="52:237"
                >
                    <img src={barTelaCheia} alt="" />
                </button>
            </div>
        </aside>
    );
}

export default BarraDeReproducao;
