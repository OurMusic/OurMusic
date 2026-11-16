import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Botao.css";

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    texto?: string;
    icone?: string;
    variante?: "primario" | "secundario" | "perigo" | "fantasma";
    className?: string;
    children?: ReactNode;
}

function Botao({
    texto,
    icone,
    variante = "primario",
    onClick,
    type = "button",
    className = "",
    children,
    ...props
}: BotaoProps) {
    const classes = ["botao", `botao--${variante}`, className].filter(Boolean).join(" ");

    return (
        <button className={classes} onClick={onClick} type={type} {...props}>
            {icone ? (
                <span className="botao__icone" aria-hidden="true">
                    <img src={icone} alt="" />
                </span>
            ) : null}
            {children ?? (texto ? <span>{texto}</span> : "Clique aqui")}
        </button>
    );
}

export default Botao;
