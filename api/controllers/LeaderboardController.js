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
      return (record != null && (record.win + record.lost) > 0);
    });


    function addPlayersToDict(player){
      dict[player.id]={name:player.name, allTimeWin:0,allTimeLost:0, win:0, lost:0}
    }

    function addMatchesToDict(match){
      if(match.p1_calculated_score>match.p2_calculated_score){
        dict[match.p1].allTimeWin++
        dict[match.p2].allTimeLost++
        if(moment(match.createdAt).isSameOrAfter(moment(),'month')){
          dict[match.p1].win++
          dict[match.p2].lost++
        }

      } else {
        dict[match.p2].allTimeWin++
        dict[match.p1].allTimeLost++
        if(moment(match.createdAt).isSameOrAfter(moment(),'month')){
          dict[match.p2].win++
          dict[match.p1].lost++
        }
      }
    }

    function calculateStats(record){
      record.percentage = record.win/(record.lost + record.win)
      record.allTimePercentage = record.allTimeWin/(record.allTimeLost + record.allTimeWin)
    }

    res.ok(filtered)

  },
}
