using Microsoft.EntityFrameworkCore;
using OurMusic.WebAPI.BdContextEvent;
using OurMusic.WebAPI.Interfaces;
using OurMusic.WebAPI.Models;

namespace OurMusic.WebAPI.Repositories;

public class MusicaRepository : IMusicaRepository
{
    private readonly OurMusicContext _context;

    public MusicaRepository(OurMusicContext context)
    {
        _context = context;
    }

    public async Task Atualizar(int id, Musica musica)
    {
        var musicaExistente = await _context.Musica.Include(m => m.IdGenero).FirstOrDefaultAsync(m => m.IdMusica == id);

        if (musicaExistente != null)
        {
            musicaExistente.Titulo = musica.Titulo;
            musicaExistente.Artista = musica.Artista;
            musicaExistente.Letra = musica.Letra;
            musicaExistente.DataLancamento = musica.DataLancamento;
            musicaExistente.Duracao = musica.Duracao;
            musicaExistente.ImagemCapa = musica.ImagemCapa;

            musicaExistente.IdGenero.Clear();
            foreach (var genero in musica.IdGenero)
                musicaExistente.IdGenero.Add(genero);

            await _context.SaveChangesAsync();
        }
    }

    public async Task<Musica?> BuscarPorId(int id)
    {
        return await _context.Musica
            .AsNoTracking()
            .Include(m => m.IdGenero)
            .Include(m => m.Comentario)
                .ThenInclude(c => c.IdUsuarioNavigation)
            .FirstOrDefaultAsync(m => m.IdMusica == id);
    }

    public async Task Cadastrar(Musica musica)
    {
        await _context.Musica.AddAsync(musica);
        await _context.SaveChangesAsync();
    }

    public async Task Excluir(int id)
    {
        // Os gêneros são carregados para que o EF remova também as linhas de MusicaGenero.
        var musicaBuscada = await _context.Musica.Include(m => m.IdGenero).FirstOrDefaultAsync(m => m.IdMusica == id);
        if (musicaBuscada != null)
        {
            musicaBuscada.IdGenero.Clear();
            _context.Musica.Remove(musicaBuscada);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<(List<Musica> musicas, int total)> ListarPaginado(int pagina = 1, int tamanhoPagina = 10, string? busca = null, int? idGenero = null, int? idUsuario = null)
    {
        var query = _context.Musica.AsNoTracking().Include(m => m.IdGenero).AsQueryable();

        if (!string.IsNullOrWhiteSpace(busca))
        {
            var termo = busca.Trim();
            query = query.Where(m => m.Titulo.Contains(termo));
        }

        if (idGenero is not null)
        {
            query = query.Where(m => m.IdGenero.Any(g => g.IdGenero == idGenero));
        }

        if (idUsuario is not null)
        {
            query = query.Where(m => m.IdUsuario == idUsuario);
        }

        int total = await query.CountAsync();

        var musicas = await query
            .OrderBy(m => m.Titulo).ThenBy(m => m.IdMusica)
            .Skip((pagina - 1) * tamanhoPagina)
            .Take(tamanhoPagina)
            .ToListAsync();

        return (musicas, total);
    }
}
