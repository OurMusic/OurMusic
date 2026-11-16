using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using OurMusic.WebAPI.DTO;
using OurMusic.WebAPI.Interfaces;
using OurMusic.WebAPI.Models;

namespace OurMusic.WebAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class GeneroController : ControllerBase
{
    private readonly IGeneroRepository _generoRepository;

    public GeneroController(IGeneroRepository generoRepository)
    {
        _generoRepository = generoRepository;
    }

    /// <summary>
    /// Lista todos os gêneros em ordem de nome (qualquer usuário autenticado).
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Listar() =>
        Ok((await _generoRepository.Listar()).Select(GeneroRespostaDTO.Converter));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        var genero = await _generoRepository.BuscarPorId(id);
        return genero is null ? NotFound("Gênero não encontrado.") : Ok(GeneroRespostaDTO.Converter(genero));
    }

    /// <summary>
    /// RF11 - Cadastra um gênero (somente administrador). Nomes duplicados não são permitidos (RN11).
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Cadastrar([FromBody] GeneroDTO dto)
    {
        var genero = new Genero { Nome = dto.Nome.Trim() };

        try
        {
            await _generoRepository.Cadastrar(genero);
        }
        catch (DbUpdateException erro)
            when (erro.GetBaseException() is SqlException { Number: 2601 or 2627 })
        {
            return Conflict("Já existe um gênero com esse nome.");
        }

        return CreatedAtAction(nameof(BuscarPorId), new { id = genero.IdGenero }, GeneroRespostaDTO.Converter(genero));
    }

    /// <summary>
    /// RF11 - Edita um gênero (somente administrador).
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] GeneroDTO dto)
    {
        if (await _generoRepository.BuscarPorId(id) is null) return NotFound("Gênero não encontrado.");

        try
        {
            await _generoRepository.Atualizar(id, new Genero { Nome = dto.Nome.Trim() });
        }
        catch (DbUpdateException erro)
            when (erro.GetBaseException() is SqlException { Number: 2601 or 2627 })
        {
            return Conflict("Já existe um gênero com esse nome.");
        }

        return NoContent();
    }

    /// <summary>
    /// Exclui um gênero (somente administrador). Gêneros associados a músicas não podem ser excluídos (RN05).
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Excluir(int id)
    {
        if (await _generoRepository.BuscarPorId(id) is null) return NotFound("Gênero não encontrado.");

        try
        {
            await _generoRepository.Excluir(id);
        }
        catch (DbUpdateException erro)
            when (erro.GetBaseException() is SqlException { Number: 547 })
        {
            return Conflict("Não é possível excluir um gênero associado a músicas.");
        }

        return NoContent();
    }
}
