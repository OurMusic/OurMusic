using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using OurMusic.WebAPI.Models;

namespace OurMusic.WebAPI.BdContextEvent;

public partial class OurMusicContext : DbContext
{
    public OurMusicContext()
    {
    }

    public OurMusicContext(DbContextOptions<OurMusicContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Genero> Genero { get; set; }

    public virtual DbSet<Musica> Musica { get; set; }

    public virtual DbSet<Usuario> Usuario { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Genero>(entity =>
        {
            entity.HasKey(e => e.IdGenero).HasName("PK__Genero__0F834988735016CA");
        });

        modelBuilder.Entity<Musica>(entity =>
        {
            entity.HasKey(e => e.IdMusica).HasName("PK__Musica__F026ACA746B8CD51");

            entity.HasMany(d => d.IdGenero).WithMany(p => p.IdMusica)
                .UsingEntity<Dictionary<string, object>>(
                    "MusicaGenero",
                    r => r.HasOne<Genero>().WithMany()
                        .HasForeignKey("IdGenero")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__MusicaGen__IdGen__571DF1D5"),
                    l => l.HasOne<Musica>().WithMany()
                        .HasForeignKey("IdMusica")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__MusicaGen__IdMus__5629CD9C"),
                    j =>
                    {
                        j.HasKey("IdMusica", "IdGenero");
                    });
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.IdUsuario).HasName("PK__Usuario__5B65BF9728146829");

            entity.ToTable(tb => tb.HasTrigger("TR_UsuarioSoftDelete"));

            entity.Property(e => e.Ativo).HasDefaultValue(true);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
