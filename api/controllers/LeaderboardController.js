module.exports = {

  getLeaderboard: async function (req, res) {
    const rankingSQL =
        `select player.name,
                COALESCE(p1won.count,0)+COALESCE(p2won.count,0)            as won,
                COALESCE(p1lost.count,0)+COALESCE(p2lost.count,0)          as lost,
                (COALESCE(p1won.count,0.0)+COALESCE(p2won.count,0.0))/(COALESCE(p1won.count,0.0)+COALESCE(p2won.count,0.0) + COALESCE(p1lost.count,0.0)+COALESCE(p2lost.count,0.0) ) as percentage
         from
           player
             left join
             (
               select
                 p1,
                 COUNT(*) as count
               from match as
                    m
               where p1_calculated_score>p2_calculated_score
               group by p1) as p1won
             on player.id = p1won.p1

             left join
             (select
                p1,
                COUNT(*)
                as
                count
              from match
              where p2_calculated_score > p1_calculated_score
              group by p1) as p1lost
             on p1lost.p1 = player.id

             left join
             (
               select
                 p2,
                 COUNT(*)
                 as
                 count
               from match as
                    m
               where p2_calculated_score>p1_calculated_score
               group by p2) as p2won
             on player.id = p2won.p2

             left join
             (select
                p2,
                COUNT(*)
                as
                count
              from match
              where p1_calculated_score > p2_calculated_score
              group by p2) as p2lost
             on p2lost.p2 = player.id
         order by percentage desc;
    `

    let rawResult = await sails.sendNativeQuery(rankingSQL, [])
    res.ok(rawResult.rows)

  },
}
