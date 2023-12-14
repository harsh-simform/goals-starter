import { check } from 'express-validator';

export const groupRules = {
  forCreateGroup: [
    check('name')
      .not()
      .isEmpty()
      .withMessage('name is required to create group!')
      .isLength({ min: 5 })
      .withMessage('group name must be at least 5 chars long!'),
    check('userIds')
      .not()
      .isEmpty()
      .withMessage('user ids are required to create group!')
      .isArray({ max: 100 })
      .withMessage('maximum 100 members are allowed'),
  ],
  forGroupGet: [
    check('skip').not().isEmpty().withMessage('skip cannot be empty'),
    check('take').not().isEmpty().withMessage('take cannot be empty'),
  ],
};
