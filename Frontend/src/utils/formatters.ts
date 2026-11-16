import capa1 from "../assets/capa-1.png";
import capa2 from "../assets/capa-2.png";
import capa3 from "../assets/capa-3.png";
import capa4 from "../assets/capa-4.png";
import capa5 from "../assets/capa-5.png";
import capa6 from "../assets/capa-6.png";

export const CAPAS_PADRAO = [capa1, capa2, capa3, capa4, capa5, capa6];

export function obterCapaMusica(imagemCapa?: string | null, indiceOuId = 0): string {
    if (imagemCapa && imagemCapa.trim()) {
        return imagemCapa.trim();
    }
    const idx = Math.abs(indiceOuId) % CAPAS_PADRAO.length;
    return CAPAS_PADRAO[idx];
}

export function formatarDuracao(segundos: number, comZeroInicial = true): string {
    if (!Number.isFinite(segundos) || segundos <= 0) return comZeroInicial ? "00:00" : "0:00";
    const mins = Math.floor(segundos / 60);
    const secs = Math.floor(segundos % 60);
    const minStr = comZeroInicial ? String(mins).padStart(2, "0") : String(mins);
    const secStr = String(secs).padStart(2, "0");
    return `${minStr}:${secStr}`;
}

export function formatarDataBr(valor?: string | null): string {
    if (!valor) return "—";
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor);
    if (match) {
        return `${match[3]}/${match[2]}/${match[1]}`;
    }
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return valor;
    return new Intl.DateTimeFormat("pt-BR").format(data);
}

export function obterAnoLancamento(valor?: string | null): string {
    if (!valor) return "2025";
    const match = /^(\d{4})/.exec(valor);
    if (match) return match[1];
    const data = new Date(valor);
    return Number.isNaN(data.getTime()) ? "2025" : String(data.getFullYear());
}

export function obterIniciais(nome?: string | null): string {
    if (!nome || !nome.trim()) return "OM";
    const partes = nome.trim().split(/\s+/);
    if (partes.length === 1) {
        return partes[0].slice(0, 2).toUpperCase();
    }
    return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

export function obterPrimeiroNome(nome?: string | null): string {
    if (!nome || !nome.trim()) return "Ouvinte";
    return nome.trim().split(/\s+/)[0];
}
