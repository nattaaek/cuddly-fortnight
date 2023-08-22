import express from 'express';
import multer from 'multer';
import csvParser from 'csv-parser';
import fs from 'fs';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
const upload = multer({ dest: 'uploads/' });

// Database configuration
const pool = new Pool({
  user: 'hhwkwaxwlodsqi',
  host: 'ec2-44-215-22-37.compute-1.amazonaws.com',
  database: 'd3vv430dpuj285',
  password: '2fc28221bcc0d0c0d5e4a939049d8cc606e0e058a4ca57ef70cea015efb51190',
  port: 5432, // Change if necessary
  ssl: {
    rejectUnauthorized: false // This line will fix new error
  }
});

app.use(cors());

// Route for CSV file upload
import { Request, Response } from 'express';

interface Row {
    [key: string]: string;
}

app.post('/upload', upload.single('csvFile'), (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).send('No file uploaded.');
        return;
    }

    const filePath = req.file.path;

    fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row: Row) => {
            // Insert data into the corresponding table based on the file name
            if (!req.file) {
                res.status(400).send('No file uploaded.');
                return;
            }
            const tableName = req.file.originalname.split('.')[0];
            const query = {
                text: `INSERT INTO ${tableName} (${Object.keys(row).join(',')}) VALUES (${Object.values(row).map((value, index) => `$${index + 1}`).join(',')})`,
                values: Object.values(row),
            };

            pool.query(query)
                .then(() => {
                    console.log(`Inserted row into ${tableName}`);
                })
                .catch((error: Error) => {
                    console.error(`Error inserting row into ${tableName}:`, error);
                });
        })
        .on('end', () => {
            fs.unlinkSync(filePath); // Remove the uploaded file

            res.status(200).send('CSV file uploaded and data inserted into the database.');
        });
});

// Start the server
app.listen(8080, () => {
  console.log('Server is running on port 3000');
});
