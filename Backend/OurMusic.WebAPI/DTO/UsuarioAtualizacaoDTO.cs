using System.ComponentModel.DataAnnotations;

namespace OurMusic.WebAPI.DTO;

/// <summary>
/// Atualização de usuário. Qualquer usuário edita o próprio perfil (Nome, Email, Senha);
/// TipoUsuario e Ativo só podem ser alterados por administradores.
/// </summary>
public class UsuarioAtualizacaoDTO
{
    [Required(ErrorMessage = "O nome do usuário é obrigatório.")]
    [StringLength(100, ErrorMessage = "O nome deve ter no máximo 100 caracteres.")]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "O e-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "Informe um e-mail válido.")]
    [StringLength(50, ErrorMessage = "O e-mail deve ter no máximo 50 caracteres.")]
    public string Email { get; set; } = string.Empty;

    /// <summary>Opcional: se omitida, a senha atual é mantida.</summary>
    [MinLength(8, ErrorMessage = "A senha deve ter no mínimo 8 caracteres.")]
    public string? Senha { get; set; }

    /// <summary>Somente administrador. "Admin" ou "Usuario".</summary>
    [RegularExpression("^(Admin|Usuario)$", ErrorMessage = "O tipo de usuário deve ser 'Admin' ou 'Usuario'.")]
    public string? TipoUsuario { get; set; }

    /// <summary>Somente administrador.</summary>
    public bool? Ativo { get; set; }
}
