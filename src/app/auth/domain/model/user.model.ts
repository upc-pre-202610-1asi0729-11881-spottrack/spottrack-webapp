export enum UserRole {
  ADMIN  = 'ADMIN',
  CLIENT = 'CLIENT',
}

export interface User {
  email: string;
  name:  string;
  role:  UserRole;
}
