var moment = require('moment');
module.exports = {

  getLeaderboard: async function (req, res) {


    let matches = await Match.find()
    let players = await Player.find()

    let dict = []

    players.map(addPlayersToDict)

    matches.map(addMatchesToDict)
    dict.map(calculateStats)

    let filtered = dict.filter(function (record) {
      return (record != null && (record.won + record.lost) > 0);
    });

    filtered.sort(function(first, second){
      return second.percentage - first.percentage
    })


    function addPlayersToDict(player){
      dict[player.id]={name:player.name, allTimeWin:0,allTimeLost:0, won:0, lost:0}
    }

    function addMatchesToDict(match){
      if(match.p1_calculated_score>match.p2_calculated_score){
        dict[match.p1].allTimeWin++
        dict[match.p2].allTimeLost++
        if(moment(match.createdAt).isSameOrAfter(moment(),'month')){
          dict[match.p1].won++
          dict[match.p2].lost++
        }

      } else {
        dict[match.p2].allTimeWin++
        dict[match.p1].allTimeLost++
        if(moment(match.createdAt).isSameOrAfter(moment(),'month')){
          dict[match.p2].won++
          dict[match.p1].lost++
        }
      }
    }

    function calculateStats(record){
      record.percentage = record.won/(record.lost + record.won)
      record.allTimePercentage = record.allTimeWin/(record.allTimeLost + record.allTimeWin)
    }

    res.ok(filtered)

  },
}
