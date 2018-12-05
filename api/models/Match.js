/**
 * Match.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    game_type: {
      type: 'number',
      required: true
    },
    player: {
      type: 'number',
      required: true,
    },
    opponent: {
      type: 'number',
      required: true,
    },
    score: {
      type: 'number',
      required: true,
    },
    calculated_score: {
      type: 'number',
      required: true,
    },
    opponent_score: {
      type: 'number',
      required: true,
    },
    opponent_calculated_score: {
      type: 'number',
      required: true,
    },
    distribution: {
      type: 'number'
    },
    opponent_distribution: {
      type: 'number'
    }
  },

};

