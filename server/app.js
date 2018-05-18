const fs = require('fs');
const _ = require('underscore');
const express = require('express');
const app = express();

// carregar "banco de dados" (data/jogadores.json e data/jogosPorJogador.json)
// você pode colocar o conteúdo dos arquivos json no objeto "db" logo abaixo
// dica: 3-4 linhas de código (você deve usar o módulo de filesystem (fs))
let db = {};

fs.readFile('server/data/jogadores.json', function (err, data) {
    if (err) {
        return console.log(err);
    }
    db.jogadores = JSON.parse(data);
});

fs.readFile('server/data/jogosPorJogador.json', function (err, data) {
    if (err) {
        return console.log(err);
    }
    db.jogosPorJogador = JSON.parse(data);
});

// configurar qual templating engine usar. Sugestão: hbs (handlebars)
app.set('view engine', 'hbs');
app.set('views', 'server/views');

// EXERCÍCIO 2
// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
// dica: o handler desta função é bem simples - basta passar para o template
//       os dados do arquivo data/jogadores.json

app.get('/', function (req, res) {
    res.render('index', db.jogadores);
});

// EXERCÍCIO 3
// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
// dica: o handler desta função pode chegar a ter umas 15 linhas de código

app.get('/jogador/:id/', function (req, res) {
    let perfilDesteJogador = _.find(db.jogadores.players, function(el) {
        return el.steamid === req.params.id;
    });

    let jogosDesteJogador = db.jogosPorJogador[req.params.id].games;

    let naoJogados = _.where(jogosDesteJogador, { playtime_forever: 0 });

    let ordenadoDesc = _.sortBy(jogosDesteJogador, 'playtime_forever').reverse();

    let topJogos = _.first(ordenadoDesc, 5);

    for (key in topJogos) {
        topJogos[key].playtime_forever = Math.round(topJogos[key].playtime_forever / 60);
    }

    res.render('jogador', {
                            'profile': perfilDesteJogador,
                            'gameInfo': topJogos,
                            'favorito': topJogos[0],
                            'gamesQtd': db.jogosPorJogador[req.params.id].game_count,
                            'unplayed': naoJogados.length
                        });
});

// EXERCÍCIO 1
// configurar para servir os arquivos estáticos da pasta "client"
// dica: 1 linha de código

app.use(express.static('client'));

// abrir servidor na porta 3000
// dica: 1-3 linhas de código

const server = app.listen(3000, () => {
  console.log('Escutando em: http://localhost:3000');
});
