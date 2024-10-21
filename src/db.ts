import { v4 as uuidv4 } from 'uuid';

export type User = {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
};

export const users: User[] = [];

export const createUser = (username: string, age: number, hobbies: string[]): User => {
  const newUser: User = {
    id: uuidv4(),
    username,
    age,
    hobbies,
  };
  users.push(newUser);
  return newUser;
};

export const findUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

export const updateUser = (id: string, username: string, age: number, hobbies: string[]): User | undefined => {
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex === -1) return undefined;

  users[userIndex] = { id, username, age, hobbies };
  return users[userIndex];
};

export const deleteUser = (id: string): boolean => {
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex === -1) return false;

  users.splice(userIndex, 1);
  return true;
};
