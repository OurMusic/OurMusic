import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/header/Header";
import Campo from "../../components/campo/Campo";
import Botao from "../../components/botao/Botao";
import ModalConfirmacao from "../../components/modalConfirmacao/ModalConfirmacao";
import { perfilEhAdministrador, useAuth } from "../../context/auth";
import { generoService, musicaService } from "../../services/ourMusicService";
import { getApiErrorMessage } from "../../services/api";
import type { Genero, Musica } from "../../types/api";
import { formatarDuracao, obterCapaMusica } from "../../utils/formatters";
import arrowLeft from "../../assets/icons/arrow-left.svg";
import uploadIcon from "../../assets/icons/upload.svg";
import chevronDown from "../../assets/icons/chevron-down.svg";
import trashBtnIcon from "../../assets/icons/trash-2-btn.svg";
import checkBtnIcon from "../../assets/icons/check-btn.svg";
import "./CadastroMusica.css";

interface FormularioMusicaState {
    titulo: string;
    artista: string;
    imagemCapa: string;
    urlMusica: string;
    dataLancamento: string;
    duracao: string;
    comentario: string;
    letra: string;
    idGeneros: number[];
    arquivoImagem: File | null;
}

const INICIAL: FormularioMusicaState = {
    titulo: "",
    artista: "",
    imagemCapa: "",
    urlMusica: "",
    dataLancamento: new Date().toISOString().slice(0, 10),
    duracao: "228",
    comentario: "",
    letra: "",
    idGeneros: [],
    arquivoImagem: null,
};

