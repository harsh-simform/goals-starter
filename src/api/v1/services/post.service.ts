import { Post } from '@prisma/client';
import { prisma } from '../../../common/helper/utils';

/**
 * Create New Post
 * @param param0 Post request data and Logged-In user's ID
 * @returns PostAttributes | null
 */
export const createNewPost = async ({
  title,
  content,
  published,
  authorId,
}: Post): Promise<Post | null> => {
  const user = await prisma.user.findUnique({
    where: {
      id: authorId,
    },
  });

  if (!user) {
    return null;
  }

  const post = await prisma.post.create({
    data: {
      title,
      content,
      published,
      User: {
        connect: {
          id: authorId,
        },
      },
    },
  });
  return post;
};
