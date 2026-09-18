'use strict';
const states = require('../data/statesData');

const PROV = {
  sourceType: 'SIMULATED',
  sourceName: 'TravelGenie Synthetic Generator',
  dataVersion: '1.0.0',
  lastVerifiedAt: new Date('2026-01-01')
};

const IMG_BASE = 'https://res.cloudinary.com/soootttd/image/upload/v1/placeholder';

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

const stateAnchors = {
  'state-ap': [80.50, 15.90], 'state-ar': [94.00, 28.00], 'state-as': [92.90, 26.20],
  'state-br': [85.30, 25.60], 'state-cg': [81.80, 21.20], 'state-ga': [73.80, 15.40],
  'state-gj': [71.50, 22.50], 'state-hr': [76.50, 29.00], 'state-hp': [77.20, 31.80],
  'state-jh': [85.50, 23.60], 'state-ka': [76.00, 14.50], 'state-kl': [76.50, 10.00],
  'state-mp': [78.00, 23.50], 'state-mh': [74.50, 19.50], 'state-mn': [93.90, 24.80],
  'state-ml': [91.50, 25.50], 'state-mz': [92.80, 23.30], 'state-nl': [94.20, 26.00],
  'state-od': [85.00, 20.50], 'state-pb': [75.50, 31.00], 'state-rj': [74.00, 26.50],
  'state-sk': [88.50, 27.50], 'state-tn': [78.50, 11.00], 'state-tg': [79.00, 17.80],
  'state-tr': [91.80, 23.80], 'state-up': [81.00, 27.00], 'state-uk': [79.00, 30.00],
  'state-wb': [87.80, 23.50], 'ut-an': [92.80, 11.80], 'ut-ch': [76.78, 30.73],
  'ut-dn': [72.90, 20.40], 'ut-dl': [77.20, 28.60], 'ut-jk': [74.80, 33.50],
  'ut-la': [77.50, 34.20], 'ut-ld': [72.60, 10.50], 'ut-py': [79.80, 11.90]
};

