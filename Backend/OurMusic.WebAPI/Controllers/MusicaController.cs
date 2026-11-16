using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OurMusic.WebAPI.DTO;
using OurMusic.WebAPI.Interfaces;
using OurMusic.WebAPI.Models;
using OurMusic.WebAPI.Services;

namespace OurMusic.WebAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class MusicaController : ControllerBase
{
    private readonly IMusicaRepository _musicaRepository;
    private readonly IGeneroRepository _generoRepository;
    private readonly IImageService _imageService;

    public MusicaController(IMusicaRepository musicaRepository, IGeneroRepository generoRepository, IImageService imageService)
    {
        _musicaRepository = musicaRepository;
        _generoRepository = generoRepository;
        _imageService = imageService;
    }

    /// <summary>
    /// RF03/RF04/RF05 - Lista as músicas do catálogo com paginação, busca por título e filtro por gênero.
    /// </summary>
    /// <param name="busca">Trecho do título da música.</param>
    /// <param name="idGenero">Filtra as músicas que pertencem ao gênero informado.</param>
    [HttpGet]
    public async Task<IActionResult> Lista([FromQuery] int pagina = 1, [FromQuery] int tamanhoPagina = 10, [FromQuery] string? busca = null, [FromQuery] int? idGenero = null)
    {
        if (pagina < 1 || tamanhoPagina is < 1 or > 100)
            return BadRequest("Página deve ser positiva e o tamanhoPagina deve estar entre 1 e 100.");

        var (musicas, total) = await _musicaRepository.ListarPaginado(pagina, tamanhoPagina, busca, idGenero);
        var items = musicas.Select(MusicaResumoDTO.Converter);
        return Ok(new { items, total, pagina, tamanhoPagina });
    }

    /// <summary>
    /// RF06 - Detalhes de uma música (inclui a letra).
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        var musica = await _musicaRepository.BuscarPorId(id);
        return musica is null ? NotFound("Música não encontrada.") : Ok(MusicaRespostaDTO.Converter(musica));
    }

    /// <summary>
    /// RF08 - Cadastra uma música (somente administrador - RN02).
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(11 * 1024 * 1024)]
    public async Task<IActionResult> Cadastrar([FromForm] MusicaDTO dto)
    {
        var generos = await BuscarGeneros(dto.IdGeneros);
        if (generos is null) return BadRequest("Um ou mais IDs de gênero não existem.");

        if (dto.ArquivoImagem is not null && !_imageService.IsConfigured)
            return Problem("Configure as credenciais do Cloudinary para enviar imagens.", statusCode: 503);

        string? novaUrl = null;
        try
        {
            if (dto.ArquivoImagem is not null)
                novaUrl = await _imageService.UploadImageAsync(dto.ArquivoImagem, ImageFolder.Musicas);
        }
        catch (ArgumentException erro) { return BadRequest(erro.Message); }
        catch (HttpRequestException) { return Problem("Falha ao enviar a capa ao Cloudinary.", statusCode: 502); }

        var imagem = string.IsNullOrWhiteSpace(dto.ImagemCapa) ? null : dto.ImagemCapa;

        var musica = Converter(dto, generos, novaUrl ?? imagem);

        try
        {
            await _musicaRepository.Cadastrar(musica);
        }
        catch
        {
            if (novaUrl is not null) await _imageService.DeleteImageAsync(novaUrl);
            throw;
        }

        return CreatedAtAction(nameof(BuscarPorId), new { id = musica.IdMusica }, MusicaRespostaDTO.Converter(musica));
    }

    /// <summary>
    /// RF09 - Edita uma música (somente administrador - RN02).
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(11 * 1024 * 1024)]
    public async Task<IActionResult> Atualizar(int id, [FromForm] MusicaDTO dto)
    {
        var atual = await _musicaRepository.BuscarPorId(id);
        if (atual is null) return NotFound("Música não encontrada.");

        var generos = await BuscarGeneros(dto.IdGeneros);
        if (generos is null) return BadRequest("Um ou mais IDs de gênero não existem.");

        if (dto.ArquivoImagem is not null && !_imageService.IsConfigured)
            return Problem("Configure as credenciais do Cloudinary para enviar imagens.", statusCode: 503);

        string? novaUrl = null;
        try
        {
            if (dto.ArquivoImagem is not null)
                novaUrl = await _imageService.UploadImageAsync(dto.ArquivoImagem, ImageFolder.Musicas);
        }
        catch (ArgumentException erro) { return BadRequest(erro.Message); }
        catch (HttpRequestException) { return Problem("Falha ao enviar a capa ao Cloudinary.", statusCode: 502); }

        // Sem nova imagem informada, mantém a capa atual.
        var imagem = novaUrl ?? (string.IsNullOrWhiteSpace(dto.ImagemCapa) ? atual.ImagemCapa : dto.ImagemCapa);

        try
        {
            await _musicaRepository.Atualizar(id, Converter(dto, generos, imagem));
        }
        catch
        {
            if (novaUrl is not null) await _imageService.DeleteImageAsync(novaUrl);
            throw;
        }

        if (!string.IsNullOrWhiteSpace(atual.ImagemCapa) && atual.ImagemCapa != imagem)
            await _imageService.DeleteImageAsync(atual.ImagemCapa);

        return NoContent();
    }

    /// <summary>
    /// RF10 - Exclui uma música do catálogo (somente administrador - RN02).
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Excluir(int id)
    {
        var musica = await _musicaRepository.BuscarPorId(id);
        if (musica is null) return NotFound("Música não encontrada.");

        await _musicaRepository.Excluir(id);

        if (!string.IsNullOrWhiteSpace(musica.ImagemCapa))
            await _imageService.DeleteImageAsync(musica.ImagemCapa);

        return NoContent();
    }

    private async Task<List<Genero>?> BuscarGeneros(List<int> ids)
    {
        var distintos = ids.Distinct().ToArray();
        if (distintos.Length == 0) return null;

        var generos = await _generoRepository.BuscarPorIds(distintos);
        return generos.Count == distintos.Length ? generos : null;
    }

    private static Musica Converter(MusicaDTO dto, List<Genero> generos, string? imagemCapa) => new()
    {
        Titulo = dto.Titulo.Trim(),
        Artista = dto.Artista.Trim(),
        Letra = dto.Letra,
        DataLancamento = dto.DataLancamento!.Value,
        Duracao = dto.Duracao,
        ImagemCapa = imagemCapa,
        Comentario = dto.Comentario,
        IdGenero = generos
    };
}
