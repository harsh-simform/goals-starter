import { check } from 'express-validator';

export const postRules = {
  forPostCreate: [
    check('title')
      .isLength({ min: 2 })
      .withMessage('post title must be at least 2 chars long!'),
    check('content')
      .exists({ checkFalsy: true })
      .withMessage('post description is required!'),
  ],
  forPostGet: [
    check('skip').not().isEmpty().withMessage('skip cannot be empty'),
    check('take').not().isEmpty().withMessage('take cannot be empty'),
  ],
};
