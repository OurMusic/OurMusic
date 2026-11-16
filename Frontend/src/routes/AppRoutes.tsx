import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/Login/Login";
import Catalogo from "../pages/Catalogo/Catalogo";
import DetalhesMusica from "../pages/DetalhesMusica/DetalhesMusica";
import AdministracaoMusicas from "../pages/AdministracaoMusicas/AdministracaoMusicas";
import CadastroMusica from "../pages/CadastroMusica/CadastroMusica";
import Generos from "../pages/Generos/Generos";
import CadastroGenero from "../pages/CadastroGenero/CadastroGenero";
import Usuarios from "../pages/Usuarios/Usuarios";
import CadastroUsuario from "../pages/CadastroUsuario/CadastroUsuario";
import MeuPerfil from "../pages/MeuPerfil/MeuPerfil";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route
                path="/catalogo"
                element={
                    <ProtectedRoute>
                        <Catalogo />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/home"
                element={<Navigate to="/catalogo" replace />}
            />

            <Route
                path="/musicas/nova"
                element={
                    <ProtectedRoute>
                        <CadastroMusica />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/musicas/editar/:id"
                element={
                    <ProtectedRoute>
                        <CadastroMusica />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/musicas/:id"
                element={
                    <ProtectedRoute>
                        <DetalhesMusica />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/perfil"
                element={
                    <ProtectedRoute>
                        <MeuPerfil />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/perfil/editar"
                element={
                    <ProtectedRoute>
                        <MeuPerfil />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/musicas"
                element={
                    <ProtectedRoute role="administrador">
                        <AdministracaoMusicas />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/generos"
                element={
                    <ProtectedRoute>
                        <Generos />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/generos/novo"
                element={
                    <ProtectedRoute role="administrador">
                        <CadastroGenero />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/generos/editar/:id"
                element={
                    <ProtectedRoute role="administrador">
                        <CadastroGenero />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/usuarios"
                element={
                    <ProtectedRoute role="administrador">
                        <Usuarios />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/usuarios/novo"
                element={
                    <ProtectedRoute role="administrador">
                        <CadastroUsuario />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/usuarios/editar/:id"
                element={
                    <ProtectedRoute role="administrador">
                        <CadastroUsuario />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<Navigate to="/catalogo" replace />} />
        </Routes>
    );
}

export default AppRoutes;
