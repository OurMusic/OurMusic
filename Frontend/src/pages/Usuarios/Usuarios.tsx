import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/header/Header";
import AdminSubnav from "../../components/adminSubnav/AdminSubnav";
import Botao from "../../components/botao/Botao";
import ListaUsuarios from "../../components/listaUsuarios/ListaUsuarios";
import ModalConfirmacao from "../../components/modalConfirmacao/ModalConfirmacao";
import { useAuth } from "../../context/auth";
import { usuarioService } from "../../services/ourMusicService";
import { getApiErrorMessage } from "../../services/api";
import type { Usuario } from "../../types/api";
import userPlusIcon from "../../assets/icons/user-plus.svg";
import headphonesLg from "../../assets/icons/headphones-lg.svg";
import shieldCheckLg from "../../assets/icons/shield-check-lg.svg";
import capaPadrao from "../../assets/capa-1.png";
import "./Usuarios.css";

function Usuarios() {
    const navigate = useNavigate();
    const { usuario: usuarioLogado } = useAuth();

    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [busca, setBusca] = useState("");
    const [filtroTipo, setFiltroTipo] = useState<"Todos" | "Admin" | "Usuario">("Todos");
    const [filtroStatus, setFiltroStatus] = useState<"Todos" | "Ativo" | "Inativo">(
        "Todos",
    );
    const [pagina, setPagina] = useState(1);
    const tamanhoPagina = 5;
    const [selecionado, setSelecionado] = useState<Usuario | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState("");

    const carregar = useCallback(async () => {
        setCarregando(true);
        setErro("");
        try {
            const lista = await usuarioService.listar();
            setUsuarios(lista);
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

    function ciclarTipo() {
        setFiltroTipo((atual) =>
            atual === "Todos" ? "Admin" : atual === "Admin" ? "Usuario" : "Todos",
        );
        setPagina(1);
    }

    function ciclarStatus() {
        setFiltroStatus((atual) =>
            atual === "Todos" ? "Ativo" : atual === "Ativo" ? "Inativo" : "Todos",
        );
        setPagina(1);
    }

    async function alternarTipoRapido(alvo: Usuario) {
        if (usuarioLogado && alvo.idUsuario === usuarioLogado.idUsuario) {
            setErro("Você não pode alterar seu próprio perfil de acesso.");
            return;
        }
        setErro("");
        setMensagem("");
        try {
            const novoTipo = alvo.tipoUsuario === "Admin" ? "Usuario" : "Admin";
            await usuarioService.atualizar(alvo.idUsuario, {
                nome: alvo.nome,
                email: alvo.email,
                tipoUsuario: novoTipo,
                ativo: alvo.ativo,
            });
            setMensagem(`Perfil de ${alvo.nome} alterado para ${novoTipo}.`);
            await carregar();
        } catch (error) {
            setErro(getApiErrorMessage(error));
        }
    }

    async function confirmarDesativacao() {
        if (!selecionado) return;
        setEnviando(true);
        setErro("");
        setMensagem("");
        try {
            await usuarioService.desativar(selecionado.idUsuario);
            setMensagem(`Usuário "${selecionado.nome}" desativado com sucesso.`);
            setSelecionado(null);
            await carregar();
        } catch (error) {
            setErro(getApiErrorMessage(error));
            setSelecionado(null);
        } finally {
            setEnviando(false);
        }
    }

    const usuariosFiltrados = usuarios.filter((u) => {
        const termo = busca.trim().toLowerCase();
        const bateBusca =
            !termo ||
            u.nome.toLowerCase().includes(termo) ||
            u.email.toLowerCase().includes(termo);
        const bateTipo = filtroTipo === "Todos" || u.tipoUsuario === filtroTipo;
        const bateStatus =
            filtroStatus === "Todos" ||
            (filtroStatus === "Ativo" && u.ativo) ||
            (filtroStatus === "Inativo" && !u.ativo);
        return bateBusca && bateTipo && bateStatus;
    });

    const totalPaginas = Math.max(1, Math.ceil(usuariosFiltrados.length / tamanhoPagina));
    const paginaSegura = Math.min(pagina, totalPaginas);
    const inicioIdx = (paginaSegura - 1) * tamanhoPagina;
    const usuariosPaginados = usuariosFiltrados.slice(
        inicioIdx,
        inicioIdx + tamanhoPagina,
    );
    const inicioIntervalo = usuariosFiltrados.length === 0 ? 0 : inicioIdx + 1;
    const fimIntervalo = Math.min(usuariosFiltrados.length, inicioIdx + tamanhoPagina);

    const totalAdmins = usuarios.filter((u) => u.tipoUsuario === "Admin").length;
    const totalComuns = usuarios.filter((u) => u.tipoUsuario === "Usuario").length;

    return (
        <div
            className="om-app-shell"
            data-node-id="2:7027"
            data-name="Gerenciamento de usuários"
        >
            <Sidebar itemAtivo="usuarios" />

            <div className="om-main-area">
                <Header />

                <main className="om-page-content om-usuarios">
                    <AdminSubnav ativo="usuarios" />

                    <section className="om-usuarios__cabecalho" data-node-id="2:7065">
                        <div className="om-usuarios__apresentacao" data-node-id="2:7066">
                            <p className="om-usuarios__contexto" data-node-id="2:7067">
                                CONTROLE DE ACESSO
                            </p>
                            <h1 className="om-usuarios__titulo" data-node-id="2:7068">
                                Usuários
                            </h1>
                        </div>

                        <Botao
                            variante="primario"
                            icone={userPlusIcon}
                            texto="Novo usuário"
                            onClick={() => navigate("/usuarios/novo")}
                            data-node-id="2:7070"
                        />
                    </section>

                    <section className="om-usuarios__resumo" data-node-id="2:7073">
                        <div className="om-usuarios__indicador" data-node-id="2:7074">
                            <span className="om-usuarios__indicador-qtd">
                                {usuarios.length}
                            </span>
                            <span className="om-usuarios__indicador-cat">
                                Usuários cadastrados
                            </span>
                        </div>

                        <div className="om-usuarios__indicador" data-node-id="2:7077">
                            <span className="om-usuarios__indicador-qtd">
                                {totalAdmins}
                            </span>
                            <span className="om-usuarios__indicador-cat">
                                Administradores
                            </span>
                        </div>

                        <div className="om-usuarios__indicador" data-node-id="2:7080">
                            <span className="om-usuarios__indicador-qtd">
                                {totalComuns}
                            </span>
                            <span className="om-usuarios__indicador-cat">
                                Usuários comuns
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

                    <ListaUsuarios
                        usuarios={usuariosPaginados}
                        idUsuarioLogado={usuarioLogado?.idUsuario}
                        busca={busca}
                        filtroTipo={filtroTipo}
                        filtroStatus={filtroStatus}
                        paginaAtual={paginaSegura}
                        totalPaginas={totalPaginas}
                        totalFiltrados={usuariosFiltrados.length}
                        inicioIntervalo={inicioIntervalo}
                        fimIntervalo={fimIntervalo}
                        carregando={carregando}
                        onBuscaChange={(valor) => {
                            setBusca(valor);
                            setPagina(1);
                        }}
                        onCiclarTipo={ciclarTipo}
                        onCiclarStatus={ciclarStatus}
                        onPaginaAnterior={() => setPagina((p) => Math.max(1, p - 1))}
                        onProximaPagina={() =>
                            setPagina((p) => Math.min(totalPaginas, p + 1))
                        }
                        onEditar={(u) => navigate(`/usuarios/editar/${u.idUsuario}`)}
                        onDesativar={(u) => setSelecionado(u)}
                        onAlternarTipoRapido={(u) => void alternarTipoRapido(u)}
                    />

                    <section className="om-usuarios__guia" data-node-id="2:7205">
                        <h2 className="om-usuarios__guia-titulo" data-node-id="2:7206">
                            Cada perfil, seu espaço.
                        </h2>

                        <div className="om-usuarios__perfis" data-node-id="2:7207">
                            <div className="om-usuarios__perfil-card" data-node-id="2:7208">
                                <span className="om-usuarios__perfil-icone">
                                    <img src={headphonesLg} alt="" />
                                </span>
                                <div className="om-usuarios__perfil-texto">
                                    <h3>Usuario (Comum)</h3>
                                    <p>
                                        Acessa o catálogo, filtra por gênero, busca por
                                        título, cadastra músicas, exclui apenas as próprias
                                        músicas e edita seu perfil.
                                    </p>
                                </div>
                            </div>

                            <div className="om-usuarios__perfil-card" data-node-id="2:7213">
                                <span className="om-usuarios__perfil-icone">
                                    <img src={shieldCheckLg} alt="" />
                                </span>
                                <div className="om-usuarios__perfil-texto">
                                    <h3>Admin (Administrador)</h3>
                                    <p>
                                        Possui todas as permissões: gerencia todas as
                                        músicas, cadastra/edita gêneros (RF11) e gerencia
                                        contas de usuários.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <ModalConfirmacao
                        show={Boolean(selecionado)}
                        titulo="Desativar este usuário?"
                        mensagem="O usuário terá seu campo Ativo alterado para 0 (Inativo) e não poderá autenticar-se, preservando o histórico no banco (RN04)."
                        itemTitulo={selecionado?.nome}
                        itemSubtitulo={
                            selecionado
                                ? `${selecionado.email} · Perfil: ${selecionado.tipoUsuario} (ID #${String(selecionado.idUsuario).padStart(2, "0")})`
                                : ""
                        }
                        itemImagem={capaPadrao}
                        avisoPermanente="Exclusão lógica via trigger TR_UsuarioSoftDelete (Ativo = 0)."
                        textoConfirmar={enviando ? "Desativando..." : "Sim, desativar"}
                        textoCancelar="Cancelar"
                        enviando={enviando}
                        onClose={() => setSelecionado(null)}
                        onConfirm={() => void confirmarDesativacao()}
                    />
                </main>
            </div>
        </div>
    );
}

export default Usuarios;
