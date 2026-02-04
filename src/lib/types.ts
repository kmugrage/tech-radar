export type RadarWithRelations = {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  quadrants: Quadrant[];
  rings: Ring[];
  blips: BlipWithRelations[];
};

export type Quadrant = {
  id: string;
  radarId: string;
  name: string;
  position: number;
  color: string;
};

export type Ring = {
  id: string;
  radarId: string;
  name: string;
  position: number;
  opacity: number;
};

export type BlipWithRelations = {
  id: string;
  radarId: string;
  quadrantId: string;
  ringId: string;
  name: string;
  description: string | null;
  isNew: boolean;
  offsetX: number;
  offsetY: number;
  createdAt: Date;
  updatedAt: Date;
  quadrant?: Quadrant;
  ring?: Ring;
};
