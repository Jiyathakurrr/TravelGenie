'use strict';
const PROV = { sourceType: 'SIMULATED', sourceName: 'TravelGenie-Seed', dataVersion: '1.0.0', lastVerifiedAt: new Date('2026-01-01') };
const IMG_BASE = 'https://res.cloudinary.com/soootttd/image/upload/v1/placeholder';

const states = [
  { _id:'state-ap', name:'Andhra Pradesh', code:'AP', type:'STATE', capital:'Amaravati', region:'South', languages:['Telugu','Urdu'], timezone:'Asia/Kolkata' },
  { _id:'state-ar', name:'Arunachal Pradesh', code:'AR', type:'STATE', capital:'Itanagar', region:'Northeast', languages:['English','Nyishi','Bengali'] },
  { _id:'state-as', name:'Assam', code:'AS', type:'STATE', capital:'Dispur', region:'Northeast', languages:['Assamese','Bengali','Bodo'] },
  { _id:'state-br', name:'Bihar', code:'BR', type:'STATE', capital:'Patna', region:'East', languages:['Hindi','Maithili','Bhojpuri'] },
  { _id:'state-cg', name:'Chhattisgarh', code:'CG', type:'STATE', capital:'Raipur', region:'Central', languages:['Hindi','Chhattisgarhi'] },
  { _id:'state-ga', name:'Goa', code:'GA', type:'STATE', capital:'Panaji', region:'West', languages:['Konkani','Marathi','English'] },
  { _id:'state-gj', name:'Gujarat', code:'GJ', type:'STATE', capital:'Gandhinagar', region:'West', languages:['Gujarati','Hindi'] },
  { _id:'state-hr', name:'Haryana', code:'HR', type:'STATE', capital:'Chandigarh', region:'North', languages:['Hindi','Haryanvi'] },
  { _id:'state-hp', name:'Himachal Pradesh', code:'HP', type:'STATE', capital:'Shimla', region:'North', languages:['Hindi','Pahari'] },
  { _id:'state-jh', name:'Jharkhand', code:'JH', type:'STATE', capital:'Ranchi', region:'East', languages:['Hindi','Santali','Bengali'] },
  { _id:'state-ka', name:'Karnataka', code:'KA', type:'STATE', capital:'Bengaluru', region:'South', languages:['Kannada','Urdu','Telugu'] },
  { _id:'state-kl', name:'Kerala', code:'KL', type:'STATE', capital:'Thiruvananthapuram', region:'South', languages:['Malayalam'] },
  { _id:'state-mp', name:'Madhya Pradesh', code:'MP', type:'STATE', capital:'Bhopal', region:'Central', languages:['Hindi'] },
  { _id:'state-mh', name:'Maharashtra', code:'MH', type:'STATE', capital:'Mumbai', region:'West', languages:['Marathi','Hindi','Urdu'] },
  { _id:'state-mn', name:'Manipur', code:'MN', type:'STATE', capital:'Imphal', region:'Northeast', languages:['Meitei','English'] },
  { _id:'state-ml', name:'Meghalaya', code:'ML', type:'STATE', capital:'Shillong', region:'Northeast', languages:['Khasi','Garo','English'] },
  { _id:'state-mz', name:'Mizoram', code:'MZ', type:'STATE', capital:'Aizawl', region:'Northeast', languages:['Mizo','English'] },
  { _id:'state-nl', name:'Nagaland', code:'NL', type:'STATE', capital:'Kohima', region:'Northeast', languages:['English','Nagamese'] },
  { _id:'state-od', name:'Odisha', code:'OD', type:'STATE', capital:'Bhubaneswar', region:'East', languages:['Odia'] },
  { _id:'state-pb', name:'Punjab', code:'PB', type:'STATE', capital:'Chandigarh', region:'North', languages:['Punjabi','Hindi'] },
  { _id:'state-rj', name:'Rajasthan', code:'RJ', type:'STATE', capital:'Jaipur', region:'North', languages:['Hindi','Rajasthani'] },
  { _id:'state-sk', name:'Sikkim', code:'SK', type:'STATE', capital:'Gangtok', region:'Northeast', languages:['Nepali','Sikkimese','Lepcha'] },
  { _id:'state-tn', name:'Tamil Nadu', code:'TN', type:'STATE', capital:'Chennai', region:'South', languages:['Tamil'] },
  { _id:'state-tg', name:'Telangana', code:'TG', type:'STATE', capital:'Hyderabad', region:'South', languages:['Telugu','Urdu'] },
  { _id:'state-tr', name:'Tripura', code:'TR', type:'STATE', capital:'Agartala', region:'Northeast', languages:['Bengali','Kokborok'] },
  { _id:'state-up', name:'Uttar Pradesh', code:'UP', type:'STATE', capital:'Lucknow', region:'North', languages:['Hindi','Urdu'] },
  { _id:'state-uk', name:'Uttarakhand', code:'UK', type:'STATE', capital:'Dehradun', region:'North', languages:['Hindi','Garhwali','Kumaoni'] },
  { _id:'state-wb', name:'West Bengal', code:'WB', type:'STATE', capital:'Kolkata', region:'East', languages:['Bengali','Hindi','Urdu'] },
  { _id:'ut-an', name:'Andaman and Nicobar Islands', code:'AN', type:'UT', capital:'Port Blair', region:'Island', languages:['Hindi','Bengali','Tamil','Telugu'] },
  { _id:'ut-ch', name:'Chandigarh', code:'CH', type:'UT', capital:'Chandigarh', region:'North', languages:['Hindi','Punjabi'] },
  { _id:'ut-dn', name:'Dadra and Nagar Haveli and Daman and Diu', code:'DN', type:'UT', capital:'Daman', region:'West', languages:['Gujarati','Hindi'] },
  { _id:'ut-dl', name:'Delhi', code:'DL', type:'UT', capital:'New Delhi', region:'North', languages:['Hindi','Punjabi','Urdu'] },
  { _id:'ut-jk', name:'Jammu and Kashmir', code:'JK', type:'UT', capital:'Srinagar', region:'North', languages:['Kashmiri','Dogri','Hindi','Urdu'] },
  { _id:'ut-la', name:'Ladakh', code:'LA', type:'UT', capital:'Leh', region:'North', languages:['Ladakhi','Hindi'] },
  { _id:'ut-ld', name:'Lakshadweep', code:'LD', type:'UT', capital:'Kavaratti', region:'Island', languages:['Malayalam'] },
  { _id:'ut-py', name:'Puducherry', code:'PY', type:'UT', capital:'Puducherry', region:'South', languages:['Tamil','French','Telugu','Malayalam'] }
];

module.exports = states.map(s => ({
  ...s,
  currency: 'INR',
  images: [{ url: `${IMG_BASE}_${s._id}.jpg`, publicId: `placeholder_${s._id}`, altText: `${s.name} landscape`, type: 'hero' }],
  provenance: PROV,
  isActive: true
}));
