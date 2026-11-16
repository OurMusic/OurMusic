import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { getApiErrorMessage } from "../../services/api";
import Campo from "../../components/campo/Campo";
import Botao from "../../components/botao/Botao";
import retratoMusical from "../../assets/retrato-musical.png";
import pexels39112950 from "../../assets/pexels-39112950.jpg";
import pexels12752470 from "../../assets/pexels-12752470.jpg";
import pexels7095561 from "../../assets/pexels-7095561.jpg";
import pexels26223391 from "../../assets/pexels-26223391.jpg";
import pexels12756277 from "../../assets/pexels-12756277.jpg";
import pexels7088382 from "../../assets/pexels-7088382.jpg";
import audioLines from "../../assets/icons/audio-lines.svg";
import mailIcon from "../../assets/icons/mail.svg";
import eyeOffIcon from "../../assets/icons/eye-off.svg";
import arrowRightIcon from "../../assets/icons/arrow-right.svg";
import "./Login.css";

const IMAGENS_MANIFESTO = [
    {
        src: retratoMusical,
        alt: "Artista ouvindo música em estúdio",
    },
    {
        src: pexels39112950,
        alt: "Close-up de uma mão tocando baixo elétrico",
    },
    {
        src: pexels12752470,
        alt: "Músico tocando instrumento no palco",
    },
    {
        src: pexels7095561,
        alt: "Mãos de musicista tocando instrumento",
    },
    {
        src: pexels26223391,
        alt: "Mãos tocando guitarra elétrica",
    },
    {
        src: pexels12756277,
        alt: "Músico sentado apresentando show ao vivo",
    },
    {
        src: pexels7088382,
        alt: "Mulher sorrindo curtindo música",
    },
];

