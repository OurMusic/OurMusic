using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace OurMusic.WebAPI.Models;

public partial class Musica
{
    [Key]
    public int IdMusica { get; set; }

    [StringLength(100)]
    [Unicode(false)]
    public string Titulo { get; set; } = null!;

    [StringLength(60)]
    [Unicode(false)]
    public string Artista { get; set; } = null!;

    [Unicode(false)]
    public string? Letra { get; set; }

    public DateOnly DataLancamento { get; set; }

    public int Duracao { get; set; }

    [Unicode(false)]
    public string? ImagemCapa { get; set; }

    [StringLength(255)]
    [Unicode(false)]
    public string? Comentario { get; set; }

    public int IdUsuario { get; set; }

    [ForeignKey("IdUsuario")]
    [InverseProperty("Musica")]
    public virtual Usuario IdUsuarioNavigation { get; set; } = null!;

    [ForeignKey("IdMusica")]
    [InverseProperty("IdMusica")]
    public virtual ICollection<Genero> IdGenero { get; set; } = new List<Genero>();
}
