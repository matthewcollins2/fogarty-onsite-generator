const express = require('express');
const router = express.Router();
const { getContent, updateContent } = require('../controller/aboutpagecontent.controller');

router.get('/:pageName', getContent);
router.put('/:pageName', updateContent);

module.exports = router;
