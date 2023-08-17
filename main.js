const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { Client } = require('pg');
const fs = require('fs');
const csvParser = require('csv-parser');


function createWindow () {
    const mainWindow = new BrowserWindow({
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
    mainWindow.loadFile('index.html')
}

async function uploadCSV (event, filePath) {
    console.log('Received file path in main process:', filePath); // Add this line

    const client = new Client({
      user: '',
      host: '',
      database: '',
      password: '',
      port: 5432, // default PostgreSQL port,
      ssl: {
        sslmode: 'require',
        rejectUnauthorized: false,
      }
    });
  
    await client.connect();
  
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        for (const row of results) {
            const query = {
                text: 'INSERT INTO organizers (name, organizer_type_id) VALUES ($1, $2)',
                values: [row.name, parseInt(row.organizer_type_id)],
            };
  
          try {
            await client.query(query);
          } catch (error) {
            console.error('Error inserting data:', error);
          }
        }
  
        await client.end();
      });
};

app.whenReady().then(() => {
    ipcMain.on('csv-upload', uploadCSV)
    createWindow()
})
