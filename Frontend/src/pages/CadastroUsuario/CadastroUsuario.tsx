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
import { usuarioService } from "../../services/ourMusicService";
import { getApiErrorMessage } from "../../services/api";
import type { TipoUsuario, Usuario } from "../../types/api";
import arrowLeft from "../../assets/icons/arrow-left.svg";
import uploadIcon from "../../assets/icons/upload.svg";
import chevronDown from "../../assets/icons/chevron-down.svg";
import trashBtnIcon from "../../assets/icons/trash-2-btn.svg";
import checkBtnIcon from "../../assets/icons/check-btn.svg";
import capaPadrao from "../../assets/capa-1.png";
import "./CadastroUsuario.css";

interface FormularioUsuarioState {
    nome: string;
    email: string;
    senha: string;
    tipoUsuario: TipoUsuario;
    ativo: boolean;
}

const INICIAL: FormularioUsuarioState = {
    nome: "",
    email: "",
    senha: "",
    tipoUsuario: "Usuario",
    ativo: true,
};

function CadastroUsuario() {
    const { id } = useParams();
    const navigate = useNavigate();
    const emEdicao = Boolean(id);
    const arquivoInputRef = useRef<HTMLInputElement>(null);

    const [formulario, setFormulario] = useState<FormularioUsuarioState>(INICIAL);
    const [usuarioOriginal, setUsuarioOriginal] = useState<Usuario | null>(null);
    const [previewImagem, setPreviewImagem] = useState<string | null>(null);
    const [carregando, setCarregando] = useState(Boolean(id));
    const [enviando, setEnviando] = useState(false);
    const [confirmandoDesativacao, setConfirmandoDesativacao] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState("");

    const carregar = useCallback(async () => {
        if (!id) return;
        setCarregando(true);
        setErro("");
        try {
            const usuario = await usuarioService.buscar(id);
            setUsuarioOriginal(usuario);
            setFormulario({
                nome: usuario.nome,
                email: usuario.email,
                senha: "",
                tipoUsuario: usuario.tipoUsuario,
                ativo: usuario.ativo,
            });
            try {
                const imgSalva = localStorage.getItem(
                    `ourmusic_usuario_img_${usuario.idUsuario}`,
                );
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

    function atualizarCampo(
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) {
        const { name, value } = event.target;
        if (name === "ativo") {
            setFormulario((atual) => ({ ...atual, ativo: value === "true" }));
            return;
        }
        setFormulario((atual) => ({ ...atual, [name]: value }));
    }

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
        setErro("");
        setMensagem("");

        if (!emEdicao && formulario.senha.length < 8) {
            setErro("A senha deve ter no mínimo 8 caracteres.");
            return;
        }

        if (emEdicao && formulario.senha && formulario.senha.length < 8) {
            setErro("Se informada, a nova senha deve ter no mínimo 8 caracteres.");
            return;
        }

        setEnviando(true);

        try {
            if (emEdicao && id) {
                await usuarioService.atualizar(id, {
                    nome: formulario.nome.trim(),
                    email: formulario.email.trim(),
                    senha: formulario.senha.trim() ? formulario.senha : undefined,
                    tipoUsuario: formulario.tipoUsuario,
                    ativo: formulario.ativo,
                });
                if (previewImagem) {
                    try {
                        localStorage.setItem(`ourmusic_usuario_img_${id}`, previewImagem);
                    } catch {
                        // Ignora armazenamento local
                    }
                }
                setMensagem("Usuário atualizado com sucesso.");
                setFormulario((atual) => ({ ...atual, senha: "" }));
            } else {
                const criado = await usuarioService.cadastrar({
                    nome: formulario.nome.trim(),
                    email: formulario.email.trim(),
                    senha: formulario.senha,
                    tipoUsuario: formulario.tipoUsuario,
                });
                if (previewImagem) {
                    try {
                        localStorage.setItem(
                            `ourmusic_usuario_img_${criado.idUsuario}`,
                            previewImagem,
                        );
                    } catch {
                        // Ignora armazenamento local
                    }
                }
                navigate("/usuarios", { replace: true });
            }
        } catch (error) {
            setErro(getApiErrorMessage(error));
        } finally {
            setEnviando(false);
        }
    }

    async function confirmarDesativacao() {
        if (!id) return;
        setEnviando(true);
        setErro("");
        try {
            await usuarioService.desativar(id);
            setConfirmandoDesativacao(false);
            navigate("/usuarios", { replace: true });
        } catch (error) {
            setErro(getApiErrorMessage(error));
            setConfirmandoDesativacao(false);
        } finally {
            setEnviando(false);
        }
    }

    const resumoPermissoes =
        formulario.tipoUsuario === "Admin"
            ? "Perfil Admin: possui acesso completo ao gerenciamento de músicas, gêneros musicais (RF11) e contas de usuários."
            : "Perfil Usuario: explora o catálogo, cadastra músicas, exclui apenas as próprias músicas e edita seu próprio perfil.";

    const imagemExibida = previewImagem || capaPadrao;

    return (
        <div
            className="om-app-shell"
            data-node-id={emEdicao ? "21:126" : "13:249"}
            data-name={emEdicao ? "Edição de usuário" : "Cadastro de usuário"}
        >
            <Sidebar itemAtivo="usuarios" />

            <div className="om-main-area">
                <Header />

                <main className="om-page-content om-cadastro-usuario">
                    <Link
                        to="/usuarios"
                        className="om-cadastro-usuario__voltar"
                        data-node-id={emEdicao ? "21:176" : "13:294"}
                    >
                        <img src={arrowLeft} alt="" />
                        <span>Voltar para lista de usuários</span>
                    </Link>

                    <section
                        className="om-cadastro-usuario__cabecalho"
                        data-node-id={emEdicao ? "21:180" : "13:298"}
                    >
                        <h1
                            className="om-cadastro-usuario__titulo"
                            data-node-id={emEdicao ? "21:182" : "13:300"}
                        >
                            {emEdicao ? "Edição de usuário" : "Cadastro de usuário"}
                        </h1>
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
                        className="om-cadastro-usuario__form-wrapper"
                        onSubmit={salvar}
                        data-node-id={emEdicao ? "21:183" : "13:306"}
                    >
                        <div className="om-cadastro-usuario__colunas">
                            <aside
                                className="om-cadastro-usuario__col-identidade"
                                data-node-id={emEdicao ? "21:184" : "13:307"}
                            >
                                <div
                                    className="om-cadastro-usuario__card-identidade"
                                    data-node-id={emEdicao ? "21:185" : "13:308"}
                                >
                                    <h2 className="om-cadastro-usuario__card-titulo">
                                        Identificação da conta
                                    </h2>

                                    <div className="om-cadastro-usuario__preview">
                                        <img
                                            src={imagemExibida}
                                            alt="Identificação do usuário"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        className="om-cadastro-usuario__btn-tipo"
                                        onClick={() => arquivoInputRef.current?.click()}
                                        data-node-id={emEdicao ? "21:188" : "13:311"}
                                    >
                                        <img src={uploadIcon} alt="" />
                                        <span>Imagem de Usuario</span>
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
                                className="om-cadastro-usuario__col-dados"
                                data-node-id={emEdicao ? "21:193" : "13:323"}
                            >
                                <section
                                    className="om-cadastro-usuario__card-dados"
                                    data-node-id={emEdicao ? "21:194" : "13:324"}
                                >
                                    <div className="om-cadastro-usuario__grupo-topo">
                                        <h2>Dados da tabela Usuario</h2>
                                        <span>* Campos obrigatórios</span>
                                    </div>

                                    <div className="om-cadastro-usuario__campo">
                                        <label htmlFor="usuario-nome">
                                            Nome completo (Nome) *
                                        </label>
                                        <Campo
                                            id="usuario-nome"
                                            name="nome"
                                            value={formulario.nome}
                                            onChange={atualizarCampo}
                                            placeholder="Marina Costa"
                                            maxLength={100}
                                            required
                                        />
                                    </div>

                                    <div className="om-cadastro-usuario__linha-dupla">
                                        <div className="om-cadastro-usuario__campo">
                                            <label htmlFor="usuario-email">
                                                E-mail único (Email) *
                                            </label>
                                            <Campo
                                                id="usuario-email"
                                                name="email"
                                                type="email"
                                                value={formulario.email}
                                                onChange={atualizarCampo}
                                                placeholder="marina@ourmusic.com"
                                                maxLength={50}
                                                required
                                            />
                                        </div>

                                        <div className="om-cadastro-usuario__campo">
                                            <label htmlFor="usuario-senha">
                                                {emEdicao ? "Senha*" : "Senha *"}
                                            </label>
                                            <Campo
                                                id="usuario-senha"
                                                name="senha"
                                                type="password"
                                                value={formulario.senha}
                                                onChange={atualizarCampo}
                                                placeholder="••••••••••••"
                                                minLength={8}
                                                required={!emEdicao}
                                            />
                                        </div>
                                    </div>

                                    <div className="om-cadastro-usuario__linha-tripla">
                                        <div className="om-cadastro-usuario__campo">
                                            <label htmlFor="usuario-tipo">
                                                Tipo de usuário *
                                            </label>
                                            <div className="om-cadastro-usuario__select-wrapper">
                                                <select
                                                    id="usuario-tipo"
                                                    name="tipoUsuario"
                                                    className="campo om-cadastro-usuario__select"
                                                    value={formulario.tipoUsuario}
                                                    onChange={atualizarCampo}
                                                >
                                                    <option value="Usuario">Usuario</option>
                                                    <option value="Admin">Admin</option>
                                                </select>
                                                <span className="om-cadastro-usuario__select-icone">
                                                    <img src={chevronDown} alt="" />
                                                </span>
                                            </div>
                                        </div>

                                        <div className="om-cadastro-usuario__campo">
                                            <label htmlFor="usuario-status">Status *</label>
                                            <select
                                                id="usuario-status"
                                                name="ativo"
                                                className="campo"
                                                value={String(formulario.ativo)}
                                                onChange={atualizarCampo}
                                            >
                                                <option value="true">Ativo</option>
                                                <option value="false">Inativo</option>
                                            </select>
                                        </div>

                                        <div className="om-cadastro-usuario__campo">
                                            <label htmlFor="usuario-id">ID Usuario</label>
                                            <Campo
                                                id="usuario-id"
                                                value={`#${id ? String(id).padStart(2, "0") : "01"}`}
                                                readOnly
                                            />
                                            <span className="om-cadastro-usuario__ajuda">
                                                PK IDENTITY(1,1)
                                            </span>
                                        </div>
                                    </div>

                                    <div className="om-cadastro-usuario__campo">
                                        <label>
                                            Resumo de permissões atribuídas (RN01 / RN02 /
                                            RN09)
                                        </label>
                                        <div className="om-cadastro-usuario__box-leitura">
                                            <p>{resumoPermissoes}</p>
                                        </div>
                                        <span className="om-cadastro-usuario__ajuda">
                                            RN03: O e-mail informado deve ser único no sistema
                                            (UQ_Usuario_Email).
                                        </span>
                                    </div>
                                </section>
                            </div>
                        </div>

                        <div
                            className={`om-cadastro-usuario__acoes-rodape ${!emEdicao ? "om-cadastro-usuario__acoes-rodape--somente-direita" : ""}`}
                            data-node-id={emEdicao ? "21:255" : "13:385"}
                        >
                            {emEdicao ? (
                                <Botao
                                    type="button"
                                    variante="perigo"
                                    icone={trashBtnIcon}
                                    texto="Desativar conta"
                                    onClick={() => setConfirmandoDesativacao(true)}
                                    disabled={enviando || carregando}
                                    data-node-id="21:256"
                                />
                            ) : null}

                            <div className="om-cadastro-usuario__acoes-direita">
                                <Botao
                                    type="button"
                                    variante="secundario"
                                    texto="Cancelar"
                                    onClick={() => navigate("/usuarios")}
                                    disabled={enviando}
                                />
                                <Botao
                                    type="submit"
                                    variante="primario"
                                    icone={checkBtnIcon}
                                    texto={enviando ? "Salvando..." : "Salvar usuário"}
                                    disabled={enviando || carregando}
                                />
                            </div>
                        </div>

                        <p
                            className="om-cadastro-usuario__nota-rodape"
                            data-node-id={emEdicao ? "21:267" : "13:397"}
                        >
                            RF13 a RF15 · RN01, RN03 e RN04: Senha criptografada via HASHBYTES
                            SHA2_256 no SQL Server.
                        </p>
                    </form>

                    <ModalConfirmacao
                        show={confirmandoDesativacao}
                        titulo="Desativar este usuário?"
                        mensagem="O usuário terá seu campo Ativo alterado para 0 (Inativo) e não poderá autenticar-se, preservando o histórico no banco (RN04)."
                        itemTitulo={usuarioOriginal?.nome || formulario.nome}
                        itemSubtitulo={`${usuarioOriginal?.email || formulario.email} · Perfil: ${formulario.tipoUsuario} (ID #${id ? String(id).padStart(2, "0") : "01"})`}
                        itemImagem={imagemExibida}
                        avisoPermanente="Exclusão lógica via trigger TR_UsuarioSoftDelete (Ativo = 0)."
                        textoConfirmar={enviando ? "Desativando..." : "Sim, desativar"}
                        textoCancelar="Cancelar"
                        enviando={enviando}
                        onClose={() => setConfirmandoDesativacao(false)}
                        onConfirm={() => void confirmarDesativacao()}
                    />
                </main>
            </div>
        </div>
    );
}

export default CadastroUsuario;
