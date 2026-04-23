import Part from '../models/part.model.js';
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../s3.js";
import User from "../models/user.model.js";

export const getParts = async (req, res) =>{
 try {
        const part = await Part.find({});
        res.status(200).json(part);
    } catch (error) {
        res.status(500).json({message: error.message});
        
    }
}

export const getPart = async (req, res) =>{
    try {
        const { id } = req.params;
        const part = await Part.findById(id);

        if (!part) {
        return res.status(404).json({ message: "Part not found" });
        }

        res.status(200).json(part);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createPart = async (req, res) => {
  try {
    const {
      partID,
      Part_Name,
      Stock,
      Description,
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

    const part = await Part.create({
      partID,
      Part_Name,
      Stock,
      Description,
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

    res.status(201).json({ message: "New part added to database.", part });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePart = async (req, res) => {
  try {
    const { id } = req.params;

    const oldPart = await Part.findById(id);
    if (!oldPart) {
      return res.status(404).json({ message: "Part not found" });
    }

    const updatedPart = await Part.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    const oldKeys = [
      oldPart.Image_Key,
      oldPart.Image_Key2,
      oldPart.Image_Key3,
      oldPart.Image_Key4,
      oldPart.Image_Key5,
    ].filter(Boolean);

    const newKeys = [
      updatedPart.Image_Key,
      updatedPart.Image_Key2,
      updatedPart.Image_Key3,
      updatedPart.Image_Key4,
      updatedPart.Image_Key5,
    ].filter(Boolean);

    const removedKeys = oldKeys.filter((key) => !newKeys.includes(key));

    for (const key of removedKeys) {
      const stillUsed = await isPartImageKeyStillUsed(key, id);
      if (!stillUsed) {
        await deleteFromS3(key);
      }
    }

    res.status(200).json(updatedPart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePart = async (req, res) => {
  try {
    const { id } = req.params;

    const part = await Part.findById(id);
    if (!part) {
      return res.status(404).json({ message: "Part not found" });
    }

    const keysToCheck = [
      part.Image_Key,
      part.Image_Key2,
      part.Image_Key3,
      part.Image_Key4,
      part.Image_Key5,
    ].filter(Boolean);

    await Part.findByIdAndDelete(id);

    await User.updateMany(
      {},
      {
        $pull: {
          favorites: {
            itemId: id,
            itemType: "part",
          },
        },
      }
    );


    for (const key of keysToCheck) {
      const stillUsed = await isPartImageKeyStillUsed(key, id);
      if (!stillUsed) {
        await deleteFromS3(key);
      }
    }

    res.status(200).json({ message: "Part was successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const isPartImageKeyStillUsed = async (key, excludePartId = null) => {
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

  if (excludePartId) {
    query._id = { $ne: excludePartId };
  }

  const existing = await Part.findOne(query);
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