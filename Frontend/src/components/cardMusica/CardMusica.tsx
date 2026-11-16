import { Link } from "react-router-dom";
import arrowUpRightLight from "../../assets/icons/arrow-up-right-light.svg";
import { obterCapaMusica } from "../../utils/formatters";
import "./CardMusica.css";

interface CardMusicaProps {
    id: number;
    titulo: string;
    artista: string;
    metadados: string;
    imagem?: string | null;
    indice?: number;
}

function CardMusica({ id, titulo, artista, metadados, imagem, indice = 0 }: CardMusicaProps) {
    const capa = obterCapaMusica(imagem, indice || id);

    return (
        <Link to={`/musicas/${id}`} className="card-musica" data-name="Música">
            <div className="card-musica__arte">
                <img
                    className="card-musica__capa"
                    src={capa}
                    alt={`Capa da música ${titulo}`}
                />
                <span className="card-musica__abrir" aria-label={`Ver detalhes de ${titulo}`}>
                    <img src={arrowUpRightLight} alt="" />
                </span>
            </div>
            <div className="card-musica__info">
                <h3 className="card-musica__titulo">{titulo}</h3>
                <p className="card-musica__artista">{artista}</p>
                <p className="card-musica__metadados">{metadados}</p>
            </div>
        </Link>
    );
}

export default CardMusica;
