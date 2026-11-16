using OurMusic.WebAPI.Models;

namespace OurMusic.WebAPI.Interfaces;

public interface IUsuarioRepository
{
    Task Cadastrar(Usuario usuario);
    Task Atualizar(int id, Usuario usuario);
    /// <summary>Desativa o usuário (soft delete - RF15).</summary>
    Task Desativar(int id);
    Task<Usuario?> BuscarPorId(int id);
    Task<List<Usuario>> Listar();
    Task<Usuario?> BuscarPorEmailESenha(string email, string senha);
}
