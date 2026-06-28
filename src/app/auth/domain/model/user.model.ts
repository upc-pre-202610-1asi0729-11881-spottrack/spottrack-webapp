export enum UserRole {
  ADMIN  = 'ADMIN',
  CLIENT = 'CLIENT',
}

export interface User {
  id:    number;
  email: string;
  name:  string;
  role:  UserRole;
}
