// Description: This script reads many ZHA diagnostic JSON files and calculates
// the average congestion values for each channel within a specified time window.
// The averages are weighted per hour of the day, so that taking too many samples
// in a short period of time will not skew the results. 
// The script outputs a list of channels sorted by average congestion.


// Prerequisites: Latest Node.js installed
// Usage: node rate-channels.js

////////////////////////////////////////////
// Configuration
////////////////////////////////////////////

// Directory containing JSON files
const inputDir = 'input';

// Older files will be ignored, 0 or null to include all files
const timeWindowHours = 24;

////////////////////////////////////////////
// DO NOT MODIFY BELOW THIS LINE
////////////////////////////////////////////
const fs = require('fs');
const path = require('path');
const energyScanPath = ['data', 'energy_scan'];

function getFiles(dir, ext, timeWindowHours) {
  const now = Date.now();
  const timeWindowMs = timeWindowHours ? timeWindowHours * 60 * 60 * 1000 : 0;

  return fs.readdirSync(dir).filter(file => {
    const filePath = path.join(dir, file);
    const fileExt = path.extname(file);
    const fileStat = fs.statSync(filePath);
    const fileAgeMs = now - fileStat.mtimeMs;

    return fileExt === ext && (timeWindowMs === 0 || fileAgeMs <= timeWindowMs);
  });
}

function readJsonFile(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

function getNestedValue(obj, path) {
  return path.reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : null, obj);
}

function averageEnergyScanValues(files) {
  const hourlySums = {};
  const hourlyCounts = {};
  let fileCount = 0;

  files.forEach(file => {
    const filePath = path.join(inputDir, file);
    const jsonData = readJsonFile(filePath);
    const energyScan = getNestedValue(jsonData, energyScanPath);
    const fileStat = fs.statSync(filePath);
    const fileHour = new Date(fileStat.mtimeMs).getHours();

    if (energyScan) {
      fileCount++;
      Object.entries(energyScan).forEach(([channel, value]) => {
        if (!hourlySums[fileHour]) {
          hourlySums[fileHour] = {};
          hourlyCounts[fileHour] = {};
        }
        if (!hourlySums[fileHour][channel]) {
          hourlySums[fileHour][channel] = 0;
          hourlyCounts[fileHour][channel] = 0;
        }
        hourlySums[fileHour][channel] += value;
        hourlyCounts[fileHour][channel]++;
      });
    }
  });

  const hourlyAverages = {};
  Object.entries(hourlySums).forEach(([hour, channels]) => {
    hourlyAverages[hour] = {};
    // noinspection JSCheckFunctionSignatures
    Object.entries(channels).forEach(([channel, sum]) => {
      hourlyAverages[hour][channel] = sum / hourlyCounts[hour][channel];
    });
  });

  const overallAverages = {};
  const channelHourCounts = {};
  Object.entries(hourlyAverages).forEach(([, channels]) => {
    // noinspection JSCheckFunctionSignatures
    Object.entries(channels).forEach(([channel, avg]) => {
      if (!overallAverages[channel]) {
        overallAverages[channel] = 0;
        channelHourCounts[channel] = 0;
      }
      overallAverages[channel] += avg;
      channelHourCounts[channel]++;
    });
  });

  const finalAverages = {};
  Object.entries(overallAverages).forEach(([channel, sum]) => {
    finalAverages[channel] = (sum / channelHourCounts[channel]).toFixed(2);
  });

  return finalAverages;
}

const jsonFiles = getFiles(inputDir, '.json', timeWindowHours);
const averagedEnergyScan = averageEnergyScanValues(jsonFiles);

const sortedAveragedEnergyScan = Object.entries(averagedEnergyScan)
.sort(([, a], [, b]) => a - b)
.map(([channel, usage]) => ({ channel, usage }));

console.log(JSON.stringify(sortedAveragedEnergyScan, null, 0).replace(/},{/g, '},\n{'));