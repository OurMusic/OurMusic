using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace OurMusic.WebAPI.Models;

[Index("IdMusica", "DataComentario", Name = "IX_Comentario_IdMusica", IsDescending = new[] { false, true })]
[Index("IdUsuario", Name = "IX_Comentario_IdUsuario")]
public partial class Comentario
{
    [Key]
    public int IdComentario { get; set; }

    [StringLength(255)]
    [Unicode(false)]
    public string Texto { get; set; } = null!;

    public DateTime DataComentario { get; set; }

    public int IdMusica { get; set; }

    public int IdUsuario { get; set; }

    [ForeignKey("IdMusica")]
    [InverseProperty("Comentario")]
    public virtual Musica IdMusicaNavigation { get; set; } = null!;

    [ForeignKey("IdUsuario")]
    [InverseProperty("Comentario")]
    public virtual Usuario IdUsuarioNavigation { get; set; } = null!;
}
