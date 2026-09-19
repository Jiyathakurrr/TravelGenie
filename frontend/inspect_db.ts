import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://travelgeniework_db_user:4z2CANJczAFpCYcV@cluster0.etoodin.mongodb.net/travelgenie?appName=Cluster0";
const dbName = "travelgenie";

async function inspect() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB Atlas!");
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    console.log("Collections in DB:", collections.map(c => c.name));

    for (const colInfo of collections) {
      const col = db.collection(colInfo.name);
      const count = await col.countDocuments();
      console.log(`\n================ Collection: ${colInfo.name} (Count: ${count}) ================`);
      const sample = await col.find().limit(3).toArray();
      console.log(JSON.stringify(sample, null, 2));
    }
  } catch (err) {
    console.error("MongoDB error:", err);
  } finally {
    await client.close();
  }
}

inspect();
