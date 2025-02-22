export interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
    dob: string;
    password: string;
    role: string;
    interests: string[];
    isActive: boolean;
}

