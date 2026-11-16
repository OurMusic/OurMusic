using System.ComponentModel.DataAnnotations;

namespace OurMusic.WebAPI.DTO;

public class ComentarioDTO
{
    [Required(ErrorMessage = "O texto do comentário é obrigatório.")]
    [StringLength(255, ErrorMessage = "O comentário deve ter no máximo 255 caracteres.")]
    public string Texto { get; set; } = string.Empty;

    [Range(1, int.MaxValue, ErrorMessage = "O ID da música é obrigatório.")]
    public int IdMusica { get; set; }
}

public class ComentarioAtualizacaoDTO
{
    [Required(ErrorMessage = "O texto do comentário é obrigatório.")]
    [StringLength(255, ErrorMessage = "O comentário deve ter no máximo 255 caracteres.")]
    public string Texto { get; set; } = string.Empty;
}
