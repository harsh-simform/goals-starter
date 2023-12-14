import {
  adjectives,
  colors,
  countries,
  uniqueNamesGenerator,
} from 'unique-names-generator';
import { ChatRoom } from '@prisma/client';
import { prisma } from '../../../common/helper';

export const createOrReturnRoom = async (
  users: number[]
): Promise<ChatRoom> => {
  let room = await prisma.chatRoom.findFirst({
    where: {
      members: {
        every: {
          id: {
            in: users,
          },
        },
      },
    },
  });
  if (!room) {
    const randomName = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, countries],
    });
    room = await prisma.chatRoom.create({
      data: {
        name: randomName,
        members: {
          connect: users.map((user) => ({ id: user })),
        },
      },
    });
  }
  return room;
};
