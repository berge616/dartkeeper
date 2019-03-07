/**
 * Match.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
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
    p1_20: {
      type: 'number',
    },
    p1_19: {
      type: 'number',
    },
    p1_18: {
      type: 'number',
    },
    p1_17: {
      type: 'number',
    },
    p1_16: {
      type: 'number',
    },
    p1_15: {
      type: 'number',
    },
    p1_bullseye: {
      type: 'number'
    },
    p1_door: {
      type: 'number'
    },
    p2_20: {
      type: 'number',
    },
    p2_19: {
      type: 'number',
    },
    p2_18: {
      type: 'number',
    },
    p2_17: {
      type: 'number',
    },
    p2_16: {
      type: 'number',
    },
    p2_15: {
      type: 'number',
    },
    p2_bullseye: {
      type: 'number'
    },
    p2_door: {
      type: 'number'
    }
  },

};

