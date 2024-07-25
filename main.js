const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const inputLocation = process.argv[2];

if (!inputLocation) {
  throw new Error("Input location needed");
  return;
}

// List of websites to scrape
const websiteList = fs.readFileSync(`./input/${inputLocation}.txt`, "utf8");
const websites = websiteList.split("\r\n");
let output = "email\n";
const outputPath = path.join(__dirname, "output", `${inputLocation}.csv`);

// Function to scrape a single website and save the output
async function scrapeAndSave(url, index) {
  return new Promise((res, rej) => {
    console.log(`Scraping website ${url}...`);
    const command = `scrape -w ${url} -d 10`; // Use --json flag if the scrape CLI supports JSON output

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error scraping ${url}:`, error);
        rej();
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        rej();
        return;
      }

      output += stdout;
      console.log(`${url} finished\n----------------------`);
      res();
    });
  });
}

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, "output");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
  console.log("Created output directory");
} else {
  //   console.log("Output directory already exists");
}

(async () => {
  console.log(
    `Starting...\nLocation: ${inputLocation}\n======================`
  );
  // Iterate through the list of websites and scrape each one
  for (let i = 0; i < websites.length; i++) {
    await scrapeAndSave(websites[i], i);

    if (i === websites.length - 1) {
      await fs.writeFileSync(outputPath, output);
      console.log(
        `Data saved to ${outputPath}\n======================\nScraping completed!`
      );
    }
  }
})();