const FRASES_MANIFESTO = [
    {
        linha1: "Cada som, uma",
        linha2: "nova descoberta.",
        descricao:
            "Encontre artistas, explore gêneros e conheça as histórias por trás de cada música.",
        rodape: "SEU REPERTÓRIO COMEÇA AQUI",
    },
    {
        linha1: "Sinta o pulso",
        linha2: "de cada acorde.",
        descricao:
            "Navegue pelo catálogo completo, filtre seus gêneros favoritos e acompanhe letras e fichas técnicas.",
        rodape: "CATÁLOGO MUSICAL OURMUSIC",
    },
    {
        linha1: "Viva a música",
        linha2: "no seu ritmo.",
        descricao:
            "Uma plataforma pensada para organizar, descobrir e celebrar grandes obras musicais.",
        rodape: "EXPERIÊNCIA SONORA INTEGRADA",
    },
];

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, autenticado } = useAuth();

    const [email, setEmail] = useState("ana@gmail.com");
    const [senha, setSenha] = useState("admin123");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    // Estado único sincronizado para transição de imagem e texto do manifesto
    const [indiceSlide, setIndiceSlide] = useState(0);
    const [slideFadeOut, setSlideFadeOut] = useState(false);
    const [saindoTela, setSaindoTela] = useState(false);

    useEffect(() => {
        if (autenticado && !saindoTela) {
            navigate("/catalogo", { replace: true });
        }
    }, [autenticado, saindoTela, navigate]);

    useEffect(() => {
        let timeoutTroca: number | undefined;
        const intervalo = window.setInterval(() => {
            setSlideFadeOut(true);
            timeoutTroca = window.setTimeout(() => {
                setIndiceSlide((atual) => atual + 1);
                setSlideFadeOut(false);
            }, 1000);
        }, 5600);

        return () => {
            window.clearInterval(intervalo);
            if (timeoutTroca) window.clearTimeout(timeoutTroca);
        };
    }, []);

    async function entrar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErro("");
        setEnviando(true);

        try {
            await login({ email: email.trim(), senha });
            setSaindoTela(true);
            const state = location.state as { from?: string } | null;
            window.setTimeout(() => {
                navigate(state?.from || "/catalogo", { replace: true });
            }, 800);
        } catch (error) {
            setErro(getApiErrorMessage(error));
            setEnviando(false);
        }
    }

    const indiceImagemAtual = indiceSlide % IMAGENS_MANIFESTO.length;
    const manifestoAtual = FRASES_MANIFESTO[indiceSlide % FRASES_MANIFESTO.length];

    return (
        <main
            className={`om-login ${saindoTela ? "om-login--fade-out" : "om-login--fade-in"}`}
            data-node-id="2:6362"
            data-name="Autenticação"
        >
            <section
                className="om-login__manifesto"
                data-node-id="2:6363"
                data-name="Manifesto musical"
            >
                <div className="om-login__retrato" data-node-id="2:6364">
                    {IMAGENS_MANIFESTO.map((item, idx) => (
                        <img
                            key={item.src}
                            src={item.src}
                            alt={item.alt}
                            className={`om-login__retrato-img ${
                                idx === indiceImagemAtual && !slideFadeOut
                                    ? "om-login__retrato-img--visivel"
                                    : "om-login__retrato-img--oculta"
                            }`}
                        />
                    ))}
                </div>
                <div className="om-login__contraste" data-node-id="2:6365" />

                <div className="om-login__marca" data-node-id="2:6366" data-name="Marca Pulso">
                    <span className="om-login__marca-icone" data-node-id="2:7326">
                        <img src={audioLines} alt="" />
                    </span>
                    <span className="om-login__marca-texto" data-node-id="2:6368">
                        OurMusic
                    </span>
                    <span className="om-login__marca-ponto" data-node-id="2:6369" />
                </div>

                <div className="om-login__manifesto-conteudo" data-node-id="2:6370">
                    <div
                        className={`om-login__manifesto-transicao ${
                            slideFadeOut
                                ? "om-login__manifesto-transicao--fade-out"
                                : "om-login__manifesto-transicao--fade-in"
                        }`}
                    >
                        <h1 className="om-login__chamada" data-node-id="2:6374">
                            <span>{manifestoAtual.linha1}</span>
                            <span>{manifestoAtual.linha2}</span>
                        </h1>
                        <p className="om-login__descricao" data-node-id="2:6375">
                            {manifestoAtual.descricao}
                        </p>
                        <div className="om-login__rodape-editorial" data-node-id="2:6376">
                            <span data-node-id="2:6377">{manifestoAtual.rodape}</span>
                        </div>
                    </div>
                </div>
            </section>

            <section
                className="om-login__acesso"
                data-node-id="2:6382"
                data-name="Acesso à plataforma"
            >
                <div className="om-login__links-legais" data-node-id="2:6417">
                    <span data-node-id="2:6418">© 2026 OurMusic</span>
                    <span data-node-id="2:6419">{"Privacidade  ·  Termos de uso"}</span>
                </div>

                <form
                    className="om-login__formulario"
                    onSubmit={entrar}
                    noValidate
                    data-node-id="2:6386"
                    data-name="Formulário de entrada"
                >
                    <div className="om-login__boas-vindas" data-node-id="2:6387">
                        <p className="om-login__contexto" data-node-id="2:6388">
                            ACESSO À PLATAFORMA
                        </p>
                        <h2 className="om-login__titulo" data-node-id="2:6389">
                            Entre no seu ritmo.
                        </h2>
                        <p className="om-login__subtitulo" data-node-id="2:6390">
                            Informe seu e-mail e senha.
                        </p>
                    </div>

                    <div className="om-login__credenciais" data-node-id="2:6391">
                        <div className="om-login__campo-grupo" data-node-id="2:6392">
                            <label htmlFor="login-email" data-node-id="2:6393">
                                E-mail
                            </label>
                            <div className="om-login__entrada" data-node-id="2:6394">
                                <Campo
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="ana.costa@email.com"
                                    autoComplete="email"
                                    required
                                />
                                <span className="om-login__entrada-icone" data-node-id="2:7332">
                                    <img src={mailIcon} alt="" />
                                </span>
                            </div>
                        </div>

                        <div className="om-login__campo-grupo" data-node-id="2:6397">
                            <label htmlFor="login-senha" data-node-id="2:6398">
                                Senha
                            </label>
                            <div className="om-login__entrada" data-node-id="2:6399">
                                <Campo
                                    id="login-senha"
                                    type={mostrarSenha ? "text" : "password"}
                                    value={senha}
                                    onChange={(event) => setSenha(event.target.value)}
                                    placeholder="••••••••••••"
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="om-login__entrada-icone om-login__entrada-btn"
                                    onClick={() => setMostrarSenha((prev) => !prev)}
                                    aria-label={
                                        mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                                    }
                                    data-node-id="2:7335"
                                >
                                    <img src={eyeOffIcon} alt="" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <Botao
                        type="submit"
                        variante="primario"
                        icone={arrowRightIcon}
                        texto={enviando ? "Entrando..." : "Entrar na minha conta"}
                        className="om-login__botao-entrar"
                        disabled={enviando}
                        data-node-id="2:6408"
                    />

                    {erro ? (
                        <p className="om-alert om-alert-error" role="alert">
                            {erro}
                        </p>
                    ) : null}
                </form>

                <div className="om-login__espacador-inferior" aria-hidden="true" />
            </section>
        </main>
    );
}

export default Login;
