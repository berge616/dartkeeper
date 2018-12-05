/**
 * MatchController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

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
    let p1Distribution = await Distribution.create({
      20: p1Marks[0], 19: p1Marks[1], 18: p1Marks[2], 17: p1Marks[3], 16: p1Marks[4],
      15: p1Marks[5], 14: p1Marks[6], 13: p1Marks[7], 12: p1Marks[8], 11: p1Marks[9], 10: p1Marks[10],
      9: p1Marks[11], 8: p1Marks[12], 7: p1Marks[13], 6: p1Marks[14], 5: p1Marks[15], 4: p1Marks[16],
      3: p1Marks[17], 2: p1Marks[18], 1: p1Marks[19], bullseye: p1Marks.bullseye, door: p1Marks.door,
    }).fetch()

    let p2Distribution = await Distribution.create({
      20: p2Marks[0], 19: p2Marks[1], 18: p2Marks[2], 17: p2Marks[3], 16: p2Marks[4],
      15: p2Marks[5], 14: p2Marks[6], 13: p2Marks[7], 12: p2Marks[8], 11: p2Marks[9], 10: p2Marks[10],
      9: p2Marks[11], 8: p2Marks[12], 7: p2Marks[13], 6: p2Marks[14], 5: p2Marks[15], 4: p2Marks[16],
      3: p2Marks[17], 2: p2Marks[18], 1: p2Marks[19], bullseye: p2Marks.bullseye, door: p2Marks.door,
    }).fetch()

    p1CalculatedScore = calculateScore(p1Marks)
    p2CalculatedScore = calculateScore(p2Marks)

    await Match.create({
      game_type: req.body.gameType, player: p1.id, opponent: p2.id, score: req.body.p1.score,
      calculated_score: p1CalculatedScore, opponent_score: req.body.p2.score, opponent_calculated_score: p2CalculatedScore,
      distribution: p1Distribution.id, opponenet_distribution: p2Distribution.id,
    })

    await Match.create({
      game_type: req.body.gameType, player: p2.id, opponent: p1.id, score: req.body.p2.score,
      calculated_score: p2CalculatedScore, opponent_score: req.body.p1.score, opponent_calculated_score: p1CalculatedScore,
      distribution: p2Distribution.id, opponenet_distribution: p1Distribution.id,
    })

    return res.ok()

    function calculateScore (distribution) {

      let score = 20 * distribution[20] + 19 * distribution[19] + 18 * distribution[18] + 17 * distribution[17] + 16 * distribution[16] + 15 *
        distribution[15] +
        14 * distribution[14] + 13 * distribution[13] + 12 * distribution[12] + 11 * distribution[11] + 10 * distribution[10] + 9 * distribution[9] +
        8 * distribution[8] + 7 * distribution[7] + 6 * distribution[6] + 5 * distribution[5] + 4 * distribution[4] + 3 * distribution[3] +
        2 * distribution[2] + 1 * distribution[1] + 25 * distribution.bullseye - 10 * distribution.door
      return score

    }
  },
}

