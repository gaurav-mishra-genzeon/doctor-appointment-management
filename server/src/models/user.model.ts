export interface User {
    id: number;
    firstName: string;
    lastName:string;
    email: string;
    password: string;
    createdAt: Date;
    isAdmin: boolean;
    appointments: string[];
  }

  
  
  export interface Doctor {
    id: number;
    name: string;
    speciality: string;
    photoUrl: string;
    appointments: string[];
  }
  
  
  export interface Appointment {
    id: number;
    userId: number;
    doctorId: number;
    datetime: Date;
  }
  