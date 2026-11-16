using Microsoft.EntityFrameworkCore;
using OurMusic.WebAPI.BdContextEvent;
using OurMusic.WebAPI.Interfaces;
using OurMusic.WebAPI.Models;

namespace OurMusic.WebAPI.Repositories;

public class ComentarioRepository : IComentarioRepository
{
    private readonly OurMusicContext _context;

    public ComentarioRepository(OurMusicContext context)
    {
        _context = context;
    }

    public async Task Atualizar(int id, string texto)
    {
        var existente = await _context.Comentario.FindAsync(id);
        if (existente != null)
        {
            existente.Texto = texto;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<Comentario?> BuscarPorId(int id)
    {
        return await _context.Comentario
            .AsNoTracking()
            .Include(c => c.IdUsuarioNavigation)
            .Include(c => c.IdMusicaNavigation)
            .FirstOrDefaultAsync(c => c.IdComentario == id);
    }

    public async Task Cadastrar(Comentario comentario)
    {
        comentario.DataComentario = DateTime.Now;
        await _context.Comentario.AddAsync(comentario);
        await _context.SaveChangesAsync();
    }

    public async Task Excluir(int id)
    {
        var comentario = await _context.Comentario.FindAsync(id);
        if (comentario != null)
        {
            _context.Comentario.Remove(comentario);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<List<Comentario>> ListarPorMusica(int idMusica)
    {
        return await _context.Comentario
            .AsNoTracking()
            .Include(c => c.IdUsuarioNavigation)
            .Where(c => c.IdMusica == idMusica)
            .OrderByDescending(c => c.DataComentario)
            .ToListAsync();
    }
}
