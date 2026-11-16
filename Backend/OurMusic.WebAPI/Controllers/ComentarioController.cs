using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OurMusic.WebAPI.DTO;
using OurMusic.WebAPI.Interfaces;
using OurMusic.WebAPI.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace OurMusic.WebAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ComentarioController : ControllerBase
{
    private readonly IComentarioRepository _comentarioRepository;
    private readonly IMusicaRepository _musicaRepository;

    public ComentarioController(IComentarioRepository comentarioRepository, IMusicaRepository musicaRepository)
    {
        _comentarioRepository = comentarioRepository;
        _musicaRepository = musicaRepository;
    }

    /// <summary>
    /// Lista os comentários de uma música, do mais recente ao mais antigo.
    /// </summary>
    [HttpGet("Musica/{idMusica:int}")]
    public async Task<IActionResult> ListarPorMusica(int idMusica)
    {
        if (await _musicaRepository.BuscarPorId(idMusica) is null)
            return NotFound("Música não encontrada.");

        var comentarios = await _comentarioRepository.ListarPorMusica(idMusica);
        return Ok(comentarios.Select(ComentarioRespostaDTO.Converter));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        var comentario = await _comentarioRepository.BuscarPorId(id);
        return comentario is null ? NotFound("Comentário não encontrado.") : Ok(ComentarioRespostaDTO.Converter(comentario));
    }

    /// <summary>
    /// Cadastra um comentário em uma música vinculado ao usuário autenticado.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Cadastrar([FromBody] ComentarioDTO dto)
    {
        var usuarioId = UsuarioLogadoId();
        if (usuarioId is null) return Unauthorized();

        if (await _musicaRepository.BuscarPorId(dto.IdMusica) is null)
            return BadRequest("A música informada não existe.");

        var comentario = new Comentario
        {
            Texto = dto.Texto.Trim(),
            IdMusica = dto.IdMusica,
            IdUsuario = usuarioId.Value
        };

        await _comentarioRepository.Cadastrar(comentario);
        var criado = await _comentarioRepository.BuscarPorId(comentario.IdComentario) ?? comentario;
        return CreatedAtAction(nameof(BuscarPorId), new { id = comentario.IdComentario }, ComentarioRespostaDTO.Converter(criado));
    }

    /// <summary>
    /// Edita um comentário (somente o autor do comentário ou um administrador).
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] ComentarioAtualizacaoDTO dto)
    {
        var atual = await _comentarioRepository.BuscarPorId(id);
        if (atual is null) return NotFound("Comentário não encontrado.");

        if (!PodeEditar(atual)) return Forbid();

        await _comentarioRepository.Atualizar(id, dto.Texto.Trim());
        return NoContent();
    }

    /// <summary>
    /// Exclui um comentário (autor do comentário, dono da música ou administrador).
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Excluir(int id)
    {
        var atual = await _comentarioRepository.BuscarPorId(id);
        if (atual is null) return NotFound("Comentário não encontrado.");

        if (!PodeExcluir(atual)) return Forbid();

        await _comentarioRepository.Excluir(id);
        return NoContent();
    }

    private int? UsuarioLogadoId() =>
        int.TryParse(User.FindFirstValue(JwtRegisteredClaimNames.Sub), out var usuarioId) ? usuarioId : null;

    private bool PodeEditar(Comentario comentario) =>
        User.IsInRole("Admin") || comentario.IdUsuario == UsuarioLogadoId();

    private bool PodeExcluir(Comentario comentario)
    {
        var usuarioId = UsuarioLogadoId();
        return User.IsInRole("Admin")
            || comentario.IdUsuario == usuarioId
            || comentario.IdMusicaNavigation?.IdUsuario == usuarioId;
    }
}
