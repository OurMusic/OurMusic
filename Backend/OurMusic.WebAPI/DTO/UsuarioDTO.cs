using System.ComponentModel.DataAnnotations;

namespace OurMusic.WebAPI.DTO;

/// <summary>
/// Cadastro de usuário (somente administrador - não há cadastro público).
/// </summary>
public class UsuarioDTO
{
    [Required(ErrorMessage = "O nome do usuário é obrigatório.")]
    [StringLength(100, ErrorMessage = "O nome deve ter no máximo 100 caracteres.")]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "O e-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "Informe um e-mail válido.")]
    [StringLength(50, ErrorMessage = "O e-mail deve ter no máximo 50 caracteres.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "A senha é obrigatória.")]
    [MinLength(8, ErrorMessage = "A senha deve ter no mínimo 8 caracteres.")]
    public string Senha { get; set; } = string.Empty;

    /// <summary>"Admin" ou "Usuario".</summary>
    [Required(ErrorMessage = "O tipo de usuário é obrigatório.")]
    [RegularExpression("^(Admin|Usuario)$", ErrorMessage = "O tipo de usuário deve ser 'Admin' ou 'Usuario'.")]
    public string TipoUsuario { get; set; } = "Usuario";
}
