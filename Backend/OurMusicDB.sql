CREATE DATABASE OurMusicDB;
GO
USE OurMusicDB;
GO
--TABELA USUARIO
CREATE TABLE Usuario(
	IdUsuario INT IDENTITY(1, 1) PRIMARY KEY,
	Nome VARCHAR(100) NOT NULL,
	Email VARCHAR(50) NOT NULL UNIQUE,
	Senha VARCHAR(255) NOT NULL, 
	TipoUsuario VARCHAR(20) NOT NULL CHECK (TipoUsuario IN('Admin','Usuario')),
	Ativo BIT NOT NULL DEFAULT 1
);
GO
--TABELA Musica
CREATE TABLE Musica(
	IdMusica INT IDENTITY (1, 1) PRIMARY KEY,
	Titulo VARCHAR(100) NOT NULL,
	Artista VARCHAR(60) NOT NULL,
	Letra VARCHAR(MAX),
	DataLancamento DATE NOT NULL CHECK (YEAR(DataLancamento) BETWEEN 1888 AND YEAR(GETDATE()) ),
	Duracao INT NOT NULL CHECK (Duracao>0),
	ImagemCapa VARCHAR(MAX),
	UrlMusica VARCHAR(500),
	IdUsuario INT NOT NULL DEFAULT 1 CONSTRAINT FK_Musica_Usuario FOREIGN KEY REFERENCES Usuario(IdUsuario)
);
GO
--TABELA GÊNERO
CREATE TABLE Genero(
	IdGenero INT IDENTITY (1, 1) PRIMARY KEY,
	Nome VARCHAR(50) NOT NULL UNIQUE
);
GO
--TABELA INTERMEDIÁRIA (N-N)
CREATE TABLE MusicaGenero(
	IdMusica INT NOT NULL FOREIGN KEY REFERENCES Musica(IdMusica),
	IdGenero INT NOT NULL FOREIGN KEY REFERENCES Genero(IdGenero)
	CONSTRAINT PK_MusicaGenero PRIMARY KEY (IdMusica, IdGenero)
);
GO
--TABELA COMENTÁRIO
CREATE TABLE Comentario(
	IdComentario INT IDENTITY(1, 1) PRIMARY KEY,
	Texto VARCHAR(255) NOT NULL,
	DataComentario DATETIME2 NOT NULL CONSTRAINT DF_Comentario_Data DEFAULT SYSDATETIME(),
	IdMusica INT NOT NULL CONSTRAINT FK_Comentario_Musica FOREIGN KEY REFERENCES Musica(IdMusica) ON DELETE CASCADE,
	IdUsuario INT NOT NULL CONSTRAINT FK_Comentario_Usuario FOREIGN KEY REFERENCES Usuario(IdUsuario)
);
GO
CREATE NONCLUSTERED INDEX IX_Comentario_IdMusica
	ON Comentario (IdMusica, DataComentario DESC);

CREATE NONCLUSTERED INDEX IX_Comentario_IdUsuario
	ON Comentario (IdUsuario);
GO
--TRIGGER: Exclusão de usuários - SOFT DELETE
CREATE TRIGGER TR_UsuarioSoftDelete
ON Usuario
INSTEAD OF DELETE
AS
BEGIN
	UPDATE Usuario
	SET Ativo = 0
	WHERE IdUsuario IN (SELECT IdUsuario FROM deleted)
