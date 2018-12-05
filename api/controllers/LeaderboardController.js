module.exports = {

  getLeaderboard: async function (req, res) {
    const rankingSQL =
        `select player.name,
                COALESCE(won.count, 0.0)                                                      as won,
                COALESCE(lost.count, 0.0)                                                     as lost,
                COALESCE(won.count, 0.0) / (COALESCE(won.count, 0) + COALESCE(lost.count, 0)) as percentage
         from
           player
             left join
             (
               select
                 player,
                 COUNT(*)
                 as
                 count
               from match as
                    m
               where calculated_score>opponent_calculated_score
               group by player) as won
             on player.id = won.player

             left join
             (select
                player,
                COUNT(*)
                as
                count
              from match
              where opponent_calculated_score > calculated_score
              group by player) as lost
             on lost.player = player.id
         order by percentage desc;`

    let rawResult = await sails.sendNativeQuery(rankingSQL, [])
    res.ok(rawResult.rows)

  },
}
