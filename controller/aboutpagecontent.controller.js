const PageContent = require('../models/aboutpagecontent.model');

async function getContent(req, res) {
  try {
    const { pageName } = req.params;
    let entry = await PageContent.findOne({ pageName });
    if (!entry) {
      // create with explicit empty content (schema default also covers this)
      entry = await PageContent.create({ pageName, content: "" });
    }
    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateContent(req, res) {
  try {
    const { pageName } = req.params;
    const { content } = req.body ?? { content: "" };
    const updated = await PageContent.findOneAndUpdate(
      { pageName },
      { content, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { getContent, updateContent };