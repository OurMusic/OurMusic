using OurMusic.WebAPI.Models;

namespace OurMusic.WebAPI.Interfaces;

public interface IComentarioRepository
{
    Task Cadastrar(Comentario comentario);
    Task Atualizar(int id, string texto);
    Task Excluir(int id);
    Task<Comentario?> BuscarPorId(int id);
    Task<List<Comentario>> ListarPorMusica(int idMusica);
}
