using Microsoft.EntityFrameworkCore;
using OurMusic.WebAPI.BdContextEvent;
using OurMusic.WebAPI.Interfaces;
using OurMusic.WebAPI.Models;
using OurMusic.WebAPI.Utils;

namespace OurMusic.WebAPI.Repositories;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly OurMusicContext _context;

    public UsuarioRepository(OurMusicContext context)
    {
        _context = context;
    }

    public async Task Atualizar(int id, Usuario usuario)
    {
        var usuarioExistente = await _context.Usuario.FindAsync(id);
        if (usuarioExistente != null)
        {
            usuarioExistente.Nome = usuario.Nome;
            usuarioExistente.Email = usuario.Email;
            usuarioExistente.TipoUsuario = usuario.TipoUsuario;
            usuarioExistente.Ativo = usuario.Ativo;
            if (!string.IsNullOrEmpty(usuario.Senha))
            {
                usuarioExistente.Senha = Criptografia.GerarHash(usuario.Senha);
            }
            await _context.SaveChangesAsync();
        }
    }

    public async Task<Usuario?> BuscarPorEmailESenha(string email, string senha)
    {
        var usuarioBuscado = await _context.Usuario.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email);

        if (usuarioBuscado == null)
        {
            return null;
        }

        if (Criptografia.CompararHash(senha, usuarioBuscado.Senha))
        {
            return usuarioBuscado;
        }

        // Usuários criados pelo script SQL (SHA-256) são migrados para BCrypt no primeiro login válido.
        if (Criptografia.CompararHashLegado(senha, usuarioBuscado.Senha))
        {
            var novoHash = Criptografia.GerarHash(senha);
            await _context.Usuario
                .Where(u => u.IdUsuario == usuarioBuscado.IdUsuario)
                .ExecuteUpdateAsync(s => s.SetProperty(u => u.Senha, novoHash));
            usuarioBuscado.Senha = novoHash;
            return usuarioBuscado;
        }

        return null;
    }

    public async Task<Usuario?> BuscarPorId(int id)
    {
        return await _context.Usuario.AsNoTracking().FirstOrDefaultAsync(u => u.IdUsuario == id);
    }

    public async Task Cadastrar(Usuario usuario)
    {
        usuario.Senha = Criptografia.GerarHash(usuario.Senha);

        await _context.Usuario.AddAsync(usuario);
        await _context.SaveChangesAsync();
    }

    public async Task Desativar(int id)
    {
        await _context.Usuario
            .Where(u => u.IdUsuario == id)
            .ExecuteUpdateAsync(s => s.SetProperty(u => u.Ativo, false));
    }

    public async Task<List<Usuario>> Listar()
    {
        return await _context.Usuario.AsNoTracking().OrderBy(u => u.Nome).ToListAsync();
    }
}
