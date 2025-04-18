"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function updateUsername(username) {
  // we need to check that user who is trying to update username belongs to that particular account

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const existingusername = await db?.user.findUnique({
    where: { username },
  });

  if (existingusername && existingusername.id !== userId) {
    throw new Error("Username is already taken");
  }

  if (!clerkClient ) {
    throw new Error("Clerk client is not initialized properly");
  }

  await db.user.update({
    where: { clerkUserId: userId },
    data: { username },
  });

  await clerkClient?.users?.updateUser?.(userId,{
    username
  })

  return { sucess: true };
}
