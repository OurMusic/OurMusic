using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace OurMusic.WebAPI.Models;

[Index("Nome", Name = "UQ__Genero__7D8FE3B25D1626C2", IsUnique = true)]
public partial class Genero
{
    [Key]
    public int IdGenero { get; set; }

    [StringLength(50)]
    [Unicode(false)]
    public string Nome { get; set; } = null!;

    [ForeignKey("IdGenero")]
    [InverseProperty("IdGenero")]
    public virtual ICollection<Musica> IdMusica { get; set; } = new List<Musica>();
}
