import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/header/Header";
import Botao from "../../components/botao/Botao";
import ModalConfirmacao from "../../components/modalConfirmacao/ModalConfirmacao";
import { generoService, musicaService } from "../../services/ourMusicService";
import { getApiErrorMessage } from "../../services/api";
import type { Genero, MusicaResumo } from "../../types/api";
import {
    formatarDataBr,
    formatarDuracao,
    obterCapaMusica,
} from "../../utils/formatters";
import plusIcon from "../../assets/icons/plus.svg";
import discStat from "../../assets/icons/disc-stat.svg";
import globeStat from "../../assets/icons/globe-stat.svg";
import filePenStat from "../../assets/icons/file-pen-stat.svg";
import searchIcon from "../../assets/icons/search.svg";
import chevronDown from "../../assets/icons/chevron-down.svg";
import eyeIcon from "../../assets/icons/eye.svg";
import pencilIcon from "../../assets/icons/pencil.svg";
import trashIcon from "../../assets/icons/trash-2.svg";
import shieldCheckXs from "../../assets/icons/shield-check-xs.svg";
import "./AdministracaoMusicas.css";

function AdministracaoMusicas() {
    const navigate = useNavigate();

    const [musicas, setMusicas] = useState<MusicaResumo[]>([]);
    const [generos, setGeneros] = useState<Genero[]>([]);
    const [total, setTotal] = useState(0);
    const [totalGeral, setTotalGeral] = useState(0);
    const [pagina, setPagina] = useState(1);
    const tamanhoPagina = 6;
    const [busca, setBusca] = useState("");
    const [idGeneroFiltro, setIdGeneroFiltro] = useState<number | null>(null);
    const [selecionadasIds, setSelecionadasIds] = useState<number[]>([]);
    const [musicaParaExcluir, setMusicaParaExcluir] = useState<MusicaResumo | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [excluindo, setExcluindo] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState("");

    const carregar = useCallback(async () => {
        setCarregando(true);
        setErro("");
        try {
            const [respostaMusicas, listaGeneros] = await Promise.all([
                musicaService.listar({
                    pagina,
                    tamanhoPagina,
                    busca,
                    idGenero: idGeneroFiltro,
                }),
                generoService.listar(),
            ]);
            setMusicas(respostaMusicas.items);
            setTotal(respostaMusicas.total);
            setGeneros(listaGeneros);
            if (!busca.trim() && !idGeneroFiltro) {
                setTotalGeral(respostaMusicas.total);
            }
        } catch (error) {
            setErro(getApiErrorMessage(error));
        } finally {
            setCarregando(false);
        }
    }, [pagina, tamanhoPagina, busca, idGeneroFiltro]);

    useEffect(() => {
        const timeout = window.setTimeout(() => void carregar(), 120);
        return () => window.clearTimeout(timeout);
    }, [carregar]);

    function ciclarFiltroGenero() {
        if (generos.length === 0) return;
        if (idGeneroFiltro === null) {
            setIdGeneroFiltro(generos[0].idGenero);
        } else {
            const idx = generos.findIndex((g) => g.idGenero === idGeneroFiltro);
            if (idx === -1 || idx + 1 >= generos.length) {
                setIdGeneroFiltro(null);
            } else {
                setIdGeneroFiltro(generos[idx + 1].idGenero);
            }
        }
        setPagina(1);
    }

    function alternarSelecao(idMusica: number) {
        setSelecionadasIds((atuais) =>
            atuais.includes(idMusica)
                ? atuais.filter((id) => id !== idMusica)
                : [...atuais, idMusica],
        );
    }

    function alternarTodas() {
        if (selecionadasIds.length === musicas.length) {
            setSelecionadasIds([]);
        } else {
            setSelecionadasIds(musicas.map((m) => m.idMusica));
        }
    }

    async function confirmarExclusao() {
        if (!musicaParaExcluir) return;
        setExcluindo(true);
        setErro("");
        setMensagem("");
        try {
            await musicaService.excluir(musicaParaExcluir.idMusica);
            setMusicaParaExcluir(null);
            setMensagem("Música excluída com sucesso.");
            await carregar();
        } catch (error) {
            setErro(getApiErrorMessage(error));
            setMusicaParaExcluir(null);
        } finally {
            setExcluindo(false);
        }
    }

    const generoAtual = generos.find((g) => g.idGenero === idGeneroFiltro) ?? null;
    const totalPaginas = Math.max(1, Math.ceil(total / tamanhoPagina));
    const inicioItem = total === 0 ? 0 : (pagina - 1) * tamanhoPagina + 1;
    const fimItem = Math.min(total, pagina * tamanhoPagina);
    const totalExibido = totalGeral || total;
    const estimativaComLetra = Math.max(1, Math.round(totalExibido * 0.6));

    return (
        <div
            className="om-app-shell"
            data-node-id="2:6687"
            data-name="Administração de músicas"
        >
            <Sidebar modo="admin" itemAtivo="admin-musicas" notaAcesso="admin" />

            <div className="om-main-area">
                <Header estiloConta="admin" />

                <main className="om-page-content om-admin-musicas">
                    <section className="om-admin-musicas__cabecalho" data-node-id="2:6725">
                        <div
                            className="om-admin-musicas__apresentacao"
                            data-node-id="2:6726"
                        >
                            <p className="om-admin-musicas__contexto" data-node-id="2:6727">
                                GESTÃO DE MÚSICAS
                            </p>
                            <h1 className="om-admin-musicas__titulo" data-node-id="2:6728">
                                Músicas
                            </h1>
                            <p className="om-admin-musicas__descricao" data-node-id="2:6729">
                                Gerencie as músicas do catálogo (Admin gerencia todas;
                                Usuário comum adiciona e exclui apenas as próprias).
                            </p>
                        </div>

                        <Botao
                            variante="primario"
                            icone={plusIcon}
                            texto="Nova música"
                            onClick={() => navigate("/musicas/nova")}
                            data-node-id="2:6730"
                        />
                    </section>

                    <section className="om-admin-musicas__kpis" data-node-id="2:6733">
                        <div className="om-admin-musicas__kpi-card" data-node-id="2:6734">
                            <div className="om-admin-musicas__kpi-info">
                                <span className="om-admin-musicas__kpi-valor">
                                    {totalExibido}
                                </span>
                                <span className="om-admin-musicas__kpi-rotulo">
                                    Músicas cadastradas
                                </span>
                            </div>
                            <span className="om-admin-musicas__kpi-icone">
                                <img src={discStat} alt="" />
                            </span>
                        </div>

                        <div className="om-admin-musicas__kpi-card" data-node-id="2:6739">
                            <div className="om-admin-musicas__kpi-info">
                                <span className="om-admin-musicas__kpi-valor">
                                    {generos.length}
                                </span>
                                <span className="om-admin-musicas__kpi-rotulo">
                                    Gêneros cadastrados
                                </span>
                            </div>
                            <span className="om-admin-musicas__kpi-icone">
                                <img src={globeStat} alt="" />
                            </span>
                        </div>

                        <div className="om-admin-musicas__kpi-card" data-node-id="2:6744">
                            <div className="om-admin-musicas__kpi-info">
                                <span className="om-admin-musicas__kpi-valor">
                                    {estimativaComLetra}
                                </span>
                                <span className="om-admin-musicas__kpi-rotulo">
                                    Músicas com letra
                                </span>
                            </div>
                            <span className="om-admin-musicas__kpi-icone">
                                <img src={filePenStat} alt="" />
                            </span>
                        </div>
                    </section>

                    {mensagem ? (
                        <p className="om-alert om-alert-success" role="status">
                            {mensagem}
                        </p>
                    ) : null}

                    {erro ? (
                        <p className="om-alert om-alert-error" role="alert">
                            {erro}
                        </p>
                    ) : null}

                    <section className="om-admin-musicas__gestao" data-node-id="2:6749">
                        <div className="om-admin-musicas__filtros" data-node-id="2:6750">
                            <div className="om-admin-musicas__busca" data-node-id="2:6751">
                                <span className="om-admin-musicas__busca-icone">
                                    <img src={searchIcon} alt="" />
                                </span>
                                <input
                                    type="search"
                                    value={busca}
                                    onChange={(e) => {
                                        setBusca(e.target.value);
                                        setPagina(1);
                                    }}
                                    placeholder="Pesquisar música por título (RF05)..."
                                    aria-label="Pesquisar música por título"
                                />
                            </div>

                            <button
                                type="button"
                                className="om-admin-musicas__filtro-genero"
                                onClick={ciclarFiltroGenero}
                                data-node-id="2:6754"
                            >
                                <img src={chevronDown} alt="" />
                                <span>
                                    {generoAtual ? generoAtual.nome : "Todos os gêneros"}
                                </span>
                            </button>
                        </div>

                        <div className="om-admin-musicas__tabela" data-node-id="2:6760">
                            <div
                                className="om-admin-musicas__tabela-cabecalho"
                                data-node-id="2:6761"
                            >
                                <div className="om-admin-musicas__col-check">
                                    <button
                                        type="button"
                                        className={`om-admin-musicas__checkbox ${musicas.length > 0 && selecionadasIds.length === musicas.length ? "om-admin-musicas__checkbox--marcado" : ""}`}
                                        onClick={alternarTodas}
                                        aria-label="Selecionar todas as músicas"
                                    />
                                </div>
                                <span className="om-admin-musicas__col-musica">
                                    MÚSICA E ARTISTA
                                </span>
                                <span className="om-admin-musicas__col-genero">GÊNERO</span>
                                <span className="om-admin-musicas__col-lancamento">
                                    LANÇAMENTO
                                </span>
                                <span className="om-admin-musicas__col-duracao">
                                    DURAÇÃO
                                </span>
                                <span className="om-admin-musicas__col-acoes">AÇÕES</span>
                            </div>

                            {carregando ? (
                                <div className="om-admin-musicas__vazio">
                                    Carregando músicas...
                                </div>
                            ) : musicas.length === 0 ? (
                                <div className="om-admin-musicas__vazio">
                                    Nenhuma música encontrada.
                                </div>
                            ) : (
                                musicas.map((musica, idx) => {
                                    const marcada = selecionadasIds.includes(musica.idMusica);
                                    const destacada = idx === 0 || marcada;
                                    const capa = obterCapaMusica(musica.imagemCapa, idx);

                                    return (
                                        <div
                                            key={musica.idMusica}
                                            className={`om-admin-musicas__linha ${destacada ? "om-admin-musicas__linha--destaque" : ""}`}
                                            data-name="Linha de música"
                                        >
                                            <div className="om-admin-musicas__col-check">
                                                <button
                                                    type="button"
                                                    className={`om-admin-musicas__checkbox ${marcada ? "om-admin-musicas__checkbox--marcado" : ""}`}
                                                    onClick={() =>
                                                        alternarSelecao(musica.idMusica)
                                                    }
                                                    aria-label={`Selecionar ${musica.titulo}`}
                                                />
                                            </div>

                                            <div className="om-admin-musicas__musica-info">
                                                <div className="om-admin-musicas__capa">
                                                    <img src={capa} alt={musica.titulo} />
                                                </div>
                                                <div className="om-admin-musicas__identificacao">
                                                    <span className="om-admin-musicas__nome">
                                                        {musica.titulo}
                                                    </span>
                                                    <span className="om-admin-musicas__sub">
                                                        {musica.artista} · Cadastrada no acervo
                                                    </span>
                                                </div>
                                            </div>

                                            <span className="om-admin-musicas__cel-genero">
                                                {musica.generos[0]?.nome || "Sem gênero"}
                                            </span>

                                            <span className="om-admin-musicas__cel-lancamento">
                                                {formatarDataBr(musica.dataLancamento)}
                                            </span>

                                            <span className="om-admin-musicas__cel-duracao">
                                                {formatarDuracao(musica.duracao, false)}
                                            </span>

                                            <div className="om-admin-musicas__acoes">
                                                <Link
                                                    to={`/musicas/${musica.idMusica}`}
                                                    className="om-admin-musicas__acao-btn"
                                                    aria-label={`Visualizar ${musica.titulo}`}
                                                >
                                                    <img src={eyeIcon} alt="" />
                                                </Link>
                                                <Link
                                                    to={`/musicas/editar/${musica.idMusica}`}
                                                    className="om-admin-musicas__acao-btn"
                                                    aria-label={`Editar ${musica.titulo}`}
                                                >
                                                    <img src={pencilIcon} alt="" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="om-admin-musicas__acao-btn"
                                                    aria-label={`Excluir ${musica.titulo}`}
                                                    onClick={() =>
                                                        setMusicaParaExcluir(musica)
                                                    }
                                                >
                                                    <img src={trashIcon} alt="" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}

                            <div
                                className="om-admin-musicas__rodape-tabela"
                                data-node-id="2:6878"
                            >
                                <span className="om-admin-musicas__contagem">
                                    {total === 0
                                        ? "0 músicas"
                                        : `${inicioItem}–${fimItem} de ${total} músicas`}
                                </span>

                                <div className="om-admin-musicas__paginacao">
                                    <button
                                        type="button"
                                        className="om-admin-musicas__pag-btn"
                                        onClick={() => setPagina((p) => Math.max(1, p - 1))}
                                        disabled={pagina <= 1}
                                    >
                                        Anterior
                                    </button>
                                    <span className="om-admin-musicas__pag-texto">
                                        Página {pagina} de {totalPaginas}
                                    </span>
                                    <button
                                        type="button"
                                        className="om-admin-musicas__pag-btn"
                                        onClick={() =>
                                            setPagina((p) => Math.min(totalPaginas, p + 1))
                                        }
                                        disabled={pagina >= totalPaginas}
                                    >
                                        Próxima
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="om-admin-musicas__legenda" data-node-id="2:6886">
                            <div className="om-admin-musicas__legenda-esq">
                                <img src={shieldCheckXs} alt="" />
                                <span>
                                    Admin exclui qualquer música; Usuário exclui apenas as
                                    próprias
                                </span>
                            </div>
                            <span>Ações: visualizar · editar · excluir</span>
                        </div>
                    </section>

                    <ModalConfirmacao
                        show={Boolean(musicaParaExcluir)}
                        titulo="Excluir esta música?"
                        mensagem="Esta ação removerá a música e seus vínculos em MusicaGenero (Admin exclui qualquer música; Usuário exclui apenas as próprias)."
                        itemTitulo={musicaParaExcluir?.titulo}
                        itemSubtitulo={
                            musicaParaExcluir
                                ? `${musicaParaExcluir.artista} · ${musicaParaExcluir.generos[0]?.nome || "Catálogo"} · ${formatarDuracao(musicaParaExcluir.duracao)}`
                                : ""
                        }
                        itemImagem={obterCapaMusica(
                            musicaParaExcluir?.imagemCapa,
                            musicaParaExcluir?.idMusica || 0,
                        )}
                        avisoPermanente="Esta ação é permanente e não pode ser desfeita."
                        textoConfirmar={excluindo ? "Excluindo..." : "Sim, excluir música"}
                        textoCancelar="Cancelar"
                        enviando={excluindo}
                        onClose={() => setMusicaParaExcluir(null)}
                        onConfirm={() => void confirmarExclusao()}
                    />
                </main>
            </div>
        </div>
    );
}

export default AdministracaoMusicas;
