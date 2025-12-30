
export interface Project {
  id: string;
  name: string;
  ref: string;
  location: string;
  status: 'En proyecto' | 'En Construcción' | 'Completado' | 'Concurso';
  statusColor: string;
  floors: string;
  units: string;
  surface: string;
  size: string;
  community: string;
  province: string;
  businessType: string;
  regime: string;
  img: string;
  detailImgUrl?: string;
  profiles: string[];
  profileCount: string | null;
  grayscale?: boolean;
  address?: string;
  cadastralRef?: string;
  developer?: string;
  architect?: string;
  builder?: string;
  budget?: string;
  costPerM2?: string;
  salesVolume?: string;
  description?: string;
  planImg?: string;
  pdfUrl?: string;
  typology?: string;
  subtypology?: string;
  roofType?: string;
  floorsAboveGround?: string;
  surfaceAboveGround?: string;
  floorsBelowGround?: string;
  surfaceBelowGround?: string;
  totalFloors?: string;
  notes?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface GroundingSource {
  title: string;
  uri: string;
}