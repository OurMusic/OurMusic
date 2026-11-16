import "./ModalConfirmacao.css";
import iconeTrashModal from "../../assets/icons/trash-2-modal.svg";
import iconeTrashBtn from "../../assets/icons/trash-2-btn.svg";
import iconeX from "../../assets/icons/x.svg";
import iconeAlerta from "../../assets/icons/triangle-alert.svg";
import capaPadrao from "../../assets/capa-1.png";

interface ModalConfirmacaoProps {
    show: boolean;
    titulo: string;
    mensagem: string;
    itemTitulo?: string;
    itemSubtitulo?: string;
    itemImagem?: string | null;
    avisoPermanente?: string;
    textoConfirmar?: string;
    textoCancelar?: string;
    enviando?: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

function ModalConfirmacao({
    show,
    titulo,
    mensagem,
    itemTitulo,
    itemSubtitulo,
    itemImagem,
    avisoPermanente = "Esta ação é permanente e não pode ser desfeita.",
    textoConfirmar = "Sim, excluir música",
    textoCancelar = "Cancelar",
    enviando = false,
    onClose,
    onConfirm,
}: ModalConfirmacaoProps) {
    if (!show) {
        return null;
    }

    return (
        <div
            className="om-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="om-modal-title"
            onClick={(e) => {
                if (e.target === e.currentTarget && !enviando) onClose();
            }}
        >
            <div className="om-modal-card" data-node-id="2:7303">
                <div className="om-modal-header">
                    <div className="om-modal-alert-badge">
                        <img src={iconeTrashModal} alt="" />
                    </div>
                    <button
                        type="button"
                        className="om-modal-close"
                        aria-label="Fechar"
                        onClick={onClose}
                        disabled={enviando}
                    >
                        <img src={iconeX} alt="" />
                    </button>
                </div>

                <div className="om-modal-aviso">
                    <h2 id="om-modal-title" className="om-modal-titulo">
                        {titulo}
                    </h2>
                    <p className="om-modal-consequencia">{mensagem}</p>
                </div>

                {itemTitulo ? (
                    <div className="om-modal-item">
                        <div className="om-modal-item-capa">
                            <img src={itemImagem || capaPadrao} alt={itemTitulo} />
                        </div>
                        <div className="om-modal-item-info">
                            <p className="om-modal-item-titulo">{itemTitulo}</p>
                            {itemSubtitulo ? (
                                <p className="om-modal-item-subtitulo">{itemSubtitulo}</p>
                            ) : null}
                        </div>
                    </div>
                ) : null}

                {avisoPermanente ? (
                    <div className="om-modal-permanente">
                        <img src={iconeAlerta} alt="" />
                        <span>{avisoPermanente}</span>
                    </div>
                ) : null}

                <div className="om-modal-decisao">
                    <button
                        type="button"
                        className="om-modal-btn-cancelar"
                        onClick={onClose}
                        disabled={enviando}
                    >
                        {textoCancelar}
                    </button>
                    <button
                        type="button"
                        className="om-modal-btn-confirmar"
                        onClick={onConfirm}
                        disabled={enviando}
                    >
                        <img src={iconeTrashBtn} alt="" />
                        <span>{textoConfirmar}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalConfirmacao;
