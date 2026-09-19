import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'soootttd',
  api_key: '691659621517926',
  api_secret: '-yEfks4tv5vDba-q3q7L2Y-k5ak'
});

async function checkCloudinary() {
  try {
    const res = await cloudinary.api.resources({ max_results: 30 });
    console.log("Cloudinary resources total:", res.resources?.length);
    console.log("Sample resources:", res.resources.map((r: any) => ({
      public_id: r.public_id,
      secure_url: r.secure_url,
      format: r.format
    })));
  } catch (e) {
    console.error("Cloudinary error:", e);
  }
}

checkCloudinary();
