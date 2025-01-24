// features.js

export const silent_prefix = 'f7a74';

let keyTimes = [];
let keyStrokes = [];
// Function to reset keyTimes
export function resetKeyTimes(e) {
    if (e) {
        console.debug('reset keyTimes (%s)',e.target.id);
    } else {
        console.debug('reset keyTimes !');
    }
    keyTimes = [];
    keyStrokes = [];
}

// Function to add a keystroke time
export function addKeyTime(e) {
    if (e.type === 'keypress') {
        keyStrokes.push(e.code);
    }
    if (keyTimes.length === 0 && e.type === 'keyup') {
        keyTimes.push(performance.now()); // introduce an extra key if start with keyup
    }
    if (e.key === 'Escape' || e.key === 'Delete' && e.target.value === '') {
        keyTimes = [];
    } else {
        keyTimes.push(performance.now());
        console.debug('%d: %s %s pass:%s @%d',keyTimes.length,e.code,e.type,e.target.value,keyTimes[keyTimes.length-1]);
    }

    // Determine which element to update based on the input field
    if (e.target.id === 'passwordInput') {
        document.getElementById('passwordLength').textContent = `${e.target.value.length + 1}ch`;
    } else if (e.target.id === 'confirmPasswordInput') {
        document.getElementById('keystrokeLength').textContent = `${keyTimes.length}ks`;
    }
}

export function getIntervals() {
  const intervals = [];
  for (let i = 1; i < keyTimes.length; i++) {
      intervals.push(keyTimes[i] - keyTimes[i - 1]);
  }
  return intervals
}

export function displayFeatures(featuresDiv, features) {
    const featureList = Object.entries(features)
        .filter(([key]) => key !== 'intervals')
        .sort((a, b) => a[0].localeCompare(b[0])) // Sort alphabetically by key
        .map(([key, value]) => `${key}: ${typeof value === 'number' ? value.toFixed(5).replace(/\.?0+$/, '') : value}`)
        .join(',<br>');
        
    console.info("Extracted Features:", features);
    featuresDiv.innerHTML = `<h4>Submitted Features:</h4><p>${featureList}</p>`;
    
}

export async function collectTiming(username, password) {
    const prefix = await pwnedPrefix(password);
    const { features, intervals } = await extractFeatures(keyTimes);
    console.debug({intervals});
    features.prefix = prefix
    features.length = password.length;
    return { success: true, features, intervals }
}

export async function collectSimpleFeatures(username, password) {
    const prefix = await pwnedPrefix(password);
    const intervals = getIntervals();
    console.debug({ intervals });

    // Calculate position of the maximum interval
    let maxInterval = -Infinity;
    let maxIntervalPosition = -1;
    intervals.forEach((interval, index) => {
        if (interval > maxInterval) {
            maxInterval = interval;
            maxIntervalPosition = index;
        }
    });
    // compute various metrics
    const avgInterval =  intervals.reduce((a, b) => a + b, 0) / intervals.length || 0;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    const standardDev = Math.sqrt(variance);

    const features = {
        username: username,
        prefix: prefix,
        avgInterval: avgInterval,
        standardDev: standardDev,
        numKeystrokes: keyTimes.length,
        totalTime: keyTimes[keyTimes.length - 1] - keyTimes[0] || 0,
        maxIntervalPosition: maxIntervalPosition, // Position of max interval
    };

    keyTimes = []; // reset for next use
    console.debug({ features });

    return { success: true, features, intervals };
}


