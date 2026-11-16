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
import { generoService } from "../../services/ourMusicService";
import { getApiErrorMessage } from "../../services/api";
import { obterCapaMusica } from "../../utils/formatters";
import arrowLeft from "../../assets/icons/arrow-left.svg";
import uploadIcon from "../../assets/icons/upload.svg";
import checkBtnIcon from "../../assets/icons/check-btn.svg";
import "./CadastroGenero.css";

function CadastroGenero() {
    const { id } = useParams();
    const navigate = useNavigate();
    const emEdicao = Boolean(id);
    const arquivoInputRef = useRef<HTMLInputElement>(null);

    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [previewImagem, setPreviewImagem] = useState<string | null>(null);
    const [carregando, setCarregando] = useState(Boolean(id));
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState("");

    const carregar = useCallback(async () => {
        if (!id) return;
        setCarregando(true);
        setErro("");
        try {
            const genero = await generoService.buscar(id);
            setNome(genero.nome);
            try {
                const descSalva = localStorage.getItem(
                    `ourmusic_genero_desc_${genero.idGenero}`,
                );
                const imgSalva = localStorage.getItem(
                    `ourmusic_genero_img_${genero.idGenero}`,
                );
                if (descSalva) setDescricao(descSalva);
                if (imgSalva) setPreviewImagem(imgSalva);
            } catch {
                // Ignora leitura local
            }
        } catch (error) {
            setErro(getApiErrorMessage(error));
        } finally {
            setCarregando(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            const timeout = window.setTimeout(() => void carregar(), 0);
            return () => window.clearTimeout(timeout);
        }
    }, [id, carregar]);

    function selecionarImagem(event: ChangeEvent<HTMLInputElement>) {
        const arquivo = event.target.files?.[0];
        if (!arquivo) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setPreviewImagem(reader.result);
            }
        };
        reader.readAsDataURL(arquivo);
    }

    async function salvar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const nomeLimpo = nome.trim();
        if (!nomeLimpo) {
            setErro("Informe o nome do gênero.");
            return;
        }

        setEnviando(true);
        setErro("");

        try {
            if (emEdicao && id) {
                await generoService.atualizar(id, { nome: nomeLimpo });
                try {
                    if (descricao.trim()) {
                        localStorage.setItem(`ourmusic_genero_desc_${id}`, descricao.trim());
                    }
                    if (previewImagem) {
                        localStorage.setItem(`ourmusic_genero_img_${id}`, previewImagem);
                    }
                } catch {
                    // Ignora armazenamento local
                }
            } else {
                const criado = await generoService.cadastrar({ nome: nomeLimpo });
                try {
                    if (descricao.trim()) {
                        localStorage.setItem(
                            `ourmusic_genero_desc_${criado.idGenero}`,
                            descricao.trim(),
                        );
                    }
                    if (previewImagem) {
                        localStorage.setItem(
                            `ourmusic_genero_img_${criado.idGenero}`,
                            previewImagem,
                        );
                    }
                } catch {
                    // Ignora armazenamento local
                }
            }
            navigate("/generos");
        } catch (error) {
            setErro(getApiErrorMessage(error));
        } finally {
            setEnviando(false);
        }
    }

    const capaExibida = previewImagem || obterCapaMusica(null, Number(id) || 2);

    return (
        <div
            className="om-app-shell"
            data-node-id={emEdicao ? "21:442" : "21:269"}
            data-name={emEdicao ? "Edição de genero" : "Cadastro de genero"}
        >
            <Sidebar modo="admin" itemAtivo="generos" />

            <div className="om-main-area">
                <Header estiloConta="admin" />

                <main className="om-page-content om-cadastro-genero">
                    <Link
                        to="/generos"
                        className="om-cadastro-genero__voltar"
                        data-node-id={emEdicao ? "21:487" : "21:314"}
                    >
                        <img src={arrowLeft} alt="" />
                        <span data-node-id={emEdicao ? "21:490" : "21:317"}>
                            Voltar para lista de generos
                        </span>
                    </Link>

                    <section
                        className="om-cadastro-genero__cabecalho"
                        data-node-id={emEdicao ? "21:491" : "21:318"}
                    >
                        <h1
                            className="om-cadastro-genero__titulo"
                            data-node-id={emEdicao ? "21:493" : "21:320"}
                        >
                            {emEdicao ? "Edição de Genero" : "Cadastro de Genero"}
                        </h1>
                    </section>

                    {erro ? (
                        <p className="om-alert om-alert-error" role="alert">
                            {erro}
                        </p>
                    ) : null}

                    <form
                        className="om-cadastro-genero__form-wrapper"
                        onSubmit={salvar}
                        data-node-id={emEdicao ? "21:494" : "21:321"}
                    >
                        <div className="om-cadastro-genero__colunas">
                            <aside
                                className="om-cadastro-genero__col-capa"
                                data-node-id={emEdicao ? "21:495" : "21:322"}
                            >
                                <div
                                    className="om-cadastro-genero__card-capa"
                                    data-node-id={emEdicao ? "21:496" : "21:323"}
                                >
                                    <h2
                                        className="om-cadastro-genero__card-capa-titulo"
                                        data-node-id={emEdicao ? "21:497" : "21:324"}
                                    >
                                        Imagem de Capa
                                    </h2>

                                    <div
                                        className="om-cadastro-genero__preview"
                                        data-node-id={emEdicao ? "21:498" : "21:325"}
                                    >
                                        <img src={capaExibida} alt="Capa do gênero" />
                                    </div>

                                    <button
                                        type="button"
                                        className="om-cadastro-genero__btn-upload"
                                        onClick={() => arquivoInputRef.current?.click()}
                                        aria-label="Enviar imagem de capa do gênero"
                                        data-node-id={emEdicao ? "21:499" : "21:326"}
                                    >
                                        <img src={uploadIcon} alt="" />
                                    </button>

                                    <input
                                        ref={arquivoInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="visually-hidden"
                                        onChange={selecionarImagem}
                                    />
                                </div>
                            </aside>

                            <div
                                className="om-cadastro-genero__col-dados"
                                data-node-id={emEdicao ? "21:503" : "21:331"}
                            >
                                <section
                                    className="om-cadastro-genero__card-dados"
                                    data-node-id={emEdicao ? "21:504" : "21:332"}
                                >
                                    <div
                                        className="om-cadastro-genero__grupo-topo"
                                        data-node-id={emEdicao ? "21:505" : "21:333"}
                                    >
                                        <h2 data-node-id={emEdicao ? "21:506" : "21:334"}>
                                            Dados do Genero
                                        </h2>
                                        <span data-node-id={emEdicao ? "21:507" : "21:335"}>
                                            * Campos obrigatórios
                                        </span>
                                    </div>

                                    <div
                                        className="om-cadastro-genero__campo"
                                        data-node-id={emEdicao ? "21:508" : "21:336"}
                                    >
                                        <label
                                            htmlFor="genero-nome"
                                            data-node-id={emEdicao ? "21:509" : "21:337"}
                                        >
                                            Nome *
                                        </label>
                                        <Campo
                                            id="genero-nome"
                                            name="nome"
                                            value={nome}
                                            onChange={(e) => setNome(e.target.value)}
                                            placeholder="Maid Core"
                                            maxLength={50}
                                            required
                                        />
                                    </div>

                                    <div
                                        className="om-cadastro-genero__campo"
                                        data-node-id={emEdicao ? "21:512" : "21:365"}
                                    >
                                        <label
                                            htmlFor="genero-descricao"
                                            data-node-id={emEdicao ? "21:513" : "21:366"}
                                        >
                                            Descrição do Genero *
                                        </label>
                                        <textarea
                                            id="genero-descricao"
                                            className="om-cadastro-genero__textarea"
                                            value={descricao}
                                            onChange={(e) => setDescricao(e.target.value)}
                                            placeholder="Descreva as características musicais deste gênero..."
                                            data-node-id={emEdicao ? "21:514" : "21:367"}
                                        />
                                    </div>
                                </section>
                            </div>
                        </div>

                        <div
                            className="om-cadastro-genero__acoes-rodape"
                            data-node-id={emEdicao ? "21:538" : "21:393"}
                        >
                            <div
                                className="om-cadastro-genero__acoes-direita"
                                data-node-id={emEdicao ? "21:543" : "21:398"}
                            >
                                <Botao
                                    type="button"
                                    variante="secundario"
                                    texto="Cancelar"
                                    onClick={() => navigate("/generos")}
                                    disabled={enviando}
                                    data-node-id={emEdicao ? "21:544" : "21:399"}
                                />
                                <Botao
                                    type="submit"
                                    variante="primario"
                                    icone={checkBtnIcon}
                                    texto={enviando ? "Salvando..." : "Salvar Genero"}
                                    disabled={enviando || carregando}
                                    data-node-id={emEdicao ? "21:546" : "21:401"}
                                />
                            </div>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
}

export default CadastroGenero;
