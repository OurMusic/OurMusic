using OurMusic.WebAPI.Models;

namespace OurMusic.WebAPI.DTO;

public record ComentarioRespostaDTO(
    int IdComentario,
    string Texto,
    DateTime DataComentario,
    int IdMusica,
    int IdUsuario,
    string? NomeUsuario)
{
    public static ComentarioRespostaDTO Converter(Comentario comentario) => new(
        comentario.IdComentario,
        comentario.Texto,
        comentario.DataComentario,
        comentario.IdMusica,
        comentario.IdUsuario,
        comentario.IdUsuarioNavigation?.Nome);
}
