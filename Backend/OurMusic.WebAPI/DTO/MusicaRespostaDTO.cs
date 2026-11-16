using OurMusic.WebAPI.Models;

namespace OurMusic.WebAPI.DTO;

/// <summary>Detalhes completos de uma música (inclui a letra, o autor do cadastro, gêneros e comentários).</summary>
public record MusicaRespostaDTO(
    int IdMusica,
    string Titulo,
    string Artista,
    string? Letra,
    DateOnly DataLancamento,
    int Duracao,
    string? ImagemCapa,
    int IdUsuario,
    List<GeneroRespostaDTO> Generos,
    List<ComentarioRespostaDTO> Comentarios)
{
    public static MusicaRespostaDTO Converter(Musica musica) => new(
        musica.IdMusica,
        musica.Titulo,
        musica.Artista,
        musica.Letra,
        musica.DataLancamento,
        musica.Duracao,
        musica.ImagemCapa,
        musica.IdUsuario,
        musica.IdGenero.OrderBy(g => g.Nome).Select(GeneroRespostaDTO.Converter).ToList(),
        musica.Comentario.OrderByDescending(c => c.DataComentario).Select(ComentarioRespostaDTO.Converter).ToList());
}

/// <summary>Versão resumida (sem letra) usada nas listagens do catálogo.</summary>
public record MusicaResumoDTO(
    int IdMusica,
    string Titulo,
    string Artista,
    DateOnly DataLancamento,
    int Duracao,
    string? ImagemCapa,
    int IdUsuario,
    List<GeneroRespostaDTO> Generos)
{
    public static MusicaResumoDTO Converter(Musica musica) => new(
        musica.IdMusica,
        musica.Titulo,
        musica.Artista,
        musica.DataLancamento,
        musica.Duracao,
        musica.ImagemCapa,
        musica.IdUsuario,
        musica.IdGenero.OrderBy(g => g.Nome).Select(GeneroRespostaDTO.Converter).ToList());
}
