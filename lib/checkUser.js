// check user is logged in or not

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  // The currentUser helper returns the Backend User object of the currently active user. It can be used in Server Components, Route Handlers, and Server Actions.

  if (!user) {
    console.error("No current user found");
    return null;
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (loggedInUser) {
      // console.log("User already exists in Neon DB:", loggedInUser);
      return loggedInUser;
    }

    const name = `${user.firstName} ${user.lastName}`;
    console.log(clerkClient);

    // update the username inside the clerk

    if (clerkClient && clerkClient.users) {
      (await clerkClient()).users.updateUser(user.id, {
        username: name.split(" ").join("-") + user.id.slice(-4),
      });
    } else {
      console.error("clerkClient.users is undefined");
    }

    // update the username inside the database

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0]?.emailAddress, // Corrected email field
        username: name.split(" ").join("-") + user.id.slice(-4),
      },
    });

    return newUser;
  } catch (error) {
    console.log(error);
  }
};
