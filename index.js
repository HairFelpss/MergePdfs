const path = require("path");
const fs = require("fs");
const hummus = require("hummus");
const memoryStreams = require("memory-streams");

function readFiles(dirname, pdf, pdfWriter) {
  if (pdf.split(".").pop() === "pdf") {
    const buffer = fs.readFileSync(`${dirname}/${pdf}`);
    try {
      pdfWriter.appendPDFPagesFromPDF(new hummus.PDFRStreamForBuffer(buffer));
      fs.unlink(path.join(dirname, pdf), (err) => {
        if (err) throw err;
      });
    } catch (err) {
      console.log("ERR INSIDE READ FILES ====> ", err);
    }
  }
}

const directoryPath = path.join(__dirname, "filter");
//passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {
  if (err) {
    return console.log("Unable to scan directory: " + err);
  }

  const filteredFiles = files.filter((item) => !/(^|\/)\.[^\/\.]/g.test(item));

  filteredFiles.forEach(function (file) {
    const directoryPaths = path.join(directoryPath, file);

    fs.readdir(directoryPaths, (err, files) => {
      let pdfFiles = [];

      if (err) {
        return console.log("Unable to scan directory: " + err);
      }

      const filteredFiles = files.filter(
        (item) => !/(^|\/)\.[^\/\.]/g.test(item)
      );

      var pdfWriter = hummus.createWriter(`${directoryPaths}/${file}.pdf`);
      var outStream = new memoryStreams.WritableStream();

      filteredFiles.forEach(function (pdf) {
        pdfFiles.push(readFiles(directoryPaths, pdf, pdfWriter));
      });

      try {
        pdfWriter.end();
        outStream.toBuffer();
        outStream.end();
      } catch (e) {
        throw new Error("Error during PDF combination: " + e);
      }
    });
  });
});
