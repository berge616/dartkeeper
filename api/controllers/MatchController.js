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

    //Record players marks in distribution table
    let p1Marks = req.body.p1.marks
    let p2Marks = req.body.p2.marks

    let p1MarksResolved = {
      20: p1Marks[20] ? p1Marks[20] : 0,
      19: p1Marks[19] ? p1Marks[19] : 0,
      18: p1Marks[18] ? p1Marks[18] : 0,
      17: p1Marks[17] ? p1Marks[17] : 0,
      16: p1Marks[16] ? p1Marks[16] : 0,
      15: p1Marks[15] ? p1Marks[15] : 0,
      14: p1Marks[14] ? p1Marks[14] : 0,
      13: p1Marks[13] ? p1Marks[13] : 0,
      12: p1Marks[12] ? p1Marks[12] : 0,
      11: p1Marks[11] ? p1Marks[11] : 0,
      10: p1Marks[10] ? p1Marks[10] : 0,
      9: p1Marks[9] ? p1Marks[9] : 0,
      8: p1Marks[8] ? p1Marks[8] : 0,
      7: p1Marks[7] ? p1Marks[7] : 0,
      6: p1Marks[6] ? p1Marks[6] : 0,
      5: p1Marks[5] ? p1Marks[5] : 0,
      4: p1Marks[4] ? p1Marks[4] : 0,
      3: p1Marks[3] ? p1Marks[3] : 0,
      2: p1Marks[2] ? p1Marks[2] : 0,
      1: p1Marks[1] ? p1Marks[1] : 0,
      bullseye: p1Marks.bullseye ? p1Marks.bullseye : 0,
      door: p1Marks.door ? p1Marks.door : 0,
    }
    let p2MarksResolved = {
      20: p2Marks[20] ? p2Marks[20] : 0,
      19: p2Marks[19] ? p2Marks[19] : 0,
      18: p2Marks[18] ? p2Marks[18] : 0,
      17: p2Marks[17] ? p2Marks[17] : 0,
      16: p2Marks[16] ? p2Marks[16] : 0,
      15: p2Marks[15] ? p2Marks[15] : 0,
      14: p2Marks[14] ? p2Marks[14] : 0,
      13: p2Marks[13] ? p2Marks[13] : 0,
      12: p2Marks[12] ? p2Marks[12] : 0,
      11: p2Marks[11] ? p2Marks[11] : 0,
      10: p2Marks[10] ? p2Marks[10] : 0,
      9: p2Marks[9] ? p2Marks[9] : 0,
      8: p2Marks[8] ? p2Marks[8] : 0,
      7: p2Marks[7] ? p2Marks[7] : 0,
      6: p2Marks[6] ? p2Marks[6] : 0,
      5: p2Marks[5] ? p2Marks[5] : 0,
      4: p2Marks[4] ? p2Marks[4] : 0,
      3: p2Marks[3] ? p2Marks[3] : 0,
      2: p2Marks[2] ? p2Marks[2] : 0,
      1: p2Marks[1] ? p2Marks[1] : 0,
      bullseye: p2Marks.bullseye ? p2Marks.bullseye : 0,
      door: p2Marks.door ? p2Marks.door : 0,
    }
    let p1Distribution = await Distribution.create(p1MarksResolved).fetch()

    let p2Distribution = await Distribution.create(p2MarksResolved).fetch()

    const p1CalculatedScore = calculateScore(p1MarksResolved)
    const p2CalculatedScore = calculateScore(p2MarksResolved)

    await Match.create({
      game_type: req.body.gameType, p1: p1.id, p2: p2.id, p1_score: req.body.p1.score,
      p1_calculated_score: p1CalculatedScore, p2_score: req.body.p2.score, p2_calculated_score: p2CalculatedScore,
      p1_distribution: p1Distribution.id, p2_distribution: p2Distribution.id,
    })

    var winner, loser, winnerScore, loserScore, statement
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
    const by100 = [`${winner} triumphed over ${loser}`,`${winner} did what he came here to do and beat ${loser}`, `${winner} finished ${loser}`]
    const by150 = [`${winner} conquered ${loser}`]
    const by200 = [`${winner} embarrassed ${loser}`]
    const by250 = [`${winner} asked ${loser} to bring his pen and paper and then proceeded to teach an elementary level lesson to ${loser}`]
    const by300 = [`${winner} had a marvelous game against ${loser}` ]
    const by350 = [`${winner} utterly humiliated ${loser}`, `${winner} RSVP'd to ${loser}'s dance recital then blew it off`]
    const by400 = [`${winner} had the game of his life against ${loser}`]
    const by450 = [`${winner} bestowed complete destruction upon ${loser}`]
    const by500 = [ `${winner} turned out the lights on ${loser}`]
    const by550 = [`${winner} read ${loser} a book and put him to bed`]
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
        distribution[15] +
        14 * distribution[14] + 13 * distribution[13] + 12 * distribution[12] + 11 * distribution[11] + 10 * distribution[10] + 9 * distribution[9] +
        8 * distribution[8] + 7 * distribution[7] + 6 * distribution[6] + 5 * distribution[5] + 4 * distribution[4] + 3 * distribution[3] +
        2 * distribution[2] + 1 * distribution[1] + 25 * distribution.bullseye - 10 * distribution.door
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
}

