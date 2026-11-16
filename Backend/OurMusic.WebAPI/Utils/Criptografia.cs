using System.Security.Cryptography;
using System.Text;

namespace OurMusic.WebAPI.Utils;

public class Criptografia
{
    public static string GerarHash(string senha)
    {
        return BCrypt.Net.BCrypt.HashPassword(senha);
    }

    public static bool CompararHash(string senhaInformada, string senhaBanco)
    {
        if (string.IsNullOrEmpty(senhaInformada) || string.IsNullOrEmpty(senhaBanco))
            return false;
        if (!senhaBanco.StartsWith("$2", StringComparison.Ordinal))
            return false;

        try
        {
            return BCrypt.Net.BCrypt.Verify(senhaInformada, senhaBanco);
        }
        catch (BCrypt.Net.SaltParseException)
        {
            return false;
        }
    }

    /// <summary>
    /// Indica se o hash armazenado está no formato legado (SHA-256 em hexadecimal, 64 caracteres),
    /// usado pelo script OurMusicDB.sql para criar o administrador inicial.
    /// </summary>
    public static bool HashLegado(string senhaBanco) =>
        senhaBanco.Length == 64 && senhaBanco.All(Uri.IsHexDigit);

    /// <summary>
    /// Compara a senha com um hash SHA-256 legado. Usado somente para migrar o usuário
    /// para BCrypt no primeiro login bem-sucedido.
    /// </summary>
    public static bool CompararHashLegado(string senhaInformada, string senhaBanco)
    {
        if (string.IsNullOrEmpty(senhaInformada) || !HashLegado(senhaBanco))
            return false;

        // HASHBYTES('SHA2_256', varchar) calcula o hash sobre os bytes ASCII/ANSI da senha.
        var calculado = SHA256.HashData(Encoding.UTF8.GetBytes(senhaInformada));
        var armazenado = Convert.FromHexString(senhaBanco);
        return CryptographicOperations.FixedTimeEquals(calculado, armazenado);
    }
}
