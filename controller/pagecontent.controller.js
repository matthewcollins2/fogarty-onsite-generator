import PageContent from '../models/pagecontent.model.js';

export const getContent = async (req, res) => {
  try {
    let content = await PageContent.findOne({ pageName: req.params.pageName });

    // for retention settings return a sensible default instead of 404
    if (!content) {
      if (req.params.pageName === 'quoteRetentionDays' || req.params.pageName === 'appointmentRetentionDays') {
        // minimum allowed value 30 used as default
        return res.json({ pageName: req.params.pageName, content: '30', updatedAt: Date.now() });
      }
      return res.status(404).json({ message: 'Content not found' });
    }
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateContent = async (req, res) => {
  try {
    // enforce numeric range for retention settings
    if (
      req.params.pageName === 'quoteRetentionDays' ||
      req.params.pageName === 'appointmentRetentionDays'
    ) {
      const num = Number(req.body.content);
      if (
        isNaN(num) ||
        num < 30 ||
        num > 365 ||
        !Number.isInteger(num)
      ) {
        return res.status(400).json({ message: 'Retention must be integer between 30 and 365' });
      }
    }
    // upsert so new entries (e.g. quoteRetentionDays) are created if missing
    const updatedContent = await PageContent.findOneAndUpdate(
      { pageName: req.params.pageName },
      { content: req.body.content, updatedAt: Date.now(), pageName: req.params.pageName },
      { new: true, upsert: true }
    );
    res.json(updatedContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};