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
    p1: {
      type: 'number',
      required: true,
    },
    p2: {
      type: 'number',
      required: true,
    },
    p1_score: {
      type: 'number',
      required: true,
    },
    p1_calculated_score: {
      type: 'number',
      required: true,
    },
    p2_score: {
      type: 'number',
      required: true,
    },
    p2_calculated_score: {
      type: 'number',
      required: true,
    },
    p1_distribution: {
      type: 'number'
    },
    p2_distribution: {
      type: 'number'
    }
  },

};

