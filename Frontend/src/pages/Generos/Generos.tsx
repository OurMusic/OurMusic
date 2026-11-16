import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/header/Header";
import Botao from "../../components/botao/Botao";
import { generoService, musicaService } from "../../services/ourMusicService";
import { getApiErrorMessage } from "../../services/api";
import type { Genero, MusicaResumo } from "../../types/api";
import { obterCapaMusica } from "../../utils/formatters";
import plusIcon from "../../assets/icons/plus.svg";
import discStat from "../../assets/icons/disc-stat.svg";
import globeStat from "../../assets/icons/globe-stat.svg";
import filePenStat from "../../assets/icons/file-pen-stat.svg";
import searchIcon from "../../assets/icons/search.svg";
import pencilIcon from "../../assets/icons/pencil.svg";
import "./Generos.css";

function Generos() {
    const navigate = useNavigate();
    const [generos, setGeneros] = useState<Genero[]>([]);
    const [musicas, setMusicas] = useState<MusicaResumo[]>([]);
    const [busca, setBusca] = useState("");
    const [selecionadosIds, setSelecionadosIds] = useState<number[]>([]);
    const [pagina, setPagina] = useState(1);
    const tamanhoPagina = 6;
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const carregar = useCallback(async () => {
        setCarregando(true);
        setErro("");
        try {
            const [listaGeneros, respostaMusicas] = await Promise.all([
                generoService.listar(),
                musicaService.listar({ pagina: 1, tamanhoPagina: 100 }),
            ]);
            setGeneros(listaGeneros);
            setMusicas(respostaMusicas.items);
        } catch (error) {
            setErro(getApiErrorMessage(error));
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        const timeout = window.setTimeout(() => void carregar(), 0);
        return () => window.clearTimeout(timeout);
    }, [carregar]);

    function alternarSelecao(idGenero: number) {
        setSelecionadosIds((atuais) =>
            atuais.includes(idGenero)
                ? atuais.filter((id) => id !== idGenero)
                : [...atuais, idGenero],
        );
    }

    const contagemPorGenero: Record<number, number> = {};
    musicas.forEach((m) => {
        m.generos.forEach((g) => {
            contagemPorGenero[g.idGenero] = (contagemPorGenero[g.idGenero] ?? 0) + 1;
        });
    });

    const generosFiltrados = generos.filter((g) =>
        g.nome.toLowerCase().includes(busca.trim().toLowerCase()),
    );

    const totalPaginas = Math.max(1, Math.ceil(generosFiltrados.length / tamanhoPagina));
    const paginaSegura = Math.min(pagina, totalPaginas);
    const inicioIdx = (paginaSegura - 1) * tamanhoPagina;
    const generosPaginados = generosFiltrados.slice(
        inicioIdx,
        inicioIdx + tamanhoPagina,
    );
    const inicioItem = generosFiltrados.length === 0 ? 0 : inicioIdx + 1;
    const fimItem = Math.min(generosFiltrados.length, inicioIdx + tamanhoPagina);

    const totalMusicasVinculadas = musicas.filter((m) => m.generos.length > 0).length;

    return (
        <div
            className="om-app-shell"
            data-node-id="13:4"
            data-name="Gerenciamento de gêneros"
        >
            <Sidebar modo="admin" itemAtivo="generos" />

            <div className="om-main-area">
                <Header estiloConta="admin" />

                <main className="om-page-content om-generos">
                    <section className="om-generos__cabecalho" data-node-id="13:49">
                        <div className="om-generos__apresentacao" data-node-id="13:50">
                            <p className="om-generos__contexto" data-node-id="13:51">
                                GESTÃO DE GÊNEROS
                            </p>
                            <h1 className="om-generos__titulo" data-node-id="13:52">
                                Gêneros musicais
                            </h1>
                            <p className="om-generos__descricao" data-node-id="13:53">
                                Cadastre novos gêneros e edite os nomes existentes
                                vinculados às músicas do catálogo.
                            </p>
                        </div>

                        <div className="om-generos__acoes-topo">
                            <Botao
                                type="button"
                                variante="primario"
                                icone={plusIcon}
                                texto="Novo gênero"
                                onClick={() => navigate("/generos/novo")}
                                data-node-id="13:54"
                            />
                        </div>
                    </section>

                    <section className="om-generos__kpis" data-node-id="13:58">
                        <div className="om-generos__kpi-card" data-node-id="13:59">
                            <div className="om-generos__kpi-info">
                                <span className="om-generos__kpi-valor">
                                    {generos.length}
                                </span>
                                <span className="om-generos__kpi-rotulo">
                                    Gêneros cadastrados
                                </span>
                            </div>
                            <span className="om-generos__kpi-icone">
                                <img src={discStat} alt="" />
                            </span>
                        </div>

                        <div className="om-generos__kpi-card" data-node-id="13:65">
                            <div className="om-generos__kpi-info">
                                <span className="om-generos__kpi-valor">
                                    {totalMusicasVinculadas}
                                </span>
                                <span className="om-generos__kpi-rotulo">
                                    Musicas Vinculadas a um Genero
                                </span>
                            </div>
                            <span className="om-generos__kpi-icone">
                                <img src={globeStat} alt="" />
                            </span>
                        </div>

                        <div className="om-generos__kpi-card" data-node-id="13:71">
                            <div className="om-generos__kpi-info">
                                <span className="om-generos__kpi-valor">100%</span>
                                <span className="om-generos__kpi-rotulo">Nomes únicos</span>
                            </div>
                            <span className="om-generos__kpi-icone">
                                <img src={filePenStat} alt="" />
                            </span>
                        </div>
                    </section>

                    {erro ? (
                        <p className="om-alert om-alert-error" role="alert">
                            {erro}
                        </p>
                    ) : null}

                    <section className="om-generos__gestao" data-node-id="13:77">
                        <div className="om-generos__pesquisa" data-node-id="13:78">
                            <div className="om-generos__busca" data-node-id="13:79">
                                <span className="om-generos__busca-icone">
                                    <img src={searchIcon} alt="" />
                                </span>
                                <input
                                    type="search"
                                    value={busca}
                                    onChange={(e) => {
                                        setBusca(e.target.value);
                                        setPagina(1);
                                    }}
                                    maxLength={50}
                                    placeholder="Digite o nome do gênero..."
                                    aria-label="Digite o nome do gênero"
                                />
                            </div>
                        </div>

                        <div className="om-generos__tabela" data-node-id="13:91">
                            <div
                                className="om-generos__tabela-cabecalho"
                                data-node-id="13:92"
                            >
                                <div className="om-generos__col-check">
                                    <span className="om-generos__checkbox" />
                                </div>
                                <span className="om-generos__col-nome">
                                    GÊNERO MUSICAL (TABELA GENERO)
                                </span>
                                <span className="om-generos__col-id">ID (IDGENERO)</span>
                                <span className="om-generos__col-musicas">
                                    MÚSICAS VINCULADAS
                                </span>
                                <span className="om-generos__col-unicidade">
                                    UNICIDADE (RN11)
                                </span>
                                <span className="om-generos__col-acoes">AÇÕES (RF11)</span>
                            </div>

                            {carregando ? (
                                <div className="om-generos__vazio">
                                    Carregando gêneros...
                                </div>
                            ) : generosPaginados.length === 0 ? (
                                <div className="om-generos__vazio">
                                    Nenhum gênero encontrado.
                                </div>
                            ) : (
                                generosPaginados.map((genero, idx) => {
                                    const marcado = selecionadosIds.includes(genero.idGenero);
                                    const ativo = idx === 0;
                                    const qtdMusicas =
                                        contagemPorGenero[genero.idGenero] ?? 0;

                                    let imagemSalva: string | null = null;
                                    let descSalva: string | null = null;
                                    try {
                                        imagemSalva = localStorage.getItem(
                                            `ourmusic_genero_img_${genero.idGenero}`,
                                        );
                                        descSalva = localStorage.getItem(
                                            `ourmusic_genero_desc_${genero.idGenero}`,
                                        );
                                    } catch {
                                        // Ignora leitura local
                                    }

                                    return (
                                        <div
                                            key={genero.idGenero}
                                            className={`om-generos__linha ${ativo ? "om-generos__linha--ativa" : ""}`}
                                            data-name="Linha de gênero"
                                        >
                                            <div className="om-generos__col-check">
                                                <button
                                                    type="button"
                                                    className={`om-generos__checkbox ${marcado ? "om-generos__checkbox--marcado" : ""}`}
                                                    onClick={() =>
                                                        alternarSelecao(genero.idGenero)
                                                    }
                                                    aria-label={`Selecionar ${genero.nome}`}
                                                />
                                            </div>

                                            <div className="om-generos__genero-info">
                                                <div className="om-generos__capa">
                                                    <img
                                                        src={
                                                            imagemSalva ||
                                                            obterCapaMusica(null, idx)
                                                        }
                                                        alt={genero.nome}
                                                    />
                                                </div>
                                                <div className="om-generos__identificacao">
                                                    <span className="om-generos__nome">
                                                        {genero.nome}
                                                    </span>
                                                    <span className="om-generos__sub">
                                                        {descSalva ||
                                                            (genero.idGenero <= 3
                                                                ? "Gênero inicial do banco OurMusicDB.sql"
                                                                : "Cadastrado pelo Administrador")}
                                                    </span>
                                                </div>
                                            </div>

                                            <span className="om-generos__cel-id">
                                                #{String(genero.idGenero).padStart(2, "0")}
                                            </span>

                                            <span className="om-generos__cel-musicas">
                                                {qtdMusicas}{" "}
                                                {qtdMusicas === 1 ? "música" : "músicas"}
                                            </span>

                                            <span className="om-generos__cel-unicidade">
                                                Nome único validado
                                            </span>

                                            <div className="om-generos__acoes">
                                                <button
                                                    type="button"
                                                    className="om-generos__acao-btn"
                                                    aria-label={`Editar ${genero.nome}`}
                                                    onClick={() =>
                                                        navigate(
                                                            `/generos/editar/${genero.idGenero}`,
                                                        )
                                                    }
                                                >
                                                    <img src={pencilIcon} alt="" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}

                            <div className="om-generos__rodape-tabela" data-node-id="13:227">
                                <span className="om-generos__contagem">
                                    Mostrando {inicioItem}–{fimItem} de{" "}
                                    {generosFiltrados.length} gêneros
                                </span>

                                <div className="om-generos__paginacao">
                                    <button
                                        type="button"
                                        className="om-generos__pag-btn"
                                        onClick={() => setPagina((p) => Math.max(1, p - 1))}
                                        disabled={paginaSegura <= 1}
                                    >
                                        Anterior
                                    </button>
                                    <span className="om-generos__pag-texto">
                                        Página {paginaSegura} de {totalPaginas}
                                    </span>
                                    <button
                                        type="button"
                                        className="om-generos__pag-btn"
                                        onClick={() =>
                                            setPagina((p) => Math.min(totalPaginas, p + 1))
                                        }
                                        disabled={paginaSegura >= totalPaginas}
                                    >
                                        Próxima
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default Generos;
