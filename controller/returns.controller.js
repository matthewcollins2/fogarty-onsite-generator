import Return from "../models/returns.model.js";
import PageContent from "../models/pagecontent.model.js";

// GET
export const getReturn = async (req, res) => {
  try {
    // Remove any old documents based off retention days
    let retentionDoc = await PageContent.findOne({ pageName: 'returnRetentionDays' });
    let days = 365; // default

    if (retentionDoc) {
      if (!isNaN(Number(retentionDoc.content))) {
        days = Math.max(30, Math.min(365, Number(retentionDoc.content)));
      }
    } else {
      try {
        await PageContent.create({ pageName: 'returnRetentionDays', content: '365' });
        days = 365;
      } catch {}
    }

    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // delete if older than cutoff
    await Return.deleteMany({
      $or: [
        { updatedAt: { $lt: cutoff } },
        { createdAt: { $lt: cutoff } }
      ]
    });

    const part = await Return.find({});
    res.status(200).json(part);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get pending
export const getPendingReturnCount = async (req, res) => {
  try {
    const count = await Return.countDocuments({
      status: { $in: ["Pending", "In-Progress"] }
    });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
export const updateReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedReturn = await Return.findByIdAndUpdate(
      id,
      { status: req.body.status },
      { new: true }
    );

    if (!updatedReturn) {
      return res.status(404).json({ message: "Return request not found" });
    }

    res.status(200).json(updatedReturn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE
export const deleteReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedReturn = await Return.findByIdAndDelete(id);

    if (!deletedReturn) {
      return res.status(404).json({ message: "Return request not found" });
    }

    res.status(200).json({ message: "Return request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE return
export const createReturn = async (req, res) => {
  try {
    const {
      userID,
      name,
      email,
      generatorModel,
      serialNumber,
      condition,
      reason,
    } = req.body;

    const newReturn = await Return.create({
      userID,
      name,
      email,
      generatorModel,
      serialNumber,
      condition,
      reason,
      status: "Pending",
    });

    res.status(201).json({
      message: "Return application submitted",
      data: newReturn
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};