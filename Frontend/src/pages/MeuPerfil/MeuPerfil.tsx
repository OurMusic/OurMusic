import {
    useRef,
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/header/Header";
import Campo from "../../components/campo/Campo";
import { perfilEhAdministrador, useAuth } from "../../context/auth";
import { usuarioService } from "../../services/ourMusicService";
import { getApiErrorMessage } from "../../services/api";
import arrowLeft from "../../assets/icons/arrow-left.svg";
import perfilAnaCosta from "../../assets/perfil-ana-costa.png";
import perfilAdmin from "../../assets/perfil-admin.png";
import "./MeuPerfil.css";

function MeuPerfil() {
    const navigate = useNavigate();
    const location = useLocation();
    const { usuario, perfil, atualizarUsuario } = useAuth();
    const ehAdmin = perfilEhAdministrador(perfil);
    const emEdicao = location.pathname.endsWith("/editar");

    const arquivoInputRef = useRef<HTMLInputElement>(null);

    const chaveStorageFoto = `ourmusic_perfil_foto_${usuario?.idUsuario ?? "padrao"}`;
    const [fotoCustomizada, setFotoCustomizada] = useState<string | null>(() => {
        try {
            return localStorage.getItem(chaveStorageFoto);
        } catch {
            return null;
        }
    });

    const [nomeEditado, setNomeEditado] = useState<string | null>(null);
    const [emailEditado, setEmailEditado] = useState<string | null>(null);
    const [senhaAtual, setSenhaAtual] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState("");

    const nomePadrao = ehAdmin ? "Rafael Costa" : "Ana Costa";
    const emailPadrao = ehAdmin ? "rafael.costa@email.com" : "ana.costa@email.com";

    const nome = nomeEditado ?? usuario?.nome ?? nomePadrao;
    const email = emailEditado ?? usuario?.email ?? emailPadrao;
    const rotuloPerfil = ehAdmin ? "Administrador" : "Usuário";
    const statusAtivo = usuario?.ativo !== false;

    const fotoPadrao = ehAdmin ? perfilAdmin : perfilAnaCosta;
    const fotoExibida = fotoCustomizada || fotoPadrao;

    function selecionarNovaFoto(event: ChangeEvent<HTMLInputElement>) {
        const arquivo = event.target.files?.[0];
        if (!arquivo) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setFotoCustomizada(reader.result);
                try {
                    localStorage.setItem(chaveStorageFoto, reader.result);
                } catch {
                    // Ignora falha de armazenamento local
                }
            }
        };
        reader.readAsDataURL(arquivo);
    }

    function removerFoto() {
        setFotoCustomizada(null);
        try {
            localStorage.removeItem(chaveStorageFoto);
        } catch {
            // Ignora falha de armazenamento local
        }
    }

    function cancelarEdicao() {
        setNomeEditado(null);
        setEmailEditado(null);
        setSenhaAtual("");
        setNovaSenha("");
        setConfirmarSenha("");
        setErro("");
        navigate("/perfil");
    }

    async function salvarPerfil(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!usuario) return;

        setErro("");
        setMensagem("");

        if (novaSenha && novaSenha.length < 8) {
            setErro("A nova senha deve ter no mínimo 8 caracteres.");
            return;
        }

        if (novaSenha && novaSenha !== confirmarSenha) {
            setErro("A confirmação de senha não coincide com a nova senha.");
            return;
        }

        setEnviando(true);
        try {
            await usuarioService.atualizar(usuario.idUsuario, {
                nome: nome.trim(),
                email: email.trim(),
                senha: novaSenha.trim() ? novaSenha : undefined,
            });
            await atualizarUsuario();
            setNomeEditado(null);
            setEmailEditado(null);
            setSenhaAtual("");
            setNovaSenha("");
            setConfirmarSenha("");
            setMensagem("Perfil atualizado com sucesso.");
            navigate("/perfil");
        } catch (error) {
            setErro(getApiErrorMessage(error));
        } finally {
            setEnviando(false);
        }
    }

    const nodeIdRaiz = emEdicao
        ? ehAdmin
            ? "21:894"
            : "21:699"
        : ehAdmin
          ? "21:802"
          : "21:608";

    return (
        <div
            className="om-app-shell"
            data-node-id={nodeIdRaiz}
            data-name={emEdicao ? "Editar meu perfil" : "Meu perfil"}
        >
            <Sidebar
                modo={ehAdmin ? "admin" : "descoberta"}
                itemAtivo="perfil"
            />

            <div className="om-main-area">
                <Header estiloConta={ehAdmin ? "admin" : "usuario"} />

                <main className="om-page-content om-perfil">
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

                    {!emEdicao ? (
                        <>
                            <section
                                className="om-perfil__topo"
                                data-node-id={ehAdmin ? "21:844" : "21:650"}
                            >
                                <div
                                    className="om-perfil__apresentacao"
                                    data-node-id={ehAdmin ? "21:845" : "21:651"}
                                >
                                    <p
                                        className="om-perfil__contexto"
                                        data-node-id={ehAdmin ? "21:846" : "21:652"}
                                    >
                                        SUA CONTA
                                    </p>
                                    <h1
                                        className="om-perfil__titulo"
                                        data-node-id={ehAdmin ? "21:847" : "21:653"}
                                    >
                                        Meu perfil
                                    </h1>
                                    <p
                                        className="om-perfil__subtitulo"
                                        data-node-id={ehAdmin ? "21:848" : "21:654"}
                                    >
                                        Seu espaço na OurMusic. Veja suas informações e
                                        gerencie sua conta.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="om-perfil__btn-primario-topo"
                                    onClick={() => navigate("/perfil/editar")}
                                    data-node-id={ehAdmin ? "21:849" : "21:655"}
                                >
                                    Editar perfil
                                </button>
                            </section>

                            <section
                                className="om-perfil__grade"
                                data-node-id={ehAdmin ? "21:851" : "21:657"}
                            >
                                <aside
                                    className="om-perfil__card-identificacao"
                                    data-node-id={ehAdmin ? "21:852" : "21:658"}
                                >
                                    <div
                                        className="om-perfil__avatar-grande"
                                        data-node-id={ehAdmin ? "21:853" : "21:659"}
                                    >
                                        <img src={fotoExibida} alt={`Foto de perfil de ${nome}`} />
                                    </div>

                                    <h2
                                        className="om-perfil__identificacao-nome"
                                        data-node-id={ehAdmin ? "21:854" : "21:660"}
                                    >
                                        {nome}
                                    </h2>

                                    <span
                                        className="om-perfil__badge-perfil"
                                        data-node-id={ehAdmin ? "21:855" : "21:661"}
                                    >
                                        {rotuloPerfil}
                                    </span>

                                    <p
                                        className="om-perfil__identificacao-email"
                                        data-node-id={ehAdmin ? "21:857" : "21:663"}
                                    >
                                        {email}
                                    </p>

                                    <div
                                        className="om-perfil__divisor"
                                        data-node-id={ehAdmin ? "21:858" : "21:664"}
                                    />

                                    <p
                                        className="om-perfil__status-conta"
                                        data-node-id={ehAdmin ? "21:859" : "21:665"}
                                    >
                                        {statusAtivo ? "Conta ativa" : "Conta inativa"}
                                    </p>

                                    <p
                                        className="om-perfil__desde"
                                        data-node-id={ehAdmin ? "21:860" : "21:666"}
                                    >
                                        Na OurMusic desde novembro de 2026
                                    </p>
                                </aside>

                                <div
                                    className="om-perfil__col-direita"
                                    data-node-id={ehAdmin ? "21:861" : "21:667"}
                                >
                                    <section
                                        className="om-perfil__card"
                                        data-node-id={ehAdmin ? "21:862" : "21:668"}
                                    >
                                        <h2
                                            className="om-perfil__card-titulo"
                                            data-node-id={ehAdmin ? "21:863" : "21:669"}
                                        >
                                            Informações pessoais
                                        </h2>

                                        <div
                                            className="om-perfil__divisor"
                                            data-node-id={ehAdmin ? "21:864" : "21:670"}
                                        />

                                        <div
                                            className="om-perfil__info-dupla"
                                            data-node-id={ehAdmin ? "21:865" : "21:671"}
                                        >
                                            <div className="om-perfil__info-item">
                                                <span className="om-perfil__info-rotulo">
                                                    Nome completo
                                                </span>
                                                <strong className="om-perfil__info-valor">
                                                    {nome}
                                                </strong>
                                            </div>
                                            <div className="om-perfil__info-item">
                                                <span className="om-perfil__info-rotulo">
                                                    E-mail
                                                </span>
                                                <strong className="om-perfil__info-valor">
                                                    {email}
                                                </strong>
                                            </div>
                                        </div>

                                        <div
                                            className="om-perfil__info-dupla"
                                            data-node-id={ehAdmin ? "21:872" : "21:678"}
                                        >
                                            <div className="om-perfil__info-item">
                                                <span className="om-perfil__info-rotulo">
                                                    Perfil de acesso
                                                </span>
                                                <strong className="om-perfil__info-valor">
                                                    {rotuloPerfil}
                                                </strong>
                                            </div>
                                            <div className="om-perfil__info-item">
                                                <span className="om-perfil__info-rotulo">
                                                    Status da conta
                                                </span>
                                                <strong className="om-perfil__info-valor">
                                                    {statusAtivo ? "Ativo" : "Inativo"}
                                                </strong>
                                            </div>
                                        </div>
                                    </section>

                                    <section
                                        className="om-perfil__card om-perfil__card--permissoes"
                                        data-node-id={ehAdmin ? "21:879" : "21:685"}
                                    >
                                        <h2
                                            className="om-perfil__card-titulo"
                                            data-node-id={ehAdmin ? "21:880" : "21:686"}
                                        >
                                            Seu acesso na OurMusic
                                        </h2>

                                        <p
                                            className="om-perfil__permissoes-intro"
                                            data-node-id={ehAdmin ? "21:881" : "21:687"}
                                        >
                                            Com seu perfil de usuário, você pode:
                                        </p>

                                        <div
                                            className="om-perfil__permissoes-lista"
                                            data-node-id={ehAdmin ? "21:882" : "21:688"}
                                        >
                                            {ehAdmin ? (
                                                <>
                                                    <p>
                                                        {
                                                            "•  Explorar o catálogo e pesquisar por título ou gênero."
                                                        }
                                                    </p>
                                                    <p>
                                                        {
                                                            "•  Cadastrar músicas e excluir musicas da plataforma."
                                                        }
                                                    </p>
                                                    <p>
                                                        {
                                                            "•  Cadastrar generos e editar generos da plataforma."
                                                        }
                                                    </p>
                                                    <p>
                                                        {
                                                            "•  Excluir, Consultar e editar perfis da plataforma."
                                                        }
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <p>
                                                        {
                                                            "•  Explorar o catálogo e pesquisar por título ou gênero."
                                                        }
                                                    </p>
                                                    <p>
                                                        {
                                                            "•  Cadastrar músicas e excluir apenas as suas."
                                                        }
                                                    </p>
                                                    <p>
                                                        {"•  Consultar e editar seu próprio perfil."}
                                                    </p>
                                                </>
                                            )}
                                        </div>

                                        <div
                                            className="om-perfil__divisor"
                                            data-node-id={ehAdmin ? "21:883" : "21:689"}
                                        />

                                        {!ehAdmin ? (
                                            <p
                                                className="om-perfil__permissoes-rodape"
                                                data-node-id="21:690"
                                            >
                                                Seu perfil de acesso é definido pela administração.
                                            </p>
                                        ) : null}
                                    </section>
                                </div>
                            </section>

                            <section
                                className="om-perfil__seguranca-banner"
                                data-node-id={ehAdmin ? "21:885" : "21:691"}
                            >
                                <div
                                    className="om-perfil__seguranca-textos"
                                    data-node-id={ehAdmin ? "21:886" : "21:692"}
                                >
                                    <h3 data-node-id={ehAdmin ? "21:887" : "21:693"}>
                                        Sua conta, sob seu controle.
                                    </h3>
                                    <p data-node-id={ehAdmin ? "21:888" : "21:694"}>
                                        Para atualizar sua foto, seus dados ou sua senha, acesse a
                                        edição do perfil.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="om-perfil__btn-editar-banner"
                                    onClick={() => navigate("/perfil/editar")}
                                    data-node-id={ehAdmin ? "21:889" : "21:695"}
                                >
                                    Editar meu perfil
                                </button>
                            </section>

                            {!ehAdmin ? (
                                <p className="om-perfil__rodape-aviso" data-node-id="21:697">
                                    Seus dados de acesso ficam disponíveis apenas para você e a
                                    administração.
                                </p>
                            ) : null}
                        </>
                    ) : (
                        <form
                            className="om-perfil__edicao-form"
                            onSubmit={salvarPerfil}
                            data-node-id={ehAdmin ? "21:935" : "21:740"}
                        >
                            <div
                                className="om-perfil__edicao-cabecalho"
                                data-node-id={ehAdmin ? "21:936" : "21:741"}
                            >
                                <Link
                                    to="/perfil"
                                    className="om-perfil__voltar"
                                    data-node-id={ehAdmin ? "21:937" : "21:742"}
                                >
                                    <img src={arrowLeft} alt="" />
                                    <span data-node-id={ehAdmin ? "21:940" : "21:745"}>
                                        Voltar para meu perfil
                                    </span>
                                </Link>

                                <h1
                                    className="om-perfil__titulo"
                                    data-node-id={ehAdmin ? "21:941" : "21:746"}
                                >
                                    Editar meu perfil
                                </h1>

                                <p
                                    className="om-perfil__subtitulo"
                                    data-node-id={ehAdmin ? "21:942" : "21:747"}
                                >
                                    Mantenha seus dados atualizados e sua conta segura.
                                </p>
                            </div>

                            <div
                                className="om-perfil__grade"
                                data-node-id={ehAdmin ? "21:943" : "21:748"}
                            >
                                <aside
                                    className="om-perfil__col-esquerda-edicao"
                                    data-node-id={ehAdmin ? "21:944" : "21:749"}
                                >
                                    <div
                                        className="om-perfil__card"
                                        data-node-id={ehAdmin ? "21:945" : "21:750"}
                                    >
                                        <h2
                                            className="om-perfil__card-titulo"
                                            data-node-id={ehAdmin ? "21:946" : "21:751"}
                                        >
                                            Foto de perfil
                                        </h2>

                                        <div
                                            className="om-perfil__retrato-bloco"
                                            data-node-id={ehAdmin ? "21:947" : "21:752"}
                                        >
                                            <div
                                                className="om-perfil__avatar-grande"
                                                data-node-id={ehAdmin ? "21:1019" : "21:753"}
                                            >
                                                <img
                                                    src={fotoExibida}
                                                    alt={`Foto de perfil de ${nome}`}
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                className="om-perfil__btn-alterar-foto"
                                                onClick={() => arquivoInputRef.current?.click()}
                                                data-node-id={ehAdmin ? "21:949" : "21:754"}
                                            >
                                                Alterar foto
                                            </button>

                                            <button
                                                type="button"
                                                className="om-perfil__btn-remover-foto"
                                                onClick={removerFoto}
                                                data-node-id={ehAdmin ? "21:951" : "21:756"}
                                            >
                                                Remover foto
                                            </button>

                                            <input
                                                ref={arquivoInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png,image/*"
                                                className="visually-hidden"
                                                onChange={selecionarNovaFoto}
                                            />
                                        </div>

                                        <div
                                            className="om-perfil__foto-ajuda"
                                            data-node-id={ehAdmin ? "21:952" : "21:757"}
                                        >
                                            <p>JPG ou PNG de até 5 MB.</p>
                                            <p>Recomendado: 400 × 400 px.</p>
                                        </div>
                                    </div>

                                    <div
                                        className="om-perfil__card"
                                        data-node-id={ehAdmin ? "21:953" : "21:758"}
                                    >
                                        <h2
                                            className="om-perfil__card-titulo-menor"
                                            data-node-id={ehAdmin ? "21:954" : "21:759"}
                                        >
                                            Seu perfil de acesso
                                        </h2>

                                        <p
                                            className="om-perfil__acesso-resumo"
                                            data-node-id={ehAdmin ? "21:955" : "21:760"}
                                        >
                                            {rotuloPerfil} ·{" "}
                                            {statusAtivo ? "Conta ativa" : "Conta inativa"}
                                        </p>

                                        <p
                                            className="om-perfil__acesso-aviso"
                                            data-node-id={ehAdmin ? "21:956" : "21:761"}
                                        >
                                            Apenas a administração pode alterar seu perfil de
                                            acesso ou o status da conta.
                                        </p>
                                    </div>
                                </aside>

                                <div
                                    className="om-perfil__col-direita"
                                    data-node-id={ehAdmin ? "21:957" : "21:762"}
                                >
                                    <section
                                        className="om-perfil__card"
                                        data-node-id={ehAdmin ? "21:958" : "21:763"}
                                    >
                                        <div
                                            className="om-perfil__grupo-topo"
                                            data-node-id={ehAdmin ? "21:959" : "21:764"}
                                        >
                                            <h2 className="om-perfil__card-titulo">
                                                Dados pessoais
                                            </h2>
                                            <span>* Campos obrigatórios</span>
                                        </div>

                                        <div
                                            className="om-perfil__campo"
                                            data-node-id={ehAdmin ? "21:962" : "21:767"}
                                        >
                                            <label htmlFor="perfil-nome">
                                                Nome completo *
                                            </label>
                                            <Campo
                                                id="perfil-nome"
                                                value={nome}
                                                onChange={(e) => setNomeEditado(e.target.value)}
                                                placeholder={nomePadrao}
                                                maxLength={100}
                                                required
                                            />
                                        </div>

                                        <div
                                            className="om-perfil__campo"
                                            data-node-id={ehAdmin ? "21:966" : "21:771"}
                                        >
                                            <label htmlFor="perfil-email">E-mail *</label>
                                            <Campo
                                                id="perfil-email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmailEditado(e.target.value)}
                                                placeholder={emailPadrao}
                                                maxLength={50}
                                                required
                                            />
                                            <span
                                                className="om-perfil__ajuda"
                                                data-node-id={ehAdmin ? "21:970" : "21:775"}
                                            >
                                                Use um endereço de e-mail único ao qual você tenha
                                                acesso.
                                            </span>
                                        </div>
                                    </section>

                                    <section
                                        className="om-perfil__card"
                                        data-node-id={ehAdmin ? "21:971" : "21:776"}
                                    >
                                        <h2
                                            className="om-perfil__card-titulo"
                                            data-node-id={ehAdmin ? "21:973" : "21:778"}
                                        >
                                            Alterar senha
                                        </h2>

                                        <p
                                            className="om-perfil__senha-sub"
                                            data-node-id={ehAdmin ? "21:974" : "21:779"}
                                        >
                                            Preencha apenas se quiser trocar sua senha.
                                        </p>

                                        <div
                                            className="om-perfil__campo"
                                            data-node-id={ehAdmin ? "21:975" : "21:780"}
                                        >
                                            <label htmlFor="perfil-senha-atual">
                                                Senha atual
                                            </label>
                                            <Campo
                                                id="perfil-senha-atual"
                                                type="password"
                                                value={senhaAtual}
                                                onChange={(e) => setSenhaAtual(e.target.value)}
                                                placeholder="Digite sua senha atual"
                                            />
                                        </div>

                                        <div
                                            className="om-perfil__linha-dupla"
                                            data-node-id={ehAdmin ? "21:979" : "21:784"}
                                        >
                                            <div className="om-perfil__campo">
                                                <label htmlFor="perfil-nova-senha">
                                                    Nova senha
                                                </label>
                                                <Campo
                                                    id="perfil-nova-senha"
                                                    type="password"
                                                    value={novaSenha}
                                                    onChange={(e) => setNovaSenha(e.target.value)}
                                                    placeholder="Crie uma nova senha"
                                                    minLength={8}
                                                />
                                            </div>

                                            <div className="om-perfil__campo">
                                                <label htmlFor="perfil-confirmar-senha">
                                                    Confirmar nova senha
                                                </label>
                                                <Campo
                                                    id="perfil-confirmar-senha"
                                                    type="password"
                                                    value={confirmarSenha}
                                                    onChange={(e) =>
                                                        setConfirmarSenha(e.target.value)
                                                    }
                                                    placeholder="Repita a nova senha"
                                                />
                                            </div>
                                        </div>

                                        <p
                                            className="om-perfil__ajuda"
                                            data-node-id={ehAdmin ? "21:988" : "21:793"}
                                        >
                                            Use no mínimo 8 caracteres, com letras e números.
                                        </p>
                                    </section>
                                </div>
                            </div>

                            <div
                                className="om-perfil__divisor"
                                data-node-id={ehAdmin ? "21:989" : "21:794"}
                            />

                            <div
                                className="om-perfil__edicao-acoes"
                                data-node-id={ehAdmin ? "21:990" : "21:795"}
                            >
                                <p
                                    className="om-perfil__edicao-acoes-texto"
                                    data-node-id={ehAdmin ? "21:991" : "21:796"}
                                >
                                    As alterações serão aplicadas ao seu próprio perfil.
                                </p>

                                <button
                                    type="button"
                                    className="om-perfil__btn-cancelar"
                                    onClick={cancelarEdicao}
                                    disabled={enviando}
                                    data-node-id={ehAdmin ? "21:992" : "21:797"}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="om-perfil__btn-salvar"
                                    disabled={enviando}
                                    data-node-id={ehAdmin ? "21:994" : "21:799"}
                                >
                                    {enviando ? "Salvando..." : "Salvar alterações"}
                                </button>
                            </div>
                        </form>
                    )}
                </main>
            </div>
        </div>
    );
}

export default MeuPerfil;
