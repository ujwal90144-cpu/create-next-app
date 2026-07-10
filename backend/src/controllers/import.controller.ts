import { Request, Response } from 'express';
import fs from 'fs';
import csv from 'csv-parser';
import logger from '../utils/logger';
import { processAllRecords } from '../services/ai.service';

export const importCsv = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No CSV file provided.' });
      return;
    }

    const filePath = req.file.path;
    const rawRecords: any[] = [];

    logger.info(`Starting CSV parsing for file: ${req.file.originalname}`);

    // Parse CSV locally first
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => rawRecords.push(data))
      .on('end', async () => {
        logger.info(`Successfully parsed ${rawRecords.length} records from CSV.`);

        // 1. Pre-filter records that have NO email and NO phone
        // This is done to give exact feedback on skipped records before sending to AI
        const validRecords: any[] = [];
        const skippedRecords: any[] = [];

        for (const row of rawRecords) {
          const rowString = JSON.stringify(row).toLowerCase();
          const cleanRowString = rowString.replace(/\s+/g, '');
          
          // Relaxed heuristic check
          const hasEmail = /@[a-z0-9.-]+\.[a-z]{2,}/.test(cleanRowString);
          const hasPhone = /[0-9]{6,}/.test(cleanRowString); // At least 6 digits anywhere

          if (!hasEmail && !hasPhone) {
            skippedRecords.push({ ...row, _skip_reason: 'Missing both Email and Phone' });
          } else {
            validRecords.push(row);
          }
        }

        logger.info(`Valid records for AI: ${validRecords.length}, Skipped: ${skippedRecords.length}`);

        if (validRecords.length === 0) {
           res.json({
            success: true,
            importedCount: 0,
            skippedCount: skippedRecords.length,
            parsedRecords: [],
            skippedRecords
          });
          return;
        }

        let recordsToProcess = validRecords;

        try {
          // 2. Send to AI
          const startTime = Date.now();
          const { parsedRecords } = await processAllRecords(recordsToProcess);
          const processingTime = Date.now() - startTime;

          logger.info(`AI Processing completed in ${processingTime}ms`);

          res.json({
            success: true,
            importedCount: parsedRecords.length,
            skippedCount: skippedRecords.length,
            parsedRecords,
            skippedRecords,
            processingTimeMs: processingTime
          });
        } catch (aiError: any) {
          logger.error(`AI Processing Error: ${aiError.message}`);
          res.status(500).json({ success: false, message: 'Failed to process records via AI.' });
        } finally {
          // Cleanup file
          fs.unlinkSync(filePath);
        }
      })
      .on('error', (err) => {
        logger.error(`CSV Parsing Error: ${err.message}`);
        res.status(500).json({ success: false, message: 'Failed to parse CSV file.' });
        fs.unlinkSync(filePath);
      });

  } catch (error: any) {
    logger.error(`Import Controller Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
