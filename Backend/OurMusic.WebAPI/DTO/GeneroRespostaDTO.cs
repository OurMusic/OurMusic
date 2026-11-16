using OurMusic.WebAPI.Models;

namespace OurMusic.WebAPI.DTO;

public record GeneroRespostaDTO(int IdGenero, string Nome)
{
    public static GeneroRespostaDTO Converter(Genero genero) => new(genero.IdGenero, genero.Nome);
}
