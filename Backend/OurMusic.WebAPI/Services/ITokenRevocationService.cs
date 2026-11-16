namespace OurMusic.WebAPI.Services;

/// <summary>
/// Controla os tokens JWT encerrados (logout) antes da expiração natural.
/// </summary>
public interface ITokenRevocationService
{
    void Revogar(string jti, DateTime expiracaoUtc);
    bool EstaRevogado(string? jti);
}
