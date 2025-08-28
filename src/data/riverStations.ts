// River station data extracted from public/river_station.csv
export interface RiverStation {
  site: string;
  river: string;
  stationName: string;
  latitude: number;
  longitude: number;
}

export const riverStations: RiverStation[] = [
  { site: "601001", river: "Young River", stationName: "Neds Corner", latitude: -33.706040026, longitude: 121.142061062 },
  { site: "601004", river: "Lort River", stationName: "Fairfield", latitude: -33.743286312, longitude: 121.256691216 },
  { site: "601005", river: "Young River", stationName: "Cascades", latitude: -33.540324082, longitude: 120.967676602 },
  { site: "601008", river: "Coramup Creek", stationName: "Myrup Rd", latitude: -33.764583691, longitude: 121.922495732 },
  { site: "601009", river: "Bandy Creek", stationName: "Fisheries Rd", latitude: -33.742155832, longitude: 121.98767879 },
  { site: "602001", river: "Pallinup River", stationName: "Bull Crossing", latitude: -34.335569793, longitude: 118.6641433 },
  { site: "602004", river: "Kalgan River", stationName: "Stevens Farm", latitude: -34.886094465, longitude: 117.999984666 },
  { site: "602009", river: "Robinson Drain", stationName: "Drop Structure", latitude: -35.026374684, longitude: 117.844146662 },
  { site: "602010", river: "Munster Hill Drain", stationName: "Robinson Dr Conflu", latitude: -35.026683772, longitude: 117.845081599 },
  { site: "602014", river: "King River", stationName: "Billa Boya Reserve", latitude: -34.932108713, longitude: 117.87485567 },
  { site: "602015", river: "Mill Brook", stationName: "Warren Rd", latitude: -34.930300963, longitude: 117.882927777 },
  { site: "602021", river: "Bremer River", stationName: "Devils Creek Rd", latitude: -34.214313348, longitude: 119.136747696 },
  { site: "602031", river: "Waychinicup River", stationName: "Cheynes Beach Rd", latitude: -34.885075683, longitude: 118.329256314 },
  { site: "602199", river: "Goodga River", stationName: "Black Cat", latitude: -34.947223547, longitude: 118.079659932 },
  { site: "602601", river: "Yakamia Creek", stationName: "Watti", latitude: -35.002940961, longitude: 117.890600677 },
  { site: "603001", river: "Marbellup Brook", stationName: "Elleker", latitude: -35.00691613, longitude: 117.727065805 },
  { site: "603002", river: "Denmark River", stationName: "Lindesay Gorge", latitude: -34.847826915, longitude: 117.27171226 },
  { site: "603003", river: "Denmark River", stationName: "Kompup", latitude: -34.699378387, longitude: 117.216959052 },
  { site: "603004", river: "Hay River", stationName: "Sunny Glen", latitude: -34.9108266, longitude: 117.478320965 },
  { site: "603005", river: "Mitchell River", stationName: "Beigpiegup", latitude: -34.827548842, longitude: 117.392879269 },
  { site: "616216", river: "Helena River", stationName: "Poison Lease Gs", latitude: -31.973078124, longitude: 116.290345403 },
  { site: "616233", river: "Helena River", stationName: "Roe Highway", latitude: -31.90554228, longitude: 116.01757864 },
  { site: "617001", river: "Moore River", stationName: "Quinns Ford", latitude: -30.98234383, longitude: 115.818958252 },
  { site: "617002", river: "Hill River", stationName: "Hill River Springs", latitude: -30.277129651, longitude: 115.366596473 },
  { site: "617003", river: "Gingin Brook", stationName: "Bookine Bookine", latitude: -31.319358087, longitude: 115.626966799 },
  { site: "617010", river: "Moore River North", stationName: "Moora Caravan Park", latitude: -30.637742707, longitude: 116.004096056 },
  { site: "701002", river: "Greenough River", stationName: "Karlanew Peak", latitude: -28.825134422, longitude: 114.845521395 },
  { site: "701007", river: "Chapman River", stationName: "Utakarra", latitude: -28.763496209, longitude: 114.670823537 },
  { site: "701008", river: "Greenough River", stationName: "Pindarring Rocks", latitude: -28.183314119, longitude: 115.677899526 },
  { site: "701009", river: "Irwin River", stationName: "Mountain Bridge", latitude: -29.236020431, longitude: 115.033428185 },
];

// Generate a deterministic seed based on coordinates
export const generateSeedFromCoordinates = (lat: number, lng: number): number => {
  // Create a simple hash from coordinates
  const latInt = Math.floor(Math.abs(lat) * 1000000);
  const lngInt = Math.floor(Math.abs(lng) * 1000000);
  return (latInt * 31 + lngInt) % 1000000;
};

// Seeded random number generator
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  nextInRange(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
} 