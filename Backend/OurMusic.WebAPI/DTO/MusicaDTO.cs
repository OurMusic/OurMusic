using System.ComponentModel.DataAnnotations;

namespace OurMusic.WebAPI.DTO;

public class MusicaDTO : IValidatableObject
{
    [Required(ErrorMessage = "O título da música é obrigatório.")]
    [StringLength(100, ErrorMessage = "O título deve ter no máximo 100 caracteres.")]
    public string Titulo { get; set; } = string.Empty;

    [Required(ErrorMessage = "O artista é obrigatório.")]
    [StringLength(60, ErrorMessage = "O artista deve ter no máximo 60 caracteres.")]
    public string Artista { get; set; } = string.Empty;

    public string? Letra { get; set; }

    [Required(ErrorMessage = "A data de lançamento é obrigatória.")]
    public DateOnly? DataLancamento { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "A duração deve ser maior que zero.")]
    public int Duracao { get; set; }

    /// <summary>URL da capa já existente. Envie este campo OU ArquivoImagem.</summary>
    public string? ImagemCapa { get; set; }

    /// <summary>Arquivo de imagem da capa (JPG, PNG, WEBP ou GIF, até 10 MB).</summary>
    public IFormFile? ArquivoImagem { get; set; }

    /// <summary>Link da música no YouTube Music / YouTube para reprodução no player do OurMusic.</summary>
    [StringLength(500, ErrorMessage = "O link da música deve ter no máximo 500 caracteres.")]
    [Url(ErrorMessage = "Informe uma URL válida para a música.")]
    public string? UrlMusica { get; set; }

    /// <summary>Ids dos gêneros (mínimo de um).</summary>
    [Required(ErrorMessage = "A música deve estar associada a pelo menos um gênero.")]
    [MinLength(1, ErrorMessage = "A música deve estar associada a pelo menos um gênero.")]
    public List<int> IdGeneros { get; set; } = new();

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (ArquivoImagem is not null && !string.IsNullOrWhiteSpace(ImagemCapa))
        {
            yield return new ValidationResult(
                "Envie ArquivoImagem ou ImagemCapa, não os dois.",
                new[] { nameof(ArquivoImagem), nameof(ImagemCapa) });
        }

        if (DataLancamento is { } data && (data.Year < 1888 || data.Year > DateTime.Now.Year))
        {
            yield return new ValidationResult(
                "O ano de lançamento deve estar entre 1888 e o ano atual.",
                new[] { nameof(DataLancamento) });
        }
    }
}
