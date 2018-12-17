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

    var winner, loser, winnerScore, loserScore, verb
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
    if (diff < 50) {verb = ' snuck by ' }
    else if (diff < 100) { verb = ' triumphed over ' }
    else if (diff < 150) { verb = ' smoked ' }
    else if (diff < 200) { verb = ' conquered ' }
    else if (diff < 250) { verb = ' embarrassed ' }
    else if (diff < 300) { verb = ' brought his pen and paper and taught a lesson to ' }
    else if (diff < 350) { verb = ' curb stomped ' }
    else if (diff < 400) { verb = ' utterly humiliated ' }
    else if (diff < 450) { verb = ' bestowed complete destruction upon ' }
    else if (diff < 500) { verb = ' took a hot, steamy dump on ' }
    else { verb = ' pooped in a bowl of Honey Nut Cheerios and spoon fed it to ' }

    sendToSlack(winner, winnerScore, loser, loserScore, verb)

    return res.ok({result: 200})

    function calculateScore (distribution) {

      let score = 20 * distribution[20] + 19 * distribution[19] + 18 * distribution[18] + 17 * distribution[17] + 16 * distribution[16] + 15 *
        distribution[15] +
        14 * distribution[14] + 13 * distribution[13] + 12 * distribution[12] + 11 * distribution[11] + 10 * distribution[10] + 9 * distribution[9] +
        8 * distribution[8] + 7 * distribution[7] + 6 * distribution[6] + 5 * distribution[5] + 4 * distribution[4] + 3 * distribution[3] +
        2 * distribution[2] + 1 * distribution[1] + 25 * distribution.bullseye - 10 * distribution.door
      return score

    }

    function sendToSlack (winnerName, winnerScore, loserName, loserScore, verb) {
      var options = {
        uri: slackUrl,
        method: 'POST',
        headers: {
          'User-Agent': 'Request-Promise',
          'Content-Type': 'application/json',
        },
        body: {
          text: winnerName + verb + loserName + ' with a score of ' + winnerScore + ' to ' + loserScore,
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

