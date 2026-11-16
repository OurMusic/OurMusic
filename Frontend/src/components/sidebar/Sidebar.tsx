import { Link, useNavigate } from "react-router-dom";
import { perfilEhAdministrador, useAuth } from "../../context/auth";
import audioLines from "../../assets/icons/audio-lines.svg";
import compass from "../../assets/icons/compass.svg";
import compassActive from "../../assets/icons/compass-active.svg";
import compassMobile from "../../assets/icons/compass-mobile.svg";
import layoutGrid from "../../assets/icons/layout-grid.svg";
import layoutGridActive from "../../assets/icons/layout-grid-active.svg";
import layoutGridMobile from "../../assets/icons/layout-grid-mobile.svg";
import circlePlus from "../../assets/icons/circle-plus.svg";
import circlePlusActive from "../../assets/icons/circle-plus-active.svg";
import userIcon from "../../assets/icons/user.svg";
import userActive from "../../assets/icons/user-active.svg";
import userRoundMobile from "../../assets/icons/user-round-mobile.svg";
import shieldCheckMenu from "../../assets/icons/shield-check-menu.svg";
import shieldCheckMenuActive from "../../assets/icons/shield-check-menu-active.svg";
import shieldCheckMd from "../../assets/icons/shield-check-md.svg";
import headphones from "../../assets/icons/headphones.svg";
import arrowUpRightMuted from "../../assets/icons/arrow-up-right-muted.svg";
import circleHelp from "../../assets/icons/circle-help.svg";
import logOutIcon from "../../assets/icons/log-out.svg";
import "./Sidebar.css";

export type ItemMenuAtivo =
    | "catalogo"
    | "generos"
    | "cadastrar-musica"
    | "perfil"
    | "admin"
    | "admin-musicas"
    | "usuarios";

interface SidebarProps {
    modo?: "descoberta" | "admin";
    itemAtivo?: ItemMenuAtivo;
    notaAcesso?: "nenhuma" | "admin" | "usuario";
    rodapeVariante?: "logout" | "encerrar-sessao" | "ir-catalogo";
}

