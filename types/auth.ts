export type UserType = {
  id: string
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: string
  token: string
}

export type User = {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    gender?: 'MALE' | 'FEMALE' | 'UNSPECIFIED';
    role: string;
    password?: string; // Password is optional
};

