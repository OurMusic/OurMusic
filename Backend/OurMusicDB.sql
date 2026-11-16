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
	Comentario VARCHAR(255),
	IdUsuario INT NOT NULL DEFAULT 1 CONSTRAINT FK_Musica_Usuario FOREIGN KEY REFERENCES Usuario(IdUsuario)
);
GO
--TABELA G�NERO
CREATE TABLE Genero(
	IdGenero INT IDENTITY (1, 1) PRIMARY KEY,
	Nome VARCHAR(50) NOT NULL UNIQUE
);
GO
--TABELA INTERMEDI�RIA (N-N)
CREATE TABLE MusicaGenero(
	IdMusica INT NOT NULL FOREIGN KEY REFERENCES Musica(IdMusica),
	IdGenero INT NOT NULL FOREIGN KEY REFERENCES Genero(IdGenero)
	CONSTRAINT PK_MusicaGenero PRIMARY KEY (IdMusica, IdGenero)
);
GO
--TRIGGER: Exclus�o de usu�rios - SOFT DELETE
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
INSERT INTO Musica (Titulo, Artista, Letra, DataLancamento, Duracao, ImagemCapa, Comentario, IdUsuario)
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
Revealing my divine anger�s arrow shall strike

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
'Som tribal maneiro',
1),

('Catharsis',
'Chikoi The Maid',
'',
'20230828',
4,
'https://i1.sndcdn.com/artworks-JuEfSkqtsJkq-0-t500x500.jpg',
'M�sica bem bacana!'),

('She Knows Your Fears',
'Takai The Maid',
'',
'20240920',
3,
'https://i.ytimg.com/vi/VF19dyVaz1o/maxresdefault.jpg',
'M�sica bem bacana!'),

('Evid�ncias',
'Chit�ozinho & Xoror�',
'Quando eu digo que deixei de te amar
� porque eu te amo
Quando eu digo que n�o quero mais voc�
� porque eu te quero
Eu tenho medo de te dar meu cora��o
E confessar que eu estou em tuas m�os
Mas n�o posso imaginar
O que vai ser de mim
Se eu te perder um dia

Eu me afasto e me defendo de voc�
Mas depois me entrego
Fa�o tipo, falo coisas que eu n�o sou
Mas depois eu nego
Mas a verdade
� que eu sou louco por voc�
E tenho medo de pensar em te perder
Eu preciso aceitar que n�o d� mais
Pra separar as nossas vidas

E nessa loucura de dizer que n�o te quero
Vou negando as apar�ncias
Disfar�ando as evid�ncias
Mas pra que viver fingindo
Se eu n�o posso enganar meu cora��o?
Eu sei que te amo!

Chega de mentiras
De negar o meu desejo
Eu te quero mais que tudo
Eu preciso do seu beijo
Eu entrego a minha vida
Pra voc� fazer o que quiser de mim
S� quero ouvir voc� dizer que sim!

Diz que � verdade, que tem saudade
Que ainda voc� pensa muito em mim
Diz que � verdade, que tem saudade
Que ainda voc� quer viver pra mim',
'19901204',
5,
'https://images.genius.com/28248ea84fe661efdeca1ee191ca31fd.1000x1000x1.png',
'M�sica bem bacana!');


SELECT * FROM Musica
SELECT * FROM Genero
SELECT * FROM MusicaGenero

INSERT MusicaGenero (IdMusica, IdGenero)
VALUES
(1,1), --Invoca��o do mal (terror)
(1,2); --Invoca��o do mal (suspense)

SELECT F.Titulo , F.DataLancamento, F.Duracao, G.Nome AS Genero
FROM Musica F INNER JOIN MusicaGenero FG
ON F.IdMusica = FG.IdMusica INNER JOIN Genero G
ON G.IdGenero = FG.IdGenero
ORDER BY F.Titulo

SELECT * FROM Musica

DELETE FROM Usuario