END;
GO
INSERT Usuario (Nome, Email, Senha, TipoUsuario)
VALUES
('Ana Silva', 'ana@gmail.com', CONVERT(VARCHAR(255), HASHBYTES('SHA2_256', 'admin123'), 2), 'Admin')
GO
INSERT Genero (Nome)
VALUES
('Maid Core'),
('Tribal'),
('Sertanejo');
GO
INSERT INTO Musica (Titulo, Artista, Letra, DataLancamento, Duracao, ImagemCapa, UrlMusica, IdUsuario)
VALUES
('LIFA',
'Krigsgaldr',
'Min Warb Naseu
Wilr Made Thaim
I Bormotha Hauni

Hu War
Hu War Opkam Har a Hit Lot

Got Nafiskr Orf
Auim Suimade
Foki Afa Galande

Hu War
Hu War Opkam Har a Hit Lot

Min Warb Naseu
Wilr Made Thaim
I Bormotha Hauni

Hu War
Hu War Opkam Har a Hit Lot

Got Nafiskr Orf
Auim Suimade
Foki Afa Galande

Hu War
Hu War Opkam Har a Hit Lot

What am I supposed to do
If I want to talk about peace and understanding
But you only understand the language of the sword
What if I want to make you understand
That the path you chose leads to downfall
But you only understand the language of the sword
What if I want to tell you to leave me and my beloved ones in peace
But you only understand the language of the sword

I let the blade do the talking
So my tongue shall become iron
And my words the mighty roar of war
Revealing my divine anger’s arrow shall strike

All action for the good of all
I see my reflection in your eyes
But my new age has just begun

The sword is soft
In the fire of the furnace
It hungers to be hit
And wants to have a hundred sisters
In the coldest state of their existence
They may dance the maddest
In the morass of the red rain

Beloved brother enemy
I sing my sword song for you
The lullaby of obliteration
So I can wake up with a smile
And bliss in my heart
And bliss in my heart
And bliss in my heart

Coexistence, Conflict, combat
Devastation, regeneration, transformation
That is the best I can do for you

I see a grey gloom on the horizon
That promises a powerful sun to rise
To melt away all moons
It will make the old fires of purification
Look like dying embers
Look like dying embers
Look like dying embers

Min Warb Naseu
Wilr Made Thaim
I Bormotha Hauni

Hu War
Hu War Opkam Har a Hit Lot

Got Nafiskr Orf
Auim Suimade
Foki Afa Galande

Hu War
Hu War Opkam Har a Hit Lot

Ylir Men Aero Their
Era Mela Os

Got Nafiskr Orf
Auim Suimade
Foki Afa Galande

Hu War
Hu War Opkam Har a Hit Lot',
'20171101',
73,
'https://cdn-images.dzcdn.net/images/cover/6b680f2097d36493911908b9289ec098/500x500.jpg',
'https://music.youtube.com/watch?v=QRg_8NNPTD8',
1),

('Catharsis',
'Chikoi The Maid',
'',
'20230828',
4,
'https://i1.sndcdn.com/artworks-JuEfSkqtsJkq-0-t500x500.jpg',
'https://music.youtube.com/watch?v=9xG91n388zI',
1),

('She Knows Your Fears',
'Takai The Maid',
'',
'20240920',
3,
'https://i.ytimg.com/vi/VF19dyVaz1o/maxresdefault.jpg',
'https://music.youtube.com/watch?v=VF19dyVaz1o',
1),

('Evidências',
'Chitãozinho & Xororó',
'Quando eu digo que deixei de te amar
É porque eu te amo
Quando eu digo que não quero mais você
É porque eu te quero
Eu tenho medo de te dar meu coração
E confessar que eu estou em tuas mãos
Mas não posso imaginar
O que vai ser de mim
Se eu te perder um dia

Eu me afasto e me defendo de você
Mas depois me entrego
Faço tipo, falo coisas que eu não sou
Mas depois eu nego
Mas a verdade
É que eu sou louco por você
E tenho medo de pensar em te perder
Eu preciso aceitar que não dá mais
Pra separar as nossas vidas

E nessa loucura de dizer que não te quero
Vou negando as aparências
Disfarçando as evidências
Mas pra que viver fingindo
Se eu não posso enganar meu coração?
Eu sei que te amo!

Chega de mentiras
De negar o meu desejo
Eu te quero mais que tudo
Eu preciso do seu beijo
Eu entrego a minha vida
Pra você fazer o que quiser de mim
Só quero ouvir você dizer que sim!

Diz que é verdade, que tem saudade
Que ainda você pensa muito em mim
Diz que é verdade, que tem saudade
Que ainda você quer viver pra mim',
'19901204',
5,
'https://images.genius.com/28248ea84fe661efdeca1ee191ca31fd.1000x1000x1.png',
'https://music.youtube.com/watch?v=ePjtnSPFWK8',
1);
GO
INSERT INTO Comentario (Texto, IdMusica, IdUsuario)
VALUES
('Som tribal maneiro', 1, 1),
('Música bem bacana!', 2, 1),
('Música bem bacana!', 3, 1),
('Música bem bacana!', 4, 1);
GO
INSERT MusicaGenero (IdMusica, IdGenero)
VALUES
(1,1),
(1,2);
GO
SELECT * FROM Musica;
SELECT * FROM Genero;
SELECT * FROM MusicaGenero;
SELECT * FROM Comentario;
