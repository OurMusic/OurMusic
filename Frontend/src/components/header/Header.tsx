import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { perfilEhAdministrador, useAuth } from "../../context/auth";
import { obterIniciais } from "../../utils/formatters";
import shieldCheckSm from "../../assets/icons/shield-check-sm.svg";
import chevronDownSm from "../../assets/icons/chevron-down-sm.svg";
import audioLinesMobile from "../../assets/icons/audio-lines-mobile.svg";
import "./Header.css";

interface HeaderProps {
    caminhoAtual?: string;
    estiloConta?: "auto" | "admin" | "usuario";
    nomePadrao?: string;
    iniciaisPadrao?: string;
}

function Header({
    caminhoAtual,
    estiloConta = "auto",
    nomePadrao,
    iniciaisPadrao,
}: HeaderProps) {
    const { usuario, perfil, logout } = useAuth();
    const navigate = useNavigate();
    const [menuAberto, setMenuAberto] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const ehAdminReal = perfilEhAdministrador(perfil);
    const mostrarComoAdmin =
        estiloConta === "admin" ? true : estiloConta === "usuario" ? false : ehAdminReal;

    const nomeExibido =
        usuario?.nome || nomePadrao || (mostrarComoAdmin ? "Rafael Costa" : "Ana Costa");
    const iniciais = usuario?.nome
        ? obterIniciais(usuario.nome)
        : iniciaisPadrao || (mostrarComoAdmin ? "RC" : "AC");

    useEffect(() => {
        function fecharFora(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuAberto(false);
            }
        }
        document.addEventListener("mousedown", fecharFora);
        return () => document.removeEventListener("mousedown", fecharFora);
    }, []);

    async function sair() {
        setMenuAberto(false);
        await logout();
        navigate("/login");
    }

    return (
        <>
            <header className="om-topbar" data-name="Barra superior">
                <div className="om-topbar__caminho" data-name="Caminho">
                    {caminhoAtual ? (
                        <>
                            <Link to="/catalogo" className="om-topbar__caminho-raiz">
                                OurMusic
                            </Link>
                            <span className="om-topbar__caminho-sep">/</span>
                            <span className="om-topbar__caminho-atual">{caminhoAtual}</span>
                        </>
                    ) : null}
                </div>

                <div className="om-topbar__conta-wrapper" ref={menuRef}>
                    <button
                        type="button"
                        className="om-topbar__conta"
                        data-name="Conta conectada"
                        onClick={() => setMenuAberto((prev) => !prev)}
                        aria-expanded={menuAberto}
                    >
                        {mostrarComoAdmin ? (
                            <span className="om-topbar__badge om-topbar__badge--admin">
                                <img src={shieldCheckSm} alt="" />
                                <span>Administrador</span>
                            </span>
                        ) : (
                            <span className="om-topbar__badge om-topbar__badge--usuario">
                                <span>Usuário</span>
                            </span>
                        )}

                        <span
                            className={`om-topbar__avatar ${mostrarComoAdmin ? "om-topbar__avatar--admin" : ""}`}
                        >
                            {iniciais}
                        </span>

                        <span className="om-topbar__nome">{nomeExibido}</span>

                        <span className="om-topbar__chevron">
                            <img src={chevronDownSm} alt="" />
                        </span>
                    </button>

                    {menuAberto ? (
                        <div className="om-topbar__dropdown" role="menu">
                            <Link
                                to="/catalogo"
                                className="om-topbar__dropdown-item"
                                onClick={() => setMenuAberto(false)}
                            >
                                Catálogo de músicas
                            </Link>
                            <Link
                                to="/generos"
                                className="om-topbar__dropdown-item"
                                onClick={() => setMenuAberto(false)}
                            >
                                Gêneros musicais
                            </Link>
                            <Link
                                to="/perfil"
                                className="om-topbar__dropdown-item"
                                onClick={() => setMenuAberto(false)}
                            >
                                Meu perfil
                            </Link>
                            {ehAdminReal ? (
                                <>
                                    <div className="om-topbar__dropdown-divider" />
                                    <Link
                                        to="/admin/musicas"
                                        className="om-topbar__dropdown-item"
                                        onClick={() => setMenuAberto(false)}
                                    >
                                        Administração de músicas
                                    </Link>
                                    <Link
                                        to="/generos"
                                        className="om-topbar__dropdown-item"
                                        onClick={() => setMenuAberto(false)}
                                    >
                                        Gerenciamento de gêneros
                                    </Link>
                                    <Link
                                        to="/usuarios"
                                        className="om-topbar__dropdown-item"
                                        onClick={() => setMenuAberto(false)}
                                    >
                                        Gerenciamento de usuários
                                    </Link>
                                </>
                            ) : null}
                            <div className="om-topbar__dropdown-divider" />
                            <button
                                type="button"
                                className="om-topbar__dropdown-item om-topbar__dropdown-item--danger"
                                onClick={() => void sair()}
                            >
                                Sair da conta (RF02)
                            </button>
                        </div>
                    ) : null}
                </div>
            </header>

            <header className="om-mobile-topbar" data-name="Navegação mobile">
                <Link to="/catalogo" className="om-mobile-topbar__marca">
                    <img src={audioLinesMobile} alt="" />
                    <span className="om-mobile-topbar__titulo">OurMusic</span>
                    <span className="om-mobile-topbar__ponto" />
                </Link>
                <Link to="/perfil" className="om-mobile-topbar__avatar" aria-label="Meu perfil">
                    {iniciais}
                </Link>
            </header>
        </>
    );
}

export default Header;
