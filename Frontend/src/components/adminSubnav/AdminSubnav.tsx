import { Link } from "react-router-dom";
import disc3 from "../../assets/icons/disc-3.svg";
import disc3Active from "../../assets/icons/disc-3-active.svg";
import users from "../../assets/icons/users.svg";
import usersActive from "../../assets/icons/users-active.svg";
import layoutGrid from "../../assets/icons/layout-grid.svg";
import layoutGridActive from "../../assets/icons/layout-grid-active.svg";
import "./AdminSubnav.css";

interface AdminSubnavProps {
    ativo: "musicas" | "usuarios" | "generos";
}

function AdminSubnav({ ativo }: AdminSubnavProps) {
    return (
        <nav className="om-admin-subnav" aria-label="Áreas de administração">
            <Link
                to="/admin/musicas"
                className={`om-admin-subnav__item ${ativo === "musicas" ? "om-admin-subnav__item--ativo" : ""}`}
            >
                <img src={ativo === "musicas" ? disc3Active : disc3} alt="" />
                <span>Músicas</span>
            </Link>

            <Link
                to="/usuarios"
                className={`om-admin-subnav__item ${ativo === "usuarios" ? "om-admin-subnav__item--ativo" : ""}`}
            >
                <img src={ativo === "usuarios" ? usersActive : users} alt="" />
                <span>Usuários</span>
            </Link>

            <Link
                to="/generos"
                className={`om-admin-subnav__item ${ativo === "generos" ? "om-admin-subnav__item--ativo" : ""}`}
            >
                <img src={ativo === "generos" ? layoutGridActive : layoutGrid} alt="" />
                <span>Gêneros</span>
            </Link>
        </nav>
    );
}

export default AdminSubnav;
