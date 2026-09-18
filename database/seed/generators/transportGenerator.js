'use strict';
const states = require('../data/statesData');
const generateDestinations = require('./destinationsGenerator');

const PROV = {
  sourceType: 'SIMULATED',
  sourceName: 'TravelGenie Synthetic Generator',
  dataVersion: '1.0.0',
  lastVerifiedAt: new Date('2026-01-01')
};

const IMG_BASE = 'https://res.cloudinary.com/soootttd/image/upload/v1/placeholder';

function generateTransportData() {
  const destinations = generateDestinations();
  const destMap = {};
  for (const d of destinations) {
    if (!destMap[d.stateId]) destMap[d.stateId] = [];
    destMap[d.stateId].push(d);
  }

  // 1. Airports (At least 1-2 per state/UT -> ~50-70 total)
  const airports = [];
  const airportCodes = [
    { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', stateCode: 'DL', type: 'international', lng: 77.1000, lat: 28.5562 },
    { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', stateCode: 'MH', type: 'international', lng: 72.8679, lat: 19.0896 },
    { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bengaluru', stateCode: 'KA', type: 'international', lng: 77.7066, lat: 13.1986 },
    { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', stateCode: 'TN', type: 'international', lng: 80.1709, lat: 12.9941 },
    { code: 'CCU', name: 'Netaji Subhash Chandra Bose International Airport', city: 'Kolkata', stateCode: 'WB', type: 'international', lng: 88.4467, lat: 22.6547 },
    { code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', stateCode: 'TG', type: 'international', lng: 78.4294, lat: 17.2403 },
    { code: 'COK', name: 'Cochin International Airport', city: 'Kochi', stateCode: 'KL', type: 'international', lng: 76.3920, lat: 10.1556 },
    { code: 'AMD', name: 'Sardar Vallabhbhai Patel International Airport', city: 'Ahmedabad', stateCode: 'GJ', type: 'international', lng: 72.6347, lat: 23.0734 },
    { code: 'GOI', name: 'Dabolim International Airport', city: 'Goa', stateCode: 'GA', type: 'international', lng: 73.8314, lat: 15.3808 },
    { code: 'JAI', name: 'Jaipur International Airport', city: 'Jaipur', stateCode: 'RJ', type: 'international', lng: 75.8122, lat: 26.8242 },
    { code: 'LKO', name: 'Chaudhary Charan Singh International Airport', city: 'Lucknow', stateCode: 'UP', type: 'international', lng: 80.8836, lat: 26.7606 },
    { code: 'GAU', name: 'Lokpriya Gopinath Bordoloi International Airport', city: 'Guwahati', stateCode: 'AS', type: 'international', lng: 91.5859, lat: 26.1061 },
    { code: 'BBI', name: 'Biju Patnaik International Airport', city: 'Bhubaneswar', stateCode: 'OD', type: 'international', lng: 85.8178, lat: 20.2444 },
    { code: 'PAT', name: 'Jay Prakash Narayan Airport', city: 'Patna', stateCode: 'BR', type: 'domestic', lng: 85.0877, lat: 25.5913 },
    { code: 'RPR', name: 'Swami Vivekananda Airport', city: 'Raipur', stateCode: 'CG', type: 'domestic', lng: 81.7388, lat: 21.1804 },
    { code: 'VTZ', name: 'Visakhapatnam Airport', city: 'Visakhapatnam', stateCode: 'AP', type: 'international', lng: 83.2245, lat: 17.7212 },
    { code: 'IXR', name: 'Birsa Munda Airport', city: 'Ranchi', stateCode: 'JH', type: 'domestic', lng: 85.3219, lat: 23.3143 },
    { code: 'ATQ', name: 'Sri Guru Ram Dass Jee International Airport', city: 'Amritsar', stateCode: 'PB', type: 'international', lng: 74.7973, lat: 31.7096 },
    { code: 'IXC', name: 'Shaheed Bhagat Singh International Airport', city: 'Chandigarh', stateCode: 'CH', type: 'international', lng: 76.7885, lat: 30.6735 },
    { code: 'SXR', name: 'Sheikh ul-Alam International Airport', city: 'Srinagar', stateCode: 'JK', type: 'international', lng: 74.7742, lat: 34.0047 },
    { code: 'IXL', name: 'Kushok Bakula Rimpochee Airport', city: 'Leh', stateCode: 'LA', type: 'domestic', lng: 77.5465, lat: 34.1359 },
    { code: 'DED', name: 'Jolly Grant Airport', city: 'Dehradun', stateCode: 'UK', type: 'domestic', lng: 78.1803, lat: 30.1897 },
    { code: 'BHO', name: 'Raja Bhoj Airport', city: 'Bhopal', stateCode: 'MP', type: 'domestic', lng: 77.3377, lat: 23.2875 },
    { code: 'IXZ', name: 'Veer Savarkar International Airport', city: 'Port Blair', stateCode: 'AN', type: 'international', lng: 92.7297, lat: 11.6410 },
    { code: 'AGX', name: 'Agatti Airport', city: 'Agatti', stateCode: 'LD', type: 'domestic', lng: 72.1764, lat: 10.8242 },
    { code: 'PNY', name: 'Puducherry Airport', city: 'Puducherry', stateCode: 'PY', type: 'regional', lng: 79.8106, lat: 11.9697 },
    { code: 'DHM', name: 'Kangra Airport', city: 'Dharamshala', stateCode: 'HP', type: 'domestic', lng: 76.2634, lat: 32.1651 },
    { code: 'IMF', name: 'Bir Tikendrajit International Airport', city: 'Imphal', stateCode: 'MN', type: 'domestic', lng: 93.8967, lat: 24.7600 },
    { code: 'SHL', name: 'Shillong Airport', city: 'Shillong', stateCode: 'ML', type: 'regional', lng: 91.9786, lat: 25.7036 },
    { code: 'AJL', name: 'Lengpui Airport', city: 'Aizawl', stateCode: 'MZ', type: 'domestic', lng: 92.6192, lat: 23.8406 },
    { code: 'DMU', name: 'Dimapur Airport', city: 'Dimapur', stateCode: 'NL', type: 'domestic', lng: 93.7711, lat: 25.8839 },
    { code: 'IXA', name: 'Maharaja Bir Bikram Airport', city: 'Agartala', stateCode: 'TR', type: 'international', lng: 91.2405, lat: 23.8869 },
    { code: 'PYG', name: 'Pakyong Airport', city: 'Gangtok', stateCode: 'SK', type: 'regional', lng: 88.5878, lat: 27.2342 },
    { code: 'HGI', name: 'Donyi Polo Airport', city: 'Itanagar', stateCode: 'AR', type: 'domestic', lng: 93.6389, lat: 26.9989 },
    { code: 'DIU', name: 'Diu Airport', city: 'Diu', stateCode: 'DN', type: 'regional', lng: 70.9206, lat: 20.7136 },
    { code: 'HSS', name: 'Hisar Airport', city: 'Hisar', stateCode: 'HR', type: 'regional', lng: 75.7533, lat: 29.1794 }
  ];

  for (const a of airportCodes) {
    const state = states.find(s => s.code === a.stateCode) || states[0];
    const dest = (destMap[state._id] || [])[0] || destinations[0];
    airports.push({
      _id: `airp-${a.code.toLowerCase()}`,
      stateId: state._id,
      destinationId: dest._id,
      name: a.name,
      iataCode: a.code,
      icaoCode: `VI${a.code}`,
      city: a.city,
      location: {
        type: 'Point',
        coordinates: [a.lng, a.lat]
      },
      type: a.type,
      terminals: a.type === 'international' ? 3 : 1,
      runways: a.type === 'international' ? 2 : 1,
      images: [{
        url: `${IMG_BASE}_airp_${a.code.toLowerCase()}.jpg`,
        publicId: `placeholder_airp_${a.code.toLowerCase()}`,
        altText: `${a.name} terminal`,
        type: 'hero'
      }],
      provenance: PROV,
      isActive: true
    });
  }

  // 2. Railway Stations (At least 1-2 per state/UT -> ~50-80 stations)
  const railwayStations = [];
  const stationCodes = [
    { code: 'NDLS', name: 'New Delhi Railway Station', city: 'Delhi', stateCode: 'DL', lng: 77.2217, lat: 28.6430 },
    { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai', stateCode: 'MH', lng: 72.8358, lat: 18.9402 },
    { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', stateCode: 'WB', lng: 88.3426, lat: 22.5838 },
    { code: 'MAS', name: 'Puratchi Thalaivar Dr. M.G.R. Central', city: 'Chennai', stateCode: 'TN', lng: 80.2755, lat: 13.0827 },
    { code: 'SBC', name: 'KSR Bengaluru City Junction', city: 'Bengaluru', stateCode: 'KA', lng: 77.5701, lat: 12.9781 },
    { code: 'SC', name: 'Secunderabad Junction', city: 'Hyderabad', stateCode: 'TG', lng: 78.5033, lat: 17.4344 },
    { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', stateCode: 'GJ', lng: 72.6019, lat: 23.0238 },
    { code: 'PNBE', name: 'Patna Junction', city: 'Patna', stateCode: 'BR', lng: 85.1320, lat: 25.6025 },
    { code: 'GHY', name: 'Guwahati Railway Station', city: 'Guwahati', stateCode: 'AS', lng: 91.7529, lat: 26.1822 },
    { code: 'BBS', name: 'Bhubaneswar Railway Station', city: 'Bhubaneswar', stateCode: 'OD', lng: 85.8436, lat: 20.2666 },
    { code: 'BZA', name: 'Vijayawada Junction', city: 'Vijayawada', stateCode: 'AP', lng: 80.6200, lat: 16.5186 },
    { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur', stateCode: 'RJ', lng: 75.7899, lat: 26.9205 },
    { code: 'LKO', name: 'Lucknow Charbagh Railway Station', city: 'Lucknow', stateCode: 'UP', lng: 80.9234, lat: 26.8322 },
    { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi', stateCode: 'UP', lng: 82.9861, lat: 25.3283 },
    { code: 'ASR', name: 'Amritsar Junction', city: 'Amritsar', stateCode: 'PB', lng: 74.8690, lat: 31.6331 },
    { code: 'JAT', name: 'Jammu Tawi Railway Station', city: 'Jammu', stateCode: 'JK', lng: 74.8800, lat: 32.7050 },
    { code: 'R', name: 'Raipur Junction', city: 'Raipur', stateCode: 'CG', lng: 81.6300, lat: 21.2600 },
    { code: 'RNC', name: 'Ranchi Junction', city: 'Ranchi', stateCode: 'JH', lng: 85.3340, lat: 23.3510 },
    { code: 'BPL', name: 'Bhopal Junction', city: 'Bhopal', stateCode: 'MP', lng: 77.4100, lat: 23.2680 },
    { code: 'TVC', name: 'Thiruvananthapuram Central', city: 'Thiruvananthapuram', stateCode: 'KL', lng: 76.9520, lat: 8.4870 },
    { code: 'MAO', name: 'Madgaon Junction', city: 'Margao', stateCode: 'GA', lng: 73.9780, lat: 15.2740 },
    { code: 'CDG', name: 'Chandigarh Junction', city: 'Chandigarh', stateCode: 'CH', lng: 76.8200, lat: 30.7000 },
    { code: 'DDN', name: 'Dehradun Railway Station', city: 'Dehradun', stateCode: 'UK', lng: 78.0400, lat: 30.3150 },
    { code: 'KLK', name: 'Kalka Railway Station', city: 'Kalka', stateCode: 'HR', lng: 76.9360, lat: 30.8330 },
    { code: 'DMR', name: 'Dharmanagar Railway Station', city: 'Dharmanagar', stateCode: 'TR', lng: 92.1600, lat: 24.3700 },
    { code: 'NJP', name: 'New Jalpaiguri Junction', city: 'Siliguri', stateCode: 'WB', lng: 88.4400, lat: 26.6800 },
    { code: 'DMP', name: 'Dimapur Railway Station', city: 'Dimapur', stateCode: 'NL', lng: 93.7300, lat: 25.9100 },
    { code: 'PDY', name: 'Puducherry Railway Station', city: 'Puducherry', stateCode: 'PY', lng: 79.8270, lat: 11.9270 }
  ];

  for (const s of stationCodes) {
    const state = states.find(st => st.code === s.stateCode) || states[0];
    const dest = (destMap[state._id] || [])[0] || destinations[0];
    railwayStations.push({
      _id: `stn-${s.code.toLowerCase()}`,
      stateId: state._id,
      destinationId: dest._id,
      name: s.name,
      stationCode: s.code,
      city: s.city,
      location: {
        type: 'Point',
        coordinates: [s.lng, s.lat]
      },
      zone: 'Indian Railways',
      platforms: 6,
      type: 'major',
      images: [{
        url: `${IMG_BASE}_stn_${s.code.toLowerCase()}.jpg`,
        publicId: `placeholder_stn_${s.code.toLowerCase()}`,
        altText: `${s.name} building`,
        type: 'hero'
      }],
      provenance: PROV,
      isActive: true
    });
  }

  // 3. Bus Terminals (~40-60 terminals across states)
  const busTerminals = [];
  const terminalCodes = [
    { code: 'ISBT-KASH', name: 'Maharana Pratap ISBT Kashmiri Gate', city: 'Delhi', stateCode: 'DL', lng: 77.2285, lat: 28.6675 },
    { code: 'ISBT-ANVR', name: 'Swami Vivekananda ISBT Anand Vihar', city: 'Delhi', stateCode: 'DL', lng: 77.3160, lat: 28.6470 },
    { code: 'BST-MUM-BCT', name: 'Mumbai Central ST Bus Depot', city: 'Mumbai', stateCode: 'MH', lng: 72.8190, lat: 18.9710 },
    { code: 'BST-PUN-SWG', name: 'Swargate Bus Station', city: 'Pune', stateCode: 'MH', lng: 73.8580, lat: 18.5020 },
    { code: 'BST-BLR-MAJ', name: 'Majestic Kempegowda Bus Station', city: 'Bengaluru', stateCode: 'KA', lng: 77.5720, lat: 12.9770 },
    { code: 'BST-MAA-CMB', name: 'Chennai Mofussil Bus Terminus (CMBT)', city: 'Chennai', stateCode: 'TN', lng: 80.2050, lat: 13.0670 },
    { code: 'BST-HYD-MGB', name: 'Mahatma Gandhi Bus Station (MGBS)', city: 'Hyderabad', stateCode: 'TG', lng: 78.4830, lat: 17.3780 },
    { code: 'BST-CCU-ESP', name: 'Esplanade Central Bus Terminus', city: 'Kolkata', stateCode: 'WB', lng: 88.3520, lat: 22.5640 },
    { code: 'BST-ADI-GIT', name: 'Geeta Mandir Central Bus Terminus', city: 'Ahmedabad', stateCode: 'GJ', lng: 72.5920, lat: 23.0140 },
    { code: 'BST-JAI-SIN', name: 'Sindhi Camp Central Bus Stand', city: 'Jaipur', stateCode: 'RJ', lng: 75.8010, lat: 26.9240 },
    { code: 'BST-LKO-ALB', name: 'Alambagh Inter-State Bus Terminal', city: 'Lucknow', stateCode: 'UP', lng: 80.9080, lat: 26.8120 },
    { code: 'BST-PNB-MIT', name: 'Meethapur Inter State Bus Terminal', city: 'Patna', stateCode: 'BR', lng: 85.1380, lat: 25.5890 },
    { code: 'BST-BHO-NAD', name: 'Nadra Bus Stand', city: 'Bhopal', stateCode: 'MP', lng: 77.4120, lat: 23.2620 },
    { code: 'BST-GHY-ISB', name: 'Guwahati Inter-State Bus Terminus', city: 'Guwahati', stateCode: 'AS', lng: 91.7300, lat: 26.1100 },
    { code: 'BST-BBS-BRM', name: 'Baramunda Inter-State Bus Terminus', city: 'Bhubaneswar', stateCode: 'OD', lng: 85.7950, lat: 20.2780 },
    { code: 'BST-CHD-S43', name: 'ISBT Sector 43', city: 'Chandigarh', stateCode: 'CH', lng: 76.7450, lat: 30.7180 },
    { code: 'BST-ASR-CEN', name: 'Amritsar Central Bus Stand', city: 'Amritsar', stateCode: 'PB', lng: 74.8830, lat: 31.6280 },
    { code: 'BST-SXR-TRC', name: 'TRC Srinagar Central Terminal', city: 'Srinagar', stateCode: 'JK', lng: 74.8250, lat: 34.0720 },
    { code: 'BST-LEH-MKT', name: 'Leh Main Gate Bus Stand', city: 'Leh', stateCode: 'LA', lng: 77.5810, lat: 34.1610 },
    { code: 'BST-VZG-DWR', name: 'Dwaraka RTC Complex', city: 'Visakhapatnam', stateCode: 'AP', lng: 83.3030, lat: 17.7280 },
    { code: 'BST-KOC-VYT', name: 'Vyttila Mobility Hub', city: 'Kochi', stateCode: 'KL', lng: 76.3220, lat: 9.9670 },
    { code: 'BST-GOA-PAN', name: 'Kadamba Panaji Bus Stand', city: 'Panaji', stateCode: 'GA', lng: 73.8340, lat: 15.4950 },
    { code: 'BST-DDN-ISB', name: 'Dehradun ISBT Clement Town', city: 'Dehradun', stateCode: 'UK', lng: 78.0050, lat: 30.2860 },
    { code: 'BST-RPR-PDR', name: 'Pandri Bus Terminal', city: 'Raipur', stateCode: 'CG', lng: 81.6500, lat: 21.2550 },
    { code: 'BST-RNC-KHD', name: 'Khadgarha Bus Stand', city: 'Ranchi', stateCode: 'JH', lng: 85.3520, lat: 23.3680 }
  ];

  for (const b of terminalCodes) {
    const state = states.find(st => st.code === b.stateCode) || states[0];
    const dest = (destMap[state._id] || [])[0] || destinations[0];
    busTerminals.push({
      _id: `bst-${b.code.toLowerCase()}`,
      stateId: state._id,
      destinationId: dest._id,
      name: b.name,
      terminalCode: b.code,
      city: b.city,
      location: {
        type: 'Point',
        coordinates: [b.lng, b.lat]
      },
      type: 'inter-state',
      platforms: 16,
      images: [{
        url: `${IMG_BASE}_bst_${b.code.toLowerCase()}.jpg`,
        publicId: `placeholder_bst_${b.code.toLowerCase()}`,
        altText: `${b.name} platform`,
        type: 'hero'
      }],
      provenance: PROV,
      isActive: true
    });
  }

  // 4. Flights (500+ flights!)
  const flights = [];
  const airlines = ['IndiGo', 'Air India', 'Vistara', 'SpiceJet', 'Akasa Air'];
  let flightCounter = 100;

  for (let i = 0; i < airports.length; i++) {
    for (let j = 0; j < airports.length; j++) {
      if (i === j) continue;
      // Connect airports
      const orig = airports[i];
      const dest = airports[j];
      const airline = airlines[(i + j) % airlines.length];
      const flightNum = `${airline.slice(0, 2).toUpperCase()}-${flightCounter++}`;

      const durMins = 60 + ((i + j) * 7) % 180;
      const baseFare = 3000 + ((i * 13 + j * 17) % 6000);

      flights.push({
        _id: `flt-${flightNum.toLowerCase()}`,
        flightNumber: flightNum,
        airline: airline,
        originAirportId: orig._id,
        destinationAirportId: dest._id,
        departureTime: `${String(6 + (i % 16)).padStart(2, '0')}:${String((j * 15) % 60).padStart(2, '0')}`,
        arrivalTime: `${String(8 + ((i + 2) % 15)).padStart(2, '0')}:${String((j * 20) % 60).padStart(2, '0')}`,
        durationMins: durMins,
        fare: {
          economy: baseFare,
          business: baseFare * 3,
          first: baseFare * 5
        },
        taxes: 650,
        serviceFees: 200,
        currency: 'INR',
        stops: (i + j) % 5 === 0 ? 1 : 0,
        aircraft: 'Airbus A320neo',
        class: ['economy', 'business'],
        availability: 35 + ((i + j) % 50),
        status: 'scheduled',
        provenance: PROV
      });

      if (flights.length >= 520) break;
    }
    if (flights.length >= 520) break;
  }

  // 5. Trains (500+ trains!)
  const trains = [];
  const trainTypes = ['superfast', 'express', 'rajdhani', 'vande_bharat', 'shatabdi', 'duronto'];
  let trainCounter = 12001;

  for (let i = 0; i < railwayStations.length; i++) {
    for (let j = 0; j < railwayStations.length; j++) {
      if (i === j) continue;
      const orig = railwayStations[i];
      const dest = railwayStations[j];
      const tNum = String(trainCounter++);
      const tType = trainTypes[(i + j) % trainTypes.length];
      const tName = `${orig.city} - ${dest.city} ${tType.toUpperCase().replace('_', ' ')}`;

      const durMins = 180 + ((i * 19 + j * 23) % 900);
      const baseFare = 450 + ((i + j) * 15);

      trains.push({
        _id: `trn-${tNum}`,
        trainNumber: tNum,
        trainName: tName,
        originStationId: orig._id,
        destinationStationId: dest._id,
        departureTime: `${String(5 + (i % 18)).padStart(2, '0')}:${String((j * 10) % 60).padStart(2, '0')}`,
        arrivalTime: `${String(6 + ((i + 5) % 18)).padStart(2, '0')}:${String((j * 25) % 60).padStart(2, '0')}`,
        durationMins: durMins,
        fare: {
          sleeper: baseFare,
          ac3tier: baseFare * 2.5,
          ac2tier: baseFare * 3.8,
          acFirstClass: baseFare * 6.2
        },
        taxes: 95,
        serviceFees: 40,
        currency: 'INR',
        type: tType,
        availability: {
          sleeper: 150,
          ac3tier: 60,
          ac2tier: 24,
          acFirstClass: 10
        },
        status: 'running',
        provenance: PROV
      });

      if (trains.length >= 520) break;
    }
    if (trains.length >= 520) break;
  }

  // 6. Buses (500+ buses!)
  const buses = [];
  const operators = ['KSRTC', 'MSRTC', 'Zingbus', 'IntrCity SmartBus', 'VRL Travels', 'Orange Travels', 'Greenline', 'SRS Travels'];
  const busTypes = ['volvo', 'luxury', 'sleeper', 'AC', 'semi_sleeper'];
  let busCounter = 101;

  for (let i = 0; i < busTerminals.length; i++) {
    for (let j = 0; j < busTerminals.length; j++) {
      if (i === j) continue;
      const orig = busTerminals[i];
      const dest = busTerminals[j];
      const op = operators[(i + j) % operators.length];
      const bType = busTypes[(i + j) % busTypes.length];
      const bNum = `BUS-${op.slice(0, 3).toUpperCase()}-${busCounter++}`;

      const durMins = 120 + ((i * 17 + j * 13) % 480);
      const fareBase = 450 + ((i + j) * 20);

      buses.push({
        _id: `bus-${bNum.toLowerCase()}`,
        busNumber: bNum,
        operator: op,
        originTerminalId: orig._id,
        destinationTerminalId: dest._id,
        departureTime: `${String(18 + (i % 6)).padStart(2, '0')}:${String((j * 15) % 60).padStart(2, '0')}`,
        arrivalTime: `${String(6 + (j % 6)).padStart(2, '0')}:${String((i * 20) % 60).padStart(2, '0')}`,
        durationMins: durMins,
        fare: {
          seater: fareBase,
          semi_sleeper: Math.round(fareBase * 1.3),
          sleeper: Math.round(fareBase * 1.7)
        },
        taxes: 50,
        serviceFees: 30,
        currency: 'INR',
        type: bType,
        availability: 28,
        status: 'scheduled',
        provenance: PROV
      });

      if (buses.length >= 520) break;
    }
    if (buses.length >= 520) break;
  }

  // 7. Transport Routes (~100 routes)
  const transportRoutes = [];
  let routeCounter = 1;

  for (let i = 0; i < states.length; i++) {
    const nextState = states[(i + 1) % states.length];
    const s1 = states[i];
    const s2 = nextState;

    ['flight', 'train', 'bus'].forEach((mode) => {
      const code = `RT-${mode.toUpperCase()}-${s1.code}-${s2.code}-${routeCounter++}`;
      transportRoutes.push({
        _id: `route-${code.toLowerCase()}`,
        routeCode: code,
        type: mode,
        origin: {
          name: `${s1.name} Hub`,
          stateId: s1._id,
          coordinates: [78.0 + (i % 5), 20.0 + (i % 5)]
        },
        destination: {
          name: `${s2.name} Hub`,
          stateId: s2._id,
          coordinates: [78.5 + (i % 5), 21.0 + (i % 5)]
        },
        distanceKm: 250 + (i * 35),
        estimatedDurationMins: mode === 'flight' ? 90 : mode === 'train' ? 360 : 480,
        estimatedTransportCost: {
          min: mode === 'flight' ? 3500 : mode === 'train' ? 600 : 450,
          max: mode === 'flight' ? 9000 : mode === 'train' ? 2400 : 1200
        },
        currency: 'INR',
        frequency: 'daily',
        providers: ['National Transport Network'],
        provenance: PROV
      });
    });
  }

  return {
    airports,
    railwayStations,
    busTerminals,
    flights,
    trains,
    buses,
    transportRoutes
  };
}

module.exports = generateTransportData;