function CadastroMusica() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { perfil } = useAuth();
    const ehAdmin = perfilEhAdministrador(perfil);
    const emEdicao = Boolean(id);

    const arquivoInputRef = useRef<HTMLInputElement>(null);
    const [formulario, setFormulario] = useState<FormularioMusicaState>(INICIAL);
    const [generos, setGeneros] = useState<Genero[]>([]);
    const [musicaOriginal, setMusicaOriginal] = useState<Musica | null>(null);
    const [previewArquivo, setPreviewArquivo] = useState<string | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [progresso, setProgresso] = useState(0);
    const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState("");

    const carregar = useCallback(async () => {
        setCarregando(true);
        setErro("");
        try {
            const listaGeneros = await generoService.listar();
            setGeneros(listaGeneros);

            if (id) {
                const detalhe = await musicaService.buscar(id);
                setMusicaOriginal(detalhe);
                setFormulario({
                    titulo: detalhe.titulo,
                    artista: detalhe.artista,
                    imagemCapa: detalhe.imagemCapa || "",
                    urlMusica: detalhe.urlMusica || "",
                    dataLancamento: detalhe.dataLancamento.slice(0, 10),
                    duracao: String(detalhe.duracao),
                    comentario: detalhe.comentario || "",
                    letra: detalhe.letra || "",
                    idGeneros:
                        detalhe.generos.length > 0
                            ? detalhe.generos.map((g) => g.idGenero)
                            : listaGeneros[0]
                              ? [listaGeneros[0].idGenero]
                              : [],
                    arquivoImagem: null,
                });
            } else if (listaGeneros[0]) {
                setFormulario((atual) => ({
                    ...atual,
                    idGeneros:
                        atual.idGeneros.length > 0
                            ? atual.idGeneros
                            : [listaGeneros[0].idGenero],
                }));
            }
        } catch (error) {
            setErro(getApiErrorMessage(error));
        } finally {
            setCarregando(false);
        }
    }, [id]);

    useEffect(() => {
        const timeout = window.setTimeout(() => void carregar(), 0);
        return () => window.clearTimeout(timeout);
    }, [carregar]);

    function atualizarCampo(
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) {
        const { name, value } = event.target;
        setFormulario((atual) => ({ ...atual, [name]: value }));
    }

    function selecionarArquivo(event: ChangeEvent<HTMLInputElement>) {
        const arquivo = event.target.files?.[0] || null;
        setFormulario((atual) => ({ ...atual, arquivoImagem: arquivo }));
        if (arquivo) {
            setPreviewArquivo(URL.createObjectURL(arquivo));
        } else {
            setPreviewArquivo(null);
        }
    }

    function alternarGenero(idGenero: number) {
        setFormulario((atual) => {
            const existe = atual.idGeneros.includes(idGenero);
            if (existe && atual.idGeneros.length > 1) {
                return {
                    ...atual,
                    idGeneros: atual.idGeneros.filter((item) => item !== idGenero),
                };
            }
            if (!existe) {
                return {
                    ...atual,
                    idGeneros: [...atual.idGeneros, idGenero],
                };
            }
            return atual;
        });
    }

    async function salvar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErro("");
        setMensagem("");

        const duracaoNum = Number(formulario.duracao);
        if (!Number.isFinite(duracaoNum) || duracaoNum <= 0) {
            setErro("A duração da música deve ser maior que zero (RN07).");
            return;
        }

        if (formulario.idGeneros.length === 0) {
            setErro("Cada música deve estar associada a pelo menos um gênero (RN05).");
            return;
        }

        setEnviando(true);
        setProgresso(0);

        try {
            const payload = {
                titulo: formulario.titulo.trim(),
                artista: formulario.artista.trim(),
                dataLancamento: formulario.dataLancamento,
                duracao: duracaoNum,
                comentario: formulario.comentario.trim() || null,
                urlMusica: formulario.urlMusica.trim() || null,
                letra: formulario.letra || null,
                arquivoImagem: formulario.arquivoImagem,
                imagemCapa: formulario.arquivoImagem
                    ? null
                    : formulario.imagemCapa.trim() || null,
                idGeneros: formulario.idGeneros,
            };

            if (emEdicao && id) {
                await musicaService.atualizar(id, payload, setProgresso);
                setMensagem("Música atualizada com sucesso.");
            } else {
                const criada = await musicaService.cadastrar(payload, setProgresso);
                setMensagem("Música cadastrada com sucesso.");
                navigate(`/musicas/${criada.idMusica}`);
            }
        } catch (error) {
            setErro(getApiErrorMessage(error));
        } finally {
            setEnviando(false);
            setProgresso(0);
        }
    }

    async function confirmarExclusao() {
        if (!id) return;
        setEnviando(true);
        setErro("");
        try {
            await musicaService.excluir(id);
            setConfirmandoExclusao(false);
            navigate(ehAdmin ? "/admin/musicas" : "/catalogo", { replace: true });
        } catch (error) {
            setErro(getApiErrorMessage(error));
            setConfirmandoExclusao(false);
        } finally {
            setEnviando(false);
        }
    }

    const capaPreview =
        previewArquivo || obterCapaMusica(formulario.imagemCapa, Number(id) || 0);
    const duracaoNum = Number(formulario.duracao) || 228;

    return (
        <div
            className="om-app-shell"
            data-node-id={emEdicao ? "2:6892" : "15:656"}
            data-name="Cadastro e edição de música"
        >
            <Sidebar
                itemAtivo={emEdicao ? "admin-musicas" : "cadastrar-musica"}
            />

            <div className="om-main-area">
                <Header />

                <main className="om-page-content om-cadastro-musica">
                    <Link
                        to={ehAdmin ? "/admin/musicas" : "/catalogo"}
                        className="om-cadastro-musica__voltar"
                        aria-label="Retornar à lista"
                        data-node-id={emEdicao ? "2:6930" : "15:709"}
                    >
                        <img src={arrowLeft} alt="" />
                        {!emEdicao ? (
                            <span data-node-id="15:712">Cadastrar Musica</span>
                        ) : null}
                    </Link>

                    <section
                        className="om-cadastro-musica__cabecalho"
                        data-node-id={emEdicao ? "2:6933" : "15:713"}
                    >
                        <div className="om-cadastro-musica__apresentacao">
                            <h1
                                className="om-cadastro-musica__titulo"
                                data-node-id={emEdicao ? "2:6935" : "15:715"}
                            >
                                {emEdicao ? "Editar música" : "Cadastrar música"}
                            </h1>
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

                    <form
                        className="om-cadastro-musica__form-wrapper"
                        onSubmit={salvar}
                        data-node-id={emEdicao ? "2:6940" : "15:721"}
                    >
                        <div className="om-cadastro-musica__colunas">
                            <aside
                                className="om-cadastro-musica__col-capa"
                                data-node-id={emEdicao ? "2:6941" : "15:722"}
                            >
                                <div
                                    className="om-cadastro-musica__card-capa"
                                    data-node-id={emEdicao ? "2:6942" : "15:723"}
                                >
                                    <h2 className="om-cadastro-musica__card-capa-titulo">
                                        Capa da música
                                    </h2>

                                    <div className="om-cadastro-musica__preview">
                                        <img src={capaPreview} alt="Capa do álbum" />
                                    </div>

                                    <button
                                        type="button"
                                        className="om-cadastro-musica__btn-upload"
                                        onClick={() => arquivoInputRef.current?.click()}
                                        data-node-id={emEdicao ? "2:6945" : "15:726"}
                                    >
                                        <img src={uploadIcon} alt="" />
                                        <span>
                                            {formulario.arquivoImagem
                                                ? formulario.arquivoImagem.name
                                                : "Enviar capa"}
                                        </span>
                                    </button>

                                    <input
                                        ref={arquivoInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="visually-hidden"
                                        onChange={selecionarArquivo}
                                    />

                                    {!emEdicao ? (
                                        <p
                                            className="om-cadastro-musica__capa-ajuda"
                                            data-node-id="15:730"
                                        >
                                            Campo ImagemCapa (VARCHAR MAX). Opcional.
                                        </p>
                                    ) : null}
                                </div>
                            </aside>

                            <div
                                className="om-cadastro-musica__col-dados"
                                data-node-id={emEdicao ? "2:6956" : "15:738"}
                            >
                                <section
                                    className="om-cadastro-musica__card-dados"
                                    data-node-id={emEdicao ? "2:6957" : "15:739"}
                                >
                                    <div className="om-cadastro-musica__grupo-topo">
                                        <h2>Dados da tabela Musica</h2>
                                        <span>* Campos obrigatórios</span>
                                    </div>

                                    <div className="om-cadastro-musica__campo">
                                        <label htmlFor="musica-titulo">
                                            Título da música (Titulo) *
                                        </label>
                                        <Campo
                                            id="musica-titulo"
                                            name="titulo"
                                            value={formulario.titulo}
                                            onChange={atualizarCampo}
                                            placeholder="Deixa o mar levar"
                                            maxLength={100}
                                            required
                                        />
                                    </div>

                                    {emEdicao ? (
                                        <div
                                            className="om-cadastro-musica__linha-dupla"
                                            data-node-id="2:6965"
                                        >
                                            <div className="om-cadastro-musica__campo">
                                                <label htmlFor="musica-artista">
                                                    Artista (Artista) *
                                                </label>
                                                <Campo
                                                    id="musica-artista"
                                                    name="artista"
                                                    value={formulario.artista}
                                                    onChange={atualizarCampo}
                                                    placeholder="Lia Luz"
                                                    maxLength={60}
                                                    required
                                                />
                                            </div>

                                            <div className="om-cadastro-musica__campo">
                                                <label htmlFor="musica-url-capa">
                                                    URL da Capa (ImagemCapa)
                                                </label>
                                                <Campo
                                                    id="musica-url-capa"
                                                    name="imagemCapa"
                                                    value={formulario.imagemCapa}
                                                    onChange={atualizarCampo}
                                                    placeholder="https://cdn.ourmusic.com/capas/cidade-submersa.jpg"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="om-cadastro-musica__bloco-artista-duracao"
                                            data-node-id="15:747"
                                        >
                                            <div
                                                className="om-cadastro-musica__campo"
                                                data-node-id="15:748"
                                            >
                                                <label htmlFor="musica-artista">
                                                    Artista (Artista) *
                                                </label>
                                                <Campo
                                                    id="musica-artista"
                                                    name="artista"
                                                    value={formulario.artista}
                                                    onChange={atualizarCampo}
                                                    placeholder="Lia Luz"
                                                    maxLength={60}
                                                    required
                                                />
                                            </div>

                                            <div
                                                className="om-cadastro-musica__campo"
                                                data-node-id="24:1194"
                                            >
                                                <label htmlFor="musica-duracao">
                                                    Duração (seg) *
                                                </label>
                                                <Campo
                                                    id="musica-duracao"
                                                    name="duracao"
                                                    type="number"
                                                    min={1}
                                                    value={formulario.duracao}
                                                    onChange={atualizarCampo}
                                                    placeholder="228 (03:48)"
                                                    required
                                                />
                                                <span
                                                    className="om-cadastro-musica__ajuda"
                                                    data-node-id="24:1198"
                                                >
                                                    Deve ser maior que zero
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div
                                        className={
                                            emEdicao
                                                ? "om-cadastro-musica__linha-tripla"
                                                : "om-cadastro-musica__linha-dupla"
                                        }
                                        data-node-id={emEdicao ? "2:6974" : "15:756"}
                                    >
                                        <div className="om-cadastro-musica__campo">
                                            <label htmlFor="musica-genero">Gênero(s) *</label>
                                            <div className="om-cadastro-musica__select-wrapper">
                                                <select
                                                    id="musica-genero"
                                                    className="campo om-cadastro-musica__select"
                                                    value={formulario.idGeneros[0] ?? ""}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        if (val) {
                                                            setFormulario((atual) => ({
                                                                ...atual,
                                                                idGeneros: Array.from(
                                                                    new Set([
                                                                        val,
                                                                        ...atual.idGeneros.slice(
                                                                            1,
                                                                        ),
                                                                    ]),
                                                                ),
                                                            }));
                                                        }
                                                    }}
                                                    required
                                                >
                                                    {generos.map((g) => (
                                                        <option
                                                            key={g.idGenero}
                                                            value={g.idGenero}
                                                        >
                                                            {g.nome}
                                                        </option>
                                                    ))}
                                                </select>
                                                <span className="om-cadastro-musica__select-icone">
                                                    <img src={chevronDown} alt="" />
                                                </span>
                                            </div>
                                            {generos.length > 1 ? (
                                                <div className="om-cadastro-musica__chips-generos">
                                                    {generos.map((g) => {
                                                        const ativo =
                                                            formulario.idGeneros.includes(
                                                                g.idGenero,
                                                            );
                                                        return (
                                                            <button
                                                                key={g.idGenero}
                                                                type="button"
                                                                className={`om-cadastro-musica__chip ${ativo ? "om-cadastro-musica__chip--ativo" : ""}`}
                                                                onClick={() =>
                                                                    alternarGenero(g.idGenero)
                                                                }
                                                            >
                                                                {g.nome}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="om-cadastro-musica__campo">
                                            <label htmlFor="musica-data">
                                                Data de lançamento *
                                            </label>
                                            <Campo
                                                id="musica-data"
                                                name="dataLancamento"
                                                type="date"
                                                value={formulario.dataLancamento}
                                                onChange={atualizarCampo}
                                                min="1888-01-01"
                                                max={`${new Date().getFullYear()}-12-31`}
                                                required
                                            />
                                        </div>

                                        {emEdicao ? (
                                            <div
                                                className="om-cadastro-musica__campo"
                                                data-node-id="2:6984"
                                            >
                                                <label htmlFor="musica-duracao">
                                                    Duração (seg) *
                                                </label>
                                                <Campo
                                                    id="musica-duracao"
                                                    name="duracao"
                                                    type="number"
                                                    min={1}
                                                    value={formulario.duracao}
                                                    onChange={atualizarCampo}
                                                    placeholder="228"
                                                    required
                                                />
                                                <span
                                                    className="om-cadastro-musica__ajuda"
                                                    data-node-id="2:6988"
                                                >
                                                    Deve ser maior que zero
                                                </span>
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="om-cadastro-musica__campo">
                                        <label htmlFor="musica-url-audio">
                                            Link da música no YouTube (UrlMusica)
                                        </label>
                                        <Campo
                                            id="musica-url-audio"
                                            name="urlMusica"
                                            type="url"
                                            value={formulario.urlMusica}
                                            onChange={atualizarCampo}
                                            placeholder="https://www.youtube.com/watch?v=..."
                                            maxLength={500}
                                        />
                                        <span className="om-cadastro-musica__ajuda">
                                            Opcional. Permite reproduzir a música diretamente pelo player do OurMusic.
                                        </span>
                                    </div>

                                    <div className="om-cadastro-musica__campo">
                                        <label htmlFor="musica-comentario">
                                            Comentário (Comentario — até 255 caracteres)
                                        </label>
                                        <textarea
                                            id="musica-comentario"
                                            name="comentario"
                                            className="om-cadastro-musica__textarea om-cadastro-musica__textarea--curto"
                                            value={formulario.comentario}
                                            onChange={atualizarCampo}
                                            maxLength={255}
                                            placeholder="Faixa com sintetizadores analógicos e atmosfera noturna cadastrada no acervo OurMusic."
                                        />
                                        {!emEdicao ? (
                                            <span
                                                className="om-cadastro-musica__ajuda"
                                                data-node-id="15:776"
                                            >
                                                Campo opcional Comentario VARCHAR(255) da tabela
                                                Musica.
                                            </span>
                                        ) : null}
                                    </div>
                                </section>

                                <section
                                    className="om-cadastro-musica__card-dados"
                                    data-node-id={emEdicao ? "2:6994" : "15:777"}
                                >
                                    <h2 className="om-cadastro-musica__subcard-titulo">
                                        {emEdicao ? "Letra da música (Letra)" : "Letra da música"}
                                    </h2>

                                    <div className="om-cadastro-musica__campo">
                                        <label htmlFor="musica-letra">
                                            {emEdicao
                                                ? "Letra completa da música (Letra — VARCHAR MAX)"
                                                : "Letra completa da música"}
                                        </label>
                                        <textarea
                                            id="musica-letra"
                                            name="letra"
                                            className="om-cadastro-musica__textarea om-cadastro-musica__textarea--letra"
                                            value={formulario.letra}
                                            onChange={atualizarCampo}
                                            placeholder="Letra indisponível (deixe em branco caso a música não possua letra)"
                                        />
                                    </div>
                                </section>
                            </div>
                        </div>

                        <div
                            className={`om-cadastro-musica__acoes-rodape ${!emEdicao ? "om-cadastro-musica__acoes-rodape--somente-direita" : ""}`}
                            data-node-id={emEdicao ? "2:7015" : "15:800"}
                        >
                            {emEdicao ? (
                                <Botao
                                    type="button"
                                    variante="perigo"
                                    icone={trashBtnIcon}
                                    texto="Excluir música"
                                    onClick={() => setConfirmandoExclusao(true)}
                                    disabled={enviando || carregando}
                                    data-node-id="2:7016"
                                />
                            ) : null}

                            <div className="om-cadastro-musica__acoes-direita">
                                <Botao
                                    type="button"
                                    variante="secundario"
                                    texto="Cancelar"
                                    onClick={() =>
                                        navigate(ehAdmin ? "/admin/musicas" : "/catalogo")
                                    }
                                    disabled={enviando}
                                />
                                <Botao
                                    type="submit"
                                    variante="primario"
                                    icone={checkBtnIcon}
                                    texto={
                                        enviando
                                            ? progresso > 0
                                                ? `Enviando ${progresso}%`
                                                : "Salvando..."
                                            : "Salvar alterações"
                                    }
                                    disabled={enviando || carregando}
                                />
                            </div>
                        </div>

                        {emEdicao ? (
                            <p
                                className="om-cadastro-musica__nota-rodape"
                                data-node-id="2:7025"
                            >
                                {
                                    "RN05 a RN08: Título, Artista, Data de lançamento (1888 até o ano atual) e Duração (> 0) são obrigatórios."
                                }
                            </p>
                        ) : null}
                    </form>

                    <ModalConfirmacao
                        show={confirmandoExclusao}
                        titulo="Excluir esta música?"
                        mensagem="Esta ação removerá a música e seus vínculos em MusicaGenero (Admin exclui qualquer música; Usuário exclui apenas as próprias)."
                        itemTitulo={musicaOriginal?.titulo || formulario.titulo}
                        itemSubtitulo={`${musicaOriginal?.artista || formulario.artista} · ${formatarDuracao(duracaoNum)}`}
                        itemImagem={capaPreview}
                        avisoPermanente="Esta ação é permanente e não pode ser desfeita."
                        textoConfirmar={enviando ? "Excluindo..." : "Sim, excluir música"}
                        textoCancelar="Cancelar"
                        enviando={enviando}
                        onClose={() => setConfirmandoExclusao(false)}
                        onConfirm={() => void confirmarExclusao()}
                    />
                </main>
            </div>
        </div>
    );
}

export default CadastroMusica;