export function fakeSamples(samples) {
    // Helper function to calculate average
    const average = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

    // Helper function to calculate median
    const median = arr => {
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    };

    // Extract all relevant values from samples
    const allMinIntervals = samples.map(s => s.minInterval);
    const allAvgIntervals = samples.map(s => s.avgInterval);
    const allStandardDev = samples.map(s => s.standardDev);
    const allNumKeystrokes = samples.map(s => s.numKeystrokes);
    const allTotalTime = samples.map(s => s.totalTime);
    const allMaxIntervalPosition = samples.map(s => s.maxIntervalPosition);
    const allSecondToMaxPosition = samples.map(s => s.secondToMaxPosition);

    // Create a few fake samples
    const fakeSamples = [
        { prefix:  Math.floor(Math.random()*1048576).toString(16),
          label: 'incorrect'
        },
        {
            secondToMaxPosition: median(allSecondToMaxPosition),
            standardDev: 0.98 * Math.min(...allStandardDev),
            numKeystrokes: median(allNumKeystrokes),
            totalTime: average(allTotalTime),
            label: 'bot'
        },
        {
            maxIntervalPosition: median(allMaxIntervalPosition),
            standardDev: 0.98 * Math.min(...allStandardDev),
            numKeystrokes: median(allNumKeystrokes),
            totalTime: average(allTotalTime),
            //avgInterval: average(allAvgIntervals),
            label: 'bot'
        },
        {
            numKeystrokes: samples[0].length * 2,
            label: 'no hidden char'
        },
        {
            numKeystrokes: Math.min(...allNumKeystrokes) - 1,
            label: 'less chars'
        },
        {
            standardDev: Math.min(...allStandardDev),
            totalTime: average(allTotalTime),
            label: 'same speed'
        },
        {
            avgInterval: Math.round(Math.min(...allAvgIntervals)),
            totalTime: median(allNumKeystrokes) * Math.min(...allAvgIntervals),
            label: 'faster'
        },
        {
            avgInterval: Math.round(Math.max(...allAvgIntervals)) + 1,
            totalTime: median(allNumKeystrokes) * Math.max(...allAvgIntervals),
            label: 'slower'
        },
        {
            maxIntervalPosition: Math.round(average(allMaxIntervalPosition) + 0.5) - 1,
            standardDev: average(allStandardDev),
            label: 'max pos - 1'
        },
        {
            maxIntervalPosition: Math.round(average(allMaxIntervalPosition) + 0.5) + 1,
            standardDev: average(allStandardDev),
            //avgInterval: average(allAvgIntervals),
            label: 'max pos + 1'
        },
        {
            numKeystrokes: median(allNumKeystrokes),
            maxIntervalPosition: (median(allMaxIntervalPosition) + median(allNumKeystrokes)/2) % median(allNumKeystrokes),
            label: 'diag opp max'
        },
        {
            prefix: silent_prefix,
            label: 'legitimate',
            silentAlarm: true
        }
    ];
    // Generate random samples
    // const fakeSamples = [];
    const baseFeatures  = {
            minInterval: Math.min(...allMinIntervals),
            avgInterval: average(allAvgIntervals), // Average interval in milliseconds
            standardDev: Math.max(...allStandardDev), // Standard deviation in milliseconds
            numKeystrokes: median(allNumKeystrokes) ,
            totalTime: average(allTotalTime) // Total typing time in milliseconds
        }
    const numberOfRandomSamples = Math.max(...allNumKeystrokes);
    for (let i = 0; i < 256; i++) {
        const timings = randomTiming(baseFeatures);
        const { features, intervals } = extractFeatures(timings);
        const sample = { ...features };
        sample.prefix = samples[i%samples.length].prefix;
        sample.label = 'bot' + (i % 2);
        fakeSamples.push(sample);
    }


    /*
    const fakeData = fakeSamples.map(({ label, ...rest }) => rest);
    console.debug({fakeData});
    const fakeLabels = fakeSamples.map(item => item.label);
    */

  return fakeSamples;
}

function randomTiming(baseFeatures) {
    const {
        avgInterval,
        standardDev,
        numKeystrokes,
        totalTime,
        minInterval
    } = baseFeatures;

    // Function to generate a random number with normal distribution
    function randomNormal(mean, stdDev) {
        let u1 = Math.random();
        let u2 = Math.random();
        let z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        return z * stdDev + mean;
    }

    // Generate realistic intervals and timestamps
    const intervals = [];
    const timestamps = [0]; // Start at time 0

    for (let i = 0; i < numKeystrokes - 1; i++) {
        let interval;
        
        // Rejection sampling to ensure interval >= minInterval
        do {
            interval = randomNormal(avgInterval, standardDev);
        } while (interval < minInterval);  // Only accept intervals >= minInterval

        intervals.push(interval);
        timestamps.push(timestamps[timestamps.length - 1] + interval);
    }

    // Adjust timestamps to fit the total time
    const actualTotalTime = timestamps[timestamps.length - 1];
    const scalingFactor = totalTime / actualTotalTime;

    const adjustedTimestamps = timestamps.map(t => t * scalingFactor);

    return adjustedTimestamps;
}




