import { MongoClient } from 'mongodb';
import * as fs from 'fs';

const uri = "mongodb+srv://travelgeniework_db_user:4z2CANJczAFpCYcV@cluster0.etoodin.mongodb.net/travelgenie?appName=Cluster0";
const dbName = "travelgenie";

async function inspect() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    console.log("Found collections:", collections.map(c => c.name));

    const result: Record<string, any> = {};

    for (const colInfo of collections) {
      const col = db.collection(colInfo.name);
      const count = await col.countDocuments();
      const sample = await col.find().limit(2).toArray();
      result[colInfo.name] = {
        count,
        sample
      };
    }

    fs.writeFileSync('db_summary.json', JSON.stringify(result, null, 2));
    console.log("Wrote db_summary.json successfully");
  } catch (err) {
    console.error("MongoDB error:", err);
  } finally {
    await client.close();
  }
}

inspect();
