
export interface User {
  uid: string;
  email: string;
  full_name: string;
  sport: string;
  age: number | null;
  height: number | null;
  weight: number | null;
  gender: string;
}

export interface Assessment {
  id: string;
  drill: string;
  score: number;
  unit: string;
  createdAt: string;
}

export enum DrillType {
  PushUps = 'Push-ups',
  Squats = 'Squats',
  BicepCurls = 'Bicep Curls',
  ReactionTime = 'Reaction Time',
  PlankHold = 'Plank Hold',
  HighKnees = 'High Knees',
  Balance = 'Single Leg Balance',
  JumpingJacks = 'Jumping Jacks',
  ReverseLunges = 'Reverse Lunges'
}

export interface TrainingPack {
  id: string;
  name: string;
  description: string;
  icon: string;
  durationDays: number;
  dailyDrills: DrillType[][];
}

export interface ActivePackStatus {
  packId: string;
  startDate: string;
}