export async function collectFeatures(username,password) {
    const { features, intervals } = extractFeatures(keyTimes);
    console.debug(intervals);
    if (Object.keys(features).length === 0) {
        return { success: false, message: 'No keystroke data captured' };
    }

    features.username = username;
    features.prefix = await pwnedPrefix(password);
    features.length = password.length;

    // Fetch subnet
    try {
        const subnet = await getSubnet();
        if (subnet !== null) {
            features.subnet = subnet;
        }
    } catch (error) {
        console.error('Error fetching subnet:', error);
    }

    // Get the hashrate
    try {
        const { isHttps, hasCryptoSubtle } = isSecureEnvironment();
        let hashRate;
        if (hasCryptoSubtle) {
            hashRate = await measureHashRate();
        } else {
            console.warn('Web Crypto API (crypto.subtle) is not available. Using fallback for hash rate calculation.');
            hashRate = await measureHashRateFallback();
            features.secure = false;
        }
        features.hashRate = parseFloat(hashRate);
    } catch (error) {
        console.error('Error calculating hash rate:', error);
    }

    const deviceType = (navigator.userAgent.match(/(iPhone|iPad|iPod|Android|Mobile)/i) || [])[1];

    if (deviceType) {
        features.deviceType = deviceType === 'Mobile' ? 'mobile' : deviceType.toLowerCase();
    } else {
        features.deviceType = 'desktop';
    }
    if (navigator.connection) {
        console.log(navigator.connection.effectiveType); // e.g., '4g', '3g', 'wifi'
    }


    // Extra Features
    features.browser = navigator.appCodeName;
    features.threads = navigator.hardwareConcurrency;
    features.screenWidth = window.screen.width,
    features.os = navigator.platform;
    features.ua = navigator.userAgent;


    return { success: true, features, intervals };
}


export function extractFeatures(keyTimes) {
  const intervals = [];
  for (let i = 1; i < keyTimes.length; i++) {
    const interval = keyTimes[i] - keyTimes[i - 1];
    intervals.push(interval);
  }

  if (intervals.length === 0) {
    return {
      features: {
        avgInterval: 0,
        numKeystrokes: 0,
        length: 0,
        totalTime: 0,
      },
      intervals: [],
    };
  }

  const totalTime = keyTimes[keyTimes.length - 1] - keyTimes[0];
  const avgInterval = intervals.length > 0 ? totalTime / intervals.length : 0;
  const variance =
    intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) /
    intervals.length;
  const standardDev = Math.sqrt(variance);
  const lastRatio = intervals[intervals.length - 1] / standardDev;
  const effectiveIntervals = lastRatio > 3 ? intervals.slice(0, -1) : intervals;
  const effectiveTotalTime = keyTimes[effectiveIntervals.length] - keyTimes[0];
  const effectiveAvgInterval =
    effectiveIntervals.length > 0 ? effectiveTotalTime / effectiveIntervals.length : 0;
  const effectiveVariance =
    effectiveIntervals.reduce(
      (sum, interval) => sum + Math.pow(interval - effectiveAvgInterval, 2),
      0
    ) / effectiveIntervals.length;
  const effectiveStandardDev = Math.sqrt(effectiveVariance);
  const sortedIndexes = Array.from(effectiveIntervals.keys()).sort(
    (a, b) => intervals[a] - intervals[b]
  );
  const sortedIntervals = sortedIndexes.map((index) => intervals[index]);
  const medianInterval = calculateMedian(sortedIntervals);
  const mad = calculateMAD(intervals, medianInterval); // median absolute deviation
  const madn = 1.4826 * mad; // median absolute deviation normalized
  const iqr = calculateIQR(sortedIntervals);
  const skewness = calculateSkewness(
    effectiveIntervals,
    effectiveAvgInterval,
    effectiveStandardDev
  );
  const kurtosis = calculateKurtosis(
    intervals,
    effectiveAvgInterval,
    effectiveStandardDev
  );
  const pauseCount = countPauses(effectiveIntervals, standardDev);
  const trigraphStats = calculateTrigraphStats(effectiveIntervals);

  const features = {
    prefix: silent_prefix,
    secondToMaxPosition: sortedIndexes[effectiveIntervals.length - 2],
    maxIntervalPosition: sortedIndexes[effectiveIntervals.length - 1],
    minIntervalPosition: sortedIndexes[0],
    slowestTrigraphPosition: trigraphStats.slowestTrigraphPosition,
    secondSlowestTrigraphPosition: trigraphStats.secondSlowestTrigraphPosition,
    thirdToMaxPosition: sortedIndexes[effectiveIntervals.length - 3],
    lastRatio,
    madn,
    skewness,
    kurtosis,
    interQuartileRange: iqr,
    medianInterval,
    effectiveVariance,
    effectiveTotalTime,
    effectiveAvgInterval,
    avgInterval,
    effectiveNumKeystrokes: effectiveIntervals.length,
    numKeystrokes: intervals.length,
    pauseCount,
    coefficientOfVariation: effectiveStandardDev / effectiveAvgInterval,
    firstInterval: intervals[0],
    firstToLastRatio: intervals[0] / intervals[intervals.length - 1],
    maxInterval: sortedIntervals[effectiveIntervals.length - 1],
    secondToMaxInterval: sortedIntervals[effectiveIntervals.length - 2],
    thirdToMaxInterval: sortedIntervals[effectiveIntervals.length - 3],
    minInterval: sortedIntervals[0],
    variance,
    standardDev,
    lastEffectiveInterval: effectiveIntervals[effectiveIntervals.length - 1],
    lastInterval: intervals[intervals.length - 1],
    totalTime,
    isMobile: isMobileDevice(),
    secure: true,
  };

  keyTimes = []; // reset for next use

  return { features, intervals };
}


