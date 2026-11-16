const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Extrai o ID do vídeo do YouTube a partir de URLs do YouTube, YouTube Music, youtu.be ou embed.
 */
export function extrairYouTubeId(url?: string | null): string | null {
    if (!url || !url.trim()) return null;

    const limpa = url.trim();
    if (YOUTUBE_ID_REGEX.test(limpa)) return limpa;

    try {
        const parsed = new URL(limpa);
        const host = parsed.hostname.toLowerCase();
        const ehYouTube =
            host === "youtu.be" ||
            host.endsWith(".youtu.be") ||
            host === "youtube.com" ||
            host.endsWith(".youtube.com");

        if (!ehYouTube) return null;

        if (host === "youtu.be" || host.endsWith(".youtu.be")) {
            const candidato = parsed.pathname.replace(/^\/+/, "").split("/")[0] || "";
            return YOUTUBE_ID_REGEX.test(candidato) ? candidato : null;
        }

        const paramV = parsed.searchParams.get("v");
        if (paramV && YOUTUBE_ID_REGEX.test(paramV)) return paramV;

        const segmentos = parsed.pathname.split("/").filter(Boolean);
        if (
            segmentos.length >= 2 &&
            ["embed", "shorts", "live", "v"].includes(segmentos[0]) &&
            YOUTUBE_ID_REGEX.test(segmentos[1])
        ) {
            return segmentos[1];
        }

        return null;
    } catch {
        return null;
    }
}
