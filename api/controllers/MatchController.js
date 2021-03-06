/**
 * MatchController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const slackUrl = sails.config.custom.slackUrl
const rp = require('request-promise')

module.exports = {
  create: async function (req, res) {
    if (req.body.gameType == undefined) return res.badRequest('missing game type')
    if (!req.body.p1) return res.badRequest('missing p1 data')
    if (!req.body.p1.name) return res.badRequest('missing p1 name')
    if (!req.body.p2.name) return res.badRequest('missing p2 name')
    if (!req.body.p2) return res.badRequest('missing p2 data')

    //Find player based on name, otherwise create new player
    let p1 = await Player.findOne({name: req.body.p1.name})
    let p2 = await Player.findOne({name: req.body.p2.name})
    if (!p1) {
      p1 = await Player.create({name: req.body.p1.name}).fetch()
    }
    if (!p2) {
      p2 = await Player.create({name: req.body.p2.name}).fetch()
    }

    let p1Marks = req.body.p1.marks
    let p2Marks = req.body.p2.marks

    const p1CalculatedScore = calculateScore(p1Marks)
    const p2CalculatedScore = calculateScore(p2Marks)

    //Ensure that this is not a duplicate of previous match
    let lastMatch = await Match.find({limit:1,sort: 'id DESC'})
    if(lastMatch[0].p1 === p1.id && lastMatch[0].p2 === p2.id && lastMatch[0].p1_calculated_score === p1CalculatedScore && lastMatch[0].p2_calculated_score === p2CalculatedScore){
      sails.log.error("this match is a dup so ignoring");
      return res.ok();
    }

    await Match.create({
      p1: p1.id, p2: p2.id,
      p1_score: req.body.p1.score, p1_calculated_score: p1CalculatedScore,
      p2_score: req.body.p2.score, p2_calculated_score: p2CalculatedScore
    })

    let winner, loser, winnerScore, loserScore, statement
    if (p1CalculatedScore > p2CalculatedScore) {
      winner = req.body.p1.name
      winnerScore = req.body.p1.score
      loser = req.body.p2.name
      loserScore = req.body.p2.score

    } else {
      winner = req.body.p2.name
      winnerScore = req.body.p2.score
      loser = req.body.p1.name
      loserScore = req.body.p1.score
    }

    const diff = winnerScore - loserScore
    const by50 = [`${winner} snuck by ${loser}`,`${winner} walked past ${loser} over the weekend and didn't make eye contact`, `${winner} taunted ${loser}` ]
    const by100 = [`${winner} triumphed over ${loser}`,`${winner} did what they came here to do and beat ${loser}`, `${winner} finished ${loser}`]
    const by150 = [`${winner} conquered ${loser}`]
    const by200 = [`${winner} embarrassed ${loser}`]
    const by250 = [`${winner} asked ${loser} to bring their pen and paper and then proceeded to teach an elementary level lesson to ${loser}`]
    const by300 = [`${winner} had a marvelous game against ${loser}` ]
    const by350 = [`${winner} utterly humiliated ${loser}`, `${winner} RSVP'd to ${loser}'s dance recital then blew it off`]
    const by400 = [`${winner} had the game of their life against ${loser}`]
    const by450 = [`${winner} bestowed complete destruction upon ${loser}`]
    const by500 = [ `${winner} turned out the lights on ${loser}`]
    const by550 = [`${winner} read ${loser} a book and put them to bed`]
    const by600 = [`${winner} taught ${loser} how the game of darts is played`]


    if (diff < 50) {statement = by50[Math.floor(Math.random()*by50.length)]  }
    else if (diff < 100) { statement = by100[Math.floor(Math.random()*by100.length)] }
    else if (diff < 150) { statement = by150[Math.floor(Math.random()*by150.length)] }
    else if (diff < 200) { statement = by200[Math.floor(Math.random()*by200.length)] }
    else if (diff < 250) { statement = by250[Math.floor(Math.random()*by250.length)] }
    else if (diff < 300) { statement = by300[Math.floor(Math.random()*by300.length)]}
    else if (diff < 350) { statement = by350[Math.floor(Math.random()*by350.length)]}
    else if (diff < 400) { statement = by400[Math.floor(Math.random()*by400.length)] }
    else if (diff < 450) { statement = by450[Math.floor(Math.random()*by450.length)]}
    else if (diff < 500) { statement = by500[Math.floor(Math.random()*by500.length)] }
    else if (diff < 550) { statement = by550[Math.floor(Math.random()*by550.length)] }
    else { statement = by600[Math.floor(Math.random()*by600.length)] }

    sendToSlack(winnerScore, loserScore, statement)

    return res.ok({result: 200})

    function calculateScore (distribution) {

      let score = 20 * distribution[20] + 19 * distribution[19] + 18 * distribution[18] + 17 * distribution[17] + 16 * distribution[16] + 15 *
        distribution[15] + 25 * distribution.bullseye - 10 * distribution.door
      return score

    }

    function sendToSlack (winnerScore, loserScore, statement) {
      var options = {
        uri: slackUrl,
        method: 'POST',
        headers: {
          'User-Agent': 'Request-Promise',
          'Content-Type': 'application/json',
        },
        body: {
          text: statement + ' with a score of ' + winnerScore + ' to ' + loserScore,
        },
        json: true,
      }

      //Call apple server to get receipt data
      rp(options).then(function (resData) {
          sails.log.info('Success posting to slack: ', resData)

      }).catch(function(error) {
        sails.log.error('Failed to send status to slack:', error)
      })
    }
  },
  startGame: async function(req,res) {
    const p1 = req.param('p1Name')
    const p2 = req.param('p2Name')

    var options = {
      uri: slackUrl,
      method: 'POST',
      headers: {
        'User-Agent': 'Request-Promise',
        'Content-Type': 'application/json',
      },
      body: {
        text: 'The darts are flying! ' + p1 + ' vs ' + p2
      },
      json: true,
    }

    //Call apple server to get receipt data
    rp(options).then(function (resData) {
      sails.log.info('Success posting to slack: ', resData)

    }).catch(function(error) {
      sails.log.error('Failed to send status to slack:', error)
    })
    res.ok()
  }
}