function Sidebar({
    itemAtivo = "catalogo",
    notaAcesso = "nenhuma",
    rodapeVariante = "logout",
}: SidebarProps) {
    const { perfil, logout } = useAuth();
    const navigate = useNavigate();
    const administrador = perfilEhAdministrador(perfil);
    const adminAtivo =
        itemAtivo === "admin" ||
        itemAtivo === "admin-musicas" ||
        itemAtivo === "usuarios";

    async function sair() {
        await logout();
        navigate("/login");
    }

    return (
        <>
            <aside className="om-sidebar" data-name="Navegação lateral">
                <div className="om-sidebar__topo">
                    <Link to="/catalogo" className="om-sidebar__marca" data-name="Marca Pulso">
                        <span className="om-sidebar__logo-icone">
                            <img src={audioLines} alt="" />
                        </span>
                        <span className="om-sidebar__logo-texto">OurMusic</span>
                        <span className="om-sidebar__logo-ponto" />
                    </Link>

                    <nav className="om-sidebar__menu" aria-label="Menu principal" data-node-id="53:54">
                        <p className="om-sidebar__area">SUA DESCOBERTA</p>

                        <Link
                            to="/catalogo"
                            className={`om-sidebar__item ${itemAtivo === "catalogo" ? "om-sidebar__item--ativo" : ""}`}
                        >
                            <span className="om-sidebar__item-icone">
                                <img
                                    src={itemAtivo === "catalogo" ? compassActive : compass}
                                    alt=""
                                />
                            </span>
                            <span>Catálogo</span>
                        </Link>

                        <Link
                            to="/generos"
                            className={`om-sidebar__item ${itemAtivo === "generos" ? "om-sidebar__item--ativo" : ""}`}
                        >
                            <span className="om-sidebar__item-icone">
                                <img
                                    src={
                                        itemAtivo === "generos"
                                            ? layoutGridActive
                                            : layoutGrid
                                    }
                                    alt=""
                                />
                            </span>
                            <span>Gêneros</span>
                        </Link>

                        <Link
                            to="/musicas/nova"
                            className={`om-sidebar__item ${itemAtivo === "cadastrar-musica" ? "om-sidebar__item--ativo" : ""}`}
                        >
                            <span className="om-sidebar__item-icone">
                                <img
                                    src={
                                        itemAtivo === "cadastrar-musica"
                                            ? circlePlusActive
                                            : circlePlus
                                    }
                                    alt=""
                                />
                            </span>
                            <span>Cadastrar música</span>
                        </Link>

                        <Link
                            to="/perfil"
                            className={`om-sidebar__item ${itemAtivo === "perfil" ? "om-sidebar__item--ativo" : ""}`}
                        >
                            <span className="om-sidebar__item-icone">
                                <img
                                    src={itemAtivo === "perfil" ? userActive : userIcon}
                                    alt=""
                                />
                            </span>
                            <span>Meu perfil</span>
                        </Link>

                        {administrador ? (
                            <Link
                                to="/admin/musicas"
                                className={`om-sidebar__item ${adminAtivo ? "om-sidebar__item--ativo" : ""}`}
                            >
                                <span className="om-sidebar__item-icone">
                                    <img
                                        src={
                                            adminAtivo
                                                ? shieldCheckMenuActive
                                                : shieldCheckMenu
                                        }
                                        alt=""
                                    />
                                </span>
                                <span>Administração</span>
                            </Link>
                        ) : null}
                    </nav>

                    {notaAcesso === "admin" ? (
                        <div className="om-sidebar__nota" data-name="Nota de acesso">
                            <span className="om-sidebar__nota-icone">
                                <img src={shieldCheckMd} alt="" />
                            </span>
                            <p className="om-sidebar__nota-titulo">Espaço de gestão</p>
                            <p className="om-sidebar__nota-texto">
                                Acesso exclusivo para administradores do OurMusic.
                            </p>
                        </div>
                    ) : null}

                    {notaAcesso === "usuario" ? (
                        <div className="om-sidebar__nota" data-name="Nota de acesso">
                            <span className="om-sidebar__nota-icone">
                                <img src={headphones} alt="" />
                            </span>
                            <p className="om-sidebar__nota-titulo">Perfil: Usuário (Ouvinte)</p>
                            <p className="om-sidebar__nota-texto">
                                Edite seus dados (RF07) e gerencie suas músicas.
                            </p>
                        </div>
                    ) : null}
                </div>

                <div className="om-sidebar__rodape" data-name="Rodapé lateral">
                    {rodapeVariante === "ir-catalogo" ? (
                        <Link to="/catalogo" className="om-sidebar__atalho om-sidebar__atalho--gap">
                            <span className="om-sidebar__atalho-icone">
                                <img src={arrowUpRightMuted} alt="" />
                            </span>
                            <span>Ir para o catálogo</span>
                        </Link>
                    ) : rodapeVariante === "encerrar-sessao" ? (
                        <button
                            type="button"
                            onClick={() => void sair()}
                            className="om-sidebar__atalho om-sidebar__atalho--gap"
                        >
                            <span className="om-sidebar__atalho-icone">
                                <img src={circleHelp} alt="" />
                            </span>
                            <span>Encerrar sessão (RF02)</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => void sair()}
                            className="om-sidebar__atalho"
                        >
                            <span className="om-sidebar__atalho-icone">
                                <img src={logOutIcon} alt="" />
                            </span>
                            <span>· Logout</span>
                        </button>
                    )}
                    <p className="om-sidebar__assinatura">OURMUSIC © 2026</p>
                </div>
            </aside>

            <nav className="om-mobile-bottom-nav" aria-label="Navegação principal mobile">
                <Link
                    to="/catalogo"
                    className={`om-mobile-bottom-nav__item ${itemAtivo === "catalogo" ? "om-mobile-bottom-nav__item--ativo" : ""}`}
                >
                    <img src={compassMobile} alt="" />
                    <span>Catálogo</span>
                </Link>
                <Link
                    to="/generos"
                    className={`om-mobile-bottom-nav__item ${itemAtivo === "generos" ? "om-mobile-bottom-nav__item--ativo" : ""}`}
                >
                    <img src={layoutGrid} alt="" />
                    <span>Gêneros</span>
                </Link>
                <Link
                    to="/musicas/nova"
                    className={`om-mobile-bottom-nav__item ${itemAtivo === "cadastrar-musica" ? "om-mobile-bottom-nav__item--ativo" : ""}`}
                >
                    <img src={layoutGridMobile} alt="" />
                    <span>Nova música</span>
                </Link>
                <Link
                    to="/perfil"
                    className={`om-mobile-bottom-nav__item ${itemAtivo === "perfil" ? "om-mobile-bottom-nav__item--ativo" : ""}`}
                >
                    <img src={userRoundMobile} alt="" />
                    <span>Meu perfil</span>
                </Link>
                {administrador ? (
                    <Link
                        to="/admin/musicas"
                        className={`om-mobile-bottom-nav__item ${adminAtivo ? "om-mobile-bottom-nav__item--ativo" : ""}`}
                    >
                        <img
                            src={adminAtivo ? shieldCheckMenuActive : shieldCheckMenu}
                            alt=""
                        />
                        <span>Admin</span>
                    </Link>
                ) : null}
            </nav>
        </>
    );
}

export default Sidebar;
