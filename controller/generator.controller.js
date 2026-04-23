import Generator from '../models/generator.model.js';
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../s3.js";
import User from "../models/user.model.js";

// Get all generators
export const getGens = async (req, res) => {
    try {
        const generators = await Generator.find({});
        res.status(200).json(generators); // <-- return the fetched data
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Get a single generator by ID
export const getGen = async (req, res) => {
    try {
        const { id } = req.params;
        const generator = await Generator.findById(id);
        if (!generator) {
            return res.status(404).json({ message: "Generator not found" });
        }
        res.status(200).json(generator); // <-- return the fetched data
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Create a new generator
export const createGen = async (req, res) => {
    try {
        const {
        genID,
        Serial_Number,
        name,
        Description,
        Stock,
        Image_Url,
        Image_Key,
        Image_Url2,
        Image_Key2,
        Image_Url3,
        Image_Key3,
        Image_Url4,
        Image_Key4,
        Image_Url5,
        Image_Key5
        } = req.body;

        const generator = await Generator.create({
        genID,
        Serial_Number,
        name,
        Description,
        Stock,
        Image_Url,
        Image_Key,
        Image_Url2,
        Image_Key2,
        Image_Url3,
        Image_Key3,
        Image_Url4,
        Image_Key4,
        Image_Url5,
        Image_Key5
        });

        res.status(201).json({ message: "Generator created!", generator });
        } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a generator
export const updateGen = async (req, res) => {
  try {
    const { id } = req.params;

    const oldGen = await Generator.findById(id);
    if (!oldGen) {
      return res.status(404).json({ message: "Generator not found" });
    }

    const updatedGen = await Generator.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    const oldKeys = [
      oldGen.Image_Key,
      oldGen.Image_Key2,
      oldGen.Image_Key3,
      oldGen.Image_Key4,
      oldGen.Image_Key5,
    ].filter(Boolean);

    const newKeys = [
      updatedGen.Image_Key,
      updatedGen.Image_Key2,
      updatedGen.Image_Key3,
      updatedGen.Image_Key4,
      updatedGen.Image_Key5,
    ].filter(Boolean);

    const removedKeys = oldKeys.filter((key) => !newKeys.includes(key));

    for (const key of removedKeys) {
      const stillUsed = await isImageKeyStillUsed(key, id);
      if (!stillUsed) {
        await deleteFromS3(key);
      }
    }

    res.status(200).json(updatedGen);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a generator
export const deleteGen = async (req, res) => {
  try {
    const { id } = req.params;

    const generator = await Generator.findById(id);
    if (!generator) {
      return res.status(404).json({ message: "Generator not found" });
    }

    const keysToCheck = [
      generator.Image_Key,
      generator.Image_Key2,
      generator.Image_Key3,
      generator.Image_Key4,
      generator.Image_Key5,
    ].filter(Boolean);

    await Generator.findByIdAndDelete(id);

     // remove deleted generator from all users' favorites
    await User.updateMany(
      {},
      {
        $pull: {
          favorites: {
            itemId: id,
            itemType: "generator",
          },
        },
      }
    );

    for (const key of keysToCheck) {
      const stillUsed = await isImageKeyStillUsed(key, id);
      if (!stillUsed) {
        await deleteFromS3(key);
      }
    }

    res.status(200).json({ message: "Generator deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const isImageKeyStillUsed = async (key, excludeGeneratorId = null) => {
  if (!key) return false;

  const query = {
    $or: [
      { Image_Key: key },
      { Image_Key2: key },
      { Image_Key3: key },
      { Image_Key4: key },
      { Image_Key5: key },
    ],
  };

  if (excludeGeneratorId) {
    query._id = { $ne: excludeGeneratorId };
  }

  const existing = await Generator.findOne(query);
  return !!existing;
};

const deleteFromS3 = async (key) => {
  if (!key) return;

  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    })
  );
};
