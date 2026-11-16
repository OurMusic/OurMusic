using System.Collections.Concurrent;

namespace OurMusic.WebAPI.Services;

/// <summary>
/// Lista em memória de tokens encerrados. Entradas são descartadas após a expiração do token.
/// Observação: a lista é perdida ao reiniciar a aplicação (os tokens continuam limitados pela expiração).
/// </summary>
public class TokenRevocationService : ITokenRevocationService
{
    private readonly ConcurrentDictionary<string, DateTime> _revogados = new();

    public void Revogar(string jti, DateTime expiracaoUtc)
    {
        var agora = DateTime.UtcNow;
        foreach (var item in _revogados.Where(r => r.Value <= agora))
            _revogados.TryRemove(item.Key, out _);

        _revogados[jti] = expiracaoUtc;
    }

    public bool EstaRevogado(string? jti) =>
        !string.IsNullOrEmpty(jti)
        && _revogados.TryGetValue(jti, out var expiracao)
        && expiracao > DateTime.UtcNow;
}
