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
INSERT Usuario (Nome, Email, Senha, TipoUsuario, Ativo)
VALUES
('Ana Silva', 'ana@gmail.com', CONVERT(VARCHAR(255), HASHBYTES('SHA2_256', 'admin123'), 2), 'Admin', 1),
('Rafael Costa', 'rafael.costa@ourmusic.com', CONVERT(VARCHAR(255), HASHBYTES('SHA2_256', 'admin123'), 2), 'Admin', 1),
('Marina Reis', 'marina.reis@ourmusic.com', CONVERT(VARCHAR(255), HASHBYTES('SHA2_256', 'admin123'), 2), 'Admin', 1),
('Bruno Almeida', 'bruno.almeida@ourmusic.com', CONVERT(VARCHAR(255), HASHBYTES('SHA2_256', 'senha123'), 2), 'Usuario', 1),
('Camila Ferreira', 'camila.ferreira@ourmusic.com', CONVERT(VARCHAR(255), HASHBYTES('SHA2_256', 'senha123'), 2), 'Usuario', 1),
('Lucas Oliveira', 'lucas.oliveira@ourmusic.com', CONVERT(VARCHAR(255), HASHBYTES('SHA2_256', 'senha123'), 2), 'Usuario', 1),
('Juliana Santos', 'juliana.santos@ourmusic.com', CONVERT(VARCHAR(255), HASHBYTES('SHA2_256', 'senha123'), 2), 'Usuario', 1),
('Pedro Lima', 'pedro.lima@ourmusic.com', CONVERT(VARCHAR(255), HASHBYTES('SHA2_256', 'senha123'), 2), 'Usuario', 1),
('Beatriz Alves', 'beatriz.alves@ourmusic.com', CONVERT(VARCHAR(255), HASHBYTES('SHA2_256', 'senha123'), 2), 'Usuario', 1),
('Gabriel Souza', 'gabriel.souza@ourmusic.com', CONVERT(VARCHAR(255), HASHBYTES('SHA2_256', 'senha123'), 2), 'Usuario', 1),
('Larissa Rocha', 'larissa.rocha@ourmusic.com', CONVERT(VARCHAR(255), HASHBYTES('SHA2_256', 'senha123'), 2), 'Usuario', 1),
('Mateus Ribeiro', 'mateus.ribeiro@ourmusic.com', CONVERT(VARCHAR(255), HASHBYTES('SHA2_256', 'senha123'), 2), 'Usuario', 1),
('Fernanda Carvalho', 'fernanda.carvalho@ourmusic.com', CONVERT(VARCHAR(255), HASHBYTES('SHA2_256', 'senha123'), 2), 'Usuario', 1),
('Thiago Gomes', 'thiago.gomes@ourmusic.com', CONVERT(VARCHAR(255), HASHBYTES('SHA2_256', 'senha123'), 2), 'Usuario', 1),
('Mariana Martins', 'mariana.martins@ourmusic.com', CONVERT(VARCHAR(255), HASHBYTES('SHA2_256', 'senha123'), 2), 'Usuario', 1),
('Felipe Barbosa', 'felipe.barbosa@ourmusic.com', CONVERT(VARCHAR(255), HASHBYTES('SHA2_256', 'senha123'), 2), 'Usuario', 1),
('Letícia Dias', 'leticia.dias@ourmusic.com', CONVERT(VARCHAR(255), HASHBYTES('SHA2_256', 'senha123'), 2), 'Usuario', 1),
('Rodrigo Mendes', 'rodrigo.mendes@ourmusic.com', CONVERT(VARCHAR(255), HASHBYTES('SHA2_256', 'senha123'), 2), 'Usuario', 1),
('Amanda Moreira', 'amanda.moreira@ourmusic.com', CONVERT(VARCHAR(255), HASHBYTES('SHA2_256', 'senha123'), 2), 'Usuario', 1),
('Vinícius Teixeira', 'vinicius.teixeira@ourmusic.com', CONVERT(VARCHAR(255), HASHBYTES('SHA2_256', 'senha123'), 2), 'Usuario', 1),
('Carolina Duarte', 'carolina.duarte@ourmusic.com', CONVERT(VARCHAR(255), HASHBYTES('SHA2_256', 'senha123'), 2), 'Usuario', 1),
('Eduardo Pereira', 'eduardo.pereira@ourmusic.com', CONVERT(VARCHAR(255), HASHBYTES('SHA2_256', 'senha123'), 2), 'Usuario', 0);
GO
INSERT Genero (Nome)
VALUES
('Maid Core'),
('Tribal'),
('Sertanejo'),
('Rock'),
('Rock Nacional'),
('Pop'),
('Pop Rock'),
('MPB'),
('Bossa Nova'),
('Samba'),
('Pagode'),
('Forró'),
('Axé'),
('Funk Brasileiro'),
('Hip Hop'),
('Rap Nacional'),
('R&B'),
('Eletrônica'),
('Indie'),
('Metal'),
('Jazz'),
('Blues'),
('Reggae'),
('Trap'),
('Gospel');
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
1),
('Bohemian Rhapsody',
'Queen',
'Is this the real life? Is this just fantasy?
Caught in a landslide, no escape from reality
Open your eyes, look up to the skies and see',
'19751031',
355,
'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
2),
('Smells Like Teen Spirit',
'Nirvana',
'With the lights out, it''s less dangerous
Here we are now, entertain us
I feel stupid and contagious',
'19910910',
301,
'https://i.ytimg.com/vi/hTWKbfoikeg/maxresdefault.jpg',
'https://www.youtube.com/watch?v=hTWKbfoikeg',
4),
('Tempo Perdido',
'Legião Urbana',
'Todos os dias quando acordo
Não tenho mais o tempo que passou
Mas tenho muito tempo
Temos todo o tempo do mundo',
'19860720',
302,
'https://i.ytimg.com/vi/zpzoG5KGaHg/maxresdefault.jpg',
'https://www.youtube.com/watch?v=zpzoG5KGaHg',
5),
('Exagerado',
'Cazuza',
'Amor da minha vida
Daqui até a eternidade
Nossos destinos foram traçados na maternidade',
'19851101',
225,
'https://i.ytimg.com/vi/szts-5Zs5_8/maxresdefault.jpg',
'https://www.youtube.com/watch?v=szts-5Zs5_8',
6),
('Céu Azul',
'Charlie Brown Jr.',
'Tão natural quanto a luz do dia
Mas que preguiça boa, me deixa aqui à toa
Hoje ninguém vai estragar meu dia',
'20111201',
199,
'https://i.ytimg.com/vi/0dLX40UMUKo/maxresdefault.jpg',
'https://www.youtube.com/watch?v=0dLX40UMUKo',
7),
('Billie Jean',
'Michael Jackson',
'Billie Jean is not my lover
She''s just a girl who claims that I am the one
But the kid is not my son',
'19830102',
294,
'https://i.ytimg.com/vi/Zi_XLOBDo_Y/maxresdefault.jpg',
'https://www.youtube.com/watch?v=Zi_XLOBDo_Y',
8),
('Blinding Lights',
'The Weeknd',
'I said, ooh, I''m blinded by the lights
No, I can''t sleep until I feel your touch',
'20191129',
200,
'https://i.ytimg.com/vi/4NRXx6U8ABQ/maxresdefault.jpg',
'https://www.youtube.com/watch?v=4NRXx6U8ABQ',
9),
('Rolling in the Deep',
'Adele',
'We could have had it all
Rolling in the deep
You had my heart inside of your hand',
'20101129',
228,
'https://i.ytimg.com/vi/rYEDA3JcQqw/maxresdefault.jpg',
'https://www.youtube.com/watch?v=rYEDA3JcQqw',
10),
('Oceano',
'Djavan',
'Assim que o dia amanheceu
Lá no mar alto da paixão
Dava pra ver o tempo ruir',
'19890101',
295,
'https://i.ytimg.com/vi/MWh78SM5G7k/maxresdefault.jpg',
'https://www.youtube.com/watch?v=MWh78SM5G7k',
11),
('Samurai',
'Djavan feat. Stevie Wonder',
'Ai, quanto querer cabe num coração
Ai, me faz sofrer, faz que me diz que não',
'19820101',
288,
'https://i.ytimg.com/vi/3-qwqrQXsXQ/maxresdefault.jpg',
'https://www.youtube.com/watch?v=3-qwqrQXsXQ',
12),
('Azul da Cor do Mar',
'Tim Maia',
'Ah, se o mundo inteiro me pudesse ouvir
Tenho muito pra contar
Dizer que aprendi',
'19700101',
197,
'https://i.ytimg.com/vi/45T6cK94GPQ/hqdefault.jpg',
'https://www.youtube.com/watch?v=45T6cK94GPQ',
13),
('Garota de Ipanema',
'Antonio Carlos Jobim',
'Olha que coisa mais linda, mais cheia de graça
É ela, menina, que vem e que passa
Num doce balanço a caminho do mar',
'19640101',
322,
'https://i.ytimg.com/vi/uW5acE-5280/maxresdefault.jpg',
'https://www.youtube.com/watch?v=uW5acE-5280',
14),
('País Tropical',
'Jorge Ben Jor',
'Moro num país tropical
Abençoado por Deus e bonito por natureza',
'19691101',
254,
'https://i.ytimg.com/vi/JzByVhWju88/hqdefault.jpg',
'https://www.youtube.com/watch?v=JzByVhWju88',
15),
('Amiga da Minha Mulher',
'Seu Jorge',
'Ela é amiga da minha mulher
Pois é, pois é
Mas vive dando em cima de mim',
'20110601',
250,
'https://i.ytimg.com/vi/BwGZKIx5FN8/maxresdefault.jpg',
'https://www.youtube.com/watch?v=BwGZKIx5FN8',
16),
('Cheia de Manias',
'Raça Negra',
'Cheia de manias, toda dengosa
Menina bonita, sabe que é gostosa
Com esse seu jeito faz o que quer de mim',
'19920101',
218,
'https://i.ytimg.com/vi/40tU93_kGnA/maxresdefault.jpg',
'https://www.youtube.com/watch?v=40tU93_kGnA',
17),
('Asa Branca',
'Luiz Gonzaga',
'Quando oiei a terra ardendo
Qual fogueira de São João
Eu perguntei a Deus do céu, ai
Por que tamanha judiação',
'19470303',
172,
'https://i.ytimg.com/vi/zIy3EwyBBI0/maxresdefault.jpg',
'https://www.youtube.com/watch?v=zIy3EwyBBI0',
18),
('Xote dos Milagres',
'Falamansa',
'Escute o que diz o meu coração
Que hoje só quer te amar
E nada mais',
'20000101',
270,
'https://i.ytimg.com/vi/chwyjJbcs1Y/hqdefault.jpg',
'https://www.youtube.com/watch?v=chwyjJbcs1Y',
19),
('Infiel',
'Marília Mendonça',
'Iê, infiel
Eu quero ver você morar num motel
Estou te expulsando do meu coração',
'20160304',
204,
'https://i.ytimg.com/vi/eCyMh-mZ1B0/maxresdefault.jpg',
'https://www.youtube.com/watch?v=eCyMh-mZ1B0',
20),
('Sorte Grande',
'Ivete Sangalo',
'A minha sorte grande foi você cair do céu
Minha paixão verdadeira',
'20030801',
228,
'https://i.ytimg.com/vi/ZZS82d3-maM/maxresdefault.jpg',
'https://www.youtube.com/watch?v=ZZS82d3-maM',
21),
('Envolver',
'Anitta',
'No te voy a negar que te quiero cerca
Cuando empieza a sonar esta melodía',
'20211111',
193,
'https://i.ytimg.com/vi/hFCjGiawJi4/maxresdefault.jpg',
'https://www.youtube.com/watch?v=hFCjGiawJi4',
3),
('HUMBLE.',
'Kendrick Lamar',
'Be humble, sit down
Be humble, hol'' up, sit down',
'20170330',
177,
'https://i.ytimg.com/vi/tvTRZJ-4EyI/maxresdefault.jpg',
'https://www.youtube.com/watch?v=tvTRZJ-4EyI',
2),
('Negro Drama',
'Racionais MC''s',
'Negro drama, entre o sucesso e a lama
Dinheiro, problemas, inveja, luxo, fama',
'20021027',
412,
'https://i.ytimg.com/vi/o50J2xg8-sU/maxresdefault.jpg',
'https://www.youtube.com/watch?v=o50J2xg8-sU',
4),
('If I Ain''t Got You',
'Alicia Keys',
'Some people want it all
But I don''t want nothing at all
If it ain''t you, baby',
'20040217',
228,
'https://i.ytimg.com/vi/Ju8Hr50Ckwk/maxresdefault.jpg',
'https://www.youtube.com/watch?v=Ju8Hr50Ckwk',
5),
('Get Lucky',
'Daft Punk feat. Pharrell Williams',
'We''re up all night to get lucky
We''re up all night to get some
We''re up all night for good fun',
'20130419',
248,
'https://i.ytimg.com/vi/5NV6Rdv1a3I/maxresdefault.jpg',
'https://www.youtube.com/watch?v=5NV6Rdv1a3I',
6),
('Hear Me Now',
'Alok, Bruno Martini & Zeeba',
'If you get to hear me now
I know you''ll get stronger
When you get older',
'20161021',
194,
'https://i.ytimg.com/vi/JVpTp8IHdEg/hqdefault.jpg',
'https://www.youtube.com/watch?v=JVpTp8IHdEg',
7),
('Do I Wanna Know?',
'Arctic Monkeys',
'Have you got colour in your cheeks?
Do you ever get that fear that you can''t shift the type
That sticks around like summat in your teeth?',
'20130619',
272,
'https://i.ytimg.com/vi/bpOSxM0rNPM/hqdefault.jpg',
'https://www.youtube.com/watch?v=bpOSxM0rNPM',
8),
('Enter Sandman',
'Metallica',
'Exit light, enter night
Take my hand
We''re off to never-never land',
'19910729',
331,
'https://i.ytimg.com/vi/CD-E-LDc384/maxresdefault.jpg',
'https://www.youtube.com/watch?v=CD-E-LDc384',
9),
('Nothing Else Matters',
'Metallica',
'So close, no matter how far
Couldn''t be much more from the heart
Forever trusting who we are
And nothing else matters',
'19920420',
388,
'https://i.ytimg.com/vi/tAGnKpE4NCI/maxresdefault.jpg',
'https://www.youtube.com/watch?v=tAGnKpE4NCI',
10),
('Take Five',
'Dave Brubeck Quartet',
'',
'19590921',
324,
'https://i.ytimg.com/vi/zHyxq9xZ5Bo/maxresdefault.jpg',
'https://www.youtube.com/watch?v=zHyxq9xZ5Bo',
11),
('The Thrill Is Gone',
'B.B. King',
'The thrill is gone
The thrill is gone away
You know you done me wrong, baby
And you''ll be sorry someday',
'19691201',
325,
'https://i.ytimg.com/vi/9x9x3aAF8GA/maxresdefault.jpg',
'https://www.youtube.com/watch?v=9x9x3aAF8GA',
12),
('Three Little Birds',
'Bob Marley & The Wailers',
'Don''t worry about a thing
''Cause every little thing gonna be all right',
'19770603',
180,
'https://i.ytimg.com/vi/HNBCVM4KbUM/maxresdefault.jpg',
'https://www.youtube.com/watch?v=HNBCVM4KbUM',
13),
('Liberdade Pra Dentro da Cabeça',
'Natiruts',
'Liberdade pra dentro da cabeça
E vai dizendo o que quiser dizer',
'19970101',
254,
'https://i.ytimg.com/vi/dtKwplO8Gvc/maxresdefault.jpg',
'https://www.youtube.com/watch?v=dtKwplO8Gvc',
14),
('Quer Voar',
'Matuê',
'Quer voar, quer subir
Quer viver tudo o que sempre sonhou',
'20210810',
191,
'https://i.ytimg.com/vi/KwM4yOwMls4/maxresdefault.jpg',
'https://www.youtube.com/watch?v=KwM4yOwMls4',
15),
('Ressuscita-me',
'Aline Barros',
'Mestre, eu preciso de um milagre
Transforma minha vida, o meu estado',
'20110128',
344,
'https://i.ytimg.com/vi/zBj-UZuNlxs/maxresdefault.jpg',
'https://www.youtube.com/watch?v=zBj-UZuNlxs',
16);
GO
INSERT INTO Comentario (Texto, IdMusica, IdUsuario)
VALUES
('Som tribal maneiro', 1, 1),
('Música bem bacana!', 2, 1),
('Música bem bacana!', 3, 1),
('Música bem bacana!', 4, 1),
('Obra-prima absoluta do rock, arrepia até hoje.', 5, 4),
('Energia pura dos anos 90!', 6, 5),
('Letra atemporal da Legião Urbana.', 7, 6),
('Cazuza eterno, impossível não cantar junto.', 8, 7),
('Perfeita para ouvir num dia de sol.', 9, 8),
('Linha de baixo mais icônica da história do pop.', 10, 9),
('Clima oitentista viciante demais.', 11, 10),
('Voz absurda da Adele nessa música!', 12, 11),
('A harmonia e a poesia do Djavan são únicas.', 13, 12),
('Essa parceria com o Stevie Wonder é lendária.', 14, 13),
('Clássico absoluto da música brasileira.', 15, 14),
('Bossa nova em sua forma mais pura.', 16, 15),
('Levanta o astral de qualquer ambiente.', 17, 16),
('Samba bom demais para cantar na roda.', 18, 17),
('Didididiê clássico de todo churrasco!', 19, 18),
('Patrimônio cultural do Nordeste e do Brasil.', 20, 19),
('Dá vontade de dançar forró na hora.', 21, 20),
('Rainha da sofrência, marcou uma geração.', 22, 21),
('Poeira levantando! Carnaval garantido.', 23, 2),
('Batida envolvente que dominou o mundo.', 24, 3),
('Produção e flow impecáveis do Kendrick.', 25, 4),
('Clássico necessário do rap nacional.', 26, 5),
('Piano emocionante e vocal impecável.', 27, 6),
('Groove perfeito, Daft Punk nunca erra.', 28, 7),
('Orgulho da música eletrônica brasileira!', 29, 8),
('Riff de guitarra hipnotizante.', 30, 9),
('Peso e energia do começo ao fim.', 31, 10),
('Um dos solos mais emocionantes do metal.', 32, 11),
('Jazz instrumental em compasso 5/4 genial.', 33, 12),
('Cada nota da guitarra do B.B. King conta uma história.', 34, 13),
('Mensagem simples que traz paz imediata.', 35, 14),
('Clássico do reggae brasileiro.', 36, 15),
('Produção pesada do trap nacional.', 37, 16),
('Louvor emocionante e muito forte.', 38, 17);
GO
INSERT MusicaGenero (IdMusica, IdGenero)
VALUES
(1,1),
(1,2),
(2,1),
(3,1),
(4,3),
(5,4),
(6,4),
(7,5),
(7,4),
(8,5),
(8,7),
(9,5),
(9,7),
(10,6),
(11,6),
(11,17),
(12,6),
(12,17),
(13,8),
(14,8),
(14,21),
(15,8),
(15,17),
(16,9),
(16,8),
(16,21),
(17,10),
(17,8),
(18,10),
(18,8),
(19,11),
(19,10),
(20,12),
(20,8),
(21,12),
(22,3),
(23,13),
(23,6),
(24,14),
(24,6),
(25,15),
(25,24),
(26,16),
(26,15),
(27,17),
(27,6),
(28,18),
(28,6),
(29,18),
(30,19),
(30,4),
(31,20),
(31,4),
(32,20),
(32,4),
(33,21),
(34,22),
(35,23),
(36,23),
(36,5),
(37,24),
(37,16),
(38,25);
GO
SELECT * FROM Musica;
SELECT * FROM Genero;
SELECT * FROM MusicaGenero;
SELECT * FROM Comentario;
