import { check } from 'express-validator';

export const chatRules = {
  forCreateChat: [
    check('text').not().isEmpty().withMessage('text is required!'),
    check('sentTo')
      .not()
      .isEmpty()
      .isNumeric()
      .withMessage('user id is required to send message!'),
  ],
  forChatGet: [
    check('skip').not().isEmpty().withMessage('skip cannot be empty'),
    check('take').not().isEmpty().withMessage('take cannot be empty'),
  ],
};
