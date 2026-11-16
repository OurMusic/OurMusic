import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { perfilEhAdministrador, useAuth } from "../context/auth";

interface ProtectedRouteProps extends PropsWithChildren {
    role?: "administrador";
}

function ProtectedRoute({ children, role }: ProtectedRouteProps) {
    const { autenticado, carregandoSessao, perfil } = useAuth();
    const location = useLocation();

    if (carregandoSessao) {
        return <main className="om-loading-screen">Carregando sessão...</main>;
    }

    if (!autenticado) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    const autorizado = !role || (role === "administrador" && perfilEhAdministrador(perfil));

    if (!autorizado) return <Navigate to="/catalogo" replace />;

    return children;
}

export default ProtectedRoute;
