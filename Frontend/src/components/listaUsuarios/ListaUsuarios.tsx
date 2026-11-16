import type { Usuario } from "../../types/api";
import { obterIniciais } from "../../utils/formatters";
import searchIcon from "../../assets/icons/search.svg";
import chevronDown from "../../assets/icons/chevron-down.svg";
import chevronDownXs from "../../assets/icons/chevron-down-xs.svg";
import pencilIcon from "../../assets/icons/pencil.svg";
import trashIcon from "../../assets/icons/trash-2.svg";
import lockKeyholeIcon from "../../assets/icons/lock-keyhole.svg";
import "./ListaUsuarios.css";

interface ListaUsuariosProps {
    usuarios: Usuario[];
    idUsuarioLogado?: number | null;
    busca: string;
    filtroTipo: "Todos" | "Admin" | "Usuario";
    filtroStatus: "Todos" | "Ativo" | "Inativo";
    paginaAtual: number;
    totalPaginas: number;
    totalFiltrados: number;
    inicioIntervalo: number;
    fimIntervalo: number;
    carregando?: boolean;
    onBuscaChange: (valor: string) => void;
    onCiclarTipo: () => void;
    onCiclarStatus: () => void;
    onPaginaAnterior: () => void;
    onProximaPagina: () => void;
    onEditar: (usuario: Usuario) => void;
    onDesativar: (usuario: Usuario) => void;
    onAlternarTipoRapido?: (usuario: Usuario) => void;
}

