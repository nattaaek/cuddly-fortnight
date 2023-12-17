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
  user: 'irmublqtskmnyc',
  host: 'ec2-34-236-100-103.compute-1.amazonaws.com',
  database: 'daim8pmkj3i9p3',
  password: 'bd1327dc6eb3600d284e5f6bc2cfd48a78c0f689d112bae761a98d509d17813c',
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
    const allRows: Row[] = [];

    fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row: Row) => {
            allRows.push(row);
        })
        .on('end', () => {
            if (!req.file) {
                res.status(400).send('No file uploaded.');
                return;
            }

            const tableName = req.file.originalname.split('.')[0];

            // Preparing the bulk insert query
            const columns = Object.keys(allRows[0]).join(',');
            const values = allRows.map(row => `(${Object.values(row).map(value => `'${value}'`).join(',')})`).join(',');

            const bulkInsertQuery = `INSERT INTO ${tableName} (${columns}) VALUES ${values}`;

            pool.query(bulkInsertQuery)
                .then(() => {
                    console.log(`Inserted ${allRows.length} rows into ${tableName}`);
                    res.status(200).send('CSV file uploaded and data inserted into the database.');
                })
                .catch((error: Error) => {
                    console.error(`Error inserting rows into ${tableName}:`, error);
                    res.status(500).send('Error inserting data into the database.');
                })
                .finally(() => {
                    fs.unlinkSync(filePath); // Remove the uploaded file
                });
        });
});


// Start the server
app.listen(8080, () => {
  console.log('Server is running on port 3000');
});
