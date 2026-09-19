export interface CloudinaryImage {
  url: string;
  publicId?: string;
  altText?: string;
  type?: string;
}

export interface Destination {
  _id: string;
  name: string;
  slug: string;
  stateId: string;
  stateName?: string;
  type: string;
  budgetCategory: string;
  description: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  estimatedDailyBudget: {
    budget: number;
    mid: number;
    luxury: number;
  };
  tags: string[];
  images: CloudinaryImage[];
  bestMonths?: string[];
  nearbyAttractionIds?: string[];
  nearbyTransportIds?: string[];
  isActive?: boolean;
  currency?: string;
  // Enriched fields from related collections:
  safetyRating?: number;
  safetyAdvisories?: string[];
  bestSeasonText?: string;
}

export interface StateInfo {
  _id: string;
  name: string;
  code: string;
  capital: string;
  region: string;
  languages: string[];
  images?: CloudinaryImage[];
  currency?: string;
}

export interface Accommodation {
  _id: string;
  name: string;
  destinationId: string;
  stateId?: string;
  starRating?: number;
  pricePerNight?: {
    min: number;
    max: number;
  };
  amenities?: string[];
  address?: string;
  type?: string;
  budgetCategory?: string;
  images?: CloudinaryImage[];
  checkInTime?: string;
  checkOutTime?: string;
}

export interface Attraction {
  _id: string;
  name: string;
  destinationId: string;
  stateId?: string;
  description?: string;
  budgetCategory?: string;
  type?: string;
  entryFee?: {
    adult?: number;
    child?: number;
    foreign?: number;
    currency?: string;
  };
  estimatedDurationMins?: number;
  openingHours?: any;
  tags?: string[];
  images?: CloudinaryImage[];
}

export interface DestinationSafety {
  _id: string;
  destinationId: string;
  stateId?: string;
  overallRating: number;
  advisories: string[];
  safetyNotes?: any;
  emergencyContacts?: Array<{
    type: string;
    number: string;
    available24h: boolean;
  }>;
  lastUpdated?: string;
}

export interface DestinationSeasons {
  _id: string;
  destinationId: string;
  stateId?: string;
  bestFor: string[];
  peakSeason?: Array<{
    month: number;
    rating: number;
    weather: string;
    crowdLevel: string;
    priceMultiplier: number;
  }>;
  offSeason?: number[];
  monsoonMonths?: number[];
  snowMonths?: number[];
}

export interface TravelPackage {
  _id: string;
  title: string;
  destinationIds: string[];
  stateIds?: string[];
  durationDays: number;
  budgetCategory: string;
  price: {
    min: number;
    max: number;
  };
  currency?: string;
  inclusions: string[];
  exclusions: string[];
  images?: CloudinaryImage[];
  tags: string[];
}

export interface ItineraryTemplate {
  _id: string;
  title: string;
  destinationIds: string[];
  stateIds?: string[];
  durationDays: number;
  budgetCategory: string;
  difficulty?: string;
  theme?: string;
  currency?: string;
  days: Array<{
    dayNumber: number;
    title: string;
    activities: Array<{
      time: string;
      activityType: string;
      name: string;
      description: string;
    }>;
  }>;
  estimatedDailyBudget?: number;
  estimatedTotalCost?: number;
  estimatedTransportCost?: number;
  estimatedFoodCost?: number;
  estimatedActivityCost?: number;
}

export interface PilgrimageSite {
  _id: string;
  name: string;
  destinationId: string;
  stateId?: string;
  deity?: string;
  religion?: string;
  significance?: string;
  dressCode?: string;
  visitorsPerYear?: number;
  images?: CloudinaryImage[];
}

export interface FlightOption {
  _id: string;
  airline: string;
  flightNumber: string;
  originAirportId: string;
  destinationAirportId: string;
  departureTime: string;
  arrivalTime: string;
  durationMins: number;
  fare: {
    economy: number;
    business?: number;
    first?: number;
  };
  aircraft?: string;
}

export interface TrainOption {
  _id: string;
  trainName: string;
  trainNumber: string;
  originStationId: string;
  destinationStationId: string;
  departureTime: string;
  arrivalTime: string;
  durationMins: number;
  fare: {
    sleeper?: number;
    ac3tier?: number;
    ac2tier?: number;
    acFirstClass?: number;
  };
}

export interface BusOption {
  _id: string;
  operator: string;
  busNumber: string;
  originTerminalId: string;
  destinationTerminalId: string;
  departureTime: string;
  arrivalTime: string;
  durationMins: number;
  fare: {
    seater?: number;
    semi_sleeper?: number;
    sleeper?: number;
  };
  type?: string;
}