function ListaUsuarios({
    usuarios,
    idUsuarioLogado,
    busca,
    filtroTipo,
    filtroStatus,
    paginaAtual,
    totalPaginas,
    totalFiltrados,
    inicioIntervalo,
    fimIntervalo,
    carregando = false,
    onBuscaChange,
    onCiclarTipo,
    onCiclarStatus,
    onPaginaAnterior,
    onProximaPagina,
    onEditar,
    onDesativar,
    onAlternarTipoRapido,
}: ListaUsuariosProps) {
    return (
        <section className="om-lista-usuarios" data-node-id="2:7083" data-name="Lista de usuários">
            <div className="om-lista-usuarios__filtros" data-node-id="2:7084">
                <div className="om-lista-usuarios__busca" data-node-id="2:7085">
                    <span className="om-lista-usuarios__busca-icone">
                        <img src={searchIcon} alt="" />
                    </span>
                    <input
                        type="search"
                        value={busca}
                        onChange={(e) => onBuscaChange(e.target.value)}
                        placeholder="Pesquisar usuário por nome ou e-mail único (RN03)..."
                        aria-label="Pesquisar usuário por nome ou e-mail"
                    />
                </div>

                <button
                    type="button"
                    className="om-lista-usuarios__filtro-btn"
                    onClick={onCiclarTipo}
                    data-node-id="2:7088"
                >
                    <img src={chevronDown} alt="" />
                    <span>Tipo: {filtroTipo}</span>
                </button>

                <button
                    type="button"
                    className="om-lista-usuarios__filtro-btn"
                    onClick={onCiclarStatus}
                    data-node-id="2:7091"
                >
                    <img src={chevronDown} alt="" />
                    <span>Status: {filtroStatus}</span>
                </button>
            </div>

            <div className="om-lista-usuarios__tabela" data-node-id="2:7094">
                <div className="om-lista-usuarios__cabecalho" data-node-id="2:7095">
                    <span className="om-lista-usuarios__col-identidade">
                        USUÁRIO (NOME E E-MAIL)
                    </span>
                    <span className="om-lista-usuarios__col-tipo">TIPO (TIPOUSUARIO)</span>
                    <span className="om-lista-usuarios__col-status">STATUS (ATIVO)</span>
                    <span className="om-lista-usuarios__col-acoes">AÇÕES</span>
                </div>

                {carregando ? (
                    <div className="om-lista-usuarios__vazio">Carregando usuários...</div>
                ) : usuarios.length === 0 ? (
                    <div className="om-lista-usuarios__vazio">Nenhum usuário encontrado.</div>
                ) : (
                    usuarios.map((usuario) => {
                        const ehAdmin = usuario.tipoUsuario === "Admin";
                        const ehVoce =
                            idUsuarioLogado !== undefined &&
                            idUsuarioLogado !== null &&
                            usuario.idUsuario === idUsuarioLogado;

                        return (
                            <div
                                key={usuario.idUsuario}
                                className="om-lista-usuarios__linha"
                                data-name="Usuário"
                            >
                                <div className="om-lista-usuarios__identidade">
                                    <div
                                        className={`om-lista-usuarios__avatar ${ehAdmin ? "om-lista-usuarios__avatar--admin" : ""}`}
                                    >
                                        {obterIniciais(usuario.nome)}
                                    </div>
                                    <div className="om-lista-usuarios__dados">
                                        <div className="om-lista-usuarios__nome-linha">
                                            <span className="om-lista-usuarios__nome">
                                                {usuario.nome}
                                            </span>
                                            {ehVoce ? (
                                                <span className="om-lista-usuarios__voce">
                                                    Você
                                                </span>
                                            ) : null}
                                        </div>
                                        <span className="om-lista-usuarios__email">
                                            {usuario.email}
                                        </span>
                                    </div>
                                </div>

                                <div className="om-lista-usuarios__perfil">
                                    <button
                                        type="button"
                                        className="om-lista-usuarios__perfil-btn"
                                        onClick={() =>
                                            onAlternarTipoRapido
                                                ? onAlternarTipoRapido(usuario)
                                                : onEditar(usuario)
                                        }
                                        title={
                                            ehVoce
                                                ? "Você não pode alterar seu próprio perfil de acesso"
                                                : `Alterar perfil de ${usuario.nome}`
                                        }
                                    >
                                        <span
                                            className={`om-lista-usuarios__badge ${ehAdmin ? "om-lista-usuarios__badge--verde" : "om-lista-usuarios__badge--neutro"}`}
                                        >
                                            {usuario.tipoUsuario}
                                        </span>
                                        <img src={chevronDownXs} alt="" />
                                    </button>
                                </div>

                                <div className="om-lista-usuarios__situacao">
                                    <span
                                        className={`om-lista-usuarios__badge ${usuario.ativo ? "om-lista-usuarios__badge--verde" : "om-lista-usuarios__badge--neutro"}`}
                                    >
                                        {usuario.ativo ? "Ativo" : "Inativo"}
                                    </span>
                                </div>

                                <div className="om-lista-usuarios__acoes">
                                    <button
                                        type="button"
                                        className="om-lista-usuarios__acao-btn"
                                        aria-label={`Editar ${usuario.nome}`}
                                        onClick={() => onEditar(usuario)}
                                    >
                                        <img src={pencilIcon} alt="" />
                                    </button>

                                    {ehVoce ? (
                                        <span
                                            className="om-lista-usuarios__acao-bloqueada"
                                            title="Conta atual protegida"
                                        >
                                            <img src={lockKeyholeIcon} alt="Conta atual" />
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            className="om-lista-usuarios__acao-btn"
                                            aria-label={`Desativar ${usuario.nome}`}
                                            onClick={() => onDesativar(usuario)}
                                        >
                                            <img src={trashIcon} alt="" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}

                <div className="om-lista-usuarios__paginacao" data-node-id="2:7197">
                    <span className="om-lista-usuarios__paginacao-resumo">
                        {totalFiltrados === 0
                            ? "0 usuários"
                            : `${inicioIntervalo}–${fimIntervalo} de ${totalFiltrados} usuários`}
                    </span>
                    <div className="om-lista-usuarios__paginacao-controles">
                        <button
                            type="button"
                            className="om-lista-usuarios__paginacao-btn"
                            onClick={onPaginaAnterior}
                            disabled={paginaAtual <= 1}
                        >
                            Anterior
                        </button>
                        <span className="om-lista-usuarios__paginacao-pagina">
                            Página {paginaAtual} de {Math.max(1, totalPaginas)}
                        </span>
                        <button
                            type="button"
                            className="om-lista-usuarios__paginacao-btn"
                            onClick={onProximaPagina}
                            disabled={paginaAtual >= totalPaginas}
                        >
                            Próxima
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ListaUsuarios;
