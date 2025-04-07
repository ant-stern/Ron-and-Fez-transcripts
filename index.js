const fs = require('fs');
const path = require('path');
const lunr = require('lunr');

const transcriptsDir = './transcripts/';
const htmlTranscriptsDir = './html_transcripts/';
const indexFile = './search_index.json';

// Create html_transcripts directory if it doesn't exist
if (!fs.existsSync(htmlTranscriptsDir)) {
  fs.mkdirSync(htmlTranscriptsDir);
}

const documents = [];

function processDirectory(directory) {
  fs.readdirSync(directory).forEach(file => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.txt')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const htmlContent = `<pre>${content}</pre>`; // Convert to HTML <pre> tag

      const htmlFileName = file.replace('.txt', '.html');
      const htmlFilePath = path.join(htmlTranscriptsDir, htmlFileName);

      fs.writeFileSync(htmlFilePath, htmlContent);

      documents.push({
        id: htmlFileName, // Use .html file name as ID
        text: content
      });
    }
  });
}

processDirectory(transcriptsDir);

const idx = lunr(function () {
  this.ref('id');
  this.field('text');

  documents.forEach(function (doc) {
    this.add(doc);
  }, this);
});

fs.writeFileSync(indexFile, JSON.stringify(idx));
console.log('Search index created successfully.');