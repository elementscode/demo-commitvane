import { sql, session, AuthError, ForbiddenError } from "@elements/app";

export type Role = "rep" | "manager";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

/** @rpc */
export function signin(email: string, password: string): Role {
  let address = email.trim().toLowerCase();

  if (!address || !password) {
    throw new AuthError("enter your email and password");
  }

  let user = sql<User>(
    `select id, email, name, role from users
     where email = ${address}
       and passwordHash = crypt(${password}, passwordHash)`,
  ).first();

  if (!user) {
    throw new AuthError("invalid email or password");
  }

  session.login({ userId: user.id, userName: user.name, role: user.role });

  return user.role;
}

/** @rpc */
export function signout() {
  session.logout();
}

export function homeFor(role: Role): string {
  return role === "manager" ? "/dashboard" : "/deals";
}

/**
 * Reads the role from the database rather than the session, so a change of
 * role takes effect on the next request.
 */
export function currentUserOrThrow(role?: Role): User {
  session.isLoggedInOrThrow();

  let user = sql<User>(
    `select id, email, name, role from users where id = ${session.getOrThrow("userId")}`,
  ).first();

  if (!user) {
    throw new AuthError("sign in again");
  }

  if (role && user.role !== role) {
    throw new ForbiddenError(`${role} access required`);
  }

  return user;
}
