import { useEffect, useRef, useState, type PropsWithChildren } from "react";
import type { AuthSession, LoginPayload } from "../types/api";
import { SESSION_STORAGE_KEY, UNAUTHORIZED_EVENT } from "../services/api";
import { authService, usuarioService } from "../services/ourMusicService";
import { AuthContext } from "./auth";

function readSession(): AuthSession | null {
    try {
        const value = localStorage.getItem(SESSION_STORAGE_KEY);
        if (!value) return null;
        const session = JSON.parse(value) as AuthSession;
        if (
            !session.token ||
            !session.expiracaoUtc ||
            new Date(session.expiracaoUtc).getTime() <= Date.now()
        ) {
            localStorage.removeItem(SESSION_STORAGE_KEY);
            return null;
        }
        return session;
    } catch {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
    }
}

export function AuthProvider({ children }: PropsWithChildren) {
    const [session, setSession] = useState<AuthSession | null>(() => readSession());
    const initialSession = useRef(session);
    const [carregandoSessao, setCarregandoSessao] = useState(Boolean(session));

    function persist(next: AuthSession | null) {
        setSession(next);
        if (next) localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
        else localStorage.removeItem(SESSION_STORAGE_KEY);
    }

    async function atualizarUsuario() {
        if (!session) return;
        const usuario = await usuarioService.buscar(session.usuario.idUsuario);
        persist({ ...session, usuario });
    }

    async function login(payload: LoginPayload) {
        const loginResponse = await authService.login(payload);
        const baseSession: AuthSession = loginResponse;
        persist(baseSession);
        try {
            const usuario = await usuarioService.buscar(loginResponse.usuario.idUsuario);
            persist({ ...baseSession, usuario });
        } catch {
            // Mantém os dados retornados pelo endpoint de Login
        }
    }

    async function logout() {
        try {
            if (session?.token) {
                await authService.sair();
            }
        } catch {
            // Ignora erro caso o token já esteja expirado/revogado
        } finally {
            persist(null);
        }
    }

    useEffect(() => {
        const handleUnauthorized = () => setSession(null);

        window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);

        return () =>
            window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    }, []);

    useEffect(() => {
        const restored = initialSession.current;

        if (!restored) return;
        usuarioService
            .buscar(restored.usuario.idUsuario)
            .then((usuario) => {
                const next = { ...restored, usuario };
                localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
                setSession(next);
            })
            .catch(() => undefined)
            .finally(() => setCarregandoSessao(false));
    }, []);

    const perfil = session?.usuario.tipoUsuario?.toLowerCase() ?? "";

    return (
        <AuthContext.Provider
            value={{
                session,
                usuario: session?.usuario ?? null,
                perfil,
                autenticado: Boolean(session),
                carregandoSessao,
                login,
                logout,
                atualizarUsuario,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