const destinationNamesByState = {
  'state-ap': ['Visakhapatnam', 'Vijayawada', 'Tirupati', 'Araku Valley', 'Srisailam', 'Amaravati', 'Lepakshi', 'Horsley Hills', 'Rajahmundry', 'Gandikota', 'Kakinada', 'Nellore'],
  'state-ar': ['Tawang', 'Itanagar', 'Ziro Valley', 'Bomdila', 'Dirang', 'Pasighat', 'Mechuka', 'Namdapha', 'Roing', 'Bhalukpong', 'Anini', 'Aalo'],
  'state-as': ['Guwahati', 'Kaziranga', 'Majuli', 'Manas National Park', 'Jorhat', 'Sivasagar', 'Tezpur', 'Silchar', 'Haflong', 'Dibrugarh', 'Nagaon', 'Barpeta'],
  'state-br': ['Patna', 'Bodh Gaya', 'Nalanda', 'Rajgir', 'Vaishali', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Sasaram', 'Valmiki National Park', 'Darbhanga', 'Munger'],
  'state-cg': ['Raipur', 'Jagdalpur', 'Chitrakote', 'Sirpur', 'Bhoramdeo', 'Bilaspur', 'Mainpat', 'Barnawapara', 'Dantewada', 'Kanker', 'Ambikapur', 'Dongargarh'],
  'state-ga': ['Panaji', 'Calangute', 'Old Goa', 'Vagator', 'Palolem', 'Dudhsagar', 'Anjuna', 'Arambol', 'Colva', 'Agonda', 'Baga', 'Candolim'],
  'state-gj': ['Ahmedabad', 'Rann of Kutch', 'Somnath', 'Dwarka', 'Gir Forest', 'Vadodara', 'Surat', 'Saputara', 'Palitana', 'Statue of Unity', 'Bhuj', 'Junagadh'],
  'state-hr': ['Gurugram', 'Kurukshetra', 'Faridabad', 'Panchkula', 'Sultanpur National Park', 'Kalka', 'Morni Hills', 'Panipat', 'Hisar', 'Rohtak', 'Karnal', 'Sonipat'],
  'state-hp': ['Shimla', 'Manali', 'Dharamshala', 'Spiti Valley', 'Kasol', 'Dalhousie', 'Kullu', 'Kaza', 'Bir Billing', 'Khajjiar', 'Chamba', 'Kasauli'],
  'state-jh': ['Ranchi', 'Jamshedpur', 'Deoghar', 'Netarhat', 'Betla National Park', 'Dhanbad', 'Hazaribagh', 'Giridih', 'Bokaro', 'Patratu Valley', 'Dumka', 'Chaibasa'],
  'state-ka': ['Bengaluru', 'Mysuru', 'Hampi', 'Coorg', 'Gokarna', 'Chikmagalur', 'Badami', 'Mangaluru', 'Bandipur', 'Kabini', 'Udupi', 'Dandeli'],
  'state-kl': ['Kochi', 'Munnar', 'Alleppey', 'Wayanad', 'Varkala', 'Thekkady', 'Thiruvananthapuram', 'Kovalam', 'Bekal', 'Athirappilly', 'Kumarakom', 'Kozhikode'],
  'state-mp': ['Bhopal', 'Indore', 'Khajuraho', 'Gwalior', 'Ujjain', 'Kanha National Park', 'Bandhavgarh', 'Orchha', 'Pachmarhi', 'Bhedaghat', 'Sanchi', 'Mandu'],
  'state-mh': ['Mumbai', 'Pune', 'Lonavala', 'Mahabaleshwar', 'Shirdi', 'Chhatrapati Sambhajinagar', 'Nashik', 'Alibaug', 'Tadoba', 'Matheran', 'Kolhapur', 'Nagpur'],
  'state-mn': ['Imphal', 'Loktak Lake', 'Ukhrul', 'Keibul Lamjao', 'Chandel', 'Senapati', 'Tamenglong', 'Churachandpur', 'Moirang', 'Andro', 'Thoubal', 'Kakching'],
  'state-ml': ['Shillong', 'Cherrapunji', 'Dawki', 'Mawlynnong', 'Nongriat', 'Jowai', 'Tura', 'Balpakram', 'Nartiang', 'Siju', 'Mairang', 'Baghmara'],
  'state-mz': ['Aizawl', 'Lunglei', 'Champhai', 'Reiek', 'Serchhip', 'Kolasib', 'Phawngpui', 'Tamdil Lake', 'Vantawng Falls', 'Hmuifang', 'Saitual', 'Mamit'],
  'state-nl': ['Kohima', 'Dimapur', 'Dzukou Valley', 'Mokokchung', 'Mon', 'Wokha', 'Tuensang', 'Phek', 'Khonoma', 'Longleng', 'Zunheboto', 'Kiphire'],
  'state-od': ['Bhubaneswar', 'Puri', 'Konark', 'Chilika Lake', 'Cuttack', 'Simlipal', 'Gopalpur', 'Rourkela', 'Sambalpur', 'Chandipur', 'Daringbadi', 'Koraput'],
  'state-pb': ['Amritsar', 'Ludhiana', 'Jalandhar', 'Patiala', 'Bathinda', 'Anandpur Sahib', 'Pathankot', 'Kapurthala', 'Faridkot', 'Hoshiarpur', 'Rupnagar', 'Mohali'],
  'state-rj': ['Jaipur', 'Udaipur', 'Jodhpur', 'Jaisalmer', 'Pushkar', 'Ranthambore', 'Mount Abu', 'Bikaner', 'Ajmer', 'Chittorgarh', 'Alwar', 'Bharatpur'],
  'state-sk': ['Gangtok', 'Pelling', 'Lachung', 'Lachen', 'Ravangla', 'Namchi', 'Yuksom', 'Zuluk', 'Yumthang Valley', 'Gurudongmar', 'Geyzing', 'Rinchenpong'],
  'state-tn': ['Chennai', 'Madurai', 'Ooty', 'Kodaikanal', 'Mahabalipuram', 'Rameswaram', 'Kanyakumari', 'Thanjavur', 'Coimbatore', 'Yercaud', 'Tiruchirappalli', 'Chettinad'],
  'state-tg': ['Hyderabad', 'Warangal', 'Nagarjuna Sagar', 'Bhadrachalam', 'Ramoji Film City', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ananthagiri Hills', 'Medak', 'Alampur', 'Basar'],
  'state-tr': ['Agartala', 'Udaipur Tripura', 'Unakoti', 'Neermahal', 'Jampui Hills', 'Sepahijala', 'Dharmanagar', 'Kailashahar', 'Ambassa', 'Pilak', 'Belonia', 'Khowai'],
  'state-up': ['Agra', 'Varanasi', 'Lucknow', 'Ayodhya', 'Mathura', 'Vrindavan', 'Prayagraj', 'Noida', 'Jhansi', 'Sarnath', 'Kushinagar', 'Fatehpur Sikri'],
  'state-uk': ['Rishikesh', 'Haridwar', 'Nainital', 'Mussoorie', 'Jim Corbett', 'Auli', 'Dehradun', 'Kedarnath', 'Badrinath', 'Valley of Flowers', 'Almora', 'Ranikhet'],
  'state-wb': ['Kolkata', 'Darjeeling', 'Sundarbans', 'Kalimpong', 'Digha', 'Shantiniketan', 'Siliguri', 'Murshidabad', 'Bishnupur', 'Dooars', 'Mirik', 'Mandarmoni'],
  'ut-an': ['Port Blair', 'Havelock Island', 'Neil Island', 'Baratang Island', 'Ross Island', 'Diglipur', 'Jolly Buoy Island', 'Rangat', 'Mayabunder', 'Little Andaman', 'Chidiya Tapu', 'Wandoor'],
  'ut-ch': ['Chandigarh Sector 17', 'Sukhna Lake Hub', 'Rock Garden Area', 'Rose Garden Sector 16', 'Capitol Complex', 'Manimajra', 'Sector 35 Food District', 'Sector 22 Shopping Bazaar', 'Sector 43 Transit Zone', 'Kaimbwala Nature Belt', 'Sector 10 Museum Complex', 'Sector 26 Club District'],
  'ut-dn': ['Daman Beachfront', 'Diu Fortress Island', 'Silvassa Cultural Center', 'Nani Daman Fort', 'Moti Daman', 'Khanvel Forest Resort', 'Devka Beach', 'Jampore Beach', 'Dudhni Lake Water Sports', 'Ghoghla Golden Beach', 'Lighthouse Daman', 'Nagoa Beach Diu'],
  'ut-dl': ['Old Delhi Heritage Quarter', 'Connaught Place', 'South Extension', 'Hauz Khas Village', 'Chanakyapuri Enclave', 'Mehrauli Archaeological Park', 'Dwarka City', 'Rohini Cultural District', 'Karol Bagh Market', 'Civil Lines Colonial Zone', 'Saket Lifestyle Hub', 'Aerocity Hospitality District'],
  'ut-jk': ['Srinagar Dal Lake', 'Gulmarg Snow Valley', 'Pahalgam Betaab Valley', 'Sonamarg Meadow of Gold', 'Jammu City of Temples', 'Katra Vaishno Devi Base', 'Patnitop Pine Woods', 'Doodhpathri Valley of Milk', 'Yusmarg Alpine Meadow', 'Bhaderwah Little Kashmir', 'Aru Valley', 'Poonch Border Valley'],
  'ut-la': ['Leh Old Town', 'Nubra Valley Sand Dunes', 'Pangong Tso Lake', 'Tso Moriri High Altitude', 'Kargil War Memorial Gateway', 'Zanskar Valley Glacier Realm', 'Diskit Monastery Zone', 'Hunder Camel Dunes', 'Alchi Ancient Gompa', 'Hemis Festival Sanctum', 'Lamayuru Moonland', 'Turpuk Valley'],
  'ut-ld': ['Kavaratti Lagoon', 'Agatti Coral Atoll', 'Bangaram Island Paradise', 'Kadmat Water Sports Hub', 'Minicoy Crescent Island', 'Kalpeni Coral Bank', 'Andrott Historical Island', 'Amini Handcrafts Island', 'Kiltan Northern Atoll', 'Chetlat Scenic Reef', 'Bitra Smallest Atoll', 'Suheli Desert Island'],
  'ut-py': ['White Town French Quarter', 'Auroville Global Township', 'Promenade Beach Boulevard', 'Paradise Beach Island', 'Arikamedu Roman Relic', 'Ousteri Lake Sanctuary', 'Karaikal Historic Port', 'Mahe Sunset Enclave', 'Yanam Godavari Delta', 'Serenity Surf Beach', 'Chunnambar Boat House', 'Bahour Lake']
};

const typesList = ['city', 'town', 'village', 'hill_station', 'beach', 'heritage', 'wildlife', 'pilgrimage', 'adventure', 'island'];
const budgetLevels = ['budget', 'mid', 'luxury', 'ultra-luxury'];

function generateDestinations() {
  const result = [];
  for (const state of states) {
    const anchor = stateAnchors[state._id] || [78.0, 22.0];
    const names = destinationNamesByState[state._id];
    if (!names || names.length < 10) {
      throw new Error(`State ${state._id} requires at least 10 destination names`);
    }

    names.forEach((name, idx) => {
      const slug = slugify(`${name}-${state.code}`);
      const dLng = (((idx * 17) % 20) - 10) * 0.08;
      const dLat = (((idx * 23) % 20) - 10) * 0.08;
      const lng = Number((anchor[0] + dLng).toFixed(4));
      const lat = Number((anchor[1] + dLat).toFixed(4));

      const type = typesList[(idx + state.code.charCodeAt(0)) % typesList.length];
      const budgetCategory = budgetLevels[idx % budgetLevels.length];
      const budgetDaily = budgetCategory === 'budget' ? 1200 : budgetCategory === 'mid' ? 3000 : 8000;

      result.push({
        _id: `dest-${slug}`,
        stateId: state._id,
        name: name,
        slug: slug,
        description: `${name} is a premier ${type.replace('_', ' ')} destination in ${state.name}, celebrated for its rich culture, scenic landscapes, and welcoming heritage.`,
        type: type,
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        estimatedDailyBudget: {
          budget: Math.round(budgetDaily * 0.5),
          mid: budgetDaily,
          luxury: Math.round(budgetDaily * 2.8)
        },
        budgetCategory: budgetCategory,
        currency: 'INR',
        bestTimeToVisit: ['October', 'November', 'December', 'January', 'February', 'March'],
        tags: [type, state.region.toLowerCase(), 'culture', 'scenic'],
        images: [{
          url: `${IMG_BASE}_${slug}.jpg`,
          publicId: `placeholder_${slug}`,
          altText: `${name} in ${state.name}`,
          type: 'hero'
        }],
        nearbyAttractionIds: [],
        nearbyTransportIds: [],
        isActive: true,
        provenance: PROV
      });
    });
  }
  return result;
}

module.exports = generateDestinations;
