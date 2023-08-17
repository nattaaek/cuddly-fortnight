
document.getElementById('uploadBtn').addEventListener('click', async () => {
  const csvFileInput = document.getElementById('csvFile');
  if (csvFileInput.files.length > 0) {
    const filePath = csvFileInput.files[0].path;
    console.log('Sending file path:', filePath);
    window.electronAPI.csvUpload(filePath);
  }
});