function isSecureEnvironment() {
  const isHttps = window.location.protocol === 'https:';
  const hasCryptoSubtle =
    typeof window.crypto !== 'undefined' &&
    typeof window.crypto.subtle !== 'undefined';
  return { isHttps, hasCryptoSubtle };
}

async function measureHashRate() {
  const iterations = 50000; // Number of hashes to compute
  const input = new TextEncoder().encode('Hello, world!'); // Sample input
  const startTime = performance.now();

  for (let i = 0; i < iterations; i++) {
    await crypto.subtle.digest('SHA-256', input); // Compute the SHA-256
  }

  const endTime = performance.now();
  const timeTaken = endTime - startTime;
  const hashRate = (iterations / (timeTaken / 1000)).toFixed(2); // Hashes per second

  return hashRate;
}

// Fallback hash rate function
function measureHashRateFallback() {
  const iterations = 50000;
  const input = 'Hello, world!';
  const startTime = performance.now();

  for (let i = 0; i < iterations; i++) {
    simpleHash(input);
  }

  const endTime = performance.now();
  const timeTaken = endTime - startTime;
  return (iterations / (timeTaken / 1000)).toFixed(2);
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

export async function pwnedPrefix(password) {
  try {
    const sha1 = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(password));
    const hash = Array.from(new Uint8Array(sha1))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const prefix = hash.substr(0, 5);
    return prefix;

  } catch (error) {
    console.error('Error computing password prefix:', error);
    return null;
  }
}

async function getSubnet() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    //console.debug({data});
    const ip = data.ip;

    // Convert IP to integer
    const ipParts = ip.split('.').map(Number);
    const ipInt =
      (ipParts << 24) |
      (ipParts << 16) |
      (ipParts << 8) |
      ipParts;

    // Calculate subnet (CIDR /22)
    const subnet = ipInt >>> 10; // Equivalent to dividing by 1024

    return subnet;
  } catch (error) {
    console.error('Error fetching IP address:', error);
    return null;
  }
}

function calculateMedian(sortedArray) {
  const mid = Math.floor(sortedArray.length / 2);
  return sortedArray.length % 2 === 0
    ? (sortedArray[mid - 1] + sortedArray[mid]) / 2
    : sortedArray[mid];
}

function calculateMAD(array, median) {
  const absoluteDeviations = array.map((val) => Math.abs(val - median));
  return calculateMedian(absoluteDeviations.sort((a, b) => a - b));
}

function calculateIQR(sortedArray) {
  const q1 = sortedArray[Math.floor(sortedArray.length * 0.25)];
  const q3 = sortedArray[Math.floor(sortedArray.length * 0.75)];
  return q3 - q1;
}

function calculateSkewness(array, mean, stdDev) {
  return (
    array.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 3), 0) /
    array.length
  );
}

function calculateKurtosis(array, mean, stdDev) {
  return (
    array.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 4), 0) /
      array.length -
    3
  );
}

function countPauses(intervals, standardDev) {
  return intervals.filter((interval) => interval > 2.5 * standardDev).length;
}

function calculateTrigraphStats(intervals) {
  const trigraphIntervals = intervals
    .slice(0, -1)
    .map((interval, i) => interval + intervals[i + 1]);
  let slowestTrigraphInterval = -Infinity;
  let slowestTrigraphPosition = -1;
  let secondSlowestTrigraphPosition = -1;

  trigraphIntervals.forEach((interval, i) => {
    if (interval > slowestTrigraphInterval) {
      secondSlowestTrigraphPosition = slowestTrigraphPosition;
      slowestTrigraphInterval = interval;
      slowestTrigraphPosition = i;
    }
  });

  return { slowestTrigraphPosition, secondSlowestTrigraphPosition };
}

function isMobileDevice() {
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    return window.matchMedia('only screen and (max-width: 768px)').matches;
  }
  return false;
}
