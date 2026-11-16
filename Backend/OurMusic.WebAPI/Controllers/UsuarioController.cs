using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using OurMusic.WebAPI.DTO;
using OurMusic.WebAPI.Interfaces;
using OurMusic.WebAPI.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace OurMusic.WebAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UsuarioController : ControllerBase
{
    private readonly IUsuarioRepository _usuarioRepository;

    public UsuarioController(IUsuarioRepository usuarioRepository)
    {
        _usuarioRepository = usuarioRepository;
    }

    /// <summary>
    /// RF12 - Lista os usuários cadastrados (somente administrador - RN03).
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Listar()
    {
        var usuarios = await _usuarioRepository.Listar();
        return Ok(usuarios.Select(UsuarioRespostaDTO.Converter));
    }

    /// <summary>
    /// Consulta um usuário. Administradores consultam qualquer um; os demais, apenas o próprio perfil.
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        if (!PodeAcessar(id)) return Forbid();
        var usuario = await _usuarioRepository.BuscarPorId(id);
        return usuario is null ? NotFound("Usuário não encontrado.") : Ok(UsuarioRespostaDTO.Converter(usuario));
    }

    /// <summary>
    /// RF13 - Cadastra um novo usuário (somente administrador). Não existe cadastro público.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Cadastrar([FromBody] UsuarioDTO dto)
    {
        var usuario = new Usuario
        {
            Nome = dto.Nome.Trim(),
            Email = dto.Email.Trim(),
            Senha = dto.Senha,
            TipoUsuario = dto.TipoUsuario,
            Ativo = true
        };

        try
        {
            await _usuarioRepository.Cadastrar(usuario);
        }
        catch (DbUpdateException erro)
            when (erro.GetBaseException() is SqlException { Number: 2601 or 2627 })
        {
            return Conflict("Já existe um usuário com esse e-mail.");
        }

        return CreatedAtAction(nameof(BuscarPorId), new { id = usuario.IdUsuario }, UsuarioRespostaDTO.Converter(usuario));
    }

    /// <summary>
    /// RF07/RF14 - Edita um usuário. O usuário comum edita somente o próprio perfil (RN09);
    /// apenas administradores alteram TipoUsuario e Ativo.
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] UsuarioAtualizacaoDTO dto)
    {
        if (!PodeAcessar(id)) return Forbid();
        var atual = await _usuarioRepository.BuscarPorId(id);
        if (atual is null) return NotFound("Usuário não encontrado.");

        var tipoUsuario = dto.TipoUsuario ?? atual.TipoUsuario;
        var ativo = dto.Ativo ?? atual.Ativo;

        if (!User.IsInRole("Admin") && (tipoUsuario != atual.TipoUsuario || ativo != atual.Ativo))
            return Forbid();

        if (id == UsuarioLogadoId() && (tipoUsuario != atual.TipoUsuario || !ativo))
            return BadRequest("Você não pode alterar o próprio perfil de acesso nem desativar a própria conta.");

        try
        {
            await _usuarioRepository.Atualizar(id, new Usuario
            {
                Nome = dto.Nome.Trim(),
                Email = dto.Email.Trim(),
                Senha = dto.Senha ?? string.Empty,
                TipoUsuario = tipoUsuario,
                Ativo = ativo
            });
        }
        catch (DbUpdateException erro)
            when (erro.GetBaseException() is SqlException { Number: 2601 or 2627 })
        {
            return Conflict("Já existe um usuário com esse e-mail.");
        }

        return NoContent();
    }

    /// <summary>
    /// RF15 - Desativa um usuário (somente administrador). A exclusão é lógica: o registro é mantido
    /// com Ativo = false e o usuário deixa de acessar o sistema (RN04).
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Desativar(int id)
    {
        if (id == UsuarioLogadoId())
            return BadRequest("Você não pode desativar a própria conta.");

        if (await _usuarioRepository.BuscarPorId(id) is null) return NotFound("Usuário não encontrado.");

        await _usuarioRepository.Desativar(id);
        return NoContent();
    }

    private int? UsuarioLogadoId() =>
        int.TryParse(User.FindFirstValue(JwtRegisteredClaimNames.Sub), out var usuarioId) ? usuarioId : null;

    private bool PodeAcessar(int id) => User.IsInRole("Admin") || UsuarioLogadoId() == id;
}
