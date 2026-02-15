import { Router } from 'express';
import { createTranscript, listTranscripts, getTranscriptItems } from '../controllers/transcript.controller.js';

const router = Router();

router.post('/transcript', createTranscript);
router.get('/transcripts', listTranscripts);
router.get('/transcripts/:transcriptId/items', getTranscriptItems);

export default router;
